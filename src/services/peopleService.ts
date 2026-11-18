import { apiRequest } from './api';
import type { Paginated, Person, PersonInput } from '@/types';

/** Professores e alunos têm o mesmo contrato na API; muda só o caminho do recurso. */
export type PersonResource = 'teachers' | 'students';

export function createPeopleService(resource: PersonResource) {
  const base = `/${resource}`;

  return {
    list: (page: number, limit = 10) =>
      apiRequest<Paginated<Person>>({ url: base, params: { page, limit } }),
    get: (id: string) => apiRequest<Person>({ url: `${base}/${id}` }),
    create: (data: PersonInput) => apiRequest<Person>({ method: 'POST', url: base, data }),
    update: (id: string, data: Partial<PersonInput>) =>
      apiRequest<Person>({ method: 'PUT', url: `${base}/${id}`, data }),
    remove: (id: string) => apiRequest<null>({ method: 'DELETE', url: `${base}/${id}` }),
  };
}

export const teachersService = createPeopleService('teachers');
export const studentsService = createPeopleService('students');
