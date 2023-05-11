import { IContextBot } from '../../context/context.interface';
import { Tournaments } from '../../entities/tournaments.interface';

export const checkers = {
    isTournamentsAction(val: string, ctx: IContextBot): RegExpExecArray | null {
        // при первом клике сохраняем выбранный турнир
        if (Object.values(Tournaments).includes(val as Tournaments)) {
            ctx.state.tournament = val;
            return {} as RegExpExecArray;
        } else if (val === 'backToTeams') {
            return {} as RegExpExecArray;
        }
        return null;
    },
    isTeamAction(val: string, ctx: IContextBot): RegExpExecArray | null {
        if (val.startsWith('team')) {
            if (ctx.callbackQuery && 'data' in ctx.callbackQuery) {
                ctx.state.teamRank = ctx.callbackQuery.data.slice(5); // slice "team-"
            }
            return {} as RegExpExecArray;
        }
        return null;
    },
    isPlayersStatsAction(val: string, ctx: IContextBot): RegExpExecArray | null {
        if(val.startsWith('playersStats-')) {
            if (ctx.callbackQuery && 'data' in ctx.callbackQuery) {
                ctx.state.teamName = ctx.callbackQuery.data.slice(13); // slice "playersStats-"
            }
            return {} as RegExpExecArray;
        }
        return null;
    },
    isPlayerAction(val: string, ctx: IContextBot): RegExpExecArray | null {
        if(val.startsWith('playerInfo-')) {
            if (ctx.callbackQuery && 'data' in ctx.callbackQuery) {
                const [_, player, squad] = ctx.callbackQuery.data.split('-');
                ctx.state.player = player;
                ctx.state.squad = squad;
            }
            return {} as RegExpExecArray;
        }
        return null;
    }
};