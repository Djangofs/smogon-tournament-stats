import styled from 'styled-components';
import { Provider } from 'react-redux';
import { Route, Routes, useLocation } from 'react-router-dom';

import { TournamentsPage } from './pages/tournaments.page';
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
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
  line-height: 1.5;
`;

export const App = () => {
  const location = useLocation();

  return (
    <Provider store={store}>
      <StyledApp>
        <Nav currentPath={location.pathname} />
        <MainContent>
          <Routes>
            <Route
              path="/"
              element={
                <div>
                  Welcome to Smogon Stats! Select a tournament to view
                  statistics.
                </div>
              }
            />
            <Route path="/tournaments" element={<TournamentsPage />} />
          </Routes>
        </MainContent>
      </StyledApp>
    </Provider>
  );
};

export default App;
