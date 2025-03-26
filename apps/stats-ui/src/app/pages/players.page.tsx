import { useState } from 'react';
import { useGetPlayersQuery } from '../store/apis/players.api';
import { Container } from '../components/layout/layout';
import { Table } from '../components/table/table';
import { PageTitle } from '../components/typography/page-title';

type SortColumn = 'name' | 'matchesWon' | 'matchesLost' | 'winRate';
type SortDirection = 'asc' | 'desc';

export function PlayersPage() {
  const { data: players, isLoading, isError, error } = useGetPlayersQuery();
  const [sortColumn, setSortColumn] = useState<SortColumn>('matchesWon');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const handleSort = (column: string, direction: SortDirection) => {
    const columnMap: Record<string, SortColumn> = {
      Name: 'name',
      'Matches Won': 'matchesWon',
      'Matches Lost': 'matchesLost',
      'Win Rate': 'winRate',
    };

    setSortColumn(columnMap[column]);
    setSortDirection(direction);
  };

  const sortedPlayers = [...(players || [])].sort((a, b) => {
    const multiplier = sortDirection === 'asc' ? 1 : -1;

    switch (sortColumn) {
      case 'name':
        return multiplier * a.name.localeCompare(b.name);
      case 'matchesWon':
        return multiplier * (a.matchesWon - b.matchesWon);
      case 'matchesLost':
        return multiplier * (a.matchesLost - b.matchesLost);
      case 'winRate': {
        const rateA =
          a.matchesWon + a.matchesLost > 0
            ? a.matchesWon / (a.matchesWon + a.matchesLost)
            : 0;
        const rateB =
          b.matchesWon + b.matchesLost > 0
            ? b.matchesWon / (b.matchesWon + b.matchesLost)
            : 0;
        return multiplier * (rateA - rateB);
      }
      default:
        return 0;
    }
  });

  if (isLoading) {
    return <div>Loading players...</div>;
  }

  if (isError) {
    return <div>Error: {error?.toString()}</div>;
  }

  return (
    <Container>
      <PageTitle>Players</PageTitle>
      <p>Browse all Smogon tournament players and their statistics</p>

      <Table
        headers={['Name', 'Matches Won', 'Matches Lost', 'Win Rate']}
        onSort={handleSort}
        initialSortColumn="Matches Won"
        initialSortDirection="desc"
      >
        {sortedPlayers.map((player) => (
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
