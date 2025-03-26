import styled from 'styled-components';
import { Provider } from 'react-redux';
import { Route, Routes, useLocation } from 'react-router-dom';

import { TournamentsPage } from './pages/tournaments.page';
import { HomePage } from './pages/home.page';
import { store } from './store/store';
import { Nav } from './components/navigation';

const StyledApp = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
    'Helvetica Neue', Arial, sans-serif;
`;

const MainContent = styled.main`
  flex: 1;
  background-color: #f5f5f5;
`;

function AppContent() {
  const location = useLocation();

  return (
    <StyledApp>
      <Nav currentPath={location.pathname} />
      <MainContent>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/tournaments" element={<TournamentsPage />} />
        </Routes>
      </MainContent>
    </StyledApp>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
}
