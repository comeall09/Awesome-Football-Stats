import { Tournaments } from './../entities/tournaments.interface';
import { Context, Scenes } from 'telegraf';

export interface IUserSessionData {
    userId: number;
    tournament: {
        league: Tournaments;
        team: string;
        player: string;
    }
}

interface SceneSession extends Scenes.SceneSession {
    data: IUserSessionData[];
}

export interface IContextBot extends Context {
    scene: Scenes.SceneContextScene<IContextBot>;
    session: SceneSession;
}