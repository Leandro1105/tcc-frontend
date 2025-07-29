import { api } from "@/lib/api";

export interface User {
  id: string;
  nome: string;
  role: string;
}

export const retrieveUserData = async (): Promise<User> => {
  const user = (await api.get("/login")) as User;
  return user;
};
