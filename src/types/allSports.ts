import { UniqueId } from 'shared-kernel';

export interface LeaguesAndCoutriesId {
    result: {
        league_name: string;
        country_name: string;
        league_key: UniqueId;
        country_key: UniqueId;
    }[];
}

export interface NormalizedLeaguesAndCountriesId {
    leaguesId: UniqueId[];
    countriesId: UniqueId[];
}

export interface Livescore {
    result: {
        league_key?: UniqueId;
        country_key?: UniqueId;
        [key: string]: string | undefined;
    }[];
}

export interface NormalizedLivescore {
    home_team?: string;
    final_result?: string;
    away_team?: string;
    home_formation?: string;
    away_formation?: string;
    stadium?: string;
    referee?: string;
    leagues_key?: UniqueId;
    country_key?: UniqueId;
    statistics?: {
        type: string;
        home: string;
        away: string;
    }[];
    [key: string]: string | { type: string; home: string; away: string }[] | undefined;
}