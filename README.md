# ⚙️ IFClass Backend - API Spring Boot Completa

Backend robusto do sistema IFClass desenvolvido com **Spring Boot 3**, **Java 17** e **PostgreSQL 16**. Sistema completo de gestão acadêmica com autenticação JWT, monitoramento avançado, logs de segurança e APIs RESTful otimizadas.

---

## 🚀 **TECNOLOGIAS E FRAMEWORKS**

### Core Technologies:
- **Spring Boot 3.2+** - Framework principal
- **Java 17** - Linguagem de programação
- **PostgreSQL 16** - Banco de dados principal
- **Maven 3.8+** - Gerenciamento de dependências

### Spring Ecosystem:
- **Spring Security 6** - Autenticação e autorização
- **Spring Data JPA** - Persistência de dados
- **Spring Web** - APIs RESTful
- **Spring Actuator** - Monitoramento e métricas
- **Spring Mail** - Sistema de emails
- **Spring Cache** - Cache de dados
- **Spring Validation** - Validação de dados

### Bibliotecas Adicionais:
- **JWT (jsonwebtoken)** - Tokens de autenticação
- **BCrypt** - Hash de senhas
- **Lombok** - Redução de boilerplate
- **Jackson** - Serialização JSON
- **Hibernate** - ORM avançado

---

## 📊 **ARQUITETURA DETALHADA**

### 🏗️ Estrutura Completa do Projeto:
```
src/main/java/com/ifclass/ifclass/
├── 👤 usuario/                    # Sistema de Usuários
│   ├── controller/                # Controllers REST
│   ├── service/                   # Lógica de negócio
│   ├── repository/                # Acesso a dados
│   ├── model/                     # Entidades JPA
│   └── dto/                       # Data Transfer Objects
│
├── 🎓 aula/                       # Sistema de Aulas
│   ├── controller/AulaController
│   ├── service/AulaService
│   ├── repository/AulaRepository
│   ├── model/Aula
│   └── dto/ProximaAulaDTO
│
├── 🏢 sala/                       # Gestão de Espaços Físicos
│   ├── controller/SalaController
│   ├── controller/BlocoController
│   ├── service/SalaService
│   ├── model/Sala, Bloco
│   └── repository/SalaRepository
│
├── 📚 disciplina/                 # Disciplinas Acadêmicas
│   ├── controller/DisciplinaController
│   ├── service/DisciplinaService
│   ├── model/Disciplina
│   └── repository/DisciplinaRepository
│
├── 🎯 curso/                      # Cursos e Programas
│   ├── controller/CursoController
│   ├── service/CursoService
│   ├── model/Curso
│   └── repository/CursoRepository
│
├── 👥 turma/                      # Turmas de Alunos
│   ├── controller/TurmaController
│   ├── service/TurmaService
│   ├── model/Turma
│   └── repository/TurmaRepository
│
├── 🔗 alunoTurma/                 # Relacionamento Aluno-Turma
│   ├── controller/AlunoTurmaController
│   ├── service/AlunoTurmaService
│   ├── model/AlunoTurma
│   └── repository/AlunoTurmaRepository
│
├── 👨‍🏫 coordenacao/               # Funcionalidades de Coordenação
│   ├── controller/CoordenacaoController
│   ├── service/CoordenacaoService
│   ├── dto/EstatisticasCoordenacaoDTO
│   ├── dto/ProfessorCargaDTO
│   └── dto/RelatorioDTO
│
├── 👨‍💼 admin/                     # Painel Administrativo
│   ├── controller/AdminController
│   ├── service/AdminService
│   ├── dto/EstatisticasAdminDTO
│   ├── dto/MonitoramentoSistemaDTO
│   └── dto/LogSistemaDTO
│
├── ⚙️ configuracoes/              # Configurações do Sistema
│   ├── controller/DashboardCardController
│   ├── service/DashboardCardService
│   ├── model/DashboardCard
│   └── repository/DashboardCardRepository
│
├── 🔧 util/                       # Utilitários e Helpers
│   ├── JwtUtil                    # Geração e validação JWT
│   ├── JwtFilter                  # Filtro de autenticação
│   ├── InputValidator             # Validação de entrada
│   ├── SecurityLogger             # Logs de segurança
│   ├── PasswordResetService       # Reset de senhas
│   └── security/SecurityConfig    # Configurações de segurança
│
├── 📊 common/                     # Serviços Comuns
│   ├── service/PerformanceMonitoringService
│   ├── service/CacheService
│   ├── service/EmailService
│   └── exception/GlobalExceptionHandler
│
└── 🛡️ config/                     # Configurações Globais
    ├── CorsConfig                 # Configuração CORS
    ├── CacheConfig                # Configuração de Cache
    ├── DatabaseConfig             # Configuração do Banco
    └── ActuatorConfig             # Configuração de Monitoramento
```

