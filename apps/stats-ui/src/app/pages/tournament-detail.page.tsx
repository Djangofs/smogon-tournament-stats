import { useParams } from 'react-router-dom';
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
  gap: 1rem;
`;

const RoundCard = styled(Card)`
  padding: 1rem;
`;

const RoundTitle = styled(TournamentTitle)`
  margin: 0 0 1rem 0;
  font-size: 1.25rem;
`;

const MatchesList = styled.div`
  display: grid;
  gap: 0.5rem;
`;

const MatchItem = styled(TournamentHighlight)`
  padding: 0.5rem;
  background: #f5f5f5;
  border-radius: 4px;
  border-bottom: none;
`;

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
            <TournamentMeta>
              <span>Official</span>
            </TournamentMeta>
          )}
          {tournament.isTeam && (
            <TournamentMeta>
              <span>Team</span>
            </TournamentMeta>
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
        {tournament.rounds?.map((round) => (
          <RoundCard key={round.id}>
            <RoundTitle>{round.name}</RoundTitle>
            <MatchesList>
              {round.matches?.map((match) => (
                <MatchItem key={match.id}>
                  <TournamentTitle>
                    {match.players[0]?.player.name} vs{' '}
                    {match.players[1]?.player.name}
                  </TournamentTitle>
                  <TournamentMeta>
                    <span>{match.result}</span>
                  </TournamentMeta>
                </MatchItem>
              ))}
            </MatchesList>
          </RoundCard>
        ))}
      </RoundsList>
    </Container>
  );
}
