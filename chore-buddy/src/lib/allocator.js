// Greedy for one-off; rotation for recurring. Points are clamped 1..5.
export function assignTasks(members, tasks, state = {}) {
  const memberPoints = { ...(state.memberPoints || {}) };
  let tieCursor = Number.isInteger(state.tieCursor) ? state.tieCursor : 0;
  const recurringNextIdx = { ...(state.recurringNextIdx || {}) };
  const points = members.map(m => memberPoints[m.id] ?? 0);

  const rec = tasks.filter(t => t.recurring);
  const one = tasks.filter(t => !t.recurring);
  const assignments = {};

  const argmin = (arr, start) => {
    let min = Math.min(...arr);
    for (let k=0;k<arr.length;k++){ const i=(start+k)%arr.length; if(arr[i]===min) return i; }
    return 0;
  };

  // recurring → rotation
  for (const t of rec) {
    const raw = Number.isInteger(recurringNextIdx[t.id]) ? recurringNextIdx[t.id] : 0;
    const idx = raw % members.length;
    const m = members[idx];
    assignments[t.id] = m.id;
    points[idx] += Math.max(1, Math.min(5, t.points || 1));
    recurringNextIdx[t.id] = (idx + 1) % members.length;
  }

  // one-off → greedy to lowest load, largest first
  one.sort((a,b)=> (b.points||1)-(a.points||1));
  for (const t of one) {
    const i = argmin(points, tieCursor);
    assignments[t.id] = members[i].id;
    points[i] += Math.max(1, Math.min(5, t.points || 1));
    tieCursor = (i + 1) % members.length;
  }

  members.forEach((m,i)=>{ memberPoints[m.id] = points[i]; });
  return { assignments, state: { memberPoints, tieCursor, recurringNextIdx } };
}
