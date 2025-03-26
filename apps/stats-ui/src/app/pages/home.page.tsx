import { Card } from '../components/card/card';
import { Grid } from '../components/grid/grid';
import {
  Container,
  NewsItem,
  TournamentHighlight,
} from '../components/layout/layout';
import {
  NewsDate,
  NewsTitle,
  NewsExcerpt,
  StatValue,
  StatLabel,
  TournamentTitle,
  TournamentMeta,
  TournamentResult,
} from '../components/typography/typography';

export function HomePage() {
  return (
    <Container>
      <h1>Smogon Tournament Statistics</h1>
      <p>Your comprehensive source for competitive Pokémon tournament data</p>

      <Grid>
        <Card title="Recent Tournaments">
          <TournamentHighlight>
            <TournamentTitle>Smogon Tour 35</TournamentTitle>
            <TournamentMeta>SS OU • 256 Players • March 2024</TournamentMeta>
            <TournamentResult>Winner: Finchinator</TournamentResult>
          </TournamentHighlight>
          <TournamentHighlight>
            <TournamentTitle>World Cup of Pokémon 2024</TournamentTitle>
            <TournamentMeta>SS OU • 16 Teams • February 2024</TournamentMeta>
            <TournamentResult>Winner: Team US West</TournamentResult>
          </TournamentHighlight>
          <TournamentHighlight>
            <TournamentTitle>Smogon Grand Slam XII</TournamentTitle>
            <TournamentMeta>SS OU • 128 Players • January 2024</TournamentMeta>
            <TournamentResult>Winner: Lopunny Kicks</TournamentResult>
          </TournamentHighlight>
        </Card>

        <Card title="Tournament Statistics">
          <StatValue>1,234</StatValue>
          <StatLabel>Active Tournaments This Month</StatLabel>
          <StatValue>45,678</StatValue>
          <StatLabel>Total Players Participating</StatLabel>
          <StatValue>89%</StatValue>
          <StatLabel>Tournament Completion Rate</StatLabel>
        </Card>

        <Card title="Latest News">
          <NewsItem>
            <NewsDate>March 15, 2024</NewsDate>
            <NewsTitle>New Tournament Format Announced</NewsTitle>
            <NewsExcerpt>
              Smogon introduces a new tournament format combining Swiss and
              Single Elimination rounds...
            </NewsExcerpt>
          </NewsItem>
          <NewsItem>
            <NewsDate>March 10, 2024</NewsDate>
            <NewsTitle>Community Spotlight: Tournament Organizers</NewsTitle>
            <NewsExcerpt>
              Meet the dedicated volunteers who make Smogon tournaments
              possible...
            </NewsExcerpt>
          </NewsItem>
          <NewsItem>
            <NewsDate>March 5, 2024</NewsDate>
            <NewsTitle>Tournament Rules Update</NewsTitle>
            <NewsExcerpt>
              Important changes to tournament scheduling and player
              eligibility...
            </NewsExcerpt>
          </NewsItem>
        </Card>
      </Grid>
    </Container>
  );
}
