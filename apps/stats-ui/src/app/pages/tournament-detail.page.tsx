import { useParams, Link } from 'react-router-dom';
import { useGetTournamentByIdQuery } from '../store/apis/tournaments.api';
import { Container, TournamentHighlight } from '../components/layout/layout';
import { Card } from '../components/card/card';
import { PageTitle } from '../components/typography/page-title';
import {
  TournamentTitle,
  TournamentMeta,
} from '../components/typography/typography';
import styled from 'styled-components';

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const TournamentInfo = styled.div`
  display: grid;
  gap: 1rem;
  margin-bottom: 2rem;
`;

const InfoItem = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const Label = styled.span`
  font-weight: 600;
  color: #666;
`;

const RoundsList = styled.div`
  display: grid;
  gap: 2rem;
`;

const RoundCard = styled(Card)`
  padding: 1rem;
`;

const StyledTournamentTitle = styled(TournamentTitle)`
  text-align: center;
`;

const StyledTournamentMeta = styled(TournamentMeta)`
  text-align: center;
`;

const RoundTitle = styled.div`
  margin: 0 0 1rem 0;
  font-size: 1.25rem;
  text-align: center;
`;

const MatchesList = styled.div`
  display: grid;
  gap: 1rem;
  max-width: 600px;
  margin: 0 auto;
`;

const StyledMatchItem = styled.a`
  display: block;
  padding: 0.5rem;
  border-radius: 4px;
  border-bottom: none;
  text-align: center;
  text-decoration: none;
  color: #333;
  transition: all 0.2s ease;
  background-color: transparent;

  &:hover {
    background-color: #f5f5f5;
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    color: #333;
  }
`;

const TeamSection = styled.div`
  margin-bottom: 1rem;
  text-align: center;
`;

const TeamTitle = styled.div`
  font-size: 1.1rem;
  margin-bottom: 0.5rem;
  color: #333;
  text-align: center;
`;

const Winner = styled.span`
  font-weight: 600;
  color: #333;
`;

const TeamMatchup = styled.div`
  margin-bottom: 1.5rem;
  text-align: center;
`;

const BoldText = styled.span`
  font-weight: 600;
`;

const TeamMatchupTitle = styled.div`
  font-size: 1.2rem;
  margin-bottom: 1rem;
  color: #333;
  text-align: center;
`;

const MatchTitle = styled.div`
  text-align: center;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
`;

const MatchFormat = styled.div`
  color: #666;
  font-size: 0.9rem;
`;

const MatchResult = styled.div`
  text-align: center;
`;

const GENERATION_ORDER = [
  'SV',
  'SWSH',
  'SM',
  'ORAS',
  'BW',
  'DPP',
  'ADV',
  'GSC',
  'RBY',
] as const;
const TIER_ORDER = ['OU', 'Uber', 'UU', 'RU', 'NU', 'PU', 'LC'] as const;

