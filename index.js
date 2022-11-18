const app = require('./src/app');
const gameState = require('./src/league');
const readline = require('readline-sync');

const league = gameState.createLeague();
const game = app.startGame(league);

console.log(`Welcome to the table tennis table
=================================

Commands:
- add player <name>
  Example:
    add player Alice

- record win <winner> <loser>
  Example:
    record win Alice Bob

- print
    Prints the current league

- winner
    Prints the name of the player at the top of the league

- save <filepath>
    Save the current league to a JSON file
  Examples:
    save my_league.json
    save ~/some/directory/my_league.json

- load <filepath>
    Load a saved league from a JSON file
  Examples:
    load my_league.json
    load ~/some/directory/my_league.json

- quit
`);

let isGameActive = true;

while (isGameActive) {
  const command = readline.prompt();

  const response = game.sendCommand(command);
  if (response) {
    console.log(response);
  } else if(response === null){
    isGameActive = false;
  }
}
