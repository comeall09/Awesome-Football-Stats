import { Context, Scenes } from 'telegraf';

export interface IContextBot extends Context {
    scene: Scenes.SceneContextScene<IContextBot>;
}