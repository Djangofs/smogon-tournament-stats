import styled from 'styled-components';
import { useState } from 'react';

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

interface TableProps {
  headers: string[];
  children: React.ReactNode;
  onSort?: (column: string, direction: 'asc' | 'desc') => void;
  initialSortColumn?: string;
  initialSortDirection?: 'asc' | 'desc';
}

export function Table({
  headers,
  children,
  onSort,
  initialSortColumn,
  initialSortDirection = 'asc',
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

  return (
    <StyledTable>
      <thead>
        <tr>
          {headers.map((header) => (
            <th key={header} onClick={() => handleSort(header)}>
              {header}
              {sortColumn === header && (
                <SortIcon>{sortDirection === 'asc' ? '↑' : '↓'}</SortIcon>
              )}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>{children}</tbody>
    </StyledTable>
  );
}

export const TableRow = 'tr';
export const TableCell = 'td';
