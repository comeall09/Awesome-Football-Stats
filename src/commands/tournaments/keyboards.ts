import { Tournaments } from '../../entities/tournaments.interface';
import { LeaguesDict } from '../../utils/dict';

export const mainLeaguesKeyboard = [
    // [{ text: LeaguesDict['UEFA Champions League'], callback_data: Tournaments.UCL }],
    [{ text: LeaguesDict['Premier League'], callback_data: Tournaments.EPL }],
    [
        { text: LeaguesDict['Primera Division'], callback_data: Tournaments.LALIGA },
        { text: LeaguesDict.Bundesliga, callback_data: Tournaments.BUNDESLIGA },
    ],
    [
        { text: LeaguesDict['Serie A'], callback_data: Tournaments.SERIEA },
        { text: LeaguesDict['Ligue 1'], callback_data: Tournaments.LIGUE1 },
    ],
    [
    ],
    [
        { text: 'Другие лиги', callback_data: 'other-tournaments' },
    ]
];

export const allLeaguesKeyboard = [
    ...mainLeaguesKeyboard.slice(0, -1), // все кроме кнопки Другие лиги
    [
        { text: LeaguesDict['Primeira Liga'], callback_data: Tournaments.PRIMEIRALIGA },
        { text: LeaguesDict['Eredivisie'], callback_data: Tournaments.EREDIVISIE },

    ],

    [
        { text: LeaguesDict['Ukrainian Premier League'], callback_data: Tournaments.UKRAINELIGA },
        { text: LeaguesDict['Russian Premier League'], callback_data: Tournaments.RUSSIANLIGA },
    ],

    [
        { text: LeaguesDict['Scottish Premier League'], callback_data: Tournaments.SCOTTISHLIGA },
        { text: LeaguesDict['Belgian Pro League'], callback_data: Tournaments.BELGIANLIGA },
    ],

    [
        { text: LeaguesDict['Turkish Süper Lig'], callback_data: Tournaments.TURKISHLIGA },
        { text: LeaguesDict['Saudi Pro League'], callback_data: Tournaments.SAUDILIGA },

    ],
];