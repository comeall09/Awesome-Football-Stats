import { playerDict, positionDict, standingsDict } from '../../utils/dict';
import { IPlayerStats, ITeamStats } from './utils';

// es => 🇪🇸
// TODO: некоторые флаги отображаются некорректно
export const convertFlag = (nation: string) => {
    const flag = nation.toUpperCase().split(' ')[0].trim();
    if(flag === 'ENG') return '🏴󠁧󠁢󠁥󠁮󠁧󠁿';
    const flagChars = String.fromCodePoint(...[...flag].map(char => char.charCodeAt(0) + 127397)).trim().split('');
    return flagChars.length > 4 ? '' : flagChars.join('');
};

const convertPosition = (positions: string) => {
    return positions.toUpperCase().split(',').map((val: string) => {
        const prop = val.toUpperCase().trim();
        if(prop in positionDict) {
            return positionDict[prop as keyof typeof positionDict];
        }
    }).join(', ');
};

const convertAge = (age: string) => {
    return age.split('-')[0];
};

export const teamTemplate = (team: ITeamStats): Markdown => {
    let markdown = `📊 ${team.Squad}\n\n`;

    markdown += `${standingsDict['Matches Played']}: ${team['Matches Played']}\n`;
    markdown += `${standingsDict.Points}: ${team.Points}\n\n`;

    markdown += `${standingsDict.Wins}: ${team.Wins}\n`;
    markdown += `${standingsDict.Losses}: ${team.Losses}\n`;
    markdown += `${standingsDict.Draws}: ${team.Draws}\n\n`;

    markdown += `${standingsDict['Goals For']}: ${team['Goals For']}\n`;
    markdown += `${standingsDict['Goals Against']}: ${team['Goals Against']}\n`;
    markdown += `${standingsDict['Goal Difference']}: ${team['Goal Difference']}\n\n`;

    if (team.xG && team['xG Allowed'] && team['xG Difference'] && team['xG Difference/90']) {
        markdown += `${standingsDict.xG}: ${team.xG}\n`;
        markdown += `${standingsDict['xG Allowed']}: ${team['xG Allowed']}\n`;
        markdown += `${standingsDict['xG Difference']}: ${team['xG Difference']}\n`;
        markdown += `${standingsDict['xG Difference/90']}: ${team['xG Difference/90']}\n\n`;
    }
    markdown += `${standingsDict['Attendance/Game']}: ${team['Attendance/Game']}\n`;
    markdown += `${standingsDict['Top Team Scorer']}: ${team['Top Team Scorer']}\n`;

    return markdown.trim();
};

export const playerTemplate = (player: IPlayerStats) => {
    let markdown = `${convertFlag(player['Nation'])} ${player['Player']}\n`;
    markdown += `${playerDict.Position}: ${convertPosition(player.Position)}\n`;
    markdown += `${playerDict['Current age']}: ${convertAge(player['Current age'])}\n\n`;

    markdown += `${playerDict['Matches Played']}: ${player['Matches Played']}\n`;
    markdown += `${playerDict.Starts}: ${player.Starts}\n`;
    markdown += `${playerDict.Minutes}: ${player.Minutes}\n`;
    markdown += `${playerDict['90s Played']}: ${player['90s Played']}\n\n`;
    markdown += `${playerDict['Yellow Cards']}: ${player['Yellow Cards']}\n`;
    markdown += `${playerDict['Red Cards']}: ${player['Red Cards']}\n\n`;

    markdown += `${playerDict.Goals}: ${player.Goals}\n`;
    markdown += `${playerDict.Assists}: ${player.Assists}\n`;
    markdown += `${playerDict['Goals + Assists']}: ${player['Goals + Assists']}\n`;
    markdown += `${playerDict['Non-Penalty Goals']}: ${player['Non-Penalty Goals']}\n\n`;

    markdown += `${playerDict['Penalty Kicks Made']}: ${player['Penalty Kicks Made']}\n`;
    markdown += `${playerDict['Penalty Kicks Attempted']}: ${player['Penalty Kicks Attempted']}\n\n`;

    if(player.xG) markdown += `${playerDict.xG}: ${player.xG}\n`;
    if(player['Non-Penalty xG']) markdown += `${playerDict['Non-Penalty xG']}: ${player['Non-Penalty xG']}\n`;
    if(player.xAG) markdown += `${playerDict['xAG']}: ${player.xAG}\n`;
    if(player['npxG + xAG']) markdown += `${playerDict['npxG + xAG']}: ${player['npxG + xAG']}\n\n`;

    if(player['Progressive Carries']) markdown += `${playerDict['Progressive Carries']}: ${player['Progressive Carries']}\n`;
    if(player['Progressive Passes']) markdown += `${playerDict['Progressive Passes']}: ${player['Progressive Passes']}\n`;
    if(player['Progressive Passes Rec']) markdown += `${playerDict['Progressive Passes Rec']}: ${player['Progressive Passes Rec']}\n\n`;

    markdown += `📊 Статистика на каждые 90 минут:\n\n`;

    if(player['Goals/90']) markdown += `${playerDict['Goals']}: ${player['Goals/90']}\n`;
    if(player['Assists/90']) markdown += `${playerDict['Assists']}: ${player['Assists/90']}\n`;
    if(player['Goals + Assists/90']) markdown += `${playerDict['Goals + Assists']}: ${player['Goals + Assists/90']}\n`;
    if(player['Non-Penalty Goals/90']) markdown += `${playerDict['Non-Penalty Goals']}: ${player['Non-Penalty Goals/90']}\n`;
    if(player['Non-Penalty Goals + Assists/90']) markdown += `${playerDict['Non-Penalty Goals + Assists/90']}: ${player['Non-Penalty Goals + Assists/90']}\n`;

    if(player['xG/90']) markdown += `${playerDict['xG']}: ${player['xG/90']}\n`;
    if(player['xAG/90']) markdown += `${playerDict['xAG']}: ${player['xAG/90']}\n`;
    if(player['xG + xAG/90']) markdown += `${playerDict['xG + xAG/90']}: ${player['xG + xAG/90']}\n`;
    if(player['npxG/90']) markdown += `${playerDict['Non-Penalty xG']}: ${player['npxG/90']}\n`;

    return markdown;
};
