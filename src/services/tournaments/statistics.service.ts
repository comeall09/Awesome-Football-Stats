import { doc, getDoc, updateDoc } from 'firebase/firestore';
import dayjs from 'dayjs';
import * as cheerio from 'cheerio';
import puppeteer from 'puppeteer';

import { db } from '../../firebase.config';
import { webData } from '../../utils/api';

import { IStatistics, IStatisticsAdditional, IStatisticsMain, IStatItem, mainStatsKeys } from './utils';
import { statisticsDict, statsPriorityOrder } from '../../utils/dict';
import { Tournaments } from '../../entities/tournaments.interface';

export async function fetchStatistics(league: Tournaments, addt: boolean): Promise<string[]>;
export async function fetchStatistics(league: Tournaments, addt: boolean, stat: keyof IStatistics): Promise<HTML>;

export async function fetchStatistics(league: Tournaments, addt: boolean, statKey?: keyof IStatistics) {
    const firebase = new StatisticsFirebase();
    const ferbfApi = new StatisticsApi();

    let stats: IFerbfResponse = { mainStats: {}, additionalStats: {} } as IFerbfResponse;

    try {
        stats.mainStats = await firebase.fetchMain(league) ?? {} as IStatisticsMain;

        if (addt) {
            stats.additionalStats = await firebase.fetchAdditional(league) ?? {} as IStatisticsAdditional;
        }

        if (!Object.keys(stats.mainStats).length || (addt && !Object.keys(stats.additionalStats).length)) {
            const response = await ferbfApi.fetch(league);
            if (response) {
                const { mainStats, additionalStats } = response;

                await firebase.updateMain(league, mainStats);
                await firebase.updateAdditional(league, additionalStats);
                stats = response;
            } else throw new Error();
        }

        if (statKey) return getStatsTemplate(stats, statKey);
        return getStatsButtons(stats, addt);
    } catch {
        throw new Error('page not found');
    }
}

function getStatsButtons(stats: IFerbfResponse, addt: boolean) {
    const keys = Object.keys(stats.mainStats);

    keys.sort((a, b) => {
        const priorityA = statsPriorityOrder.indexOf(a);
        const priorityB = statsPriorityOrder.indexOf(b);

        if (priorityA === -1 && priorityB === -1) {
            // если оба элемента не найдены в priorityOrder,
            // то возвращаем порядок из оригинального массива
            return keys.indexOf(a) - keys.indexOf(b);
        } else if (priorityA === -1) {
            // если только первый элемент не найден в priorityOrder,
            // то считаем его менее приоритетным и перемещаем его назад
            return 1;
        } else if (priorityB === -1) {
            // если только второй элемент не найден в priorityOrder,
            // то считаем его менее приоритетным и перемещаем его назад
            return -1;
        } else {
            // если оба элемента найдены в priorityOrder,
            // то сравниваем их порядок в этом массиве
            return priorityA - priorityB;
        }
    });

    if(addt) keys.push(...Object.keys(stats.additionalStats));

    return keys;
}

function getStatsTemplate(stats: IFerbfResponse, key: keyof IStatistics): HTML {
    const stat = stats.mainStats[key as keyof IStatisticsMain] ?? stats.additionalStats[key];
    const rankIcon: Record<string, string> = {
        '1.': '🥇',
        '2.': '🥈',
        '3.': '🥉',
    };

    let markdown: HTML = `${statisticsDict[key] ?? key}\n\n`;

    stat.map(({ rank, value, who }, i) => {
        const rk: string = rank.length ? rank : `${i + 1}.`;
        return markdown += `${rankIcon[rk] ?? rk} ${who} -${value}\n`;
    });

    return markdown;
}

interface IFerbfResponse {
    mainStats: IStatisticsMain;
    additionalStats: IStatisticsAdditional;
}
// ferbf api
class StatisticsApi {
    public async fetch(league: Tournaments): Promise<IFerbfResponse | undefined> {
        const { queries: { standings } } = webData.ferbf;
        try {
            const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox'] });
            const page = await browser.newPage();
            const url = `${standings.baseUrl}/${standings[league]}`;

            await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 10_000 });
            await page.waitForSelector('#div_leaders');
            const content = await page.content();
            await browser.close();
            return this.parse(content);
        } catch (error) {
            console.log(error);
            throw new Error();
        }
    }

    private parse(page: HTML): IFerbfResponse {
        const $ = cheerio.load(page);
        const table = $('#div_leaders');

        const stats: IStatistics = {} as IStatistics;

        table.find('table').each((_, el) => {
            const header = $(el).find('caption').text();
            if (!stats[header]) {
                stats[header] = [];
            }
            let tempObj: IStatItem = {} as IStatItem;
            $(el).find('tbody tr').each((__, tr) => {
                tr.children.map((stat) => {
                    const key = $(stat).attr('class');
                    const val = $(stat).text();
                    if (key && ['rank', 'who', 'value'].includes(key)) {
                        tempObj[key as keyof IStatItem] = val;
                        if (key === 'value') {
                            stats[header]!.push(tempObj);
                            tempObj = {} as IStatItem;
                        }
                    }
                });
            });
        });

        const [mainStats, additionalStats] = Object.keys(stats).reduce((acc: [IStatisticsMain, IStatisticsAdditional], key) => {
            if (key in mainStatsKeys) {
                acc[0][key as keyof IStatisticsMain] = stats[key];
            } else {
                const correctedKey = key
                    .replace(/\//g, ' ') // replace '/'
                    .replace('+', 'and');
                acc[1][correctedKey] = stats[key];
            }
            return acc;
        }, [{}, {}] as [IStatisticsMain, IStatisticsAdditional]);

        return { mainStats, additionalStats };
    }
}

class StatisticsFirebase {
    public async fetchMain(league: Tournaments): Promise<IStatisticsMain | undefined> {
        const statsRef = doc(db, league, "statistics", 'main', 'list');

        try {
            const response = (await getDoc(statsRef)).data() as IStatisticsMain & { date?: string; };

            const isExist = response && Object.keys(response).length;
            const isToday = isExist && dayjs().format('YYYY-MM-DD') === response.date;
            delete response.date;
            if (isExist && isToday) return response;
            throw new Error();
        } catch {
            return undefined;
        }
    }

    public async updateMain(league: Tournaments, statistics: IStatisticsMain) {
        const statsRef = doc(db, league, "statistics", 'main', 'list');

        await updateDoc(statsRef, {
            date: dayjs().format('YYYY-MM-DD'),
            ...statistics
        });
    }

    public async fetchAdditional(league: Tournaments): Promise<IStatisticsAdditional | undefined> {
        const statsRef = doc(db, league, "statistics", 'additional', 'list');

        try {
            const response = (await getDoc(statsRef)).data() as IStatisticsAdditional & { date?: string; };
            const isExist = response && Object.keys(response).length;
            const isToday = isExist && dayjs().format('YYYY-MM-DD') === response.date;
            delete response.date;
            if (isExist && isToday) return response;
            throw new Error();
        } catch {
            return undefined;
        }
    }

    public async updateAdditional(league: Tournaments, statistics: IStatisticsAdditional) {
        const statsRef = doc(db, league, 'statistics', 'additional', 'list');

        await updateDoc(statsRef, {
            date: dayjs().format('YYYY-MM-DD'),
            ...statistics
        });
    }
}
