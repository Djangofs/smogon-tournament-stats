import { useGetTournamentsQuery } from '../store/apis/tournaments.api';
import { Card } from '../components/card/card';
import { Grid } from '../components/grid/grid';
import { Container } from '../components/layout/layout';

export function TournamentsPage() {
  const {
    data: tournaments,
    isLoading,
    isError,
    error,
  } = useGetTournamentsQuery();

  if (isLoading) {
    return <div>Loading tournaments...</div>;
  }

  if (isError) {
    return <div>Error: {error?.toString()}</div>;
  }

  return (
    <Container>
      <h1>Tournaments</h1>
      <p>Browse all Smogon tournaments and their statistics</p>

      <Grid>
        {tournaments?.map((tournament) => (
          <Card key={tournament.id} title={tournament.name}>
            <div>
              <p>Tournament ID: {tournament.id}</p>
            </div>
          </Card>
        ))}
      </Grid>
    </Container>
  );
}
