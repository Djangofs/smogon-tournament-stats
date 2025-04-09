import { useState } from 'react';
import { useGetPlayersQuery, Player } from '../store/apis/players.api';
import { Container } from '../components/layout/layout';
import { Table, TableRow, TableCell } from '../components/table/table';
import { PageTitle } from '../components/typography/page-title';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { Generation, Tier } from '@smogon-tournament-stats/shared-constants';
import { GENERATIONS, TIERS } from '@smogon-tournament-stats/shared-constants';

const FilterContainer = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  align-items: center;
`;

const FilterLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const Select = styled.select`
  padding: 0.5rem;
  border-radius: 4px;
  border: 1px solid #ccc;
`;

const StyledLink = styled.a`
  color: #0066cc;
  text-decoration: none;
  &:hover {
    text-decoration: underline;
  }
`;

type SortColumn =
  | 'name'
  | 'matcheswon'
  | 'matcheslost'
  | 'winrate'
  | 'deadgames';
type SortDirection = 'asc' | 'desc';
type FilterValue = {
  operator: '>' | '<' | '=' | '';
  value: string;
};

export function PlayersPage() {
  const [generation, setGeneration] = useState<Generation | ''>('');
  const [tier, setTier] = useState<Tier | ''>('');
  const [startYear, setStartYear] = useState<number | ''>('');
  const [endYear, setEndYear] = useState<number | ''>('');
  const [stage, setStage] = useState<string>('');
  const {
    data: players,
    isLoading,
    isError,
    error,
  } = useGetPlayersQuery({
    generation: generation || undefined,
    tier: tier || undefined,
    startYear: startYear || undefined,
    endYear: endYear || undefined,
    stage: stage || undefined,
  });
  const [sortColumn, setSortColumn] = useState<SortColumn>('matcheswon');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [filters, setFilters] = useState<Record<string, FilterValue>>({});

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const handleFilter = (
    column: string,
    operator: FilterValue['operator'],
    value: string
  ) => {
    const normalizedColumn = column.toLowerCase().replace(/\s+/g, '');
    // For numeric columns, ensure the value is a valid number
    if (
      ['matcheswon', 'matcheslost', 'winrate', 'deadgames'].includes(
        normalizedColumn
      )
    ) {
      const numValue = parseFloat(value);
      if (isNaN(numValue) && value !== '') {
        return;
      }
    }
    setFilters((prev) => ({
      ...prev,
      [column]: { operator, value },
    }));
  };

  const compareValues = (
    a: number,
    b: number,
    operator: FilterValue['operator']
  ): boolean => {
    switch (operator) {
      case '>':
        return a > b;
      case '<':
        return a < b;
      case '=':
        return a === b;
      case '':
        return true;
      default:
        return true;
    }
  };

  const filteredAndSortedPlayers = [...(players || [])]
    .filter((player: Player) => {
      // First check if the player has any matches in the selected format
      if (generation || tier) {
        if (player.matchesWon + player.matchesLost + player.deadGames === 0) {
          return false;
        }
      }

      // Then apply the column filters
      return Object.entries(filters).every(([column, filter]) => {
        if (!filter.operator || !filter.value) return true;

        const value = parseFloat(filter.value);
        if (isNaN(value)) return true;

        const normalizedColumn = column.toLowerCase().replace(/\s+/g, '');
        switch (normalizedColumn) {
          case 'name':
            return (
              filter.value === '' ||
              player.name.toLowerCase().includes(filter.value.toLowerCase())
            );
          case 'matcheswon':
            return compareValues(player.matchesWon, value, filter.operator);
          case 'matcheslost':
            return compareValues(player.matchesLost, value, filter.operator);
          case 'deadgames':
            return compareValues(player.deadGames, value, filter.operator);
          case 'winrate': {
            const winRate =
              player.matchesWon + player.matchesLost > 0
                ? Math.round(
                    (player.matchesWon /
                      (player.matchesWon + player.matchesLost)) *
                      100
                  )
                : 0;
            return compareValues(winRate, value, filter.operator);
          }
          default:
            return true;
        }
      });
    })
    .sort((a: Player, b: Player) => {
      const multiplier = sortDirection === 'asc' ? 1 : -1;

      switch (sortColumn) {
        case 'name':
          return multiplier * a.name.localeCompare(b.name);
        case 'matcheswon':
          return multiplier * (a.matchesWon - b.matchesWon);
        case 'matcheslost':
          return multiplier * (a.matchesLost - b.matchesLost);
        case 'deadgames':
          return multiplier * (a.deadGames - b.deadGames);
        case 'winrate': {
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
      <p>View statistics for all players</p>

      <FilterContainer>
        <FilterLabel>
          Generation:
          <Select
            value={generation}
            onChange={(e) => setGeneration(e.target.value as Generation | '')}
          >
            <option value="">All Generations</option>
            {GENERATIONS.map((gen: Generation) => (
              <option key={gen} value={gen}>
                {gen}
              </option>
            ))}
          </Select>
        </FilterLabel>

        <FilterLabel>
          Tier:
          <Select
            value={tier}
            onChange={(e) => setTier(e.target.value as Tier | '')}
          >
            <option value="">All Tiers</option>
            {TIERS.map((t: Tier) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </Select>
        </FilterLabel>

        <FilterLabel>
          Stage:
          <Select value={stage} onChange={(e) => setStage(e.target.value)}>
            <option value="">All Stages</option>
            <option value="Regular Season">Regular Season</option>
            <option value="Playoff">Playoff</option>
            <option value="Tiebreak">Tiebreak</option>
          </Select>
        </FilterLabel>
      </FilterContainer>

      <Table
        headers={[
          'Name',
          'Matches Won',
          'Matches Lost',
          'Dead Games',
          'Win Rate',
        ]}
        onSort={(column: string, direction: SortDirection) =>
          handleSort(column as SortColumn)
        }
        onFilter={(column: string, filter: FilterValue) =>
          handleFilter(column, filter.operator, filter.value)
        }
        initialSortColumn="matcheswon"
        initialSortDirection="desc"
        filters={filters}
      >
        {filteredAndSortedPlayers.map((player) => {
          const winRate =
            player.matchesWon + player.matchesLost > 0
              ? Math.round(
                  (player.matchesWon /
                    (player.matchesWon + player.matchesLost)) *
                    100
                )
              : 0;
          return (
            <TableRow key={player.id}>
              <TableCell>
                <Link
                  to={`/players/${player.id}`}
                  style={{ textDecoration: 'none', color: '#0066cc' }}
                >
                  {player.name}
                </Link>
              </TableCell>
              <TableCell>{player.matchesWon}</TableCell>
              <TableCell>{player.matchesLost}</TableCell>
              <TableCell>{player.deadGames}</TableCell>
              <TableCell>{winRate}%</TableCell>
            </TableRow>
          );
        })}
      </Table>
    </Container>
  );
}
