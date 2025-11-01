export function currentWeek() {
  const now = new Date();
  const day = now.getDay(); // 0 Sun..6 Sat
  const diffToMon = (day + 6) % 7; // Monday=0
  const start = new Date(now); start.setDate(now.getDate() - diffToMon); start.setHours(0,0,0,0);
  const end   = new Date(start); end.setDate(start.getDate() + 6); end.setHours(23,59,59,999);
  return {
    start,
    end,
    startISO: start.toISOString(),
    endISO: end.toISOString(),
    label: `${start.toLocaleDateString()}`
  };
}
