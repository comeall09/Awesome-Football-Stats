import axios from 'axios';
import { ConfigService } from '../config/config.service';

const FOOTBALL_DATA_API_KEY = new ConfigService().get('FOOTBALL_DATA_API_KEY');
const FOOTBALL_DATA_BASE_URL = new ConfigService().get('FOOTBALL_DATA_BASE_URL');

const WEBDATA_BASE_URL = new ConfigService().get('WEBDATA_BASE_URL');

// ferbf api
const playersStats = {
    UCL: '8/Champions-League-Stats',
    EPL: '9/stats/Premier-League-Stats',
    LALIGA: '12/stats/La-Liga-Stats',
    SERIEA: '11/stats/Serie-A-Stats',
    BUNDESLIGA: '20/stats/Bundesliga-Stats',
    LIGUE1: '13/stats/Ligue-1-Stats',
    PRIMEIRALIGA: '32/stats/Primeira-Liga-Stats',

    UKRAINELIGA: '39/stats/Ukrainian-Premier-League-Stats',
    RUSSIANLIGA: '30/stats/Russian-Premier-League-Stats',
    EREDIVISIE: '23/stats/Eredivisie-Stats',
    BELGIANLIGA: '37/stats/Belgian-First-Division-A-Stats',
    SCOTTISHLIGA: '40/stats/Scottish-Premiership-Stats',
    TURKISHLIGA: '26/stats/Super-Lig-Stats',
    SAUDILIGA: '70/stats/Saudi-Professional-League-Stats',
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
                baseUrl: `${WEBDATA_BASE_URL}/comps/`,
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
