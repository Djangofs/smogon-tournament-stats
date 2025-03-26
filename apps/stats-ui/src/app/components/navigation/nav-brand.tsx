import styled from 'styled-components';
import { Link } from 'react-router-dom';

const StyledNavBrand = styled.div`
  a {
    color: #fff;
    font-size: 1.5rem;
    font-weight: 700;
    text-decoration: none;
    letter-spacing: -0.02em;
    &:hover {
      color: #64b5f6;
    }
  }
`;

export const NavBrand = () => (
  <StyledNavBrand>
    <Link to="/">Smogon Stats</Link>
  </StyledNavBrand>
);
