# [⚽️ Football Stats Bot](https://t.me/match_stats_squad_bot)

A Telegram bot that brings you real-time access to match data, comprehensive statistics, and insightful information about football leagues, teams, and players

## Screenshots:
<!-- <p>
  <img src="https://github.com/comeall09/readme-storage/blob/main/images/bots/footballBot2.png" width="290" height="550" alt="League standings screenshot" title="League standings" />
  <img src="https://github.com/comeall09/readme-storage/blob/main/images/bots/footballBot3.png" width="290" height="550" alt="Team statistics screenshot" title="Team statistics" />
  <img src="https://github.com/comeall09/readme-storage/blob/main/images/bots/footballBot7.png" width="290" height="550" alt="Today's match list screenshot" title="Today's match list" />
</p> -->
<p>
  <img src="https://github.com/comeall09/readme-storage/blob/main/images/bots/footballBot6.png" width="290" height="530" alt="Player stats screenshot" title="Player stats" />
  <img src="https://github.com/comeall09/readme-storage/blob/main/images/bots/footballBot4.png" width="380" height="530" alt="League stats screenshot" title="League stats" />
</p>
<p>
  <img src="https://github.com/comeall09/readme-storage/blob/main/images/bots/footballBot5.png" width="450" height="300" alt="League single stat screenshot" title="League single stat" />
  <img src="https://github.com/comeall09/readme-storage/blob/main/images/bots/footballBot1.png" width="290" height="300" alt="available commands screenshot" title="Available commands" />
</p>

## Features:
- 📅 Real-time Access to today's match data - match fixtures, live score updates, match status
- 🏆 Comprehensive data on the top 13 football leagues worldwide, including the English Premier League, La Liga, Bundesliga, Serie A, Ligue 1, and more
- 📊 Leagues standings and tournament stats such as points, wins, draws, losses, goals, xG, xaG and etc.
- ⚽️ In-depth statistics on league teams, covering aspects such as average goals per match, possession percentage, pass accuracy, and shots on target
- 👤 Extensive player statistics, including individual player performance data like goals, assists, expected goals, tackles, interceptions, key passes, and other relevant stats

## Tech Stack:
- ⚙️ Node.js, Typescript
- 🤖 [Telegraf.js](https://telegraf.js.org/): A [Telegram API](https://core.telegram.org/) client used for handling Telegram bot functionalities
- 📦 Firebase ([Firestore db](https://firebase.google.com/docs/firestore)): used to store and manage the data
- 🛠️ [Puppeteer](https://pptr.dev/) and [Cheerio](https://cheerio.js.org/): used in combination to scrape data from statistical portals. The data is updated **once** a day, stored in Firestore, and retrieved from there throughout the day

## Installation
1. create `.env` and fill it in:
```shell
cp .env.example .env
```
2. install all dependencies:
```shell
yarn install
```
3. start the nodemon process:
```shell
yarn start
```
