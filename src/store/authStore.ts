import { create } from 'zustand';
import { User } from 'firebase/auth';
export type Profile = { displayName: string; neighborhood: string };
export const useAuthStore = create<{
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  error: string;
  connected: boolean;
}>(() => ({ user: null, profile: null, loading: true, error: '', connected: false }));