---

## 🗄️ **MODELO DE DADOS COMPLETO**

### 📋 Entidades Principais:

#### 👤 **Usuario**
```java
@Entity
public class Usuario {
    private Long id;
    private String nome;
    private String email;           // Único, usado para login
    private String senha;           // Hash BCrypt
    private String prontuario;      // Identificação acadêmica
    
    @ElementCollection
    private List<String> authorities; // ROLE_ADMIN, ROLE_PROFESSOR, etc.
    
    @ManyToMany
    private Set<Disciplina> disciplinas; // Para professores
}
```

#### 🏢 **Sala & Bloco**
```java
@Entity
public class Sala {
    private Long id;
    private String codigo;          // Ex: "A101"
    private Integer capacidade;
    private String cor;             // Para visualização no mapa
    
    // Posicionamento no mapa interativo
    private Integer posX;           // Coordenada X
    private Integer posY;           // Coordenada Y
    private Integer largura;        // Largura visual
    private Integer altura;         // Altura visual
    
    @ManyToOne
    private Bloco bloco;           // Relacionamento com bloco
}

@Entity
public class Bloco {
    private Long id;
    private String nome;           // Ex: "Bloco A"
    
    @OneToMany(mappedBy = "bloco")
    private List<Sala> salas;      // Salas do bloco
}
```

#### 🎓 **Aula**
```java
@Entity
public class Aula {
    private Long id;
    
    @ManyToOne
    private Sala sala;             // Onde acontece
    
    @ManyToOne
    private Turma turma;           // Para quem
    
    @ManyToOne
    private Disciplina disciplina; // O que é ensinado
    
    @ManyToOne
    private Usuario professor;     // Quem ensina
    
    @Enumerated(EnumType.STRING)
    private DayOfWeek diaSemana;   // Dia da semana
    
    private LocalTime hora;        // Horário de início
}
```

#### 📚 **Disciplina**
```java
@Entity
public class Disciplina {
    private Long id;
    private String nome;           // Ex: "Programação Web"
    private String codigo;         // Ex: "PW001"
    private String departamento;
    private String descricao;
    private Integer cargaHoraria;
    
    @ManyToOne
    private Curso curso;           // Curso ao qual pertence
    
    @ManyToMany(mappedBy = "disciplinas")
    private Set<Usuario> professores; // Professores habilitados
}
```

#### 🎯 **Curso & Turma**
```java
@Entity
public class Curso {
    private Long id;
    private String nome;           // Ex: "Técnico em Informática"
    private String codigo;         // Ex: "TI"
    private Integer cargaHoraria;
    private String departamento;
    private String descricao;
}

@Entity
public class Turma {
    private Long id;
    private Integer ano;           // Ex: 2024
    private Long semestre;         // 1 ou 2
    
    @ManyToOne
    private Curso curso;           // Curso da turma
}
```

#### 🔗 **AlunoTurma** (Relacionamento N:N)
```java
@Entity
public class AlunoTurma {
    @Id
    @GeneratedValue
    private Long id;
    
    @ManyToOne
    private Usuario aluno;         // Aluno matriculado
    
    @ManyToOne
    private Turma turma;           // Turma do aluno
    
    private LocalDate dataMatricula;
    private String status;         // ATIVO, TRANCADO, CONCLUIDO
}
```

### 🔐 **Sistema de Permissões Hierárquico:**
```
ROLE_ADMIN (Nível 4)
├── Acesso total ao sistema
├── Gestão de usuários e permissões
├── Configurações globais
└── Analytics e relatórios avançados

ROLE_COORDENADOR (Nível 3)
├── Gestão de professores e disciplinas
├── Relatórios acadêmicos
├── Configuração de horários
└── Dashboard de coordenação

ROLE_PROFESSOR (Nível 2)
├── Criação e gestão de aulas
├── Visualização de turmas
├── Acesso ao mapa do campus
└── Dashboard personalizado

ROLE_ALUNO (Nível 1)
├── Visualização de horários
├── Mapa interativo do campus
├── Informações pessoais
└── Dashboard básico
```

---

## 🔐 **SISTEMA DE SEGURANÇA AVANÇADO**

