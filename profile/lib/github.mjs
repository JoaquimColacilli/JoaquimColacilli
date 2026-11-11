// Contribution calendar from the GitHub GraphQL API — the same data behind the
// graph on the profile page (private contributions included when the profile
// has "Private contributions" turned on).

const LEVELS = { NONE: 0, FIRST_QUARTILE: 1, SECOND_QUARTILE: 2, THIRD_QUARTILE: 3, FOURTH_QUARTILE: 4 };

const QUERY = `query ($login: String!) {
  user(login: $login) {
    contributionsCollection {
      contributionCalendar {
        totalContributions
        weeks { contributionDays { date contributionCount contributionLevel } }
      }
    }
  }
}`;

export async function fetchCalendar(login, token) {
  const res = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: {
      Authorization: `bearer ${token}`,
      'Content-Type': 'application/json',
      'User-Agent': `${login}-profile-readme`,
    },
    body: JSON.stringify({ query: QUERY, variables: { login } }),
  });
  if (!res.ok) throw new Error(`GitHub GraphQL responded ${res.status}: ${await res.text()}`);
  const json = await res.json();
  if (json.errors?.length) throw new Error(json.errors.map((e) => e.message).join('; '));
  const calendar = json.data?.user?.contributionsCollection?.contributionCalendar;
  if (!calendar) throw new Error(`No contribution calendar returned for "${login}"`);
  const days = calendar.weeks
    .flatMap((w) => w.contributionDays)
    .map((d) => ({ date: d.date, count: d.contributionCount, level: LEVELS[d.contributionLevel] ?? 0 }))
    .sort((a, b) => a.date.localeCompare(b.date));
  return { total: calendar.totalContributions, days, fetchedAt: new Date().toISOString() };
}
