const fs = require('fs');
const gameState = require('./league');
const InvalidArgumentException = require('./invalid_argument_exception');
const pathLib = require('path');

exports.save = function (path, league) {
  const players = league.getPlayers();
  try {
    const parentDir = pathLib.dirname(path);
    fs.mkdirSync(parentDir, { recursive: true });

    fs.writeFileSync(path, JSON.stringify(players), { flag: 'w' });
  } catch (e) {
    if (e.code === 'ENOENT') {
      throw new InvalidArgumentException(`Could not save file to ${path}`);
    }
    throw e;
  }
};

exports.load = function (path) {
  try {
    const fileName = pathLib.parse(path).base;
    const regex = /(.*)\.json$/;
    const found = fileName.match(regex);
    const leagueId = found[1];
    return gameState.load(JSON.parse(fs.readFileSync(path, 'utf8')), leagueId);
  } catch (e) {
    if (e instanceof SyntaxError) {
      throw new InvalidArgumentException(`File is not valid JSON: ${path}`);
    }
    if (e.code === 'ENOENT') {
      throw new InvalidArgumentException(`Could not load file from ${path}`);
    }
    throw e;
  }
};