### 🛡️ **Autenticação JWT**
```java
@Component
public class JwtUtil {
    // Geração de tokens seguros
    public String generateToken(Long id, String email, List<String> authorities) {
        return Jwts.builder()
            .setSubject(email)
            .claim("id", id)
            .claim("authorities", authorities)
            .setIssuedAt(new Date())
            .setExpiration(new Date(System.currentTimeMillis() + jwtExpiration))
            .signWith(getSigningKey())
            .compact();
    }
}
```

### 🔍 **Filtro de Segurança**
```java
@Component
public class JwtFilter implements Filter {
    // Intercepta todas as requisições
    // Valida tokens JWT
    // Registra tentativas de acesso
    // Bloqueia requisições maliciosas
}
```

### 📝 **Logs de Segurança**
```java
@Component
public class SecurityLogger {
    // Log de tentativas de login
    public void logLoginAttempt(String email, String ip, boolean success);

    // Log de tokens inválidos
    public void logInvalidToken(String ip, String token);

    // Log de acessos negados
    public void logAccessDenied(String email, String resource, String ip);

    // Log de ações administrativas
    public void logAdminAction(String admin, String action, String target);
}
```

### 🔒 **Validação e Sanitização**
```java
@Component
public class InputValidator {
    // Validação de emails
    public boolean isValidEmail(String email);

    // Sanitização de strings
    public String sanitizeInput(String input);

    // Validação de senhas fortes
    public boolean isStrongPassword(String password);

    // Prevenção de SQL Injection
    public String escapeSqlInput(String input);
}
```

### 🚫 **Rate Limiting**
- **60 requisições/minuto** por IP
- **1000 requisições/hora** por usuário
- **Bloqueio automático** de IPs suspeitos
- **Whitelist** para IPs confiáveis

---

## 📡 **APIs COMPLETAS POR MÓDULO**

### 👤 **APIs de Usuários** (`/api/usuarios`)

#### Gestão Básica:
```http
GET    /api/usuarios                    # Listar usuários (sem admins)
GET    /api/usuarios/detalhes           # Usuários com informações completas
GET    /api/usuarios/{id}               # Buscar usuário específico
POST   /api/usuarios                    # Criar novo usuário
PUT    /api/usuarios/{id}               # Atualizar usuário
DELETE /api/usuarios/{id}               # Excluir usuário
```

#### Autenticação:
```http
POST   /api/login                       # Login com email/senha
POST   /api/cadastro                    # Registro de novo usuário
POST   /api/logout                      # Logout (invalidar token)
POST   /api/refresh-token               # Renovar token JWT
```

#### Gestão de Perfil:
```http
GET    /api/usuarios/perfil             # Dados do usuário logado
PUT    /api/usuarios/perfil             # Atualizar perfil
PUT    /api/usuarios/senha              # Alterar senha
POST   /api/usuarios/avatar             # Upload de avatar
```

#### Reset de Senha:
```http
POST   /api/usuarios/reset-senha/solicitar    # Solicitar reset
POST   /api/usuarios/reset-senha/confirmar    # Confirmar reset
GET    /api/usuarios/reset-senha/validar/{token} # Validar token
```

#### Permissões:
```http
GET    /api/usuarios/{id}/permissoes    # Listar permissões
POST   /api/usuarios/{id}/permissoes    # Adicionar permissão
DELETE /api/usuarios/{id}/permissoes/{role} # Remover permissão
```

### 🎓 **APIs de Aulas** (`/api/aulas`)

#### CRUD Básico:
```http
GET    /api/aulas                       # Listar todas as aulas
GET    /api/aulas/{id}                  # Buscar aula específica
POST   /api/aulas                       # Criar nova aula
PUT    /api/aulas/{id}                  # Atualizar aula
DELETE /api/aulas/{id}                  # Excluir aula
```

#### Consultas Específicas:
```http
GET    /api/aulas/professor/{id}        # Aulas de um professor
GET    /api/aulas/turma/{id}            # Aulas de uma turma
GET    /api/aulas/sala/{id}             # Aulas em uma sala
GET    /api/aulas/disciplina/{id}       # Aulas de uma disciplina
```

#### Filtros Avançados:
```http
GET    /api/aulas/data/{data}           # Aulas em data específica
GET    /api/aulas/semana/{inicio}/{fim} # Aulas da semana
GET    /api/aulas/mes/{ano}/{mes}       # Aulas do mês
GET    /api/aulas/hoje                  # Aulas de hoje
GET    /api/aulas/proxima               # Próxima aula do usuário
```

#### Relatórios:
```http
GET    /api/aulas/relatorio/ocupacao    # Relatório de ocupação
GET    /api/aulas/relatorio/professor   # Relatório por professor
GET    /api/aulas/relatorio/conflitos   # Detectar conflitos de horário
```

