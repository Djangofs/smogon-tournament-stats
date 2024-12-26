import styled from 'styled-components';
import { Provider } from 'react-redux';
import { Route, Routes, Link } from 'react-router-dom';

import { TournamentsPage } from './pages/tournaments.page';
import { store } from './store/store';

const StyledApp = styled.div`
  // Your style here
`;

export const App = () => {
  return (
    <Provider store={store}>
      <StyledApp>
        <div role="navigation">
          <ul>
            <li>
              <Link to="/">Home</Link>
            </li>

            <li>
              <Link to="/tournaments">Tournaments</Link>
            </li>
          </ul>
        </div>
        <Routes>
          <Route
            path="/"
            element={<div>This is the generated root route. </div>}
          />
          <Route path="/tournaments" element={<TournamentsPage />} />
        </Routes>
      </StyledApp>
    </Provider>
  );
};

export default App;
