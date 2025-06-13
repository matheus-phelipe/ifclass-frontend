export interface MenuCard {
  icon: string;
  title: string;
  text: string;
  link: string;
  roles: string[];
}

export const ALL_MENU_CARDS: MenuCard[] = [
  {
    icon: 'bi bi-calendar-week-fill',
    title: 'Aulas do dia',
    text: 'Confira quais aulas você tem hoje.',
    link: '/aulas',
    roles: ['ROLE_ALUNO', 'ROLE_PROFESSOR', 'ROLE_COORDENADOR', 'ROLE_ADMIN']
  },
  {
    icon: 'bi bi-door-open-fill',
    title: 'Salas',
    text: 'Veja em qual sala sua aula acontecerá.',
    link: '/salas',
    roles: ['ROLE_ALUNO', 'ROLE_PROFESSOR', 'ROLE_COORDENADOR', 'ROLE_ADMIN']
  },
  {
    icon: 'bi bi-people-fill',
    title: 'Turma',
    text: 'Informações sobre sua turma atual.',
    link: '/turmas',
    roles: ['ROLE_ALUNO', 'ROLE_COORDENADOR', 'ROLE_ADMIN']
  },
  {
    icon: 'bi bi-journal-bookmark-fill',
    title: 'Disciplinas',
    text: 'Acompanhe suas disciplinas.',
    link: '/disciplinas',
    roles: ['ROLE_ALUNO', 'ROLE_COORDENADOR', 'ROLE_ADMIN']
  },
  {
    icon: 'bi bi-plus-square-fill',
    title: 'Criar aula',
    text: 'Crie uma nova aula e defina sala, horário e disciplina.',
    link: '/aulas/criar',
    roles: ['ROLE_PROFESSOR', 'ROLE_COORDENADOR', 'ROLE_ADMIN']
  },
  {
    icon: 'bi bi-link',
    title: 'Relacionar sala/disciplina',
    text: 'Associe salas às disciplinas disponíveis.',
    link: '/relacionar-sala',
    roles: ['ROLE_COORDENADOR', 'ROLE_ADMIN']
  },
  {
    icon: 'bi bi-link',
    title: 'Relacionar turma/curso',
    text: 'Associe turmas aos cursos disponíveis.',
    link: '/relacionar-turma',
    roles: ['ROLE_COORDENADOR', 'ROLE_ADMIN']
  },
  {
    icon: 'bi bi-person-gear',
    title: 'Gerenciar permissões',
    text: 'Defina permissões de acesso para usuários.',
    link: '/permissoes',
    roles: ['ROLE_COORDENADOR', 'ROLE_ADMIN']
  },
  {
    icon: 'bi bi-people-fill',
    title: 'Gerenciar usuários',
    text: 'Adicione, remova e edite usuários.',
    link: '/usuarios',
    roles: ['ROLE_ADMIN']
  },
  {
    icon: 'bi bi-gear-fill',
    title: 'Configurações',
    text: 'Ajuste configurações do sistema.',
    link: '/configuracoes',
    roles: ['ROLE_ADMIN']
  }
];