import styled from 'styled-components';
import {
  useState,
  Children,
  isValidElement,
  cloneElement,
  ReactElement,
} from 'react';

const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  th {
    padding: 1rem;
    text-align: left;
    font-weight: 600;
    color: #495057;
    border-bottom: 2px solid #dee2e6;
    background-color: #f8f9fa;
    cursor: pointer;
    user-select: none;

    &:hover {
      background-color: #e9ecef;
    }
  }

  td {
    padding: 1rem;
    border-bottom: 1px solid #dee2e6;
    color: #212529;
  }

  tr {
    &:nth-child(even) {
      background-color: #f8f9fa;
    }
    &:hover {
      background-color: #f1f3f5;
    }
  }
`;

const SortIcon = styled.span`
  margin-left: 0.5rem;
  color: #6c757d;
`;

const FilterContainer = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
`;

const FilterInput = styled.input`
  padding: 0.5rem;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  font-size: 0.875rem;
  width: 100px;

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

interface FilterValue {
  operator: '>' | '<' | '=' | '';
  value: string;
}

interface TableCellProps {
  children: string | number;
}

interface TableRowProps {
  children: ReactElement<TableCellProps>[];
  style?: React.CSSProperties;
}

interface TableProps {
  headers: string[];
  children: React.ReactNode;
  onSort?: (column: string, direction: 'asc' | 'desc') => void;
  onFilter?: (column: string, filter: FilterValue) => void;
  initialSortColumn?: string;
  initialSortDirection?: 'asc' | 'desc';
  filters?: Record<string, FilterValue>;
  showWinRateHighlight?: boolean;
}

const getWinRateColor = (winRate: number): string => {
  // Convert win rate to a value between 0 and 1
  const normalizedRate = winRate / 100;

  // Define colors for 0% and 100%
  const red = [255, 200, 200]; // Light red
  const green = [200, 255, 200]; // Light green

  // Interpolate between red and green based on win rate
  const color = red.map((start, i) => {
    const end = green[i];
    return Math.round(start + (end - start) * normalizedRate);
  });

  return `rgb(${color.join(',')})`;
};

export function Table({
  headers,
  children,
  onSort,
  onFilter,
  initialSortColumn,
  initialSortDirection = 'asc',
  filters = {},
  showWinRateHighlight = false,
}: TableProps) {
  const [sortColumn, setSortColumn] = useState<string | null>(
    initialSortColumn || null
  );
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>(
    initialSortDirection
  );

  const handleSort = (header: string) => {
    if (sortColumn === header) {
      const newDirection = sortDirection === 'asc' ? 'desc' : 'asc';
      setSortDirection(newDirection);
      onSort?.(header, newDirection);
    } else {
      setSortColumn(header);
      setSortDirection('asc');
      onSort?.(header, 'asc');
    }
  };

  const handleFilterChange = (
    header: string,
    operator: '>' | '<' | '=' | '',
    value: string
  ) => {
    onFilter?.(header, { operator, value });
  };

  const isNumericColumn = (header: string) => {
    return ['Matches Won', 'Matches Lost', 'Win Rate'].includes(header);
  };

  // Process children to add background color based on win rate
  const processedChildren = showWinRateHighlight
    ? Children.map(children, (child) => {
        if (isValidElement<TableRowProps>(child)) {
          const cells = Children.toArray(
            child.props.children
          ) as ReactElement<TableCellProps>[];
          const winRateCell = cells[3]; // Win Rate is the 4th column
          if (winRateCell && typeof winRateCell.props.children === 'string') {
            const winRateText = winRateCell.props.children;
            const winRate = parseFloat(winRateText);
            if (!isNaN(winRate)) {
              const backgroundColor = getWinRateColor(winRate);
              return cloneElement(child, {
                style: { backgroundColor },
              });
            }
          }
        }
        return child;
      })
    : children;

  return (
    <StyledTable>
      <thead>
        <tr>
          {headers.map((header) => (
            <th key={header}>
              {isNumericColumn(header) ? (
                <FilterContainer>
                  <FilterSelect
                    value={filters[header]?.operator || ''}
                    onChange={(e) =>
                      handleFilterChange(
                        header,
                        e.target.value as '>' | '<' | '=' | '',
                        filters[header]?.value || ''
                      )
                    }
                  >
                    <option value="">No filter</option>
                    <option value=">">{'>'}</option>
                    <option value="<">{'<'}</option>
                    <option value="=">{'='}</option>
                  </FilterSelect>
                  <FilterInput
                    type="number"
                    placeholder="Value"
                    value={filters[header]?.value || ''}
                    onChange={(e) =>
                      handleFilterChange(
                        header,
                        filters[header]?.operator || '',
                        e.target.value
                      )
                    }
                  />
                </FilterContainer>
              ) : (
                <FilterInput
                  type="text"
                  placeholder={`Search ${header}...`}
                  value={filters[header]?.value || ''}
                  onChange={(e) =>
                    handleFilterChange(header, '=', e.target.value)
                  }
                />
              )}
              <div onClick={() => handleSort(header)}>
                {header}
                {sortColumn === header && (
                  <SortIcon>{sortDirection === 'asc' ? '↑' : '↓'}</SortIcon>
                )}
              </div>
            </th>
          ))}
        </tr>
      </thead>
      <tbody>{processedChildren}</tbody>
    </StyledTable>
  );
}

export const TableRow = 'tr';
export const TableCell = 'td';