### 🏢 **APIs de Salas e Blocos** (`/api/salas`, `/api/blocos`)

#### Gestão de Salas:
```http
GET    /api/salas                       # Listar todas as salas
GET    /api/salas/{id}                  # Buscar sala específica
POST   /api/salas                       # Criar nova sala
PUT    /api/salas/{id}                  # Atualizar sala
DELETE /api/salas/{id}                  # Excluir sala
PUT    /api/salas/{id}/posicao          # Atualizar posição no mapa
```

#### Gestão de Blocos:
```http
GET    /api/blocos                      # Listar blocos com salas
GET    /api/blocos/{id}                 # Buscar bloco específico
POST   /api/blocos                      # Criar novo bloco
PUT    /api/blocos/{id}                 # Atualizar bloco
DELETE /api/blocos/{id}                 # Excluir bloco
```

#### Consultas Especiais:
```http
GET    /api/salas/disponiveis           # Salas disponíveis agora
GET    /api/salas/ocupacao/{data}       # Ocupação em data específica
GET    /api/salas/capacidade/{min}      # Salas com capacidade mínima
GET    /api/blocos/{id}/mapa            # Dados para renderizar mapa
```

### 📚 **APIs de Disciplinas** (`/api/disciplinas`)

#### CRUD Completo:
```http
GET    /api/disciplinas                 # Listar disciplinas
GET    /api/disciplinas/{id}            # Buscar disciplina
POST   /api/disciplinas                 # Criar disciplina
PUT    /api/disciplinas/{id}            # Atualizar disciplina
DELETE /api/disciplinas/{id}            # Excluir disciplina
```

#### Relacionamentos:
```http
GET    /api/disciplinas/curso/{id}      # Disciplinas de um curso
GET    /api/disciplinas/professor/{id}  # Disciplinas de um professor
POST   /api/disciplinas/{id}/professores/{professorId} # Associar professor
DELETE /api/disciplinas/{id}/professores/{professorId} # Desassociar professor
```

### 🎯 **APIs de Cursos** (`/api/cursos`)

#### Gestão Básica:
```http
GET    /api/cursos                      # Listar cursos
GET    /api/cursos/{id}                 # Buscar curso
POST   /api/cursos                      # Criar curso
PUT    /api/cursos/{id}                 # Atualizar curso
DELETE /api/cursos/{id}                 # Excluir curso
```

#### Informações Detalhadas:
```http
GET    /api/cursos/{id}/disciplinas     # Disciplinas do curso
GET    /api/cursos/{id}/turmas          # Turmas do curso
GET    /api/cursos/{id}/estatisticas    # Estatísticas do curso
```

### 👥 **APIs de Turmas** (`/api/turmas`)

#### CRUD e Consultas:
```http
GET    /api/turmas                      # Listar turmas
GET    /api/turmas/{id}                 # Buscar turma
POST   /api/turmas                      # Criar turma
PUT    /api/turmas/{id}                 # Atualizar turma
DELETE /api/turmas/{id}                 # Excluir turma
GET    /api/turmas/{id}/alunos          # Alunos da turma
GET    /api/turmas/{id}/horarios        # Horários da turma
```

### 🔗 **APIs de Aluno-Turma** (`/api/aluno-turma`)

#### Matrículas:
```http
POST   /api/aluno-turma/{alunoId}/{turmaId}     # Matricular aluno
DELETE /api/aluno-turma/{alunoId}/{turmaId}     # Desmatricular aluno
GET    /api/aluno-turma/aluno/{id}              # Turmas do aluno
GET    /api/aluno-turma/turma/{id}              # Alunos da turma
PUT    /api/aluno-turma/{id}/status             # Alterar status matrícula
```

### 👨‍🏫 **APIs de Coordenação** (`/api/coordenacao`)

#### Dashboard e Estatísticas:
```http
GET    /api/coordenacao/dashboard/estatisticas  # Estatísticas gerais
GET    /api/coordenacao/professores/carga       # Carga horária professores
GET    /api/coordenacao/turmas/ocupacao         # Ocupação das turmas
GET    /api/coordenacao/salas/utilizacao        # Utilização das salas
```

#### Gestão de Professores:
```http
GET    /api/coordenacao/professores             # Listar professores
GET    /api/coordenacao/professores/{id}/carga  # Carga específica
POST   /api/coordenacao/professores/{id}/disciplinas # Atribuir disciplina
DELETE /api/coordenacao/professores/{id}/disciplinas/{disciplinaId} # Remover
```

