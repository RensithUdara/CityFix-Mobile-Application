export function errorMessage(error: unknown): string {
  const code = (error as { code?: string })?.code;
  const messages: Record<string, string> = {
    'auth/invalid-credential': 'The email or password is incorrect.',
    'auth/email-already-in-use': 'An account already exists with this email.',
    'auth/weak-password': 'Choose a stronger password with at least 6 characters.',
    'auth/invalid-email': 'Please enter a valid email address.',
    'auth/too-many-requests': 'Too many attempts. Please try again later.',
    'auth/network-request-failed': 'Unable to connect. Check your internet connection.',
    'permission-denied': 'Access denied. Check your account and deployed Firebase rules.',
    'storage/unauthorized': 'Photo upload is not authorized. Check Storage rules.',
    unavailable: 'The service is unavailable. Please try again.',
  };
  return code && messages[code]
    ? messages[code]
    : error instanceof Error
      ? error.message
      : 'Something went wrong. Please try again.';
}
