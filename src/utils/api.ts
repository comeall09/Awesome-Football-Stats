import axios from 'axios';
import { ConfigService } from '../config/config.service';

const FOOTBALL_DATA_API_KEY = new ConfigService().get('FOOTBALL_DATA_API_KEY');
const FOOTBALL_DATA_BASE_URL = new ConfigService().get('FOOTBALL_DATA_BASE_URL');

const WEBDATA_BASE_URL = new ConfigService().get('WEBDATA_BASE_URL');
enum ferbf {
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
            baseURL: WEBDATA_BASE_URL
        }),
        queries: {
            standings: {
                UCL: ferbf.UCL,
                EPL: ferbf.EPL,
                LALIGA: ferbf.LALIGA,
                SERIEA: ferbf.SERIEA,
                BUNDESLIGA: ferbf.BUNDESLIGA,
                LIGUE1: ferbf.LIGUE1,

                PRIMEIRALIGA: ferbf.PRIMEIRALIGA,
                EREDIVISIE: ferbf.EREDIVISIE,

                UKRAINELIGA: ferbf.UKRAINELIGA,
                RUSSIANLIGA: ferbf.RUSSIANLIGA,

                BELGIANLIGA: ferbf.BELGIANLIGA,
                SCOTTISHLIGA: ferbf.SCOTTISHLIGA,

                SAUDILIGA: ferbf.SAUDILIGA,
                TURKISHLIGA: ferbf.TURKISHLIGA
            }
        }
    }
};
