export const faqs = [
  {
    question: 'How do I report an issue?',
    answer:
      'Tap Report an issue. Add one to five photos, a title, a category, a description, and an address. Add GPS if you want a map pin, then submit. Keep the app open until submission finishes.',
    category: 'Reporting',
  },
  {
    question: 'How many photos can I add?',
    answer:
      'Add between one and five photos from your camera or library. You can remove photos or choose a different cover before submitting. Photos are resized and prepared as JPEG files automatically.',
    category: 'Photos',
  },
  {
    question: 'Why can I see a photo before it is uploaded?',
    answer:
      'The preview shows the photo selected on your device. It is uploaded when you submit the report. Keep the app open while each photo uploads. If preparation fails, remove that photo and select it again.',
    category: 'Photos',
  },
  {
    question: 'What do the issue statuses mean?',
    answer:
      'Reported means the issue has been submitted. In progress means an administrator has marked it as being addressed. Resolved means an administrator has marked it complete. A report is not a promise of a repair or an official authority response.',
    category: 'Reporting',
  },
  {
    question: 'Does CityFix contact local authorities?',
    answer:
      'CityFix is a community reporting application. It currently does not send reports to a municipal authority or emergency service.',
    category: 'Community',
  },
  {
    question: 'Can I report without sharing GPS?',
    answer:
      'Yes. Enter a street or landmark manually. Your report will have an address but no map pin. GPS is requested only when you tap Use my current location.',
    category: 'Privacy',
  },
  {
    question: 'What does confirming an issue do?',
    answer:
      'It adds your confirmation to that report. Each account can confirm an issue once. Tap Confirmed by you to remove your confirmation.',
    category: 'Community',
  },
  {
    question: 'How do I follow updates?',
    answer:
      'Open an issue and tap Follow this issue. Find followed issues in My activity. You can enable automatic following for your new reports in Settings. Statuses update while the app is open; background push notifications are not available yet.',
    category: 'Community',
  },
  {
    question: 'Can I submit a report offline?',
    answer:
      'An internet connection is required to upload photos and submit reports. Do not close the form until you see the report details. A durable offline upload queue is not available yet.',
    category: 'Reporting',
  },
  {
    question: 'Who can see my information?',
    answer:
      'Signed-in community members can see reports, photos, report locations, and comments. Your profile name appears on your comments. Account profiles, preferences, followed lists, and support requests are private to your account and authorized project administrators.',
    category: 'Privacy',
  },
  {
    question: 'How do I change my password?',
    answer:
      'Open Profile → Settings → Account security. Enter your current password and a new password. If you cannot sign in, use Forgot password on the sign-in screen.',
    category: 'Account',
  },
  {
    question: 'How can I request removal of my data?',
    answer:
      'Use Help & feedback to submit a data-removal request. Identify the report or account information you want removed, without sending your password. Requests are stored for administrator review; automated account deletion and a response-time guarantee are not available.',
    category: 'Privacy',
  },
];
export const privacySections = [
  {
    title: 'Information you provide',
    text: 'CityFix stores your account email with Firebase Authentication, your profile name and neighborhood, reports, photos, report locations, confirmations, followed issues, comments, preferences, and support requests. Passwords are handled by Firebase Authentication and are not stored in CityFix profile documents.',
  },
  {
    title: 'What the community can see',
    text: 'Signed-in users can read reports, report coordinates and addresses, photos, confirmation information, and comments. Your profile name accompanies comments. Firebase photo links can be shared and opened by anyone who has the download link. Avoid uploading faces, identity documents, private addresses, or sensitive personal details.',
  },
  {
    title: 'Camera, photos, and location',
    text: 'Camera access is requested when you take a photo. The photo picker lets you select images to attach. Location access is requested when you choose GPS; the app does not continuously track your location. Manually entered addresses do not receive a fabricated GPS pin.',
  },
  {
    title: 'How information is used',
    text: 'Information supports account access, community reporting, live updates, confirmations, comments, your preferences, and support requests. Presence records indicate whether your app session is connected. This app does not currently include advertising or analytics SDKs.',
  },
  {
    title: 'Storage and service providers',
    text: 'Firebase Authentication, Cloud Firestore, Firebase Storage, and Realtime Database process and store app data. Data may be processed outside your country. Native maps use platform map providers, and the web map uses OpenStreetMap. Opening maps or directions contacts those providers.',
  },
  {
    title: 'Your controls',
    text: 'You can edit your profile, change your password, remove your confirmations, unfollow issues, delete comments you authored, and adjust reporting preferences. You can revoke device permissions in system settings. Onboarding completion is saved on your device.',
  },
  {
    title: 'Retention and removal requests',
    text: 'Reports and account content remain in the project until removed by the application owner or an authorized administrator. No automatic retention schedule is configured. Submit a data-removal request through Help & feedback. This version does not provide automatic account deletion or guarantee a response time.',
  },
  {
    title: 'Questions and changes',
    text: 'Use Help & feedback for privacy questions. This page describes the current app behavior and should be updated whenever the app’s data practices change.',
  },
];
export const guidelines = [
  {
    title: 'Report what you can observe',
    text: 'Use clear photos and a factual description. Include a useful landmark, select an appropriate category, and avoid duplicate reports where possible.',
  },
  {
    title: 'Keep people’s privacy in mind',
    text: 'Avoid faces, vehicle details, identity documents, private conversations, and identifying information that is not needed to explain the issue.',
  },
  {
    title: 'Be respectful and constructive',
    text: 'Use comments to share relevant observations. Do not post harassment, threats, discriminatory content, advertising, or unrelated material.',
  },
  {
    title: 'Choose severity thoughtfully',
    text: 'Use High for issues that appear to need urgent attention. CityFix is not an emergency service. Contact the appropriate local emergency service directly if someone is in immediate danger.',
  },
  {
    title: 'Help keep information accurate',
    text: 'Confirm an issue only if you have observed it. Add a comment if something has changed. Only authorized administrators update official report statuses in the app.',
  },
];
