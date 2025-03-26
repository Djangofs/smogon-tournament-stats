import styled from 'styled-components';
import { NavLink } from './nav-link';

const StyledNavLinks = styled.nav`
  display: flex;
  gap: 1rem;
`;

export function NavLinks({ currentPath }: { currentPath: string }) {
  return (
    <StyledNavLinks>
      <NavLink to="/" active={currentPath === '/'}>
        Home
      </NavLink>
      <NavLink to="/tournaments" active={currentPath === '/tournaments'}>
        Tournaments
      </NavLink>
      <NavLink to="/players" active={currentPath === '/players'}>
        Players
      </NavLink>
    </StyledNavLinks>
  );
}