export function TournamentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: tournament, isLoading } = useGetTournamentByIdQuery(id || '');

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!tournament) {
    return <div>Tournament not found</div>;
  }

  return (
    <Container>
      <Header>
        <PageTitle>{tournament.name}</PageTitle>
        <div>
          {tournament.isOfficial && (
            <StyledTournamentMeta>
              <span>Official</span>
            </StyledTournamentMeta>
          )}
          {tournament.isTeam && (
            <StyledTournamentMeta>
              <span>Team</span>
            </StyledTournamentMeta>
          )}
        </div>
      </Header>

      <TournamentInfo>
        <InfoItem>
          <Label>Created:</Label>
          <span>{new Date(tournament.createdAt).toLocaleDateString()}</span>
        </InfoItem>
        <InfoItem>
          <Label>Last Updated:</Label>
          <span>{new Date(tournament.updatedAt).toLocaleDateString()}</span>
        </InfoItem>
      </TournamentInfo>

      <RoundsList>
        {tournament.rounds?.map((round) => {
          // Group matches by team matchups
          const teamMatchups = round.matches?.reduce(
            (acc, match) => {
              const team1 = match.players[0]?.team;
              const team2 = match.players[1]?.team;

              if (!team1?.id || !team2?.id) return acc;

              // Create a unique key for this team matchup
              const matchupKey = [team1.id, team2.id].sort().join('-');

              if (!acc[matchupKey]) {
                acc[matchupKey] = {
                  team1: {
                    id: team1.id,
                    name: team1.team.name,
                    wins: 0,
                  },
                  team2: {
                    id: team2.id,
                    name: team2.team.name,
                    wins: 0,
                  },
                  matches: [],
                };
              }

              acc[matchupKey].matches.push(match);
              return acc;
            },
            {} as Record<
              string,
              {
                team1: { id: string; name: string; wins: number };
                team2: { id: string; name: string; wins: number };
                matches: typeof round.matches;
              }
            >
          );

          return (
            <RoundCard key={round.id}>
              <RoundTitle>
                <StyledTournamentTitle>{round.name}</StyledTournamentTitle>
              </RoundTitle>
              <MatchesList>
                {Object.values(teamMatchups || {}).map((matchup) => {
                  // Calculate wins for each team
                  matchup.team1.wins = matchup.matches.filter((match) => {
                    const team1Player = match.players.find(
                      (p) => p.team.id === matchup.team1.id
                    );
                    return team1Player?.winner;
                  }).length;

                  matchup.team2.wins = matchup.matches.filter((match) => {
                    const team2Player = match.players.find(
                      (p) => p.team.id === matchup.team2.id
                    );
                    return team2Player?.winner;
                  }).length;

                  const isTeam1Winning =
                    matchup.team1.wins > matchup.team2.wins;
                  const isTeam2Winning =
                    matchup.team2.wins > matchup.team1.wins;
                  const isTie = matchup.team1.wins === matchup.team2.wins;

                  return (
                    <TeamMatchup
                      key={`${matchup.team1.id}-${matchup.team2.id}`}
                    >
                      <TeamMatchupTitle>
                        <StyledTournamentTitle>
                          {isTeam1Winning ? (
                            <BoldText>
                              {matchup.team1.name} ({matchup.team1.wins})
                            </BoldText>
                          ) : (
                            `${matchup.team1.name} (${matchup.team1.wins})`
                          )}{' '}
                          {isTie ? <BoldText>vs</BoldText> : 'vs'}{' '}
                          {isTeam2Winning ? (
                            <BoldText>
                              {matchup.team2.name} ({matchup.team2.wins})
                            </BoldText>
                          ) : (
                            `${matchup.team2.name} (${matchup.team2.wins})`
                          )}
                        </StyledTournamentTitle>
                      </TeamMatchupTitle>
                      {(matchup.matches || [])
                        .sort((a, b) => {
                          // First sort by generation
                          const genAIndex = GENERATION_ORDER.indexOf(
                            a.generation as (typeof GENERATION_ORDER)[number]
                          );
                          const genBIndex = GENERATION_ORDER.indexOf(
                            b.generation as (typeof GENERATION_ORDER)[number]
                          );
                          if (genAIndex !== genBIndex) {
                            return genAIndex - genBIndex;
                          }
                          // Then sort by tier
                          const tierAIndex = TIER_ORDER.indexOf(
                            a.tier as (typeof TIER_ORDER)[number]
                          );
                          const tierBIndex = TIER_ORDER.indexOf(
                            b.tier as (typeof TIER_ORDER)[number]
                          );
                          return tierAIndex - tierBIndex;
                        })
                        .map((match) => {
                          // Sort players so team1's player is always first
                          const sortedPlayers = [...match.players].sort(
                            (a, b) => {
                              if (a.team.id === matchup.team1.id) return -1;
                              if (b.team.id === matchup.team1.id) return 1;
                              return 0;
                            }
                          );

                          const player1 = sortedPlayers[0];
                          const player2 = sortedPlayers[1];

                          // Determine if the first player (team1's player) won
                          const isPlayer1Winner = player1?.winner;

                          return (
                            <Link
                              key={match.id}
                              to={`/matches/${match.id}`}
                              style={{ textDecoration: 'none' }}
                            >
                              <StyledMatchItem>
                                <MatchTitle>
                                  <MatchFormat>
                                    {match.generation} {match.tier}:
                                  </MatchFormat>
                                  {isPlayer1Winner ? (
                                    <Winner>{player1?.player.name}</Winner>
                                  ) : (
                                    player1?.player.name
                                  )}{' '}
                                  vs{' '}
                                  {!isPlayer1Winner ? (
                                    <Winner>{player2?.player.name}</Winner>
                                  ) : (
                                    player2?.player.name
                                  )}
                                </MatchTitle>
                                <MatchResult>
                                  <span>{match.result}</span>
                                </MatchResult>
                              </StyledMatchItem>
                            </Link>
                          );
                        })}
                    </TeamMatchup>
                  );
                })}
              </MatchesList>
            </RoundCard>
          );
        })}
      </RoundsList>
    </Container>
  );
}
