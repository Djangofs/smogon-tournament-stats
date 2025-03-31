import { format } from 'date-fns';
import { useParams } from 'react-router-dom';
import { useGetPlayerByIdQuery } from '../store/apis/players.api';
import { Container } from '../components/layout/layout';
import { Table } from '../components/table/table';
import { PageTitle } from '../components/typography/page-title';
import styled from 'styled-components';
import { useState } from 'react';
import {
  GENERATIONS,
  TIERS,
  Generation,
  Tier,
} from '@smogon-tournament-stats/shared-constants';

const StatsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
`;

const StatCard = styled.div`
  background: white;
  padding: 1rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const StatLabel = styled.div`
  font-size: 0.875rem;
  color: #666;
  margin-bottom: 0.5rem;
`;

const StatValue = styled.div`
  font-size: 1.5rem;
  font-weight: 600;
`;

const TableCell = styled.td`
  padding: 1rem;
  border-bottom: 1px solid #dee2e6;
  color: #212529;
`;

const TableRow = styled.tr`
  &:nth-child(even) {
    background-color: #f8f9fa;
  }
  &:hover {
    background-color: #f1f3f5;
  }
`;

const FilterContainer = styled.div`
  margin-bottom: 2rem;
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const FilterGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
`;

const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const FilterLabel = styled.label`
  font-size: 0.875rem;
  color: #666;
`;

const FilterInput = styled.input`
  padding: 0.5rem;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  font-size: 0.875rem;

  &:focus {
    outline: none;
    border-color: #0066cc;
    box-shadow: 0 0 0 2px rgba(0, 102, 204, 0.1);
  }
`;

const FilterSelect = styled.select`
  padding: 0.5rem;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  font-size: 0.875rem;
  background-color: white;

  &:focus {
    outline: none;
    border-color: #0066cc;
    box-shadow: 0 0 0 2px rgba(0, 102, 204, 0.1);
  }
`;

type FilterValue = {
  value: string;
};

type SortColumn = 'Date' | 'Opponent' | 'Result' | 'Generation' | 'Tier';
type SortDirection = 'asc' | 'desc';

