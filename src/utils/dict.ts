export const LeaguesDict = {
    'UEFA Champions League': '🇪🇺 Лига Чемпионов УЕФА 🔥',
    Bundesliga: '🇩🇪 Бундеслига',
    'Premier League': '🏴󠁧󠁢󠁥󠁮󠁧󠁿 АПЛ',
    'Primera Division': '🇪🇸 Ла Лига',
    'Serie A': '🇮🇹 Сериа А',
    'Ligue 1': '🇫🇷 Лига 1',

    'Primeira Liga': '🇵🇹 Примейра Лига',
    Eredivisie: '🇳🇱 Эредивизи',
    'Ukrainian Premier League': '🇺🇦 УПЛ',
    'Turkish Süper Lig': '🇹🇷 Тур. Суперлига',
    'Russian Premier League': '🇷🇺 РПЛ',
    'Belgian Pro League': '🇧🇪 Бел. Про-Лига',
    'Scottish Premier League': '🏴󠁧󠁢󠁳󠁣󠁴󠁿 Шотл. Премьер-Лига',
    'Saudi Pro League': '🇸🇦 Сауд. Про-Лига',
};

export const tournamentsDict = {
    UCL: LeaguesDict['UEFA Champions League'],
    EPL: LeaguesDict['Premier League'],
    LALIGA: LeaguesDict['Primera Division'],
    SERIEA: LeaguesDict['Serie A'],
    BUNDESLIGA: LeaguesDict.Bundesliga,
    LIGUE1: LeaguesDict['Ligue 1'],
    PRIMEIRALIGA: LeaguesDict['Primeira Liga'],

    UKRAINELIGA: LeaguesDict['Ukrainian Premier League'],
    RUSSIANLIGA: LeaguesDict['Russian Premier League'],
    EREDIVISIE: LeaguesDict.Eredivisie,
    BELGIANLIGA: LeaguesDict['Belgian Pro League'],
    SCOTTISHLIGA: LeaguesDict['Scottish Premier League'],
    SAUDILIGA: LeaguesDict['Saudi Pro League'],
    TURKISHLIGA: LeaguesDict['Turkish Süper Lig'],
};

const baseDict = {
    Squad: 'Команда',
    'Matches Played': '🆚 Матчей сыграно',
    "Yellow Cards": '🟨 Желтые карточки',
    "Red Cards": '🟥 Красные карточки',
    Minutes: '🕒 Сыграно минут',

    Goals: '⚽️ Голы',
    Assists: '🅰️ Ассисты',
    "Goals + Assists": '📊 Г+А',

    xG: '🔺 Ожидаемые голы (xG)',
    xAG: '🅰️ Ожидаемые ассисты (xAG)',

    'Progressive Passes Rec': '📈 Усп. передачи с продвижением',
    'Progressive Passes': '📈 Передачи с продвижением',

    'Non-Penalty Goals': '⚽️ Голы (не с пенальти)',
    'Progressive Carries': '📈 Продвижение мяча',
};

export const standingsDict = {
    Rank: 'Место',
    Squad: baseDict.Squad,
    'Matches Played': baseDict['Matches Played'],
    Wins: '🏆 Победы',
    Draws: '🤝 Ничьи',
    Losses: '🚫 Поражения',
    'Goals For': '⚽️ Забитые голы',
    'Goals Against': '❌ Пропущенные голы',
    'Goal Difference': '♻️ Разница мячей',
    Points: '✅ Очки',
    'Points/Game': '♻️ Очки/Матчи',
    xG: baseDict.xG,
    'xG Allowed': '🔻 Допущенные xG',
    'xG Difference': '📊 Разница xG',
    'xG Difference/90': '♻️ Разница xG/Матч',
    'Last 5': '📊 Последние 5 матчей',
    'Attendance/Game': '📈 Средняя посещаемость стадиона',
    'Top Team Scorer': '⚽️ Лучший бомбардир',
    Goalkeeper: 'Вратарь',
    Notes: '',
};

