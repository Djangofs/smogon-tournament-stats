import { google } from 'googleapis';
import { tournamentsData } from './tournaments.data';
import { TournamentDatabase } from './tournaments.model';
import { createPlayer, createTournamentPlayer } from '../player/player.service';
import { createTeam, createTournamentTeam } from '../team/team.service';

export const getAllTournaments = async (): Promise<TournamentDatabase[]> => {
  return tournamentsData.getAllTournaments();
};

export const createTournament = async ({
  name,
  sheetName,
  sheetId,
}: {
  name: string;
  sheetName: string;
  sheetId: string;
}) => {
  let tournament: TournamentDatabase;
  const existingTournament = await tournamentsData.findTournament({ name });
  if (existingTournament) {
    console.log(`Tournament ${name} already exists`);
    tournament = existingTournament;
  } else {
    tournament = await tournamentsData.createTournament({ name });
  }

  // Get Data from Google Sheets Api
  const sheets = google.sheets({
    version: 'v4',
    auth: process.env.GOOGLE_API_KEY,
  });

  // Don't need the full range, a sheet name gets everything in that sheet
  const sheetsData = await sheets.spreadsheets.values.get({
    spreadsheetId: sheetId,
    range: sheetName,
  });

  const data = sheetsData.data.values;

  const priceIndex = data[0].findIndex((cell: string) => cell.includes('Cost'));
  // Find the player column
  const playerIndex = data[0].findIndex((cell: string) =>
    cell.includes('Player')
  );
  const teamIndex = data[0].findIndex((cell: string) => cell.includes('Team'));

  // Make any new teams
  const teams = data.slice(1).map((row: string[]) => row[teamIndex]);
  const uniqueTeams = [...new Set(teams)].filter((team) => !team.includes('/'));
  const teamPromises = uniqueTeams.map((team) => createTeam({ name: team }));
  const createdTeams = await Promise.all(teamPromises);

  // Create the tournament_teams
  const tournamentId = tournament.id;
  const tournamentTeamPromises = createdTeams.map((team) =>
    createTournamentTeam({ tournamentId, teamId: team.id })
  );
  const tournamentTeams = await Promise.all(tournamentTeamPromises);

  const betterData = data.slice(1).map((row: string[]) => {
    const player = row[playerIndex];
    let team = row[teamIndex];
    // TODO: Add second team record for players who were traded
    if (team.includes('/')) {
      team = team.split('/')[0].trim();
    }
    const price = row[priceIndex];
    // const tiers = row[0].split(' / ');
    // const record = row[0].split(' - ');
    // const wins = record[0];
    // const losses = record[1];
    // const weeks = row.slice(1, 10);
    // const semis = row[10];
    // const finals = row[11];
    // const semisTiebreak = row[12];
    // const finalsTiebreak = row[13];
    return {
      player,
      team,
      price,
    };
  });

  // Make any new players
  const players = betterData.map((row) => row.player);
  const uniquePlayers = [...new Set(players)];
  const playerPromises = uniquePlayers.map((player) =>
    createPlayer({ name: player })
  );
  const createdPlayers = await Promise.all(playerPromises);

  // Create the tournament_players
  const tournamentPlayerPromises = betterData.map((data) => {
    const teamId = createdTeams.find((team) => data.team === team.name).id;
    const tournamentTeamId = tournamentTeams.find(
      (team) => team.teamId === teamId
    ).id;
    const playerId = createdPlayers.find(
      (player) => data.player === player.name
    ).id;
    return createTournamentPlayer({
      tournamentTeamId,
      playerId,
      price: Number(data.price),
    });
  });

  const tournamentPlayers = await Promise.all(tournamentPlayerPromises);

  // Create the rounds

  // Get all players and add any which are new
  // Get and then add all the matches

  // Overall Ciele sheet:
  //   [
  //     "Player:",
  //     "Team:",
  //     "Cost:",
  //     "Tier(s):",
  //     "Wins:",
  //     "Losses:",
  //     "Week 1:",
  //     "Week 2:",
  //     "Week 3:",
  //     "Week 4:",
  //     "Week 5:",
  //     "Week 6:",
  //     "Week 7:",
  //     "Week 8:",
  //     "Week 9:",
  //     "Semis:",
  //     "Finals:",
  //     "Tiebreak (Semis):",
  //     "Tiebreak (Final):"
  // ],

  //   [
  //     "blunder", // Player
  //     "Tyrants", // Team
  //     "25500", // Price
  //     "USM / ORAS OU", // Tier
  //     "9", // W
  //     "3", // L
  //     "vs. reiku (W)",
  //     "vs. Hiye (W)",
  //     "vs. ABR (L)",
  //     "vs. Cdumas (W)",
  //     "vs. Kickasser (W)",
  //     "vs. The Hallows (W)",
  //     "vs. High Impulse (W)",
  //     "vs. Will of Fire (W)",
  //     "vs. insult (W)",
  //     "vs. Charmflash (W)",
  //     "vs. Empo (L)",
  //     "",
  //     "vs. lax (L)"
  // ],

  // SPL XV sheet format:
  //   [
  //     "",
  //     "",
  //     "Rank",
  //     "Spr.",
  //     "Player",
  //     "",
  //     "Team",
  //     "Cost",
  //     "Tier(s)",
  //     "Record",
  //     "",
  //     "Week 1",
  //     "",
  //     "",
  //     "",
  //     "Week 2",
  //     "",
  //     "",
  //     "",
  //     "Week 3",
  //     "",
  //     "",
  //     "",
  //     "Week 4",
  //     "",
  //     "",
  //     "",
  //     "Week 5",
  //     "",
  //     "",
  //     "",
  //     "Week 6",
  //     "",
  //     "",
  //     "",
  //     "Week 7",
  //     "",
  //     "",
  //     "",
  //     "Week 8",
  //     "",
  //     "",
  //     "",
  //     "Week 9",
  //     "",
  //     "",
  //     "",
  //     "Semi Finals",
  //     "",
  //     "",
  //     "",
  //     "Semi Finals Tiebreak",
  //     "",
  //     "",
  //     "",
  //     "Finals",
  //     "",
  //     "",
  //     "",
  //     "Finals Tiebreak"
  // ],
  // [],
  // [],
  // [
  //     "",
  //     "",
  //     "#1",
  //     "",
  //     "484704",
  //     "hellom",
  //     "Scooters",
  //     "6000",
  //     " SV ",
  //     "10 - 1",
  //     "999.1666667",
  //     "W",
  //     "vs. JustFranco",
  //     "SV",
  //     "",
  //     "W",
  //     "vs. Fogbound Lake",
  //     "SV",
  //     "",
  //     "W",
  //     "vs. lax",
  //     "SV",
  //     "",
  //     "W",
  //     "vs. Trosko",
  //     "SV",
  //     "",
  //     "W",
  //     "vs. DonSalvatore",
  //     "SV",
  //     "",
  //     "W",
  //     "vs. crying",
  //     "SV",
  //     "",
  //     "W",
  //     "vs. mncmt",
  //     "SV",
  //     "",
  //     "W",
  //     "vs. Floss",
  //     "SV",
  //     "",
  //     "W",
  //     "vs. entrocefalo",
  //     "SV",
  //     "",
  //     "W",
  //     "vs. Storm Zone",
  //     "SV",
  //     "",
  //     "L",
  //     "vs. Trosko",
  //     "SV",
  //     "",
  //     "",
  //     "",
  //     "",
  //     "",
  //     "",
  //     "",
  //     "",
  //     "",
  //     "",
  //     "Ruiners"
  // ],

  return sheetsData;

  return tournamentsData.createTournament({ name });
};
