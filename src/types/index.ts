export interface Post {
  _id: string;
  title: string;
  content: string;
  author: string;
  createdAt: string;
  updatedAt: string;
}

export interface PostInput {
  title: string;
  content: string;
  author: string;
}

export type UserRole = 'teacher' | 'student';

/** Usuário autenticado (professor ou aluno), como retornado por POST /auth/login. */
export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface LoginResponse {
  token: string;
  user: AuthUser;
}

/** Registro de professor ou aluno, como retornado por /teachers e /students. */
export interface Person {
  _id: string;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export interface PersonInput {
  name: string;
  email: string;
  password?: string;
}

export interface Paginated<T> {
  items: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
