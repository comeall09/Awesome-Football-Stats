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

type TStatsDict = { [key: string]: string; };
const statsDict: TStatsDict = {
  "Shots Total": "Удары",
  "On Target": "В створ ворот",
  "Off Target": "Мимо ворот",
  "Shots Blocked": "Заблокировано",
  "Shots Inside Box": "Удары из вратарской",
  "Shots Outside Box": "Удары из-за вратарской",
  Fouls: "Фолы",
  Corners: "Угловые",
  Offsides: "Оффсайды",
  "Ball Possession": "Владение мячом",
  "Yellow Cards": "Количество ЖК",
  "Red Cards": "Количество КК",
  Saves: "Сейвы",
  "Passes Total": "Пасы",
  "Passes Accurate": "Точность пасов",
  Substitution: "Замены",
};

type HTML = string;

export class NormalizeUI {
    static livescore(matches: NormalizedLivescore[]): HTML[][] {
            const content = matches?.reduce((acc: string[][], curr, i) => {
      const html = `
<b>${curr?.home_team} ${curr?.final_result} ${curr?.away_team}</b>\n
${curr?.home_formation} vs ${curr?.away_formation}
Стадион: ${curr?.stadium}
Судья: ${curr?.referee}\n
${curr?.statistics
  ?.map(
    ({type, home, away}) => `${statsDict[type] ?? type}: ${home} - ${away}\n`
  )
  .join("")}
`;
            return [...acc, [html]];
            }, []);

        return content;
    }
}
