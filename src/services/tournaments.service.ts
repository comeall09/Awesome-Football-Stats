import * as cheerio from 'cheerio';
import { standingsDict } from '../utils/dict';
import { webData } from '../utils/api';
import { Tournaments } from '../entities/tournaments.interface';

export class TournamentsService {
    private standings: IStandings;
    // temporary data
    // private standings: IStandings = temporaryData;
    public template: { Rank: string; Squad: string }[];

    async fetchStats(tournament: Tournaments) {
        const {
            api,
            queries: { standings },
        } = webData.ferbf;
        try {
            const { data }: { data: HTML } = await api.get(standings[tournament]);

            if (tournament === Tournaments.UCL) {
                this.normalizeUCL(data);
            } else {
                this.normilizeResponse(data);
            }
        } catch (error) {
            throw new Error('api error');
        }

        // temporary template
        // this.prepareTemplate();
    }

    protected normalizeUCL(page: HTML) {
        const $ = cheerio.load(page);
        const groups = $('#div_Group').eq(0);
        console.dir(groups, { depth: null });
        const headers = [];

        // groups
        // только при первой итерации по группам сохраняем заголовки таблиц
        // if (i === 0) {
        //     $(group).find('table thead tr');
        // }
    }

    protected normilizeResponse(page: HTML): void {
        const $ = cheerio.load(page);
        const table = $('table.stats_table').eq(0);

        const headers: Array<keyof ITeamStats> = [];
        table.find('thead tr th').each((_, el) => {
            headers.push($(el).attr('aria-label')! as keyof ITeamStats);
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

        const result: IStandings = [];
        for (let i = 0; i < cells.length; i += headers.length) {
            const obj: Partial<ITeamStats> = {};
            for (let j = 0; j < headers.length; j++) {
                obj[headers[j]] = cells[i + j];
            }
            result.push(obj as ITeamStats);
        }
        this.standings = result as IStandings;
        this.prepareTemplate();
    }

    protected prepareTemplate(): void {
        this.template = this.standings.map(({ Rank, Squad }) => ({ Rank, Squad }));
    }
    public getTeamInfo(teamRank: string): Markdown {
        const team = this.standings.find(({ Rank }) => Rank === teamRank);
        if (team) {
            return getTeamMarkdown(team);
        }
        throw new Error('team not found');
    }
}

const getTeamMarkdown = (team: ITeamStats): Markdown => {
    let markdown = `📊 ${team.Squad}\n\n`;

    markdown += `${standingsDict['Matches Played']}: ${team['Matches Played']}\n`;
    markdown += `${standingsDict.Points}: ${team.Points}\n\n`;

    markdown += `${standingsDict.Wins}: ${team.Wins}\n`;
    markdown += `${standingsDict.Losses}: ${team.Losses}\n`;
    markdown += `${standingsDict.Draws}: ${team.Draws}\n\n`;

    markdown += `${standingsDict['Goals For']}: ${team['Goals For']}\n`;
    markdown += `${standingsDict['Goals Against']}: ${team['Goals Against']}\n`;
    markdown += `${standingsDict['Goal Difference']}: ${team['Goal Difference']}\n\n`;

    if (team.xG && team['xG Allowed'] && team['xG Difference'] && team['xG Difference/90']) {
        markdown += `${standingsDict.xG}: ${team.xG}\n`;
        markdown += `${standingsDict['xG Allowed']}: ${team['xG Allowed']}\n`;
        markdown += `${standingsDict['xG Difference']}: ${team['xG Difference']}\n`;
        markdown += `${standingsDict['xG Difference/90']}: ${team['xG Difference/90']}\n\n`;
    }
    markdown += `${standingsDict['Attendance/Game']}: ${team['Attendance/Game']}\n`;
    markdown += `${standingsDict['Top Team Scorer']}: ${team['Top Team Scorer']}\n`;

    return markdown.trim();
};

type IStandings = ITeamStats[];
interface ITeamStats {
    Rank: string;
    Squad: string;
    "Matches Played": string;
    Wins: string,
    Draws: string,
    Losses: string,
    'Goals For': string,
    'Goals Against': string,
    'Goal Difference': string,
    Points: string,
    'Points/Game': string,
    xG?: string,
    'xG Allowed'?: string,
    'xG Difference'?: string,
    'xG Difference/90'?: string,
    'Last 5': string,
    'Attendance/Game': string,
    'Top Team Scorer': string,
    Goalkeeper: string,
    Notes: string
}

const indicators = { ucl: '🔵', uel: '🟠', uecl: '🟢', relagate: '🔻' };

// const temporaryData = [
//     {
//         Rank: '19',
//         Squad: ' Everton',
//         'Matches Played': '33',
//         Wins: '6',
//         Draws: '10',
//         Losses: '17',
//         'Goals For': '25',
//         'Goals Against': '50',
//         'Goal Difference': '-25',
//         Points: '28',
//         'Points/Game': '0.85',
//         xG: '35.2',
//         'xG Allowed': '56.4',
//         'xG Difference': '-21.2',
//         'xG Difference/90': '-0.64',
//         'Last 5': 'D L L D L',
//         'Attendance/Game': '39,238',
//         'Top Team Scorer': 'Dwight McNeil - 5',
//         Goalkeeper: 'Jordan Pickford',
//         Notes: ''
//     },
//     {
//         Rank: '20',
//         Squad: ' Southampton',
//         'Matches Played': '33',
//         Wins: '6',
//         Draws: '6',
//         Losses: '21',
//         'Goals For': '27',
//         'Goals Against': '57',
//         'Goal Difference': '-30',
//         Points: '24',
//         'Points/Game': '0.73',
//         xG: '31.0',
//         'xG Allowed': '47.0',
//         'xG Difference': '-16.0',
//         'xG Difference/90': '-0.48',
//         'Last 5': 'L L L D L',
//         'Attendance/Game': '30,486',
//         'Top Team Scorer': 'James Ward-Prowse - 7',
//         Goalkeeper: 'Gavin Bazunu',
//         Notes: ''
//     }
// ];