export function PlayerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const {
    data: player,
    isLoading,
    isError,
    error,
  } = useGetPlayerByIdQuery(id || '');

  const [filters, setFilters] = useState<Record<string, FilterValue>>({
    Date: { value: '' },
    Opponent: { value: '' },
    Result: { value: '' },
    Generation: { value: '' },
    Tier: { value: '' },
  });

  const [sortColumn, setSortColumn] = useState<SortColumn>('Date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  if (isLoading) {
    return <div>Loading player details...</div>;
  }

  if (isError || !player) {
    return <div>Error: {error?.toString()}</div>;
  }

  const matches = player.matches.map((match) => ({
    id: match.id,
    date: format(new Date(match.year, 0, 1), 'MMM d, yyyy'),
    opponent: match.opponentName,
    result: match.winner === null ? 'Dead Game' : match.winner ? 'Won' : 'Lost',
    generation: match.generation,
    tier: match.tier,
    winner: match.winner,
  }));

  const handleFilterChange = (column: string, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [column]: { value },
    }));
  };

  const handleSort = (column: string, direction: SortDirection) => {
    setSortColumn(column as SortColumn);
    setSortDirection(direction);
  };

  const filteredMatches = matches
    .filter((match) => {
      return Object.entries(filters).every(([column, filter]) => {
        if (!filter.value) return true;

        const value = filter.value.toLowerCase();
        switch (column) {
          case 'Date':
            return match.date.toLowerCase().includes(value);
          case 'Opponent':
            return match.opponent.toLowerCase().includes(value);
          case 'Result':
            if (value === 'dead game') {
              return match.winner === null;
            } else if (value === 'won') {
              return match.winner === true;
            } else if (value === 'lost') {
              return match.winner === false;
            }
            return match.result.toLowerCase().includes(value);
          case 'Generation':
            return match.generation === filter.value;
          case 'Tier':
            return match.tier === filter.value;
          default:
            return true;
        }
      });
    })
    .sort((a, b) => {
      const multiplier = sortDirection === 'asc' ? 1 : -1;

      switch (sortColumn) {
        case 'Date':
          return multiplier * a.date.localeCompare(b.date);
        case 'Opponent':
          return multiplier * a.opponent.localeCompare(b.opponent);
        case 'Result':
          return multiplier * a.result.localeCompare(b.result);
        case 'Generation':
          return multiplier * a.generation.localeCompare(b.generation);
        case 'Tier':
          return multiplier * a.tier.localeCompare(b.tier);
        default:
          return 0;
      }
    });

  const filteredStats = {
    matchesWon: filteredMatches.filter((match) => match.winner === true).length,
    matchesLost: filteredMatches.filter((match) => match.winner === false)
      .length,
    deadGames: filteredMatches.filter((match) => match.winner === null).length,
  };

  const winRate =
    filteredStats.matchesWon + filteredStats.matchesLost > 0
      ? Math.round(
          (filteredStats.matchesWon /
            (filteredStats.matchesWon + filteredStats.matchesLost)) *
            100
        )
      : 0;

  return (
    <Container>
      <PageTitle>{player.name}</PageTitle>
      <p>View detailed statistics and match history for {player.name}</p>

      <FilterContainer>
        <h3>Filters</h3>
        <FilterGrid>
          <FilterGroup>
            <FilterLabel>Date</FilterLabel>
            <FilterInput
              type="text"
              placeholder="Filter by date..."
              value={filters.Date.value}
              onChange={(e) => handleFilterChange('Date', e.target.value)}
            />
          </FilterGroup>
          <FilterGroup>
            <FilterLabel>Opponent</FilterLabel>
            <FilterInput
              type="text"
              placeholder="Filter by opponent..."
              value={filters.Opponent.value}
              onChange={(e) => handleFilterChange('Opponent', e.target.value)}
            />
          </FilterGroup>
          <FilterGroup>
            <FilterLabel>Result</FilterLabel>
            <FilterSelect
              value={filters.Result.value}
              onChange={(e) => handleFilterChange('Result', e.target.value)}
            >
              <option value="">All Results</option>
              <option value="Won">Won</option>
              <option value="Lost">Lost</option>
              <option value="Dead Game">Dead Game</option>
            </FilterSelect>
          </FilterGroup>
          <FilterGroup>
            <FilterLabel>Generation</FilterLabel>
            <FilterSelect
              value={filters.Generation.value}
              onChange={(e) => handleFilterChange('Generation', e.target.value)}
            >
              <option value="">All Generations</option>
              {GENERATIONS.map((gen: Generation) => (
                <option key={gen} value={gen}>
                  {gen}
                </option>
              ))}
            </FilterSelect>
          </FilterGroup>
          <FilterGroup>
            <FilterLabel>Tier</FilterLabel>
            <FilterSelect
              value={filters.Tier.value}
              onChange={(e) => handleFilterChange('Tier', e.target.value)}
            >
              <option value="">All Tiers</option>
              {TIERS.map((tier: Tier) => (
                <option key={tier} value={tier}>
                  {tier}
                </option>
              ))}
            </FilterSelect>
          </FilterGroup>
        </FilterGrid>
      </FilterContainer>

      <StatsContainer>
        <StatCard>
          <StatLabel>Total Matches</StatLabel>
          <StatValue>
            {filteredStats.matchesWon +
              filteredStats.matchesLost +
              filteredStats.deadGames}
          </StatValue>
        </StatCard>
        <StatCard>
          <StatLabel>Matches Won</StatLabel>
          <StatValue>{filteredStats.matchesWon}</StatValue>
        </StatCard>
        <StatCard>
          <StatLabel>Matches Lost</StatLabel>
          <StatValue>{filteredStats.matchesLost}</StatValue>
        </StatCard>
        <StatCard>
          <StatLabel>Dead Games</StatLabel>
          <StatValue>{filteredStats.deadGames}</StatValue>
        </StatCard>
        <StatCard>
          <StatLabel>Win Rate</StatLabel>
          <StatValue>{winRate}%</StatValue>
        </StatCard>
      </StatsContainer>

      <h2>Match History</h2>
      <Table
        headers={['Date', 'Opponent', 'Result', 'Generation', 'Tier']}
        noFilters
        onSort={handleSort}
        initialSortColumn="Date"
        initialSortDirection="desc"
      >
        {filteredMatches.map((match) => (
          <TableRow key={match.id}>
            <TableCell>{match.date}</TableCell>
            <TableCell>{match.opponent}</TableCell>
            <TableCell>
              {match.winner === null
                ? 'Dead Game'
                : match.winner
                ? 'Won'
                : 'Lost'}
            </TableCell>
            <TableCell>{match.generation}</TableCell>
            <TableCell>{match.tier}</TableCell>
          </TableRow>
        ))}
      </Table>
    </Container>
  );
}
