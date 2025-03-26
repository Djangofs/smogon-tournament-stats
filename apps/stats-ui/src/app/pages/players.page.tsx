import { useGetPlayersQuery } from '../store/apis/players.api';
import { Container } from '../components/layout/layout';
import { Table } from '../components/table/table';

export function PlayersPage() {
  const { data: players, isLoading, isError, error } = useGetPlayersQuery();

  if (isLoading) {
    return <div>Loading players...</div>;
  }

  if (isError) {
    return <div>Error: {error?.toString()}</div>;
  }

  return (
    <Container>
      <h1>Players</h1>
      <p>Browse all Smogon tournament players and their statistics</p>

      <Table headers={['Name', 'Matches Won', 'Matches Lost', 'Win Rate']}>
        {players?.map((player) => (
          <tr key={player.id}>
            <td>{player.name}</td>
            <td>{player.matchesWon}</td>
            <td>{player.matchesLost}</td>
            <td>
              {player.matchesWon + player.matchesLost > 0
                ? `${Math.round(
                    (player.matchesWon /
                      (player.matchesWon + player.matchesLost)) *
                      100
                  )}%`
                : 'N/A'}
            </td>
          </tr>
        ))}
      </Table>
    </Container>
  );
}
