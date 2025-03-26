import styled from 'styled-components';
import { Link } from 'react-router-dom';

interface NavLinkProps {
  to: string;
  active?: boolean;
  children: React.ReactNode;
}

const StyledNavLink = styled.div<{ active?: boolean }>`
  a {
    color: ${(props) => (props.active ? '#64b5f6' : '#fff')};
    text-decoration: none;
    font-weight: ${(props) => (props.active ? '600' : '500')};
    padding: 0.5rem 1rem;
    border-radius: 4px;
    transition: all 0.2s ease-in-out;
    letter-spacing: -0.01em;

    &:hover {
      background-color: rgba(255, 255, 255, 0.1);
      color: #64b5f6;
    }
  }
`;

export const NavLink = ({ to, active, children }: NavLinkProps) => (
  <StyledNavLink active={active}>
    <Link to={to}>{children}</Link>
  </StyledNavLink>
);