export const positionDict = {
    GK: 'Вр',

    DF: 'Защ',
    LB: 'Лз',
    RB: 'Пз',
    CB: 'Цз',
    FB: 'Лз/Пз',

    DM: 'Оп',
    MF: 'Пзщ',
    CM: 'Цпз',
    LM: 'Лпз',
    RM: 'Ппз',
    AM: 'Апз',

    WM: 'Лв/Пв',
    FW: 'Фрв',
    LW: 'Лн',
    RW: 'Пн',
};

export const playerDict = {
    Rk: 'Индекс',
    Player: 'Игрок', // full name
    Nation: 'Национальность',
    Position: '⚡️ Позиция',
    Squad: baseDict.Squad,
    "Current age": '📆 Возраст',

    "Matches Played": baseDict['Matches Played'],
    Starts: '⏳ Матчей со старта',
    Minutes: baseDict.Minutes,
    "90s Played": '♻️ Среднее число матчей к 90мин', // среднее количество минут/матч
    "Yellow Cards": baseDict['Yellow Cards'],
    "Red Cards": baseDict['Red Cards'],

    Goals: baseDict.Goals,
    Assists: baseDict.Assists,
    "Goals + Assists": baseDict['Goals + Assists'],
    "Non-Penalty Goals": baseDict['Non-Penalty Goals'],

    'Penalty Kicks Made': '⚽️ Забито с пенальти',
    'Penalty Kicks Attempted': '❌ Промазано пенальти',

    'Progressive Carries': baseDict['Progressive Carries'],
    'Progressive Passes': baseDict['Progressive Passes'],
    'Progressive Passes Rec': baseDict['Progressive Passes Rec'],

    xG: baseDict.xG,
    "Non-Penalty xG": '📈 xG без учёта пенальти (npxG)', // Non-Penalty xG
    xAG: baseDict.xAG,
    "npxG + xAG": '📊 npxG + xAG',

    "Non-Penalty Goals + Assists/90": '📊 Голы + Ассисты без учёта пенальти',
    'xG + xAG/90': '📈 xG + xAG',
    'npxG/90': '♻️ xG без учёта пенальти (npxG)/90мин',
};

export const statisticsDict: Record<string, string> = {
    "Goals": baseDict.Goals,
    "Assists": baseDict.Assists,
    "Goals + Assists": baseDict['Goals + Assists'],

    'Key Passes': '📈 Ключевые передачи',
    Touches: '✴️ Касания мяча',
    'Successful Take-Ons': '🥇 Успешные дриблинги',
    'Red Cards': baseDict['Red Cards'],
    'Yellow Cards': baseDict['Yellow Cards'],
    'Pass Completion %': '📊 % Успешных передач',
    xG: baseDict.xG,
    xAG: baseDict.xAG,
    'Shots Total': '🎯 Удары',
    'Progressive Passes Rec': baseDict['Progressive Passes Rec'],
    'Progressive Passes': baseDict['Progressive Passes'],
    'Progressive Carries': baseDict['Progressive Carries'],
    Blocks: '🚫 Заблокированные удары',
    'Aerials won': '🔱 Выигранные воздушные дуэли',
    'Non-Penalty Goals': baseDict['Non-Penalty Goals'],
    Minutes: baseDict.Minutes,
    Clearances: '⭕️ Выносы мяча',
    'Shot-Creating Actions': '💢 Действия, приведшие к ударам',
    'Points per Match': '🟢 Очки за матч',
    Tackles: '⚠️ Отборы',
    Interceptions: '✅ Перехваты',
    'Fouls Committed': '❌ Фолы',
    'Fouls Drawn': '❎ Заработанные фолы',

    'Clean Sheets': '🔒 Сухие матчи',
    Saves: '🥅 Сейвы',
};

export const statsPriorityOrder = [
    "Goals",
    "Assists",
    "Goals + Assists",
    "Non-Penalty Goals",
    "xG",
    "xAG",
    "Shots Total",
    "Key Passes",
    "Pass Completion %",
    "Minutes",

    "Progressive Passes",
    "Progressive Passes Rec",
    "Progressive Carries",

    "Successful Take-Ons",
    "Shot-Creating Actions",

    "Aerials won",
    "Interceptions",
    "Tackles",
    "Blocks",
    "Clearances",
    'Touches',
    'Fouls Committed',
    'Fouls Drawn',

    "Clean Sheets",
    "Saves",

    "Points per Match",
    "Yellow Cards",
    "Red Cards",
];