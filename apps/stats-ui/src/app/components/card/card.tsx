import styled from 'styled-components';
import { ReactNode, PropsWithChildren } from 'react';

const StyledCard = styled.div`
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const CardTitle = styled.h2`
  font-size: 1.25rem;
  margin-bottom: 1rem;
  color: #333;
`;

interface CardProps extends PropsWithChildren {
  title?: string;
  children?: ReactNode;
}

export const Card = ({ title, children }: CardProps) => {
  return (
    <StyledCard>
      {title && <CardTitle>{title}</CardTitle>}
      {children}
    </StyledCard>
  );
};
