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
import {
  FilterContainerComponent,
  FilterDropdownComponent,
  ClearFiltersButtonComponent,
  useFilterDropdown,
} from '../components/filters/filter-dropdown';
import { YearFilterComponent } from '../components/filters/year-filter';

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

const FilterHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
`;

const FilterTitle = styled.h3`
  margin: 0;
  font-size: 1.25rem;
  color: #333;
`;

const FilterGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
  margin-bottom: 1.5rem;

  @media (max-width: 992px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 1.5rem;
  }

  @media (max-width: 576px) {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
`;

const FilterItem = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  margin-bottom: 0.5rem;
`;

const FilterTextInput = styled.input`
  padding: 0.75rem 1rem;
  border-radius: 6px;
  border: 1px solid #ddd;
  background-color: white;
  color: #333;
  font-size: 0.9rem;
  width: 100%;
  height: 42px;
  box-sizing: border-box;
  transition: all 0.2s ease;

  &:hover {
    border-color: #999;
    background-color: #f9f9f9;
  }

  &:focus {
    outline: none;
    border-color: #0066cc;
    box-shadow: 0 0 0 2px rgba(0, 102, 204, 0.1);
  }
`;

const FilterTextLabel = styled.div`
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 0.5rem;
  font-weight: 500;
`;

const FilterActions = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 1rem;
`;

type SortColumn =
  | 'Date'
  | 'Opponent'
  | 'Result'
  | 'Generation'
  | 'Tier'
  | 'Stage';
type SortDirection = 'asc' | 'desc';
type FilterValue = {
  value: string;
};

