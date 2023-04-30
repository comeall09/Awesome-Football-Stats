import { LiveMatchesService } from '../services/liveMatches.service';
import { Scene } from './scene.class';

export class LiveMatchesScene extends Scene {
    constructor() {
        super('liveMatchesScene');
        this.open();
    }

    async open() {
        this.scene.enter((ctx) => {
            new LiveMatchesService().fetchMatches();
            ctx.reply('live matches scene');
        });
    }
}