import { Scenes } from 'telegraf';
import { IContextBot } from '../context/context.interface';

export abstract class Scene {
    scene: Scenes.BaseScene<IContextBot>;
    constructor(sceneType: string) {
        this.scene = new Scenes.BaseScene<IContextBot>(sceneType);
    }

    abstract open(): void;
    abstract actions(): void;
    abstract checkers?: Record<string, (val: string, ctx: IContextBot) => RegExpExecArray | null>;
}