import { useParams, Link } from 'react-router-dom';
import { useGetMatchByIdQuery } from '../store/apis/matches.api';
import { Container } from '../components/layout/layout';
import { Card } from '../components/card/card';
import { PageTitle } from '../components/typography/page-title';
import styled from 'styled-components';
import { format } from 'date-fns';
import { useState } from 'react';

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const MatchInfo = styled.div`
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

const PlayersSection = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 2rem;
`;

const PlayerCard = styled(Card)<{ isWinner?: boolean }>`
  padding: 1rem;
  text-align: center;
  border: ${(props) => (props.isWinner ? '2px solid #28a745' : 'none')};
`;

const PlayerName = styled.div`
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
`;

const TeamName = styled.div`
  color: #666;
  margin-bottom: 1rem;
`;

const Result = styled.div<{ isWinner?: boolean }>`
  font-size: 1.5rem;
  font-weight: 600;
  color: ${(props) => (props.isWinner ? '#28a745' : '#666')};
`;

const GamesSection = styled.div`
  margin-top: 2rem;
`;

const GameCard = styled(Card)`
  padding: 1rem;
  margin-bottom: 1rem;
`;

const GameHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const GameFormat = styled.div`
  font-weight: 600;
`;

const GamePlayers = styled.div`
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 1rem;
  align-items: center;
  text-align: center;
`;

const GamePlayer = styled.div<{ isWinner?: boolean }>`
  font-weight: ${(props) => (props.isWinner ? '600' : 'normal')};
  color: ${(props) => (props.isWinner ? '#28a745' : 'inherit')};
`;

const VsText = styled.div`
  color: #666;
`;

const ReplayModal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background-color: white;
  padding: 1rem;
  border-radius: 8px;
  width: 90%;
  max-width: 1000px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const ModalTitle = styled.h3`
  margin: 0;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #666;

  &:hover {
    color: #333;
  }
`;

const ReplayIframe = styled.iframe`
  width: 100%;
  height: 70vh;
  border: none;
  border-radius: 4px;
`;

const ReplayToggle = styled.button`
  background: none;
  border: none;
  color: #0066cc;
  cursor: pointer;
  font-size: 0.9rem;
  padding: 0.5rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &:hover {
    text-decoration: underline;
  }
`;

const StyledLink = styled.a`
  display: inline-block;
  margin-top: 2rem;
  color: #0066cc;
  text-decoration: none;
  transition: all 0.2s ease;
  position: relative;
  padding-bottom: 2px;

  &:hover {
    color: #004999;
    text-decoration: none;

    &:after {
      width: 100%;
      left: 0;
    }
  }

  &:after {
    content: '';
    position: absolute;
    width: 0;
    height: 2px;
    bottom: 0;
    left: 50%;
    background-color: #004999;
    transition: all 0.2s ease;
  }
`;

