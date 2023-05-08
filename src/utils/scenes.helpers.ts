interface IScene {
    name: string;
    action: string;
}

export const permissions = [
    {user: 'lust', id: 1333220153},
    {user: 'Khamidov', id: 5174774728},
];

export const scenesUtils: IScene[] = [
    { name: 'uclScene', action: '🇪🇺 Лига Чемпионов УЕФА 🔥' },
    { name: 'tournamentsScene', action: 'Чемпионаты 🏆' },
    { name: 'todayMatchesScene', action: 'Матчи дня ⚽️' },
    // { name: 'liveMatchesScene', action: 'Матчи в Live 💥' },
    // { name: 'teamsScene', action: 'Команды 🥇' },
    // { name: 'playersScene', action: 'Игроки 👤' },
];

// [['Сегодняшние матчи', 'Матчи в Live'], ['Турниры',...]]
export function scenesKeyboard() {
    const keyboard = scenesUtils.reduce((keyboards: string[][], scene, i) => {
        // Выводим кнопки парами
        if (i % 2) {
            const lastItem = keyboards[keyboards.length - 1];
            lastItem.push(scene.action);
            return keyboards;
        }
        return [...keyboards, [scene.action]];
    }, []);

    return keyboard;
}
