import { IUserSessionData } from './../../context/context.interface';
import { IContextBot } from '../../context/context.interface';
import { Tournaments } from '../../entities/tournaments.interface';

export const checkers = {
    isTournamentsAction(val: string, ctx: IContextBot): RegExpExecArray | null {
        if (Object.values(Tournaments).includes(val as Tournaments)) {
            const currentUserData: IUserSessionData = {
                userId: ctx.callbackQuery!.from.id,
                tournament: { league: val as Tournaments, team: '', player: '' }
            };

            const allUsersExceptCurrent = ctx.session.data?.filter(({userId}) => userId !== ctx.callbackQuery?.from.id);

            if(!ctx.session.data) {
                ctx.session.data = [currentUserData];
            } else {
                ctx.session.data = [...allUsersExceptCurrent, currentUserData];
            }

            return {} as RegExpExecArray;
        } else if (val === 'backToTeams') {
            return {} as RegExpExecArray;
        }
        return null;
    },
    isTeamAction(val: string, ctx: IContextBot): RegExpExecArray | null {
        if (val.startsWith('team')) {
            if (ctx.callbackQuery && 'data' in ctx.callbackQuery) {
                const team = ctx.callbackQuery.data.slice(5); // slice "team-"
                const currentUserData = ctx.session.data.find(({userId}) => userId === ctx.callbackQuery?.from.id) ?? {} as IUserSessionData;
                const allUsersExceptCurrent = ctx.session.data.filter(({userId}) => userId !== ctx.callbackQuery?.from.id);
                ctx.session.data = [
                    ...allUsersExceptCurrent,
                    {
                        userId: currentUserData.userId,
                        tournament: {...currentUserData.tournament, team}
                    }
                ];
            }
            return {} as RegExpExecArray;
        }
        return null;
    },
    isPlayersStatsAction(val: string, ctx: IContextBot): RegExpExecArray | null {
        if(val.startsWith('playersStats-')) {
            if (ctx.callbackQuery && 'data' in ctx.callbackQuery) {
                const team = ctx.callbackQuery.data.slice(13); // slice "playersStats-"
                const currentUserData = ctx.session.data.find(({userId}) => userId === ctx.callbackQuery?.from.id) ?? {} as IUserSessionData;
                const allUsersExceptCurrent = ctx.session.data.filter(({userId}) => userId !== ctx.callbackQuery?.from.id);

                ctx.session.data = [
                    ...allUsersExceptCurrent,
                    {
                        userId: currentUserData.userId,
                        tournament: {...currentUserData.tournament, team}
                    }
                ];
            }
            return {} as RegExpExecArray;
        }
        return null;
    },
    isPlayerAction(val: string, ctx: IContextBot): RegExpExecArray | null {
        if(val.startsWith('playerInfo-')) {
            if (ctx.callbackQuery && 'data' in ctx.callbackQuery) {
                const [_, player, squad] = ctx.callbackQuery.data.split('-');

                const currentUserData = ctx.session.data.find(({userId}) => userId === ctx.callbackQuery?.from.id) ?? {} as IUserSessionData;
                const allUsersExceptCurrent = ctx.session.data.filter(({userId}) => userId !== ctx.callbackQuery?.from.id);
                ctx.session.data = [
                    ...allUsersExceptCurrent,
                    {
                        userId: currentUserData.userId,
                        tournament: {...currentUserData.tournament, team: squad, player}
                    }
                ];
            }
            return {} as RegExpExecArray;
        }
        return null;
    }
};