export function MatchDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: match, isLoading, error } = useGetMatchByIdQuery(id || '');
  const [activeReplay, setActiveReplay] = useState<{
    id: string;
    url: string;
    title: string;
  } | null>(null);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error || !match) {
    return <div>Error: {error?.toString()}</div>;
  }

  // Ensure match.players exists and has at least 2 players
  if (!match.players || match.players.length < 2) {
    return <div>Error: Match data is incomplete</div>;
  }

  // Determine the winner
  const player1 = match.players[0];
  const player2 = match.players[1];

  // Ensure player1 and player2 have the required properties
  if (!player1?.player?.id || !player2?.player?.id) {
    return <div>Error: Player data is incomplete</div>;
  }

  const player1Wins =
    match.games?.filter(
      (game) =>
        game.players?.find((p) => p.player?.id === player1.player.id)?.winner
    ).length || 0;

  const player2Wins =
    match.games?.filter(
      (game) =>
        game.players?.find((p) => p.player?.id === player2.player.id)?.winner
    ).length || 0;

  // Fix the winner determination logic
  const player1IsWinner = player1Wins > player2Wins;
  const player2IsWinner = player2Wins > player1Wins;
  const isDeadGame = player1.winner === null && player2.winner === null;

  // If we can't determine the winner from games, use the player.winner property
  const player1Won = player1IsWinner || player1.winner === true;
  const player2Won = player2IsWinner || player2.winner === true;
  const isTie = player1Wins === player2Wins && player1Wins > 0;

  const openReplay = (
    gameId: string,
    replayUrl: string,
    player1Name: string,
    player2Name: string
  ) => {
    setActiveReplay({
      id: gameId,
      url: replayUrl,
      title: `${player1Name} vs ${player2Name}`,
    });
  };

  const closeReplay = () => {
    setActiveReplay(null);
  };

  return (
    <Container>
      <Header>
        <PageTitle>Match Details</PageTitle>
      </Header>

      <MatchInfo>
        <InfoItem>
          <Label>Format:</Label>
          <span>
            {match.generation} {match.tier}
          </span>
        </InfoItem>
        <InfoItem>
          <Label>Stage:</Label>
          <span>{match.stage || 'Unknown'}</span>
        </InfoItem>
        <InfoItem>
          <Label>Date:</Label>
          <span>{format(new Date(match.playedAt), 'MMM d, yyyy')}</span>
        </InfoItem>
        <InfoItem>
          <Label>Best of:</Label>
          <span>{match.bestOf}</span>
        </InfoItem>
      </MatchInfo>

      <PlayersSection>
        <PlayerCard isWinner={player1Won}>
          <PlayerName>{player1.player.name}</PlayerName>
          <TeamName>{player1.team.name}</TeamName>
          <Result isWinner={player1Won}>
            {isDeadGame
              ? 'Dead Game'
              : player1Won
              ? 'Won'
              : isTie
              ? 'Tie'
              : 'Lost'}
          </Result>
        </PlayerCard>
        <PlayerCard isWinner={player2Won}>
          <PlayerName>{player2.player.name}</PlayerName>
          <TeamName>{player2.team.name}</TeamName>
          <Result isWinner={player2Won}>
            {isDeadGame
              ? 'Dead Game'
              : player2Won
              ? 'Won'
              : isTie
              ? 'Tie'
              : 'Lost'}
          </Result>
        </PlayerCard>
      </PlayersSection>

      <GamesSection>
        <h2>Games</h2>
        {!match.games || match.games.length === 0 ? (
          <div>No games found for this match.</div>
        ) : (
          match.games.map((game) => {
            // Check if game has the expected structure
            if (!game) {
              return null;
            }

            // Find player information in the game data
            const gamePlayer1 = game.players?.find(
              (p) => p?.player?.id === player1.player.id
            );
            const gamePlayer2 = game.players?.find(
              (p) => p?.player?.id === player2.player.id
            );

            return (
              <GameCard key={game.id}>
                <GameHeader>
                  <GameFormat>
                    {game.generation} {game.tier}
                  </GameFormat>
                </GameHeader>
                <GamePlayers>
                  <GamePlayer isWinner={gamePlayer1?.winner}>
                    {player1.player.name}
                  </GamePlayer>
                  <VsText>vs</VsText>
                  <GamePlayer isWinner={gamePlayer2?.winner}>
                    {player2.player.name}
                  </GamePlayer>
                </GamePlayers>
                {game.replayUrl && (
                  <ReplayToggle
                    onClick={() =>
                      openReplay(
                        game.id,
                        game.replayUrl || '',
                        player1.player.name,
                        player2.player.name
                      )
                    }
                  >
                    Watch Replay
                  </ReplayToggle>
                )}
              </GameCard>
            );
          })
        )}
      </GamesSection>

      <Link
        to="/tournaments"
        style={{
          textDecoration: 'none',
          display: 'inline-block',
          marginTop: '2rem',
          color: '#333',
          transition: 'all 0.2s ease',
          position: 'relative',
          paddingBottom: '2px',
        }}
      >
        Back to Tournaments
      </Link>

      {activeReplay && (
        <ReplayModal onClick={closeReplay}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>{activeReplay.title}</ModalTitle>
              <CloseButton onClick={closeReplay}>&times;</CloseButton>
            </ModalHeader>
            <ReplayIframe
              src={activeReplay.url}
              title={activeReplay.title}
              sandbox="allow-scripts allow-same-origin"
            />
          </ModalContent>
        </ReplayModal>
      )}
    </Container>
  );
}
