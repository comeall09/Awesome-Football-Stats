import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
dayjs.extend(utc);

import { axiosInstances } from '../utils/api';
import { LeaguesDict } from '../utils/dict';
import { ITodayMatch } from '../entities/match.interface';
import { Matches } from './match.class';

export class TodayMatches extends Matches {
    public matches: ITodayMatch[];
    public template: string | undefined;

    async fetchMatches() {
        const {
            // allFootball: { api, queries },
            fooballData: { api, queries },
        } = axiosInstances;

        const res: IResponse = await api.get(queries.todayMatches);
        if (res?.data?.matches?.length) {
            const matches: IMatchResponse[] = res.data.matches;
            this.normilizeResponse(matches);
        }
    }

    normilizeResponse(matches: IMatchResponse[]) {
        const topMatches = matches.filter(({ competition }) => topLeaguesIds.includes(Number(competition.id)));

        const normalizedMatches: ITodayMatch[] = topMatches?.map(
            ({ competition, homeTeam, awayTeam, utcDate, status, score }) => ({
                homeTeam: {
                    name: homeTeam.name,
                    shortName: homeTeam.shortName,
                    icon: homeTeam.crest,
                    initials: homeTeam.tla,
                },
                awayTeam: {
                    name: awayTeam.name,
                    shortName: awayTeam.shortName,
                    icon: awayTeam.crest,
                    initials: awayTeam.tla,
                },
                dateOrTime: dayjs(utcDate).subtract(2, 'hours').format('HH:mm'),
                leagueName: LeaguesDict[competition.name],
                status,
                scores: {
                    home: score.fullTime.home,
                    away: score.fullTime.away,
                },
            })
        );
        this.matches = normalizedMatches;
        this.prepareTemplate();
    }

    prepareTemplate() {
        const groupedLeagues: { [key in string]: ITodayMatch[] } = {};

        this.matches.forEach((match) => {
            if (groupedLeagues[match.leagueName]) {
                groupedLeagues[match.leagueName].push(match);
            } else {
                groupedLeagues[match.leagueName] = [match];
            }
        });

        let markdown = 'Матчи на сегодня (время в мск):\n\n';
        for (const leagueName in groupedLeagues) {
            const leagueMatches = groupedLeagues[leagueName].sort((a, b) => a.dateOrTime.localeCompare(b.dateOrTime));
            markdown += `${leagueName}:\n`;
            leagueMatches.forEach(({ homeTeam, awayTeam, dateOrTime, status, scores }) => {
                switch (status) {
                    case MatchStatus.FINISHED:
                        markdown += `⚫️ ${homeTeam.shortName} ${scores?.home ?? 0} : ${scores?.away ?? 0} ${
                            awayTeam.shortName
                        }\n`;
                        break;
                    case MatchStatus.IN_PLAY:
                    case MatchStatus.PAUSED:
                    case MatchStatus.SUSPENDED:
                        markdown += `🟢 ${homeTeam.shortName} ${scores?.home ?? 0} : ${scores?.away ?? 0} ${
                            awayTeam.shortName
                        }\n`;
                        break;
                    default:
                        markdown += `🟣 ${homeTeam.shortName} - ${awayTeam.shortName} ${dateOrTime}\n`;
                }
            });
            markdown += '\n';
        }
        markdown += 'Статус матчей:\n';
        markdown += '⚫️ - завершён\n';
        markdown += '🟢 - идёт\n';
        markdown += '🟣 - ещё не начался\n';

        this.template = markdown;
    }
}

const availableLeagues = [
    // top leagues
    { id: 2021, name: 'Premier League' },
    { id: 2014, name: 'Primera Division', custom: 'La Liga' },
    { id: 2002, name: 'Bundesliga' },
    { id: 2019, name: 'Serie A' },
    { id: 2015, name: 'Ligue 1' },
    { id: 2001, name: 'UEFA Champions League' },
    // others
    { id: 2013, name: 'Campeonato Brasileiro Série A' },
    { id: 2016, name: 'Championship' },
    { id: 2018, name: 'European Championship' },
    { id: 2003, name: 'Eredivisie' },
    { id: 2017, name: 'Primeira Liga' },
    { id: 2152, name: 'Copa Libertadores' },
    { id: 2000, name: 'FIFA World Cup' },
];

const topLeaguesIds = availableLeagues
    .filter(({ id }) => [2021, 2014, 2002, 2019, 2015, 2001].includes(id))
    .map(({ id }) => id);

// api status
enum MatchStatus {
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

interface IResponse {
    data?: {
        matches?: IMatchResponse[]
    }
}

interface IMatchResponse {
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