import * as cheerio from 'cheerio';
import puppeteer from 'puppeteer';
import { webData } from '../../utils/api';
import { Tournaments } from '../../entities/tournaments.interface';
import { convertFlag, indicators, IPlayerStats, IStandings, ITeamStats, playerTemplate, teamTemplate } from './helpers';
import { positionDict } from '../../utils/dict';

export class TournamentsService {
    private standings: IStandings;
    private playersStats: IPlayerStats[];
    private playersContent: HTML | null;

    public teamsButtons: { Rank: string; Squad: string }[];
    public playersButtons: Pick<IPlayerStats, 'Player' | 'Nation'>[];

    async fetchTeamsStats(tournament: Tournaments) {
        const {
            api,
            queries: { standings },
        } = webData.ferbf;
        try {
            const { data }: { data: HTML } = await api.get(standings[tournament]);
            this.normilizeTeamsResponse(data);
        } catch (error) {
            throw new Error('api error');
        }
        this.playersContent = null;
    }

    async fetchPlayersStats(tournament: Tournaments, teamRank: string) {
        // Запрашиваем данные только если поменяли турнир
        if(!this.playersContent) {
            const { queries: { playersStats } } = webData.ferbf;
            try {
                const browser = await puppeteer.launch({ headless: 'new' });
                const page = await browser.newPage();
                const url = playersStats(tournament);

                await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 10_000 });
                await page.waitForSelector('#div_stats_standard');
                const content = await page.content();
                browser.close();

                this.playersContent = content;
            } catch (error) {
                throw new Error('api error');
            }
        }
        const team = this.standings.find(({Rank}) => Rank === teamRank);
        this.normalizePlayersResponse({ team: team! });
    }

    protected normilizeTeamsResponse(page: HTML): void {
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
        this.standings = standings;
        this.prepareTeamsButtons();
    }

    protected normalizePlayersResponse({team}: {team: ITeamStats}): void {
        const $ = cheerio.load(this.playersContent!);
        const table = $('#div_stats_standard');

        const headers: Array<keyof IPlayerStats> = [];
        table.find('table thead tr:nth-of-type(2) th').each((_, el) => {
            headers.push($(el).attr('aria-label') as keyof IPlayerStats);
        });

        const teamCells: cheerio.Element[] = [];
        table.find('table tbody tr').each((_, cell) => {
            $(cell).each(((n, tr) => {
                const teamEl = $(tr).find("*[data-stat='team']");
                if(teamEl.text().trim().includes(team.Squad.trim())) {
                    teamCells.push(tr);
                }
            }));
        });

        const playersStats: IPlayerStats[] = [];
        $(teamCells).each((_, el) => {
            el.children.map((str, i) => {
                const index = i % headers.length;
                const text = $(str).text();
                if(index === 0) {
                    playersStats.push({} as IPlayerStats);
                }
                playersStats[playersStats.length - 1][headers[index]] = text;
            });
        });

        this.playersStats = playersStats;
        this.preparePlayersButtons();
    }

    protected preparePlayersButtons(): void {
        this.playersButtons = this.playersStats
            .map(({ Player, Nation, Position }) => ({ Player, Nation: convertFlag(Nation), Position }))
            .sort((a, b) => {
                const positions = Object.keys(positionDict);
                // Сначала сравниваем по GK
                if (a.Position === positions[0]) {
                    return -1;
                } else if (b.Position === positions[0]) {
                    return 1;
                }

                // Затем по защите
                const defensePositions = positions.slice(1, 6);
                if (defensePositions.includes(a.Position) && !defensePositions.includes(b.Position)) {
                    return -1;
                } else if (!defensePositions.includes(a.Position) && defensePositions.includes(b.Position)) {
                    return 1;
                }

                // по полузащитникам
                const midfieldPositions = positions.slice(6, 15);
                if (midfieldPositions.includes(a.Position) && !midfieldPositions.includes(b.Position)) {
                    return -1;
                } else if (!midfieldPositions.includes(a.Position) && midfieldPositions.includes(b.Position)) {
                    return 1;
                }

                // по нападающим
                const forwardsPositions = positions.slice(15);
                if (forwardsPositions.includes(a.Position) && !forwardsPositions.includes(b.Position)) {
                    return -1;
                } else if (!forwardsPositions.includes(a.Position) && forwardsPositions.includes(b.Position)) {
                    return 1;
                }
                return 0;
            });
    }

    public getPlayerTemplate(name: string) {
        const player = this.playersStats.find(({Player}) => Player === name );
        if(player) {
            return { template: playerTemplate(player), player };
        }
        throw new Error('player not found');
    }

    protected prepareTeamsButtons(): void {
        this.teamsButtons = this.standings.map(({ Rank, Squad }) => ({ Rank, Squad }));
    }
    public getTeamTemplate(teamRank: string): {template: HTML, team: ITeamStats} {
        const team = this.standings.find(({ Rank }) => Rank === teamRank);
        if (team) {
            return { template: teamTemplate(team), team };
        }
        throw new Error('team not found');
    }
}