#### Relatórios:
```http
GET    /api/coordenacao/relatorios/frequencia   # Relatório de frequência
GET    /api/coordenacao/relatorios/desempenho   # Relatório de desempenho
GET    /api/coordenacao/relatorios/ocupacao     # Relatório de ocupação
POST   /api/coordenacao/relatorios/personalizado # Relatório customizado
```

#### Gestão de Horários:
```http
GET    /api/coordenacao/horarios/conflitos      # Detectar conflitos
POST   /api/coordenacao/horarios/otimizar       # Otimizar horários
GET    /api/coordenacao/horarios/grade/{turmaId} # Grade de uma turma
PUT    /api/coordenacao/horarios/grade/{turmaId} # Atualizar grade
```

### 👨‍💼 **APIs de Administração** (`/api/admin`)

#### Dashboard Administrativo:
```http
GET    /api/admin/dashboard/estatisticas        # Estatísticas completas
GET    /api/admin/sistema/monitoramento         # Monitoramento do sistema
GET    /api/admin/sistema/logs                  # Logs do sistema
GET    /api/admin/sistema/health                # Health check
GET    /api/admin/performance                   # Métricas de performance
```

#### Gestão de Sistema:
```http
POST   /api/admin/sistema/backup                # Criar backup
POST   /api/admin/sistema/restore               # Restaurar backup
POST   /api/admin/sistema/manutencao            # Modo manutenção
GET    /api/admin/sistema/configuracoes         # Configurações globais
PUT    /api/admin/sistema/configuracoes         # Atualizar configurações
```

#### Analytics Avançado:
```http
GET    /api/admin/analytics/usuarios            # Analytics de usuários
GET    /api/admin/analytics/aulas               # Analytics de aulas
GET    /api/admin/analytics/ocupacao            # Analytics de ocupação
GET    /api/admin/analytics/performance         # Analytics de performance
GET    /api/admin/analytics/seguranca           # Analytics de segurança
```

#### Auditoria:
```http
GET    /api/admin/auditoria/logs                # Logs de auditoria
GET    /api/admin/auditoria/acessos             # Log de acessos
GET    /api/admin/auditoria/modificacoes        # Log de modificações
GET    /api/admin/auditoria/seguranca           # Log de segurança
```

### ⚙️ **APIs de Configurações** (`/api/configuracoes`)

#### Dashboard Cards:
```http
GET    /api/configuracoes/dashboard-cards       # Todos os cards
GET    /api/configuracoes/dashboard-cards/enabled # Cards habilitados
POST   /api/configuracoes/dashboard-cards       # Criar card
PUT    /api/configuracoes/dashboard-cards/{id}  # Atualizar card
DELETE /api/configuracoes/dashboard-cards/{id}  # Excluir card
PUT    /api/configuracoes/dashboard-cards/ordem # Reordenar cards
```

#### Configurações Globais:
```http
GET    /api/configuracoes/sistema               # Configurações do sistema
PUT    /api/configuracoes/sistema               # Atualizar configurações
GET    /api/configuracoes/email                 # Configurações de email
PUT    /api/configuracoes/email                 # Atualizar email
GET    /api/configuracoes/seguranca             # Configurações de segurança
PUT    /api/configuracoes/seguranca             # Atualizar segurança
```

---

## 📊 **MONITORAMENTO E OBSERVABILIDADE**

### 🔍 **Spring Actuator Endpoints**

#### Health Checks:
```http
GET    /actuator/health                         # Status geral
GET    /actuator/health/db                      # Status do banco
GET    /actuator/health/diskSpace               # Espaço em disco
GET    /actuator/health/ping                    # Ping básico
```

#### Métricas Detalhadas:
```http
GET    /actuator/metrics                        # Todas as métricas
GET    /actuator/metrics/jvm.memory.used        # Uso de memória
GET    /actuator/metrics/system.cpu.usage       # Uso de CPU
GET    /actuator/metrics/http.server.requests   # Métricas HTTP
GET    /actuator/metrics/jdbc.connections.active # Conexões DB
```

#### Informações do Sistema:
```http
GET    /actuator/info                           # Informações da aplicação
GET    /actuator/env                            # Variáveis de ambiente
GET    /actuator/configprops                    # Propriedades de configuração
GET    /actuator/beans                          # Beans do Spring
```

#### Logs e Traces:
```http
GET    /actuator/loggers                        # Configuração de logs
POST   /actuator/loggers/{name}                 # Alterar nível de log
GET    /actuator/httptrace                      # Trace de requisições HTTP
GET    /actuator/threaddump                     # Dump de threads
```

### 📈 **Métricas Customizadas**

