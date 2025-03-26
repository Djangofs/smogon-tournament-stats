import { useState } from 'react';
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
import { Tournament } from '../store/apis/tournaments.api';

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
          <Card key={tournament.id}>
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
          </Card>
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
