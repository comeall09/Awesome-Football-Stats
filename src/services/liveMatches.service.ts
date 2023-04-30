import { axiosInstances } from '../utils/api';
import { IMatch } from '../entities/match.interface';
import { Matches } from './match.class';

export class LiveMatchesService extends Matches {
    template: string | undefined;
    matches: IMatch[] = [];

    async fetchMatches() {
        const {
            fooballData: { api, queries },
        } = axiosInstances;

        // const res: Record<string, any> = await api.get(queries.competitions);
        // console.dir(res.data);

        // if (data.result) {
        //     this.normilizeResponse(data.result);
        // }
    }

    normilizeResponse(matches: unknown) {
        // console.log('normilizing');
        // console.log(matches);
    }

    prepareTemplate(): void {
        throw new Error('Method not implemented.');
    }
}

// api info
const availableLeagues = [
    // top leagues
    { id: 2021, name: '🏴󠁧󠁢󠁥󠁮󠁧󠁿 Premier League' },
    { id: 2014, name: '🇪🇸 Primera Division', custom: 'La Liga' },
    { id: 2002, name: '🇩🇪 Bundesliga' },
    { id: 2019, name: '🇮🇹 Serie A' },
    { id: 2015, name: '🇫🇷 Ligue 1' },
    { id: 2001, name: '🇪🇺 UEFA Champions League' },
    // others
    { id: 2013, name: 'Campeonato Brasileiro Série A' },
    { id: 2016, name: 'Championship' },
    { id: 2018, name: 'European Championship' },
    { id: 2003, name: 'Eredivisie' },
    { id: 2017, name: 'Primeira Liga' },
    { id: 2152, name: 'Copa Libertadores' },
    { id: 2000, name: 'FIFA World Cup' },
];
const topLeagues = availableLeagues
    .filter(({ id }) => [2021, 2014, 2002, 2019, 2015, 2001].includes(id))
    .map(({ id }) => id);
