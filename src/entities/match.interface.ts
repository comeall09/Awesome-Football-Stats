import { LeaguesDict } from '../utils/dict';

export enum MatchStatus {
    SCHEDULED = 'SCHEDULED',
    TIMED = 'TIMED',
    IN_PLAY = 'IN_PLAY',
    PAUSED = 'PAUSED',
    FINISHED = 'FINISHED',
    SUSPENDED = 'SUSPENDED',
    POSTPONED = 'POSTPONED',
    CANCELLED = 'CANCELLED',
    AWARDED = 'AWARDED',
}

export const enum LiveMatchStatusType {
    HALFTIME = 'HALFTIME',
    IN_PROCCESS = 'IN_PROCCESS',
}

export interface IGoalScoarer {
    time: string;
    author: string;
}

export interface IMatchPlayer {
    id: UniqueId;
    name: string;
    number: number;
    team: 'Home' | 'away';
}

export interface IMatchStats {
    possession: string;
    shots: string;
    onTarget: string;
    offTarget: string;
    fouls: string;
    corners: string;
    offsides: string;
    yellowCards: string;
    redCards: string;
    saves: string;
}

interface IMatchTeam {
    name: string;
    shortName?: string;
    icon?: URLString;
    initials?: string; // Real Mardid => RMA
}

export interface IMatch {
    id: UniqueId;
    leagueName: typeof LeaguesDict[keyof typeof LeaguesDict];
    status: MatchStatus;
    result: string;
    dateOrTime: string;

    homeTeam: IMatchTeam;
    awayTeam: IMatchTeam;

    goalScorers?: {
        player: IMatchPlayer;
        time: string;
        count: number;
    };
    scores?: {
        home: number;
        away: number;
    };

    referee?: string;

    // additional info
    homeTeamCoach?: string;
    awayTeamCoach?: string;
    stadium?: string;
    subtitutions?: IMatchPlayer[];
    statistics?: IMatchStats;
    lineups?: {
        home: IMatchPlayer[],
        away: IMatchPlayer[]
    };
}


export type ITodayMatch = Pick<IMatch, 'leagueName' | 'homeTeam' | 'awayTeam' | 'dateOrTime' | 'status' | 'scores'>;