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
    link: '/app/aulas',
    roles: ['ROLE_ALUNO', 'ROLE_PROFESSOR', 'ROLE_COORDENADOR', 'ROLE_ADMIN']
  },
  {
    icon: 'bi bi-door-open-fill',
    title: 'Salas',
    text: 'Veja em qual sala sua aula acontecerá.',
    link: '/app/salas',
    roles: ['ROLE_PROFESSOR', 'ROLE_COORDENADOR', 'ROLE_ADMIN']
  },
  {
    icon: 'bi bi-mortarboard-fill',
    title: 'Curso',
    text: 'Informações sobre os cursos.',
    link: '/app/cursos',
    roles: ['ROLE_PROFESSOR', 'ROLE_COORDENADOR', 'ROLE_ADMIN']
  },
  {
    icon: 'bi bi-people-fill',
    title: 'Turma',
    text: 'Informações sobre sua turma atual.',
    link: '/app/turmas',
    roles: ['ROLE_PROFESSOR', 'ROLE_COORDENADOR', 'ROLE_ADMIN']
  },
  {
    icon: 'bi bi-journal-bookmark-fill',
    title: 'Disciplinas',
    text: 'Acompanhe suas disciplinas.',
    link: '/app/disciplinas',
    roles: ['ROLE_PROFESSOR', 'ROLE_COORDENADOR', 'ROLE_ADMIN']
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
    icon: 'bi bi-person-gear',
    title: 'Gerenciar permissões',
    text: 'Defina permissões de acesso para usuários.',
    link: '/app/permissoes',
    roles: ['ROLE_COORDENADOR', 'ROLE_ADMIN']
  },
  {
    icon: 'bi bi-people-fill',
    title: 'Gerenciar usuários',
    text: 'Adicione, remova e edite usuários.',
    link: '/app/usuarios',
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