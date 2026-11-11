import { stack, experience, work } from './content.mjs';

const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`;

/** Section dividers, in page order. */
export function sections() {
  const core = stack.groups.reduce((n, g) => n + g.items.length, 0);
  const since = Math.min(...experience.map((j) => Number(j.start.slice(0, 4))));
  const clients = work.filter((w) => w.kind === 'Client').length;
  const side = work.length - clients;
  return [
    { id: 'stack', index: '01', title: 'Stack', meta: `${core} core tools · ${stack.also.length} more` },
    { id: 'experience', index: '02', title: 'Experience', meta: `${plural(experience.length, 'role')} · since ${since}` },
    { id: 'work', index: '03', title: 'Selected work', meta: `${plural(clients, 'client site')} · ${plural(side, 'side project')}` },
    { id: 'activity', index: '04', title: 'Activity', meta: 'Synced from GitHub' },
    { id: 'education', index: '05', title: 'Education', meta: 'UBA · FIUBA' },
  ];
}
