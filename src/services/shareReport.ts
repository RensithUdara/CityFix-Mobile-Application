import { Share } from 'react-native';
import { Issue } from '../types/issue';
export async function shareReport(issue: Issue): Promise<string> {
  await Share.share({ message: `${issue.title}\n${issue.address}\ncityfix://issue/${issue.id}` });
  return '';
}
