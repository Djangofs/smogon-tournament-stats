import { getDbClient } from '../../../database/client';
import {
  tierFixtures,
  generationFixtures,
} from '../fixtures/tournaments.fixtures';

const getRandomTier = () => {
  return tierFixtures[Math.floor(Math.random() * tierFixtures.length)];
};

const getRandomGeneration = () => {
  return generationFixtures[
    Math.floor(Math.random() * generationFixtures.length)
  ];
};

const generateReplayUrl = () => {
  const replayId = Math.random().toString(36).substring(2, 15);
  return `https://replay.pokemonshowdown.com/gen9ou-${replayId}`;
};

export const createGame = async (
  matchId: string,
  overrides: Partial<{
    generation: string;
    tier: string;
    playedAt: Date;
    replayUrl: string;
  }> = {}
) => {
  const defaultData = {
    matchId,
    generation: getRandomGeneration(),
    tier: getRandomTier(),
    playedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000), // Random date within last week
    replayUrl: Math.random() > 0.3 ? generateReplayUrl() : null, // 70% chance of having replay
    ...overrides,
  };

  return await getDbClient().game.create({
    data: defaultData,
  });
};

export const createPlayerGame = async (
  playerId: string,
  gameId: string,
  winner: boolean
) => {
  return await getDbClient().player_Game.create({
    data: {
      playerId,
      gameId,
      winner,
    },
  });
};

export const createGameWithPlayers = async (
  matchId: string,
  player1Id: string,
  player2Id: string,
  gameOverrides = {},
  winner?: 'player1' | 'player2'
) => {
  const game = await createGame(matchId, gameOverrides);

  // Determine winners - someone must win a game
  const player1Winner =
    winner === 'player1' || (!winner && Math.random() > 0.5);
  const player2Winner = !player1Winner;

  const playerGame1 = await createPlayerGame(player1Id, game.id, player1Winner);
  const playerGame2 = await createPlayerGame(player2Id, game.id, player2Winner);

  return { game, playerGames: [playerGame1, playerGame2] };
};

export const createGamesForMatch = async (
  matchId: string,
  player1Id: string,
  player2Id: string,
  bestOf = 1,
  matchWinner?: 'player1' | 'player2'
) => {
  const games = [];
  let player1Wins = 0;
  let player2Wins = 0;
  const winsNeeded = Math.ceil(bestOf / 2);

  // If match winner is specified, work backwards to create realistic game results
  if (matchWinner) {
    const totalGames = Math.min(
      bestOf,
      Math.floor(Math.random() * bestOf) + winsNeeded
    );

    for (let i = 0; i < totalGames; i++) {
      let gameWinner: 'player1' | 'player2';

      // If we're at the last game and need to ensure the match winner wins
      if (i === totalGames - 1) {
        gameWinner = matchWinner;
      } else {
        // Random game winner, but bias toward eventual match winner
        gameWinner =
          Math.random() > 0.3
            ? matchWinner
            : matchWinner === 'player1'
            ? 'player2'
            : 'player1';
      }

      const gameData = await createGameWithPlayers(
        matchId,
        player1Id,
        player2Id,
        {},
        gameWinner
      );

      games.push(gameData);

      if (gameWinner === 'player1') player1Wins++;
      else player2Wins++;
    }
  } else {
    // Random game results
    for (
      let i = 0;
      i < bestOf && player1Wins < winsNeeded && player2Wins < winsNeeded;
      i++
    ) {
      const gameWinner = Math.random() > 0.5 ? 'player1' : 'player2';

      const gameData = await createGameWithPlayers(
        matchId,
        player1Id,
        player2Id,
        {},
        gameWinner
      );

      games.push(gameData);

      if (gameWinner === 'player1') player1Wins++;
      else player2Wins++;
    }
  }

  return { games, matchResult: { player1Wins, player2Wins } };
};
