import * as cheerio from 'cheerio';
import dayjs from 'dayjs';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { FirebaseService } from '../../firebase.config';

import { webData } from '../../utils/api';
import { Tournaments } from '../../entities/tournaments.interface';
import { indicators, IStandings, ITeamStats, teamTemplate } from './helpers';

// public service
export class StandingsService {
    private standings: IStandings;
    public standingsButtons: Record<string, string>[];

    public async fetch(tournament: Tournaments): Promise<void> {
        const firebase = new StandingsFirebase();
        const ferbfApi = new StandingsApi();

        try {
            const resp = await firebase.fetch(tournament);
            if(resp) this.standings = resp;
            else {
                this.standings = await ferbfApi.fetch(tournament);
                firebase.update(tournament, this.standings);
            }
            this.prepareStandingsButtons();
        } catch {
            throw new Error('page not found');
        }
    }

    private prepareStandingsButtons(): void {
        this.standingsButtons = this.standings.map(({ Rank, Squad }) => ({ Rank, Squad }));
    }

    public getStandingTeamTemplate(teamRank: string): { template: HTML, team: ITeamStats } {
        const team = this.standings.find(({ Rank }) => Rank === teamRank);
        if (team) {
            return { template: teamTemplate(team), team };
        }
        throw new Error('team not found');
    }
}

// ferbf api
class StandingsApi {
    public async fetch(tournament: Tournaments): Promise<IStandings> {
        const {
            api,
            queries: { standings },
        } = webData.ferbf;
        try {
            const { data: page }: { data: HTML } = await api.get(standings[tournament]);
            return this.parse(page);
        } catch {
            throw new Error('page not found');
        }
    }

    private parse(page: HTML) {
        const $ = cheerio.load(page);
        const table = $('table.stats_table').eq(0);

        const headers: Array<keyof ITeamStats> = [];
        table.find('thead tr th').each((_, el) => {
            headers.push($(el).attr('aria-label') as keyof ITeamStats);
        });

        const cells: string[] = [];
        table.find('tbody tr').each((_, tr) => {
            // строки таблиц с классом spacer пропускаем, тк это разделитель строк
            if (!$(tr).hasClass('spacer')) {
                tr.children.map((el) => {
                    // qualification indicator
                    // UCL
                    const text = $(el).text();
                    const { ucl, uel, uecl, relagate } = indicators;
                    if ($(el).hasClass('qualifier1')) {
                        cells.push(`${ucl} ${text}`);
                        return;
                    }

                    // UEL
                    if ($(el).hasClass('qualifier2')) {
                        cells.push(`${uel} ${text}`);
                        return;
                    }

                    // UECL
                    if ($(el).hasClass('qualifier3')) {
                        cells.push(`${uecl} ${text}`);
                        return;
                    }

                    // relagate indicator
                    if ($(el).hasClass('relegate')) {
                        cells.push(`${relagate} ${text}`);
                        return;
                    }
                    cells.push(text);
                });
            }
        });

        const standings: IStandings = [];
        for (let i = 0; i < cells.length; i += headers.length) {
            const obj: Partial<ITeamStats> = {};
            for (let j = 0; j < headers.length; j++) {
                obj[headers[j]] = cells[i + j];
            }
            standings.push(obj as ITeamStats);
        }

        return standings;
    }
}

// firebase api
class StandingsFirebase {
    public async fetch(tournament: Tournaments): Promise<IStandings | undefined> {
        const standingsRef = doc(FirebaseService.db, tournament, "standings");
        try {
            const response = (await getDoc(standingsRef)).data() as { date: string, teams: IStandings } | undefined;
            const isExist = response && response.teams.length > 1;
            const isToday = isExist && dayjs().format('YYYY-MM-DD') === response?.date;
            if(isExist && isToday) return response.teams;
            throw new Error();
        } catch {
            return undefined;
        }
    }

    public async update(tournament: Tournaments, standings: IStandings) {
        const standingsRef = doc(FirebaseService.db, tournament, 'standings');
        await updateDoc(standingsRef, {
            teams: standings,
            date: dayjs().format('YYYY-MM-DD')
        });
    }
}
