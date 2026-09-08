import { create } from 'zustand';
export type Preferences = {
  autoFollow: boolean;
  showResolved: boolean;
  defaultSeverity: 'Low' | 'Medium' | 'High';
};
export const defaultPreferences: Preferences = {
  autoFollow: false,
  showResolved: true,
  defaultSeverity: 'Medium',
};
export const usePreferencesStore = create<Preferences>(() => defaultPreferences);
