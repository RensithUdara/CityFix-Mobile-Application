import { NavigatorScreenParams } from '@react-navigation/native';
export type RootStackParams = {
  Main: NavigatorScreenParams<TabParams> | undefined;
  IssueDetails: { id: string };
  Report: undefined;
  Notifications: undefined;
  Auth: undefined;
  Settings: undefined;
  Security: undefined;
  FAQ: undefined;
  Privacy: undefined;
  Guidelines: undefined;
  About: undefined;
  HelpSupport: undefined;
};
export type TabParams = {
  Home: undefined;
  Explore: undefined;
  Activity: undefined;
  Profile: undefined;
};
