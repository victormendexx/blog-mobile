import { studentsService, teachersService, type PersonResource } from '@/services/peopleService';

/**
 * Professores e alunos compartilham as mesmas telas (ambos fazem login, então ambos têm senha);
 * muda só o texto e o serviço da API.
 */
export const peopleConfig = {
  teachers: {
    service: teachersService,
    basePath: '/admin/teachers',
    singular: 'professor',
    plural: 'professores',
  },
  students: {
    service: studentsService,
    basePath: '/admin/students',
    singular: 'aluno',
    plural: 'alunos',
  },
} as const satisfies Record<PersonResource, unknown>;
