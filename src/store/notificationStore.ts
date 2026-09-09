import { create } from 'zustand';
export const useNotificationStore = create<{ pendingIssueId: string | null }>(() => ({
  pendingIssueId: null,
}));