export function PlayerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const {
    data: player,
    isLoading,
    isError,
    error,
  } = useGetPlayerByIdQuery(id || '');

  const [startYear, setStartYear] = useState<string>('');
  const [endYear, setEndYear] = useState<string>('');
  const [opponentTextInput, setOpponentTextInput] = useState('');

  // Use the shared filter hook for result
  const {
    selectedValues: resultFilter,
    setSelectedValues: setResultFilter,
    openFilter: openResultFilter,
    toggleFilter: toggleResultFilter,
    handleCheckboxChange: handleResultChange,
    clearFilters: clearResultFilter,
  } = useFilterDropdown<string>(['Won', 'Lost', 'Dead Game']);

  // Use the shared filter hook for generations
  const {
    selectedValues: generations,
    setSelectedValues: setGenerations,
    openFilter: openGenerationFilter,
    toggleFilter: toggleGenerationFilter,
    handleCheckboxChange: handleGenerationChange,
    clearFilters: clearGenerations,
  } = useFilterDropdown<Generation>([...GENERATIONS]);

  // Use the shared filter hook for tiers
  const {
    selectedValues: tiers,
    setSelectedValues: setTiers,
    openFilter: openTierFilter,
    toggleFilter: toggleTierFilter,
    handleCheckboxChange: handleTierChange,
    clearFilters: clearTiers,
  } = useFilterDropdown<Tier>([...TIERS]);

  // Use the shared filter hook for stages
  const {
    selectedValues: stages,
    setSelectedValues: setStages,
    openFilter: openStageFilter,
    toggleFilter: toggleStageFilter,
    handleCheckboxChange: handleStageChange,
    clearFilters: clearStages,
  } = useFilterDropdown<string>(['Regular Season', 'Playoff', 'Tiebreak']);

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
    stage: match.stage,
  }));

  const handleSort = (column: string, direction: SortDirection) => {
    setSortColumn(column as SortColumn);
    setSortDirection(direction);
  };

  const handleStartYearChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '' || /^\d{0,4}$/.test(value)) {
      setStartYear(value);
    }
  };

  const handleEndYearChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '' || /^\d{0,4}$/.test(value)) {
      setEndYear(value);
    }
  };

  const handleClearFilters = () => {
    setStartYear('');
    setEndYear('');
    setOpponentTextInput('');
    clearResultFilter();
    clearGenerations();
    clearTiers();
    clearStages();
  };

  const filteredMatches = matches
    .filter((match) => {
      // Filter by year range
      const matchYear = new Date(match.date).getFullYear();
      const startYearMatch = !startYear || matchYear >= parseInt(startYear, 10);
      const endYearMatch = !endYear || matchYear <= parseInt(endYear, 10);

      // Filter by opponent
      const opponentMatch =
        !opponentTextInput ||
        match.opponent.toLowerCase().includes(opponentTextInput.toLowerCase());

      // Filter by result
      const resultMatch =
        resultFilter.length === 0 || resultFilter.includes(match.result);

      // Filter by dropdown selections
      const generationMatch =
        generations.length === 0 ||
        generations.includes(match.generation as Generation);
      const tierMatch =
        tiers.length === 0 || tiers.includes(match.tier as Tier);
      const stageMatch =
        stages.length === 0 || stages.includes(match.stage || '');

      return (
        startYearMatch &&
        endYearMatch &&
        opponentMatch &&
        resultMatch &&
        generationMatch &&
        tierMatch &&
        stageMatch
      );
    })
    .sort((a, b) => {
      const multiplier = sortDirection === 'asc' ? 1 : -1;
      let stageA, stageB;

      switch (sortColumn) {
        case 'Date':
          return (
            multiplier *
            (new Date(a.date).getTime() - new Date(b.date).getTime())
          );
        case 'Opponent':
          return multiplier * a.opponent.localeCompare(b.opponent);
        case 'Result':
          return multiplier * a.result.localeCompare(b.result);
        case 'Generation':
          return multiplier * a.generation.localeCompare(b.generation);
        case 'Tier':
          return multiplier * a.tier.localeCompare(b.tier);
        case 'Stage':
          stageA = a.stage || '';
          stageB = b.stage || '';
          return multiplier * stageA.localeCompare(stageB);
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
        <FilterHeader>
          <FilterTitle>Filters</FilterTitle>
        </FilterHeader>

        <FilterGrid>
          <FilterItem>
            <FilterTextLabel>Year</FilterTextLabel>
            <YearFilterComponent
              startYear={startYear}
              endYear={endYear}
              onStartYearChange={handleStartYearChange}
              onEndYearChange={handleEndYearChange}
            />
          </FilterItem>

          <FilterItem>
            <FilterTextLabel>Opponent</FilterTextLabel>
            <FilterTextInput
              type="text"
              placeholder="Filter by opponent..."
              value={opponentTextInput}
              onChange={(e) => setOpponentTextInput(e.target.value)}
            />
          </FilterItem>

          <FilterItem>
            <FilterTextLabel>Result</FilterTextLabel>
            <div style={{ width: '100%' }}>
              <FilterDropdownComponent
                label="Result"
                options={['Won', 'Lost', 'Dead Game']}
                selectedValues={resultFilter}
                onChange={handleResultChange}
                isOpen={openResultFilter === 'result'}
                onToggle={() => toggleResultFilter('result')}
              />
            </div>
          </FilterItem>

          <FilterItem>
            <FilterTextLabel>Generation</FilterTextLabel>
            <div style={{ width: '100%' }}>
              <FilterDropdownComponent
                label="Generation"
                options={[...GENERATIONS]}
                selectedValues={generations}
                onChange={handleGenerationChange}
                isOpen={openGenerationFilter === 'generation'}
                onToggle={() => toggleGenerationFilter('generation')}
              />
            </div>
          </FilterItem>

          <FilterItem>
            <FilterTextLabel>Tier</FilterTextLabel>
            <div style={{ width: '100%' }}>
              <FilterDropdownComponent
                label="Tier"
                options={[...TIERS]}
                selectedValues={tiers}
                onChange={handleTierChange}
                isOpen={openTierFilter === 'tier'}
                onToggle={() => toggleTierFilter('tier')}
              />
            </div>
          </FilterItem>

          <FilterItem>
            <FilterTextLabel>Stage</FilterTextLabel>
            <div style={{ width: '100%' }}>
              <FilterDropdownComponent
                label="Stage"
                options={['Regular Season', 'Playoff', 'Tiebreak']}
                selectedValues={stages}
                onChange={handleStageChange}
                isOpen={openStageFilter === 'stage'}
                onToggle={() => toggleStageFilter('stage')}
              />
            </div>
          </FilterItem>
        </FilterGrid>

        <FilterActions>
          <ClearFiltersButtonComponent onClick={handleClearFilters} />
        </FilterActions>
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
        headers={['Date', 'Opponent', 'Result', 'Generation', 'Tier', 'Stage']}
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
            <TableCell>{match.stage}</TableCell>
          </TableRow>
        ))}
      </Table>
    </Container>
  );
}
