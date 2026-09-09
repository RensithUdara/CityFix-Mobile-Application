import { create } from 'zustand';
import { QueuedReport } from '../types/queue';
export const useQueueStore = create<{
  entries: QueuedReport[];
  online: boolean;
  ready: boolean;
  syncing: boolean;
  error: string;
}>(() => ({ entries: [], online: true, ready: false, syncing: false, error: '' }));
