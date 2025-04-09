import axios from 'axios';
import * as cheerio from 'cheerio';
import logger from '../../utils/logger';

export interface ReplayMatch {
  player1: string;
  player2: string;
  replayUrl: string;
}

/**
 * Extracts replay information from a Smogon tournament replays thread
 * @param url The URL of the tournament replays thread
 * @returns Array of replay information including players and URLs
 */
export const extractReplays = async (url: string): Promise<ReplayMatch[]> => {
  try {
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);
    const replays: ReplayMatch[] = [];

    // Find all links that might be replays
    $('a').each((_, element) => {
      const link = $(element);
      const href = link.attr('href');

      // Skip if not a replay link
      if (!href || !href.includes('replay.pokemonshowdown.com')) {
        return;
      }

      // Get the parent text that contains the player names
      const parentText = link.parent().text().trim();

      // Look for the pattern [TEAM1] Player1 vs Player2 [TEAM2]
      // This handles cases where player names might contain " vs "
      const matchPattern = /\[([^\]]+)\]\s*(.*?)\s*vs\s*(.*?)\s*\[([^\]]+)\]/;
      const match = parentText.match(matchPattern);

      if (!match) return;

      // Extract player names from the match
      const player1Name = match[2].trim();
      const player2Name = match[3].trim();

      replays.push({
        player1: player1Name,
        player2: player2Name,
        replayUrl: href,
      });
    });

    return replays;
  } catch (error) {
    logger.error('Error extracting replays:', error);
    throw new Error('Failed to extract replays');
  }
};
