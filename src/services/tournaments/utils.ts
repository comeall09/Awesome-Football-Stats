export const uefaIndicators = { ucl: '🔵', uel: '🟠', uecl: '🟢', relagate: '🔻' };

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