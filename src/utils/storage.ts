import { User } from '../types';

const STORAGE_KEY = 'youmatter_user';

export const saveUser = (user: User): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
};

export const getUser = (): User | null => {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : null;
};

export const clearUser = (): void => {
  localStorage.removeItem(STORAGE_KEY);
};
