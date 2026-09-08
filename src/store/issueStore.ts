import { create } from 'zustand';
import { Issue, NewIssue } from '../types/issue';
import { createIssue, toggleConfirm, toggleFollow } from '../services/issues';
type IssueState = {
  issues: Issue[];
  followed: string[];
  confirmed: string[];
  loading: boolean;
  error: string;
  addIssue: (input: NewIssue, onProgress?: (message: string) => void) => Promise<string>;
  toggleFollow: (id: string) => Promise<void>;
  toggleConfirm: (id: string) => Promise<void>;
  reset: () => void;
};
export const useIssueStore = create<IssueState>((set) => ({
  issues: [],
  followed: [],
  confirmed: [],
  loading: true,
  error: '',
  addIssue: createIssue,
  toggleFollow,
  toggleConfirm,
  reset: () => set({ issues: [], followed: [], confirmed: [], loading: true, error: '' }),
}));
