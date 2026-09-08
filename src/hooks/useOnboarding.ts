import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
export const ONBOARDING_KEY = 'cityfix-onboarding-complete-v1';
export function useOnboarding() {
  const [ready, setReady] = useState(false);
  const [complete, setComplete] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => {
    let active = true;
    AsyncStorage.getItem(ONBOARDING_KEY)
      .then((value) => {
        if (active) setComplete(value === 'true');
      })
      .catch(() => {
        if (active) setError('Your welcome preferences could not be loaded.');
      })
      .finally(() => {
        if (active) setReady(true);
      });
    return () => {
      active = false;
    };
  }, []);
  const finish = async () => {
    setError('');
    try {
      await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
      setComplete(true);
    } catch {
      setError('Could not save your preference. Please try again.');
    }
  };
  return { ready, complete, finish, error };
}
