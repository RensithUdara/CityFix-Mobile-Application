import { useEffect, useState } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { firebase } from '../config/firebase';
import { errorMessage } from '../utils/errors';
export function useLiveDocument<T>(path: string | null) {
  const [data, setData] = useState<T | null>(null),
    [error, setError] = useState('');
  useEffect(() => {
    setData(null);
    setError('');
    if (!path) return;
    return onSnapshot(
      doc(firebase().firestore, path),
      (snapshot) => setData(snapshot.exists() ? (snapshot.data() as T) : null),
      (e) => setError(errorMessage(e)),
    );
  }, [path]);
  return { data, error };
}