#### Performance Monitoring:
```java
@Component
public class PerformanceMonitoringService {
    // Tempo de resposta das APIs
    public void recordApiResponseTime(String endpoint, long duration);

    // Contadores de requisições
    public void incrementRequestCounter(String endpoint, String method);

    // Métricas de banco de dados
    public void recordDatabaseQueryTime(String query, long duration);

    // Métricas de cache
    public void recordCacheHitRate(String cacheName, boolean hit);
}
```

#### Business Metrics:
```java
@Component
public class BusinessMetricsService {
    // Usuários ativos
    public void recordActiveUsers(long count);

    // Aulas criadas
    public void incrementAulasCreated();

    // Logins por dia
    public void recordDailyLogins(long count);

    // Ocupação de salas
    public void recordSalaOccupancy(String salaId, double percentage);
}
```

### 📝 **Sistema de Logs Estruturados**

#### Configuração de Logs:
```properties
# Níveis de log por pacote
logging.level.com.ifclass.ifclass.usuario=INFO
logging.level.com.ifclass.ifclass.security=WARN
logging.level.org.springframework.security=DEBUG
logging.level.org.hibernate.SQL=DEBUG

# Formato de logs
logging.pattern.console=%d{yyyy-MM-dd HH:mm:ss} [%thread] %-5level %logger{36} - %msg%n
logging.pattern.file=%d{yyyy-MM-dd HH:mm:ss} [%thread] %-5level %logger{36} - %msg%n

# Arquivos de log
logging.file.name=logs/ifclass.log
logging.file.max-size=10MB
logging.file.max-history=30
```

#### Logs de Segurança:
```java
// Arquivo: logs/security.log
2024-06-24 10:30:15 [SECURITY] LOGIN_SUCCESS - Email: professor@ifclass.com, IP: 192.168.1.100
2024-06-24 10:31:22 [SECURITY] LOGIN_FAILED - Email: hacker@evil.com, IP: 203.0.113.1
2024-06-24 10:32:05 [SECURITY] INVALID_TOKEN - IP: 203.0.113.1, Token: eyJ...
2024-06-24 10:33:10 [SECURITY] ACCESS_DENIED - Email: aluno@ifclass.com, Resource: /api/admin
```

#### Logs de Aplicação:
```java
// Arquivo: logs/ifclass.log
2024-06-24 10:30:15 [INFO ] AulaService - Aula criada: ID=123, Professor=João, Sala=A101
2024-06-24 10:31:20 [WARN ] UsuarioService - Tentativa de criar usuário com email duplicado
2024-06-24 10:32:30 [ERROR] DatabaseService - Falha na conexão com o banco de dados
2024-06-24 10:33:45 [DEBUG] CacheService - Cache hit para chave: usuarios_all
```

---

## 🔧 **CONFIGURAÇÕES AVANÇADAS**

### 🌐 **Configuração de CORS**
```java
@Configuration
public class CorsConfig {
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOriginPatterns(Arrays.asList("*"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);
        return source;
    }
}
```

### 💾 **Configuração de Cache**
```java
@Configuration
@EnableCaching
public class CacheConfig {
    @Bean
    public CacheManager cacheManager() {
        CaffeineCacheManager cacheManager = new CaffeineCacheManager();
        cacheManager.setCaffeine(Caffeine.newBuilder()
            .maximumSize(1000)
            .expireAfterWrite(10, TimeUnit.MINUTES)
            .recordStats());
        return cacheManager;
    }
}
```

### 🗄️ **Configuração de Banco**
```properties
# Pool de conexões
spring.datasource.hikari.maximum-pool-size=20
spring.datasource.hikari.minimum-idle=5
spring.datasource.hikari.idle-timeout=300000
spring.datasource.hikari.max-lifetime=600000
spring.datasource.hikari.connection-timeout=30000

# JPA/Hibernate
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=false
spring.jpa.properties.hibernate.format_sql=true
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.PostgreSQLDialect
spring.jpa.properties.hibernate.jdbc.batch_size=20
spring.jpa.properties.hibernate.order_inserts=true
spring.jpa.properties.hibernate.order_updates=true
```

### 📧 **Configuração de Email**
```properties
# SMTP Configuration
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=${MAIL_USERNAME}
spring.mail.password=${MAIL_PASSWORD}
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true
spring.mail.properties.mail.smtp.starttls.required=true
spring.mail.properties.mail.smtp.ssl.trust=smtp.gmail.com
```

---

## 🚀 **DESENVOLVIMENTO E DEPLOYMENT**

### 🛠️ **Ambiente de Desenvolvimento**

