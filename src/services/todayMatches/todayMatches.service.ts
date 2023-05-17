import { LeaguesDict } from './../../utils/dict';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
dayjs.extend(utc);

import { axiosInstances } from '../../utils/api';
import { ITodayMatch } from '../../entities/match.interface';
import { IMatchResponse, IResponse, MatchStatus, topLeaguesIds } from './utils';

export class TodayMatches {
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
                dateOrTime: dayjs(utcDate).add(3, 'hours').format('HH:mm'),
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

        let markdown = 'Матчи дня (время в мск):\n\n';
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
        markdown += '⚫️ Завершён\n';
        markdown += '🟢 Идёт\n';
        markdown += '🟣 Ещё не начался\n';

        this.template = markdown;
    }
}
