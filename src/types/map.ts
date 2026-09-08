import { Issue } from './issue';
export type MapCenter = { latitude: number; longitude: number };
export type IssueMapProps = { issues: Issue[]; selected?: Issue; center?: MapCenter; onSelect: (issue: Issue) => void };
