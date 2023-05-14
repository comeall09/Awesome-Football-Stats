import * as cheerio from 'cheerio';
import dayjs from 'dayjs';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase.config';

import { webData } from '../../utils/api';
import { uefaIndicators, IStandings, ITeamStats } from './utils';
import { teamTemplate } from './helpers';
import { Tournaments } from '../../entities/tournaments.interface';

export async function fetchStandings(league: Tournaments): Promise<Pick<ITeamStats, 'Rank' | 'Squad' | 'Points'>[]>; // return all teams of league buttons
export async function fetchStandings(league: Tournaments, team: string): Promise<{ template: HTML, team: ITeamStats }>;

export async function fetchStandings(league: Tournaments, team?: string) {
    const firebase = new StandingsFirebase();
    const ferbfApi = new StandingsApi();

    let standings;

    try {
        const resp = await firebase.fetch(league);
        if(resp) standings = resp;
        else {
            standings = await ferbfApi.fetch(league);
            firebase.update(league, standings);
        }

        if(team) {
            return getStandingTeamTemplate(standings, team);
        }

        return getStandingsButtons(standings);
    } catch {
        throw new Error('page not found');
    }
}

function getStandingsButtons(standings: IStandings): Pick<ITeamStats, 'Rank' | 'Squad' | 'Points'>[] {
    return standings.map(({ Rank, Squad, Points }) => ({ Rank, Squad, Points }));
}

function getStandingTeamTemplate(standings: IStandings, team: string): { template: HTML, team: ITeamStats } {
    const teamData = standings.find(({ Squad }) => Squad === team) ?? {} as ITeamStats;
    if (team) {
        return { template: teamTemplate(teamData), team: teamData };
    }
    throw new Error('team not found');
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
                    const { ucl, uel, uecl, relagate } = uefaIndicators;
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
        const standingsRef = doc(db, tournament, "standings");
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
        const standingsRef = doc(db, tournament, 'standings');
        await updateDoc(standingsRef, {
            teams: standings,
            date: dayjs().format('YYYY-MM-DD')
        });
    }
}
