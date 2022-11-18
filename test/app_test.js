require('mocha-sinon');
const chai = require('chai');
const expect = chai.expect;

const app = require('../src/app');
const gameState = require('../src/league');
const leagueRenderer = require('../src/league_renderer');
const fileService = require('../src/file_service');

describe('app command processing', function () {
  it('prints the current state of the league', function () {
    // Given
    const league = gameState.createLeague();
    const renderLeague = this.sinon.stub(leagueRenderer, 'render');
    renderLeague.withArgs(league).returns('rendered league');

    // When
    const game = app.startGame(league);
    const result = game.sendCommand('print');

    // Then
    expect(result).to.equal('rendered league');
  });

  it('adds a player to the game', function () {
    // Given
    const league = gameState.createLeague();
    const game = app.startGame(league);
    const mock = this.sinon.mock(league);
    mock.expects('addPlayer').withArgs('Player1');

    // When
    game.sendCommand('add player Player1');

    // Then
    mock.verify();
  });

  it('record a winner', function () {
    // Given
    const league = gameState.createLeague();
    const game = app.startGame(league);
    const mock = this.sinon.mock(league);
    mock.expects('recordWin').withArgs('Player1', 'Player2');

    // When
    game.sendCommand('record win Player1 Player2');

    // Then
    mock.verify();
  });

  it('prints the winner', function () {
    // Given
    const league = gameState.createLeague();
    const game = app.startGame(league);
    const stub = this.sinon.stub(league, 'getWinner');
    stub.withArgs().returns('Winner1');

    // When
    const result = game.sendCommand('winner');

    // Then
    expect(result).to.be.equal('Winner1');
  });

  it('should call file service to save game', function () {
    // Given
    const league = gameState.createLeague();
    const game = app.startGame(league);
    const mock = this.sinon.mock(fileService);
    mock.expects('save').withArgs('file.json', league);

    // When
    game.sendCommand('save file.json');

    // Then
    mock.verify();
  });

  it('should call file service to load game', function () {
    // Given
    const league = gameState.createLeague();
    const game = app.startGame(league);
    const loadedLeague = gameState.createLeague();
    loadedLeague.addPlayer('TestPlayer');

    const stub = this.sinon.stub(fileService, 'load');
    stub.withArgs('file.json').returns(loadedLeague);

    const renderMock = this.sinon.mock(leagueRenderer);
    renderMock.expects('render').withArgs(loadedLeague);

    // When
    game.sendCommand('load file.json');
    game.sendCommand('print');

    // Then
    renderMock.verify();
  });

  it('should return null if user quits', function () {
    // Given
    const league = gameState.createLeague();
    const game = app.startGame(league);

    // When
    const response=game.sendCommand('quit');

    // Then
    expect(response).to.be.equal(null);
  });

  it('should autosave when a player is added', function () {
    // Given
    const league = gameState.createLeague();
    const game = app.startGame(league);
    const mock = this.sinon.mock(fileService);
    mock.expects('save').withArgs(`saved_games\\${league.leagueId}.json`, league);

    // When
    game.sendCommand('add player Player1');

    // Then
    mock.verify();
  });

  it('should autosave when a winner is recorded', function () {
    // Given
    const league = gameState.createLeague();
    const game = app.startGame(league);

    const leagueMock = this.sinon.mock(league);
    leagueMock.expects('recordWin', 'Player1', 'Player2');

    const mock = this.sinon.mock(fileService);
    mock.expects('save').withArgs(`saved_games\\${league.leagueId}.json`, league);

    // When
    game.sendCommand('record win Player1 Player2');

    // Then
    mock.verify();
  });
});
