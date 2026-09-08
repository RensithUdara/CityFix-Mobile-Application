export const categories = [
  'All issues',
  'Roads',
  'Lighting',
  'Waste',
  'Water',
  'Public spaces',
] as const;
export type Category = Exclude<(typeof categories)[number], 'All issues'>;
export type Status = 'Reported' | 'In progress' | 'Resolved';
export type Issue = {
  id: string;
  title: string;
  description: string;
  category: Category;
  status: Status;
  severity: 'Low' | 'Medium' | 'High';
  address: string;
  latitude: number | null;
  longitude: number | null;
  ownerId: string;
  image?: string;
  photos: ReportPhoto[];
  confirmations: number;
  createdAt: string;
  mine?: boolean;
};
export type NewIssue = Omit<
  Issue,
  'id' | 'createdAt' | 'confirmations' | 'status' | 'mine' | 'ownerId' | 'image' | 'photos'
> & { photos: LocalPhoto[] };
import { LocalPhoto, ReportPhoto } from './photo';
