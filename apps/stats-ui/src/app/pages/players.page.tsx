import { useState, useEffect } from 'react';
import { useGetPlayersQuery, Player } from '../store/apis/players.api';
import { Container } from '../components/layout/layout';
import { Table, TableRow, TableCell } from '../components/table/table';
import { PageTitle } from '../components/typography/page-title';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { Generation, Tier } from '@smogon-tournament-stats/shared-constants';
import { GENERATIONS, TIERS } from '@smogon-tournament-stats/shared-constants';
import {
  FilterContainerComponent,
  FilterDropdownComponent,
  ClearFiltersButtonComponent,
  useFilterDropdown,
} from '../components/filters/filter-dropdown';
import { YearFilterComponent } from '../components/filters/year-filter';

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
  const [startYear, setStartYear] = useState<string>('');
  const [endYear, setEndYear] = useState<string>('');
  const [filters, setFilters] = useState<Record<string, FilterValue>>({});

  // Use the shared filter hook for generations
  const {
    selectedValues: generations,
    setSelectedValues: setGenerations,
    openFilter: openGenerationFilter,
    toggleFilter: toggleGenerationFilter,
    handleCheckboxChange: handleGenerationChange,
  } = useFilterDropdown<Generation>([...GENERATIONS]);

  // Use the shared filter hook for tiers
  const {
    selectedValues: tiers,
    setSelectedValues: setTiers,
    openFilter: openTierFilter,
    toggleFilter: toggleTierFilter,
    handleCheckboxChange: handleTierChange,
  } = useFilterDropdown<Tier>([...TIERS]);

  // Use the shared filter hook for stages
  const {
    selectedValues: stages,
    setSelectedValues: setStages,
    openFilter: openStageFilter,
    toggleFilter: toggleStageFilter,
    handleCheckboxChange: handleStageChange,
  } = useFilterDropdown<string>(['Regular Season', 'Playoff', 'Tiebreak']);

  const {
    data: players,
    isLoading,
    isError,
    error,
  } = useGetPlayersQuery({
    generation: generations.length > 0 ? generations.join(',') : undefined,
    tier: tiers.length > 0 ? tiers.join(',') : undefined,
    startYear: startYear ? parseInt(startYear, 10) : undefined,
    endYear: endYear ? parseInt(endYear, 10) : undefined,
    stage: stages.length > 0 ? stages.join(',') : undefined,
  });
  const [sortColumn, setSortColumn] = useState<SortColumn>('matcheswon');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

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

  const handleClearFilters = () => {
    setGenerations([]);
    setTiers([]);
    setStartYear('');
    setEndYear('');
    setStages([]);
    setFilters({});
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

  const filteredAndSortedPlayers = [...(players || [])]
    .filter((player: Player) => {
      // First check if the player has any matches in the selected format
      if (generations.length > 0 || tiers.length > 0 || stages.length > 0) {
        if (player.matchesWon + player.matchesLost + player.deadGames === 0) {
          return false;
        }
      }

      // Apply year filters if they are set
      if (startYear || endYear) {
        // If we have year filters but no player matches, filter them out
        if (player.matchesWon + player.matchesLost + player.deadGames === 0) {
          return false;
        }

        // The API already filters by year, so we don't need to do additional filtering here
        // The players returned from the API should already match the year criteria
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

      <FilterContainerComponent>
        <FilterDropdownComponent
          label="Generation"
          options={[...GENERATIONS]}
          selectedValues={generations}
          onChange={handleGenerationChange}
          isOpen={openGenerationFilter === 'generation'}
          onToggle={() => toggleGenerationFilter('generation')}
        />

        <FilterDropdownComponent
          label="Tier"
          options={[...TIERS]}
          selectedValues={tiers}
          onChange={handleTierChange}
          isOpen={openTierFilter === 'tier'}
          onToggle={() => toggleTierFilter('tier')}
        />

        <FilterDropdownComponent
          label="Stage"
          options={['Regular Season', 'Playoff', 'Tiebreak']}
          selectedValues={stages}
          onChange={handleStageChange}
          isOpen={openStageFilter === 'stage'}
          onToggle={() => toggleStageFilter('stage')}
        />

        <YearFilterComponent
          startYear={startYear}
          endYear={endYear}
          onStartYearChange={handleStartYearChange}
          onEndYearChange={handleEndYearChange}
        />

        <ClearFiltersButtonComponent onClick={handleClearFilters} />
      </FilterContainerComponent>

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
