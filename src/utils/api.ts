import axios from 'axios';
import { ConfigService } from '../config/config.service';

const FOOTBALL_DATA_API_KEY = new ConfigService().get('FOOTBALL_DATA_API_KEY');
const FOOTBALL_DATA_BASE_URL = new ConfigService().get('FOOTBALL_DATA_BASE_URL');

const WEBDATA_BASE_URL = new ConfigService().get('WEBDATA_BASE_URL');

// ferbf api
const playersStats = {
    UCL: '8',
    EPL: '9/stats/Premier-League-Stats#all_stats_standard',
    LALIGA: '12/stats/La-Liga-Stats#all_stats_standard',
    SERIEA: '11/stats/Serie-A-Stats#all_stats_standard',
    BUNDESLIGA: '20/stats/Bundesliga-Stats#all_stats_standard',
    LIGUE1: '13/stats/Ligue-1-Stats#all_stats_standard',
    PRIMEIRALIGA: '32/stats/Primeira-Liga-Stats#all_stats_standard',

    UKRAINELIGA: '39/stats/Ukrainian-Premier-League-Stats#all_stats_standard',
    RUSSIANLIGA: '30',
    EREDIVISIE: '23/stats/Eredivisie-Stats#all_stats_standard',
    BELGIANLIGA: '37',
    SCOTTISHLIGA: '40',
    TURKISHLIGA: '26',
    SAUDILIGA: '70',
};
// ferbf api
enum standings {
    UCL = '8',
    EPL = '9',
    LALIGA = '12',
    SERIEA = '11',
    BUNDESLIGA = '20',
    LIGUE1 = '13',
    PRIMEIRALIGA = '32',

    UKRAINELIGA = '39',
    RUSSIANLIGA = '30',
    EREDIVISIE = '23',
    BELGIANLIGA = '37',
    SCOTTISHLIGA = '40',
    TURKISHLIGA = '26',
    SAUDILIGA = '70',
}

export const axiosInstances = {
    fooballData: {
        api: axios.create({
            baseURL: FOOTBALL_DATA_BASE_URL,
            headers: {
                'X-Auth-Token': FOOTBALL_DATA_API_KEY,
            },
        }),
        queries: {
            todayMatches: 'matches',
            competitions: 'competitions/PL',
        },
    },
};


export const webData = {
    ferbf: {
        api: axios.create({
            baseURL: `${WEBDATA_BASE_URL}/comps/`
        }),
        queries: {
            standings: {
                UCL: standings.UCL,
                EPL: standings.EPL,
                LALIGA: standings.LALIGA,
                SERIEA: standings.SERIEA,
                BUNDESLIGA: standings.BUNDESLIGA,
                LIGUE1: standings.LIGUE1,

                PRIMEIRALIGA: standings.PRIMEIRALIGA,
                EREDIVISIE: standings.EREDIVISIE,

                UKRAINELIGA: standings.UKRAINELIGA,
                RUSSIANLIGA: standings.RUSSIANLIGA,

                BELGIANLIGA: standings.BELGIANLIGA,
                SCOTTISHLIGA: standings.SCOTTISHLIGA,

                SAUDILIGA: standings.SAUDILIGA,
                TURKISHLIGA: standings.TURKISHLIGA
            },
            playersStats(tournament: keyof typeof playersStats) {
                return `${WEBDATA_BASE_URL}/comps/${playersStats[tournament]}`;
            }
        }
    }
};
