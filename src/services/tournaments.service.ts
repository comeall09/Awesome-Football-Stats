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
            this.normilizeResponse(data);
        } catch (error) {
            throw new Error('api error');
        }

        // temporary template
        // this.prepareTemplate();
    }
    protected normilizeResponse(matches: HTML): void {
        const $ = cheerio.load(matches);
        const table = $('table.stats_table').eq(0);

        const headers: Array<keyof ITeamStats> = [];
        table.find('thead tr th').each((_, el) => {
            headers.push($(el).attr('aria-label')! as keyof ITeamStats);
        });

        const cells: string[] = [];
        table.find('tbody tr').each((_, tr) => {
            tr.children.map((el) => {
                cells.push($(el).text());
            });
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
    const markdown = `📊 ${team.Squad}\n
${standingsDict['Matches Played']}: ${team['Matches Played']}
${standingsDict.Points}: ${team.Points}\n
${standingsDict.Wins}: ${team.Wins}
${standingsDict.Losses}: ${team.Losses}
${standingsDict.Draws}: ${team.Draws}\n
${standingsDict['Goals For']}: ${team['Goals For']}
${standingsDict['Goals Against']}: ${team['Goals Against']}
${standingsDict['Goal Difference']}: ${team['Goal Difference']}\n
${standingsDict['xG']}: ${team.xG}
${standingsDict['xG Allowed']}: ${team['xG Allowed']}
${standingsDict['xG Difference']}: ${team['xG Difference']}
${standingsDict['xG Difference/90']}: ${team['xG Difference/90']}\n
${standingsDict['Attendance/Game']}: ${team['Attendance/Game']}
${standingsDict['Top Team Scorer']}: ${team['Top Team Scorer']}`;
    return markdown;
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
    xG: string,
    'xG Allowed': string,
    'xG Difference': string,
    'xG Difference/90': string,
    'Last 5': string,
    'Attendance/Game': string,
    'Top Team Scorer': string,
    Goalkeeper: string,
    Notes: string
}

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