#### Pré-requisitos:
```bash
# Java 17 (OpenJDK recomendado)
java -version

# Maven 3.8+
mvn -version

# PostgreSQL 14+
psql --version

# Git para versionamento
git --version
```

#### Setup Local:
```bash
# 1. Clone o repositório
git clone <repository-url>
cd ifclass-backend/ifclass

# 2. Configure o banco de dados
createdb ifclass
psql -d ifclass -c "CREATE USER ifclass_user WITH PASSWORD 'dev_password';"
psql -d ifclass -c "GRANT ALL PRIVILEGES ON DATABASE ifclass TO ifclass_user;"

# 3. Configure as variáveis de ambiente
cp .env.example .env
# Edite o arquivo .env com suas configurações

# 4. Execute a aplicação
mvn spring-boot:run
```

#### Profiles de Ambiente:
```properties
# application-dev.properties (Desenvolvimento)
spring.jpa.show-sql=true
spring.jpa.hibernate.ddl-auto=update
logging.level.com.ifclass=DEBUG

# application-test.properties (Testes)
spring.datasource.url=jdbc:h2:mem:testdb
spring.jpa.hibernate.ddl-auto=create-drop
logging.level.org.springframework.test=DEBUG

# application-prod.properties (Produção)
spring.jpa.show-sql=false
spring.jpa.hibernate.ddl-auto=validate
logging.level.com.ifclass=INFO
```

### 🧪 **Testes Automatizados**

#### Estrutura de Testes:
```
src/test/java/com/ifclass/ifclass/
├── 🧪 unit/                      # Testes unitários
│   ├── service/                  # Testes de serviços
│   ├── repository/               # Testes de repositórios
│   └── util/                     # Testes de utilitários
│
├── 🔗 integration/               # Testes de integração
│   ├── controller/               # Testes de controllers
│   ├── database/                 # Testes de banco
│   └── security/                 # Testes de segurança
│
└── 🎯 e2e/                       # Testes end-to-end
    ├── auth/                     # Fluxos de autenticação
    ├── crud/                     # Operações CRUD
    └── business/                 # Regras de negócio
```

#### Comandos de Teste:
```bash
# Executar todos os testes
mvn test

# Executar apenas testes unitários
mvn test -Dtest="**/*UnitTest"

# Executar apenas testes de integração
mvn test -Dtest="**/*IntegrationTest"

# Executar com cobertura
mvn test jacoco:report

# Executar testes específicos
mvn test -Dtest="UsuarioServiceTest"
```

#### Exemplo de Teste:
```java
@SpringBootTest
@TestPropertySource(locations = "classpath:application-test.properties")
class UsuarioServiceTest {

    @Autowired
    private UsuarioService usuarioService;

    @MockBean
    private UsuarioRepository usuarioRepository;

    @Test
    void deveCriarUsuarioComSucesso() {
        // Given
        Usuario usuario = new Usuario();
        usuario.setEmail("test@ifclass.com");
        usuario.setSenha("senha123");

        // When
        Usuario resultado = usuarioService.salvar(usuario);

        // Then
        assertThat(resultado.getId()).isNotNull();
        assertThat(resultado.getEmail()).isEqualTo("test@ifclass.com");
        verify(usuarioRepository).save(any(Usuario.class));
    }
}
```

### 📦 **Build e Packaging**

#### Build para Desenvolvimento:
```bash
# Compilar sem executar testes
mvn clean compile

# Compilar e executar testes
mvn clean test

# Gerar JAR para desenvolvimento
mvn clean package -DskipTests
```

#### Build para Produção:
```bash
# Build otimizado para produção
mvn clean package -Pprod -DskipTests

# Build com testes e relatórios
mvn clean package -Pprod

# Build com análise de código
mvn clean package sonar:sonar
```

#### Dockerfile (Opcional):
```dockerfile
FROM openjdk:17-jdk-slim

WORKDIR /app

COPY target/ifclass-*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
```

### 🚀 **Deploy em Produção**

#### Configurações de Produção:
```bash
# Variáveis de ambiente obrigatórias
export SPRING_PROFILES_ACTIVE=prod
export JWT_SECRET="sua_chave_jwt_super_segura_base64"
export DB_URL="jdbc:postgresql://localhost:5432/ifclass"
export DB_USERNAME="ifclass_user"
export DB_PASSWORD="senha_super_segura"
export MAIL_USERNAME="sistema@ifclass.com"
export MAIL_PASSWORD="senha_email_app"
```

