import { NewIssue } from './issue';
export type QueuedReport = {
  id: string;
  uid: string;
  input: NewIssue;
  state: 'pending' | 'uploading' | 'failed';
  attempts: number;
  nextAttemptAt: number;
  createdAt: number;
  error: string;
};
