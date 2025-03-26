import styled from 'styled-components';
import { NavLink } from './nav-link';

const StyledNavLinks = styled.div`
  display: flex;
  gap: 2rem;
`;

interface NavLinksProps {
  currentPath: string;
}

export const NavLinks = ({ currentPath }: NavLinksProps) => (
  <StyledNavLinks>
    <NavLink to="/" active={currentPath === '/'}>
      Home
    </NavLink>
    <NavLink to="/tournaments" active={currentPath === '/tournaments'}>
      Tournaments
    </NavLink>
  </StyledNavLinks>
);
