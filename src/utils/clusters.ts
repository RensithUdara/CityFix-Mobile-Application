import { Issue } from '../types/issue';
export function clusterIssues(issues: Issue[], zoom: number) {
  const cells = new Map<string, { latitude: number; longitude: number; issues: Issue[] }>();
  const scale = 256 * 2 ** Math.min(20, Math.max(0, zoom));
  for (const issue of issues) {
    if (
      issue.latitude == null ||
      issue.longitude == null ||
      !Number.isFinite(issue.latitude) ||
      !Number.isFinite(issue.longitude)
    )
      continue;
    const lat = (Math.max(-85, Math.min(85, issue.latitude)) * Math.PI) / 180;
    const x = ((issue.longitude + 180) / 360) * scale;
    const y = ((1 - Math.log(Math.tan(lat) + 1 / Math.cos(lat)) / Math.PI) / 2) * scale;
    const key = `${Math.floor(x / 60)}:${Math.floor(y / 60)}`;
    const group = cells.get(key) || { latitude: 0, longitude: 0, issues: [] };
    group.latitude += issue.latitude;
    group.longitude += issue.longitude;
    group.issues.push(issue);
    cells.set(key, group);
  }
  return [...cells.entries()].map(([id, g]) => ({
    id,
    ...g,
    latitude: g.latitude / g.issues.length,
    longitude: g.longitude / g.issues.length,
  }));
}
