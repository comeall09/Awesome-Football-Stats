import { LeaguesDict } from '../../utils/dict';

export const availableLeagues = [
    // top leagues
    { id: 2021, name: 'Premier League' },
    { id: 2014, name: 'Primera Division', custom: 'La Liga' },
    { id: 2002, name: 'Bundesliga' },
    { id: 2019, name: 'Serie A' },
    { id: 2015, name: 'Ligue 1' },
    { id: 2001, name: 'UEFA Champions League' },
    // others
    { id: 2003, name: 'Eredivisie' },
    { id: 2017, name: 'Primeira Liga' },
    { id: 2013, name: 'Campeonato Brasileiro Série A' },
    { id: 2016, name: 'Championship' },
    { id: 2018, name: 'European Championship' },
    { id: 2152, name: 'Copa Libertadores' },
    { id: 2000, name: 'FIFA World Cup' },
];

export const topLeaguesIds = availableLeagues
    .filter(({ id }) => [2021, 2014, 2002, 2019, 2015, 2001, 2003, 2017].includes(id))
    .map(({ id }) => id);

// api status
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

export interface IResponse {
    data?: {
        matches?: IMatchResponse[]
    }
}

export interface IMatchResponse {
    matchDay: number;
    status: MatchStatus;
    utcDate: Date;

    area: {
        id: UniqueId;
        name: string;
    };
    competition: {
        id: UniqueId;
        name: keyof typeof LeaguesDict;
    };
    season: {
        id: UniqueId;
    };

    homeTeam: {
        name: string;
        shortName: string;
        tla: string; // Real Madrid => RMA
        crest: URLString; // club icon
    };
    awayTeam: {
        name: string;
        shortName: string;
        tla: string; // Real Madrid => RMA
        crest: URLString; // club icon
    };

    referees: {
        id: UniqueId;
        name: string;
        nationality: string;
    }[];

    score: {
        winner: 'HOME_TEAM' | 'DRAW' | 'AWAY_TEAM';
        fullTime: { home: number; away: number }; // goals count
        halfTime: { home: number; away: number }; // goals count
    };
}