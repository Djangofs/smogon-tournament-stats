import { useState } from 'react';
import { useGetPlayersQuery } from '../store/apis/players.api';
import { Container } from '../components/layout/layout';
import { Table } from '../components/table/table';
import { PageTitle } from '../components/typography/page-title';
import styled from 'styled-components';
import {
  GENERATIONS,
  TIERS,
  Generation,
  Tier,
} from '@smogon-tournament-stats/shared-constants';

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

type SortColumn = 'name' | 'matchesWon' | 'matchesLost' | 'winRate';
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
  });
  const [sortColumn, setSortColumn] = useState<SortColumn>('matchesWon');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [filters, setFilters] = useState<Record<string, FilterValue>>({});

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

  const compareValues = (
    a: number,
    b: number,
    operator: '>' | '<' | '=' | ''
  ) => {
    switch (operator) {
      case '>':
        return a > b;
      case '<':
        return a < b;
      case '=':
        return a === b;
      default:
        return true;
    }
  };

  const handleFilter = (column: string, filter: FilterValue) => {
    setFilters((prev) => ({
      ...prev,
      [column]: filter,
    }));
  };

  const filteredAndSortedPlayers = [...(players || [])]
    .filter((player) => {
      // First check if the player has any matches in the selected format
      if (generation || tier) {
        if (player.matchesWon + player.matchesLost === 0) {
          return false;
        }
      }

      // Then apply the column filters
      return Object.entries(filters).every(([column, filter]) => {
        if (!filter.operator || !filter.value) return true;

        const value = parseFloat(filter.value);
        if (isNaN(value)) return true;

        switch (column) {
          case 'Name':
            return (
              filter.value === '' ||
              player.name.toLowerCase().includes(filter.value.toLowerCase())
            );
          case 'Matches Won':
            return compareValues(player.matchesWon, value, filter.operator);
          case 'Matches Lost':
            return compareValues(player.matchesLost, value, filter.operator);
          case 'Win Rate': {
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
    .sort((a, b) => {
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
          Start Year:
          <input
            type="number"
            value={startYear}
            onChange={(e) =>
              setStartYear(e.target.value ? parseInt(e.target.value) : '')
            }
            min="2000"
            max="2024"
            placeholder="2000"
            style={{
              padding: '0.5rem',
              borderRadius: '4px',
              border: '1px solid #ccc',
            }}
          />
        </FilterLabel>

        <FilterLabel>
          End Year:
          <input
            type="number"
            value={endYear}
            onChange={(e) =>
              setEndYear(e.target.value ? parseInt(e.target.value) : '')
            }
            min="2000"
            max="2024"
            placeholder="2024"
            style={{
              padding: '0.5rem',
              borderRadius: '4px',
              border: '1px solid #ccc',
            }}
          />
        </FilterLabel>
      </FilterContainer>

      <Table
        headers={['Name', 'Matches Won', 'Matches Lost', 'Win Rate']}
        onSort={handleSort}
        onFilter={handleFilter}
        initialSortColumn="Matches Won"
        initialSortDirection="desc"
        filters={filters}
        showWinRateHighlight
      >
        {filteredAndSortedPlayers.map((player) => (
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
