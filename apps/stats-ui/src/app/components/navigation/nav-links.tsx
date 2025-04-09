import styled from 'styled-components';
import { NavLink } from './nav-link';
import { useAuth0 } from '@auth0/auth0-react';

const StyledNavLinks = styled.nav`
  display: flex;
  gap: 1rem;
`;

export function NavLinks({ currentPath }: { currentPath: string }) {
  const { isAuthenticated } = useAuth0();

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
      {isAuthenticated && (
        <NavLink to="/profile" active={currentPath === '/profile'}>
          Profile
        </NavLink>
      )}
    </StyledNavLinks>
  );
}
