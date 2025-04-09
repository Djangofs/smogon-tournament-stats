import { useAuth0 } from '@auth0/auth0-react';

export function LoginButton() {
  const { loginWithRedirect, logout, isAuthenticated } = useAuth0();

  return (
    <button
      onClick={() => (isAuthenticated ? logout() : loginWithRedirect())}
      style={{
        padding: '8px 16px',
        borderRadius: '4px',
        border: 'none',
        backgroundColor: '#007bff',
        color: 'white',
        cursor: 'pointer',
      }}
    >
      {isAuthenticated ? 'Log Out' : 'Log In'}
    </button>
  );
}
