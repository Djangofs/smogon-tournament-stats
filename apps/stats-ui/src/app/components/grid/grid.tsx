import styled from 'styled-components';
import { PropsWithChildren } from 'react';

interface GridProps extends PropsWithChildren {
  minWidth?: string;
  gap?: string;
}

const Grid = styled.div<GridProps>`
  display: grid;
  grid-template-columns: repeat(
    auto-fit,
    minmax(${(props) => props.minWidth || '300px'}, 1fr)
  );
  gap: ${(props) => props.gap || '2rem'};
  margin-top: 2rem;
`;

export { Grid };
