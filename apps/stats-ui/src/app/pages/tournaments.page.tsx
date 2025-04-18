import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  useGetTournamentsQuery,
  useCreateTournamentMutation,
} from '../store/apis/tournaments.api';
import { Modal } from '../components/modal/modal';
import { Card } from '../components/card/card';
import { Container, TournamentHighlight } from '../components/layout/layout';
import {
  TournamentTitle,
  TournamentMeta,
} from '../components/typography/typography';
import { Button } from '../components/button/button';
import { PageTitle } from '../components/typography/page-title';
import styled from 'styled-components';
import { Tournament } from '../types/tournament';

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const TournamentList = styled.div`
  display: grid;
  gap: 1rem;
`;

const Flag = styled.span<{ active: boolean }>`
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  margin-right: 0.5rem;
  background: ${(props) => (props.active ? '#e6f3ff' : '#f5f5f5')};
  color: ${(props) => (props.active ? '#0066cc' : '#666')};
`;

const TournamentCard = styled(Card)`
  cursor: pointer;
  transition: transform 0.2s;

  &:hover {
    transform: translateY(-2px);
  }
`;

export function TournamentsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data: tournaments, isLoading } = useGetTournamentsQuery();
  const [createTournament, { isLoading: isCreating }] =
    useCreateTournamentMutation();

  const handleSubmit = async (data: {
    name: string;
    sheetName: string;
    sheetId: string;
    isOfficial: boolean;
    isTeam: boolean;
    year: number;
    replayPostUrl?: string;
    replaySource: 'thread' | 'embedded' | 'none';
    transformer?: string;
  }) => {
    try {
      await createTournament(data).unwrap();
      setIsModalOpen(false);
    } catch (error) {
      console.error('Failed to create tournament:', error);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <Container>
      <Header>
        <PageTitle>Tournaments</PageTitle>
        <Button onClick={() => setIsModalOpen(true)}>Create Tournament</Button>
      </Header>

      <TournamentList>
        {tournaments?.map((tournament: Tournament) => (
          <Link
            to={`/tournaments/${tournament.id}`}
            key={tournament.id}
            style={{ textDecoration: 'none' }}
          >
            <TournamentCard>
              <TournamentHighlight>
                <TournamentTitle>{tournament.name}</TournamentTitle>
                <TournamentMeta>
                  {tournament.isOfficial && (
                    <Flag active={tournament.isOfficial}>Official</Flag>
                  )}
                  {tournament.isTeam && (
                    <Flag active={tournament.isTeam}>Team</Flag>
                  )}
                </TournamentMeta>
              </TournamentHighlight>
            </TournamentCard>
          </Link>
        ))}
      </TournamentList>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        isLoading={isCreating}
      />
    </Container>
  );
}
