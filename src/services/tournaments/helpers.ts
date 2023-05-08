import { playerDict, positionDict, standingsDict } from '../../utils/dict';

export const indicators = { ucl: '🔵', uel: '🟠', uecl: '🟢', relagate: '🔻' };
// es => 🇪🇸
// TODO: некоторые флаги отображаются некорректно
export const convertFlag = (nation: string) => {
    const flag = nation.split(' ')[0];
    return String.fromCodePoint(...[...flag.toUpperCase()].map(char => char.charCodeAt(0) + 127397));
};

const convertPosition = (positions: string) => {
    return positions.toUpperCase().split(',').map((val: string) => {
        const prop = val.toUpperCase().trim();
        if(prop in positionDict) {
            return positionDict[prop as keyof typeof positionDict];
        }
    }).join(', ');
};

const convertAge = (age: string) => {
    return age.split('-')[0];
};

export const teamTemplate = (team: ITeamStats): Markdown => {
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

export const playerTemplate = (player: IPlayerStats) => {
    let markdown = `${convertFlag(player['Nation'])} ${player['Player']}\n`;
    markdown += `${playerDict.Position}: ${convertPosition(player.Position)}\n`;
    markdown += `${playerDict['Current age']}: ${convertAge(player['Current age'])}\n\n`;

    markdown += `${playerDict['Matches Played']}: ${player['Matches Played']}\n`;
    markdown += `${playerDict.Starts}: ${player.Starts}\n`;
    markdown += `${playerDict.Minutes}: ${player.Minutes}\n`;
    markdown += `${playerDict['90s Played']}: ${player['90s Played']}\n\n`;
    markdown += `${playerDict['Yellow Cards']}: ${player['Yellow Cards']}\n`;
    markdown += `${playerDict['Red Cards']}: ${player['Red Cards']}\n\n`;

    markdown += `${playerDict.Goals}: ${player.Goals}\n`;
    markdown += `${playerDict.Assists}: ${player.Assists}\n`;
    markdown += `${playerDict['Goals + Assists']}: ${player['Goals + Assists']}\n`;
    markdown += `${playerDict['Non-Penalty Goals']}: ${player['Non-Penalty Goals']}\n\n`;

    markdown += `${playerDict['Penalty Kicks Made']}: ${player['Penalty Kicks Made']}\n`;
    markdown += `${playerDict['Penalty Kicks Attempted']}: ${player['Penalty Kicks Attempted']}\n\n`;

    markdown += `${playerDict.xG}: ${player.xG}\n`;
    markdown += `${playerDict['Non-Penalty xG']}: ${player['Non-Penalty xG']}\n`;
    markdown += `${playerDict['xAG']}: ${player['xAG']}\n`;
    markdown += `${playerDict['npxG + xAG']}: ${player['npxG + xAG']}\n\n`;

    markdown += `${playerDict['Progressive Carries']}: ${player['Progressive Carries']}\n`;
    markdown += `${playerDict['Progressive Passes']}: ${player['Progressive Passes']}\n`;
    markdown += `${playerDict['Progressive Passes Rec']}: ${player['Progressive Passes Rec']}\n\n`;

    markdown += `📊 Статистика на каждые 90 минут:\n\n`;

    markdown += `${playerDict['Goals']}: ${player['Goals/90']}\n`;
    markdown += `${playerDict['Assists']}: ${player['Assists/90']}\n`;
    markdown += `${playerDict['Goals + Assists']}: ${player['Goals + Assists/90']}\n`;
    markdown += `${playerDict['Non-Penalty Goals']}: ${player['Non-Penalty Goals/90']}\n`;
    markdown += `${playerDict['Non-Penalty Goals + Assists/90']}: ${player['Non-Penalty Goals + Assists/90']}\n`;

    markdown += `${playerDict['xG']}: ${player['xG/90']}\n`;
    markdown += `${playerDict['xAG']}: ${player['xAG/90']}\n`;
    markdown += `${playerDict['xG + xAG/90']}: ${player['xG + xAG/90']}\n`;
    markdown += `${playerDict['Non-Penalty xG']}: ${player['npxG/90']}\n`;

    return markdown;
};

export type IStandings = ITeamStats[];
export interface ITeamStats {
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

export interface IPlayerStats {
    Rk: string;
    Player: string; // full name
    Nation: string;
    Position: string;
    Squad: string; // team name
    "Current age": string;

    "Matches Played": string; // Matches Played
    Starts: string;
    Minutes: string;
    "90s Played": string; // среднее количество минут/матч

    Goals: string; // goals
    Assists: string; // assists
    "Goals + Assists": string; // goals + assists
    "Non-Penalty Goals": string; // Non-Penalty Goals

    'Penalty Kicks Made': string;
    'Penalty Kicks Attempted':string;

    "Yellow Cards": string; // Yellow Cards
    "Red Cards": string; // Red Cards

    xG: string;
    "Non-Penalty xG": string; // Non-Penalty xG
    xAG: string; // Expected Assisted goals ожидаемые ассисты
    "npxG + xAG": string;

    'Progressive Carries': string; // Progressive Carries продвижение мяча в сторону ворот соперника
    'Progressive Passes': string;  // Progressive Passes пас с продвижением мяча в сторону ворот соперника
    'Progressive Passes Rec': string; // Progressive Passes Received успешные пасы с продвижением мяча в сторону ворот соперника

    // stat per 90 minutes
    "Goals/90": string; // Голы на каждые 90 минут
    "Assists/90": string;
    "Goals + Assists/90": string;
    "Non-Penalty Goals/90": string;
    "Non-Penalty Goals + Assists/90": string;
    "xG/90": string;
    'xAG/90': string;
    'xG + xAG/90': string;
    'npxG/90': string;
    // 'npxG + xAG': string;
}