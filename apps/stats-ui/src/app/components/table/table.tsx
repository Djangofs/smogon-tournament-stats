import styled from 'styled-components';

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

interface TableProps {
  headers: string[];
  children: React.ReactNode;
}

export function Table({ headers, children }: TableProps) {
  return (
    <StyledTable>
      <thead>
        <tr>
          {headers.map((header) => (
            <th key={header}>{header}</th>
          ))}
        </tr>
      </thead>
      <tbody>{children}</tbody>
    </StyledTable>
  );
}

export const TableRow = 'tr';
export const TableCell = 'td';
