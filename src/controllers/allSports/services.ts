import axios from 'axios';
import { allSportsMethods } from '../../model/leagues';
import {
    LeaguesAndCoutriesId,
    Livescore,
    NormalizedLeaguesAndCountriesId,
    NormalizedLivescore,
} from 'src/types/allSports';

import { NormalizeAllSports, NormalizeUI } from './normalize';

require('dotenv').config();
const ALLSPORTS_API_KEY = process.env.ALLSPORTS_API_KEY;
const BASE_URL = process.env.ALLSPORTS_BASE_URL;

const axiosInstance = axios.create({
    baseURL: BASE_URL,
    params: {
        APIkey: ALLSPORTS_API_KEY,
    },
});

export class AllSportsService {
    static async getLeaguesAndCountriesId(): Promise<NormalizedLeaguesAndCountriesId> {
        const res = await axiosInstance.get<LeaguesAndCoutriesId>(`?met=${allSportsMethods.Leagues}`);
        return NormalizeAllSports.leaguesCountriesId(res.data);
    }

    static async getLivescore(): Promise<NormalizedLivescore[]> {
        const res = await axiosInstance.get<Livescore>(`?met=${allSportsMethods.Livescore}`);
        return NormalizeAllSports.allLivescore(res.data);
    }

    static async getTop5Livescore() {
        const { leaguesId } = await this.getLeaguesAndCountriesId();

        const livescore = await this.getLivescore();
        const top5LeaguesMathces = livescore?.filter((event) =>
            leaguesId?.includes(event.league_key as string)
        );
        return NormalizeUI.livescore(top5LeaguesMathces);
    }
}
