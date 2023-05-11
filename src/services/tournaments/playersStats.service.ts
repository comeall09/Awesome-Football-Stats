import * as cheerio from 'cheerio';
import puppeteer from 'puppeteer';
import dayjs from 'dayjs';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase.config';

import { webData } from '../../utils/api';
import { positionDict } from '../../utils/dict';
import { IPlayerStats } from './utils';
import { Tournaments } from '../../entities/tournaments.interface';
import { convertFlag, playerTemplate } from './helpers';

export class PlayersStatsService {
    private playersStats: IPlayerStats[];
    private teamName: string;

    public async fetch(tournament: Tournaments, teamName: string): Promise<void> {
        const firebase = new PlayerStatsFirebase();
        const ferbfApi = new PlayersStatsApi();
        // Запрашиваем если тима поменялась
        if(this.teamName !== teamName) {
            this.teamName = teamName;
            try {
                const playersStatsFb = await firebase.fetch(tournament, teamName);
                if(playersStatsFb) {
                    this.playersStats = playersStatsFb;
                }
                else {
                    const playersStats = await ferbfApi.fetch(tournament);
                    firebase.update(tournament, playersStats);
                    this.playersStats = playersStats.filter(({ Squad }) => Squad === teamName);
                }
            } catch {
                throw new Error('api error');
            }
        }
    }

    public getPlayersButtons(): Pick<IPlayerStats, 'Player' | 'Nation' | 'Squad' >[] {
        return this.playersStats
            .map(({ Player, Nation, Squad, Position }) => ({ Player, Nation: convertFlag(Nation), Squad, Position }))
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

    public getPlayerTemplate(teamName: string, playerName: string): HTML {
         const player = this.playersStats.find(({ Squad, Player }) => Squad === teamName && Player === playerName);
        return playerTemplate(player!);
    }
}

class PlayersStatsApi {
    private page: HTML;
    public async fetch(tournament: Tournaments): Promise<IPlayerStats[]> {
        const { queries: { playersStats } } = webData.ferbf;
        if(!this.page) {
            try {
                const browser = await puppeteer.launch({ headless: 'new' });
                const page = await browser.newPage();
                const url = playersStats(tournament);

                await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 10_000 });
                await page.waitForSelector('#div_stats_standard');
                const content = await page.content();
                browser.close();
                this.page = content;
            } catch {
                throw new Error('ferbf api error');
            }
        }
        const parsedStats = this.parse(this.page);
        return parsedStats;
    }

    public parse(page: HTML): IPlayerStats[] {
        const $ = cheerio.load(page);
        const table = $('#div_stats_standard');

        const headers: Array<keyof IPlayerStats> = [];
        table.find('table thead tr:nth-of-type(2) th').each((_, el) => {
            headers.push($(el).attr('aria-label') as keyof IPlayerStats);
        });

        const teamCells: cheerio.Element[] = [];
        table.find('table tbody tr').each((_, cell) => {
            $(cell).each(((n, tr) => {
                teamCells.push(tr);
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

        return playersStats;
    }
}

class PlayerStatsFirebase {
    public async fetch(tournament: Tournaments, teamName: string): Promise<IPlayerStats[] | undefined> {
        const playerStatsDocRef = doc(db, tournament, "players-stats");
        try {
            const response = (await getDoc(playerStatsDocRef)).data() as { date: string, players: IPlayerStats[] };
            const isExist = response && response.players.length > 1;
            const isToday = isExist && dayjs().format('YYYY-MM-DD') === response?.date;
            if(isExist && isToday) return response.players.filter(({ Squad }) => Squad === teamName);
            throw new Error();
        } catch {
            return undefined;
        }
    }

    public async update(tournament: Tournaments, playersStats: IPlayerStats[]) {
        const playersStatsRef = doc(db, tournament, 'players-stats');
        await updateDoc(playersStatsRef, {
            players: playersStats,
            date: dayjs().format('YYYY-MM-DD')
        });
    }
}