export type User = {
  id: number;
  phone: string;
  pushToken: string | null;
};

export type StoredUser = User | null;
