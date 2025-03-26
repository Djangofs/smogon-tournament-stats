import styled from 'styled-components';
import { NavBrand } from './nav-brand';
import { NavLinks } from './nav-links';

const StyledNavContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

interface NavContainerProps {
  currentPath: string;
}

export const NavContainer = ({ currentPath }: NavContainerProps) => (
  <StyledNavContainer>
    <NavBrand />
    <NavLinks currentPath={currentPath} />
  </StyledNavContainer>
);
