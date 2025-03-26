import styled from 'styled-components';
import { NavContainer } from './nav-container';

const StyledNav = styled.nav`
  background-color: #1a1a1a;
  padding: 1rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

interface NavProps {
  currentPath: string;
}

export const Nav = ({ currentPath }: NavProps) => (
  <StyledNav>
    <NavContainer currentPath={currentPath} />
  </StyledNav>
);
