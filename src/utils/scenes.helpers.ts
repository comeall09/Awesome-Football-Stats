interface IScene {
    name: string;
    action: string;
}

export const scenesUtils: IScene[] = [
    { name: 'todayMatchesScene', action: 'Матчи дня ⚽️' },
    // { name: 'liveMatchesScene', action: 'Матчи в Live 💥' },
    { name: 'tournamentsScene', action: 'Турниры 🏆' },
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
