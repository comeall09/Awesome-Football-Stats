import * as Cheerio from 'cheerio';
import puppeteer from 'puppeteer';
import fs from 'fs';

import { Tournaments } from '../../entities/tournaments.interface';
import { webData } from '../../utils/api';

export class UclService {
    statsContent: HTML | null;

    async fetchUCLStats() {
        const url =  webData.ferbf.queries.playersStats(Tournaments.UCL);
        if(!this.statsContent) {
            try {
                const browser = await puppeteer.launch();
                const page = await browser.newPage();
                await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 10_000 });
                await page.waitForSelector('#div_leaders');
                const content = await page.content();
                this.statsContent = content;
                browser.close();

            } catch (error) {
                throw new Error('page not found');
            }
        }
        this.normalizeStats();
    }

    protected normalizeStats() {
        const $ = Cheerio.load(this.statsContent!);
        const leaders = $('#div_leaders');
        fs.writeFile('leaders.html', $(leaders).html() as HTML, () => null);
    }
}