#### Systemd Service:
```ini
# /etc/systemd/system/ifclass-backend.service
[Unit]
Description=IFClass Backend Service
After=network.target postgresql.service

[Service]
Type=simple
ExecStart=/usr/bin/java -jar /opt/ifclass/backend/ifclass.jar
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal
SyslogIdentifier=ifclass-backend
WorkingDirectory=/opt/ifclass/backend
Environment=SPRING_PROFILES_ACTIVE=prod

[Install]
WantedBy=multi-user.target
```

#### Comandos de Deploy:
```bash
# Parar o serviço
sudo systemctl stop ifclass-backend

# Fazer backup do JAR atual
sudo cp /opt/ifclass/backend/ifclass.jar /opt/ifclass/backup/

# Copiar novo JAR
sudo cp target/ifclass-*.jar /opt/ifclass/backend/ifclass.jar

# Iniciar o serviço
sudo systemctl start ifclass-backend

# Verificar status
sudo systemctl status ifclass-backend

# Ver logs
sudo journalctl -u ifclass-backend -f
```

### 📊 **Monitoramento em Produção**

#### Health Checks:
```bash
# Verificar se a aplicação está rodando
curl http://localhost:8080/actuator/health

# Verificar métricas
curl http://localhost:8080/actuator/metrics

# Verificar informações da aplicação
curl http://localhost:8080/actuator/info
```

#### Logs de Produção:
```bash
# Logs da aplicação
tail -f /opt/ifclass/logs/ifclass.log

# Logs de segurança
tail -f /opt/ifclass/logs/security.log

# Logs do sistema
sudo journalctl -u ifclass-backend -f
```

#### Backup Automatizado:
```bash
#!/bin/bash
# Script de backup diário
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump -h localhost -U ifclass_user ifclass > /opt/ifclass/backup/db_backup_$DATE.sql
find /opt/ifclass/backup -name "db_backup_*.sql" -mtime +7 -delete
```

---

## 🔍 **TROUBLESHOOTING E FAQ**

### ❓ **Problemas Comuns**

#### 1. Erro de Conexão com Banco:
```bash
# Verificar se PostgreSQL está rodando
sudo systemctl status postgresql

# Verificar conexões ativas
sudo -u postgres psql -c "SELECT * FROM pg_stat_activity;"

# Testar conexão manual
psql -h localhost -U ifclass_user -d ifclass
```

#### 2. Erro de JWT Token:
```bash
# Verificar se JWT_SECRET está configurado
echo $JWT_SECRET

# Verificar logs de segurança
grep "JWT" /opt/ifclass/logs/security.log

# Regenerar chave JWT
openssl rand -base64 64
```

#### 3. Problemas de Performance:
```bash
# Verificar uso de memória
curl http://localhost:8080/actuator/metrics/jvm.memory.used

# Verificar conexões de banco
curl http://localhost:8080/actuator/metrics/jdbc.connections.active

# Verificar cache
curl http://localhost:8080/actuator/metrics/cache.gets
```

### 📚 **Documentação Adicional**

#### Links Úteis:
- **Spring Boot Docs:** https://spring.io/projects/spring-boot
- **Spring Security:** https://spring.io/projects/spring-security
- **PostgreSQL Docs:** https://www.postgresql.org/docs/
- **JWT.io:** https://jwt.io/

#### Comandos Úteis:
```bash
# Verificar versão do Java
java -version

# Verificar dependências do Maven
mvn dependency:tree

# Analisar JAR gerado
jar -tf target/ifclass-*.jar | head -20

# Verificar portas em uso
netstat -tulpn | grep :8080
```

---

## 🎯 **CONCLUSÃO**

O **IFClass Backend** é uma API robusta e completa que oferece:

✅ **Segurança Avançada** - JWT, BCrypt, Rate Limiting, Logs
✅ **Performance Otimizada** - Cache, Pool de Conexões, Índices
✅ **Monitoramento Completo** - Actuator, Métricas, Health Checks
✅ **APIs RESTful** - Documentadas e padronizadas
✅ **Arquitetura Escalável** - Modular e bem estruturada
✅ **Testes Automatizados** - Unitários, Integração, E2E
✅ **Deploy Simplificado** - Scripts automatizados

### 🚀 **Para Desenvolvedores:**
1. **Clone** o repositório
2. **Configure** o ambiente local
3. **Execute** `mvn spring-boot:run`
4. **Acesse** http://localhost:8080/actuator/health

### 🏭 **Para Produção:**
1. **Configure** variáveis de ambiente
2. **Execute** build de produção
3. **Deploy** com systemd
4. **Monitore** com Actuator

**Backend pronto para uso em produção! 🎉**
