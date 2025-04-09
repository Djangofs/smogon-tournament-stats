import styled from 'styled-components';
import { NavBrand } from './nav-brand';
import { NavLinks } from './nav-links';
import { LoginButton } from '../../auth/LoginButton';

const StyledNavContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const NavRight = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

interface NavContainerProps {
  currentPath: string;
}

export const NavContainer = ({ currentPath }: NavContainerProps) => (
  <StyledNavContainer>
    <NavBrand />
    <NavRight>
      <NavLinks currentPath={currentPath} />
      <LoginButton />
    </NavRight>
  </StyledNavContainer>
);
