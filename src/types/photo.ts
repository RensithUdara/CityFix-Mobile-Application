export const MAX_REPORT_PHOTOS = 5;
export type LocalPhoto = {
  id: string;
  uri: string;
  width: number;
  height: number;
  mimeType?: string;
  fileName?: string;
};
export type ReportPhoto = { url: string; path: string };
