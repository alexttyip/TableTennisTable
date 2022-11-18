require('mocha-sinon');
const {expect} = require('chai');
// const expect = chai.expect;

const fs = require('fs');

const app = require('../../src/app');
const proxyquire = require('proxyquire');

const SAVE_DIRECTORY = 'saved_games';

const givenUuid = 'abcdef';
const uuidStub = {v4: () => givenUuid};
const gameState = proxyquire('../../src/league', {'uuid': uuidStub});

describe('league app', function () {
  it('prints empty game state', function () {
    const game = app.startGame(gameState.createLeague());

    expect(game.sendCommand('print')).to.equal('No players yet');
  });

  it('should play a game and autosave on changes', function () {
    // Given
    const fsMock = this.sinon.mock(fs);
    fsMock.expects('mkdirSync').withArgs(SAVE_DIRECTORY, this.sinon.match.any).twice();

    fsMock.expects('writeFileSync').withArgs(
      `${SAVE_DIRECTORY}\\${givenUuid}.json`,
      '[["Player1"]]',
      this.sinon.match.any
    );
    fsMock.expects('writeFileSync').withArgs(
      `${SAVE_DIRECTORY}\\${givenUuid}.json`,
      '[["Player1"],["Player2"]]',
      this.sinon.match.any
    );

    // When
    const league = gameState.createLeague();
    const game = app.startGame(league);
    game.sendCommand('add player Player1');
    game.sendCommand('add player Player2');

    // Then
    fsMock.verify();
  });

  it('plays a game and manually saves', function () {
    // Given
    const saveName = 'test save name';
    const fsMock = this.sinon.mock(fs);
    fsMock.expects('mkdirSync').withArgs(SAVE_DIRECTORY, this.sinon.match.any).exactly(4);

    fsMock.expects('writeFileSync').withArgs(
      `${SAVE_DIRECTORY}\\${givenUuid}.json`,
      this.sinon.match.any,
      this.sinon.match.any
    ).thrice();

    fsMock.expects('writeFileSync').withArgs(
      `${SAVE_DIRECTORY}\\${saveName}.json`,
      '[["Player2"],["Player1"]]',
      this.sinon.match.any
    );

    const league = gameState.createLeague();
    const game = app.startGame(league);
    game.sendCommand('add player Player1');
    game.sendCommand('add player Player2');
    game.sendCommand('record win Player2 Player1');

    // When
    game.sendCommand(`save ${SAVE_DIRECTORY}\\${saveName}.json`);

    // Then
    fsMock.verify();
  });

  it('starts and loads a saved game', function () {
    // Given
    const saveName = 'test save name';
    const fsMock = this.sinon.mock(fs);

    const league = gameState.createLeague();
    const game = app.startGame(league);

    game.sendCommand(`load  ${SAVE_DIRECTORY}\\${saveName}.json`);

    fsMock.expects('mkdirSync').withArgs(SAVE_DIRECTORY, this.sinon.match.any).exactly(4);

    fsMock.expects('writeFileSync').withArgs(
      `${SAVE_DIRECTORY}\\${givenUuid}.json`,
      this.sinon.match.any,
      this.sinon.match.any
    ).thrice();

    fsMock.expects('writeFileSync').withArgs(
      `${SAVE_DIRECTORY}\\${saveName}.json`,
      '[["Player2"],["Player1"]]',
      this.sinon.match.any
    );


    game.sendCommand('add player Player1');
    game.sendCommand('add player Player2');
    game.sendCommand('record win Player2 Player1');

    // When
    game.sendCommand(`save ${SAVE_DIRECTORY}\\${saveName}.json`);

    // Then
    fsMock.verify();
  });

  it('should start and load game', function () {
    // Given
    const league = gameState.createLeague();
    const game = app.startGame(league);

    const fsStub = this.sinon.stub(fs, 'readFileSync');
    fsStub.returns('[["Player2"],["Player1"]]');

    // When
    game.sendCommand('load file.json');
    const response = game.sendCommand('print');

    // Then
    expect(response).to.be.equal(
      '          -------------------\n' +
      '          |     Player2     |\n' +
      '          -------------------\n' +
      '------------------- -------------------\n' +
      '|     Player1     | |                 |\n' +
      '------------------- -------------------'
    );
  });


  /*
    it plays a game
    add some users
    record a few wins
    auto saves
    end state is correct
  */

  /*
    it plays a game
    do some stuff
    manually save
   */

  /*
    it starts a game
    loads a save
    print players
   */

});
