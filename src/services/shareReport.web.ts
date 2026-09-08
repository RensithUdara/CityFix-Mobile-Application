import { Issue } from '../types/issue';
export async function shareReport(issue: Issue): Promise<string> {
  const url = `${window.location.origin}/issue/${issue.id}`;
  if (navigator.share) {
    try { await navigator.share({ title: issue.title, text: issue.address, url }); }
    catch (error) { if (!(error instanceof DOMException && error.name === 'AbortError')) throw error; }
    return '';
  }
  if (!navigator.clipboard) throw new Error('Sharing is unavailable in this browser. Copy the report address from your address bar.');
  await navigator.clipboard.writeText(url);
  return 'Report link copied.';
}
