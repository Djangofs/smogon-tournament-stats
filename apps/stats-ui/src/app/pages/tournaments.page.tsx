import { useGetTournamentsQuery } from '../store/apis/tournaments.api';

export const TournamentsPage = () => {
  const { data, isError, isLoading } = useGetTournamentsQuery();

  return (
    <div>
      <h1>Welcome to TournamentPage!</h1>
      {isLoading ? (
        <div>Loading...</div>
      ) : isError ? (
        <div>Error: {isError}</div>
      ) : (
        <ul>
          {data?.map((tournament) => (
            <li key={tournament.id}>{tournament.name}</li>
          ))}
        </ul>
      )}
    </div>
  );
};
