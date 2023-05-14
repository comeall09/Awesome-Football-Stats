export const uefaIndicators = { ucl: '🔵', uel: '🟠', uecl: '🟢', relagate: '🔻' };

export type IStandings = ITeamStats[];
export interface ITeamStats {
    Rank: string;
    Squad: string;
    'Matches Played': string;
    Wins: string;
    Draws: string;
    Losses: string;
    'Goals For': string;
    'Goals Against': string;
    'Goal Difference': string;
    Points: string;
    'Points/Game': string;
    xG?: string;
    'xG Allowed'?: string;
    'xG Difference'?: string;
    'xG Difference/90'?: string;
    'Last 5': string;
    'Attendance/Game': string;
    'Top Team Scorer': string;
    Goalkeeper: string;
    Notes: string;
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
    'Penalty Kicks Attempted': string;

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

export interface IStatItem {
    rank: string;
    who: string;
    value: string;
}

export interface IStatisticsMain {
    Goals: IStatItem[],
    Assists: IStatItem[],
    'Goals + Assists': IStatItem[],
    'Non-Penalty Goals': IStatItem[],
    'Shots Total': IStatItem[],
    'xG': IStatItem[],
    'xAG': IStatItem[],
    'npxG': IStatItem[],
    'Key Passes': IStatItem[],
    'Pass Completion %': IStatItem[],
    'Progressive Passes': IStatItem[],
    'Shot-Creating Actions': IStatItem[],
    'Tackles': IStatItem[],
    'Blocks': IStatItem[],
    'Interceptions': IStatItem[],
    'Clearances': IStatItem[],
    'Touches': IStatItem[],
    'Successful Take-Ons': IStatItem[],
    'Progressive Carries': IStatItem[],
    'Progressive Passes Rec': IStatItem[],
    'Minutes': IStatItem[],
    'Points per Match': IStatItem[],
    'Yellow Cards': IStatItem[],
    'Red Cards': IStatItem[],
    'Clean Sheets': IStatItem[],
    'Saves': IStatItem[],
    'Aerials won': IStatItem[];
}

export type IStatisticsAdditional = Record<string, IStatItem[]>;

export interface IStatistics extends IStatisticsMain, IStatisticsAdditional { }

export const mainStatsKeys: Record<keyof IStatisticsMain, string> = {
    'Goals': '',
    'Assists': '',
    'Goals + Assists': '',
    'Non-Penalty Goals': '',
    'Shots Total': '',
    'xG': '',
    'xAG': '',
    'npxG': '',
    'Key Passes': '',
    'Pass Completion %': '',
    'Progressive Passes': '',
    'Shot-Creating Actions': '',
    'Tackles': '',
    'Blocks': '',
    'Interceptions': '',
    'Clearances': '',
    'Touches': '',
    'Successful Take-Ons': '',
    'Progressive Carries': '',
    'Progressive Passes Rec': '',
    'Minutes': '',
    'Points per Match': '',
    'Yellow Cards': '',
    'Red Cards': '',
    'Clean Sheets': '',
    'Saves': '',
    'Aerials won': '',
};
