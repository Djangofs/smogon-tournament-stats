import { useState } from 'react';
import {
  useGetTournamentsQuery,
  useCreateTournamentMutation,
} from '../store/apis/tournaments.api';
import { Card } from '../components/card/card';
import { Grid } from '../components/grid/grid';
import { Container } from '../components/layout/layout';
import { Modal } from '../components/modal/modal';
import styled from 'styled-components';

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const ButtonWrapper = styled.div`
  button {
    background-color: #0066cc;
    color: white;
    border: none;
    padding: 0.75rem 1.5rem;
    border-radius: 4px;
    font-size: 1rem;
    cursor: pointer;

    &:hover {
      background-color: #0052a3;
    }
  }
`;

export function TournamentsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const {
    data: tournaments,
    isLoading,
    isError,
    error,
  } = useGetTournamentsQuery();
  const [createTournament, { isLoading: isCreating }] =
    useCreateTournamentMutation();

  const handleImport = async (data: {
    name: string;
    sheetName: string;
    sheetId: string;
  }) => {
    try {
      await createTournament(data).unwrap();
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error importing tournament:', error);
      // TODO: Show error message to user
    }
  };

  if (isLoading) {
    return <div>Loading tournaments...</div>;
  }

  if (isError) {
    return <div>Error: {error?.toString()}</div>;
  }

  return (
    <Container>
      <Header>
        <div>
          <h1>Tournaments</h1>
          <p>Browse all Smogon tournaments and their statistics</p>
        </div>
        <ButtonWrapper>
          <button type="button" onClick={() => setIsModalOpen(true)}>
            Import Tournament
          </button>
        </ButtonWrapper>
      </Header>

      <Grid>
        {tournaments?.map((tournament) => (
          <Card key={tournament.id} title={tournament.name}>
            <div>
              <p>Tournament ID: {tournament.id}</p>
            </div>
          </Card>
        ))}
      </Grid>

      <Modal
        isOpen={isModalOpen}
        onClose={() => !isCreating && setIsModalOpen(false)}
        onSubmit={handleImport}
        isLoading={isCreating}
      />
    </Container>
  );
}
