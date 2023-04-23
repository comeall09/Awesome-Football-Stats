import { leagues } from '../../model/leagues';
import {
    LeaguesAndCoutriesId,
    Livescore,
    NormalizedLeaguesAndCountriesId,
    NormalizedLivescore,
} from 'src/types/allSports';
import { contains, isEqual } from '../../utils/index';

export class NormalizeAllSports {
    static leaguesCountriesId(data: LeaguesAndCoutriesId): NormalizedLeaguesAndCountriesId {
        const leaguesId: string[] = [];
        const countriesId: string[] = [];

        data.result.forEach(({ league_name, country_name, league_key, country_key }) => {
            leagues.forEach(({ name, tournaments }) => {
                if (isEqual(name, country_name) && contains(tournaments, league_name)) {
                    leaguesId.push(league_key);
                    countriesId.push(country_key);
                }
            });
        });
        return { leaguesId, countriesId };
    }
    static allLivescore(data: Livescore): NormalizedLivescore[] {
        const list = data.result.map((eventObj) => {
            const normalized: NormalizedLivescore = {};
            for (const key in eventObj) {
                if (key.startsWith('event')) {
                    const newKey = key.slice(6);
                    normalized[newKey] = eventObj[key];
                } else {
                    normalized[key] = eventObj[key];
                }
            }
            return normalized;
        });
        return list;
    }
}

export class NormalizeUI {
    static livescore(matches: NormalizedLivescore[]): NormalizedLivescore[][] | null {
        if (!matches.length) return null;

            const content = matches?.reduce((acc: NormalizedLivescore[][], curr, i) => {
                if (i % 2 === 0) {
                    acc.push([curr]);
                } else {
                    acc[acc.length - 1].push(curr);
                }
                return acc;
            }, []);
        return content;
    }
}
