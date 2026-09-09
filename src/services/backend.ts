import { httpsCallable } from 'firebase/functions';
import { firebase } from '../config/firebase';
export async function callBackend<T>(name: string, data: unknown): Promise<T> {
  const result = await httpsCallable<unknown, T>(firebase().functions, name)(data);
  return result.data;
}
