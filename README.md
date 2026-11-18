# Mural — App mobile (Tech Challenge Fase 4)

Aplicativo React Native (Expo) da plataforma de blogging educacional **Mural**, consumindo a API
REST desenvolvida na Fase 2 ([blog-api](https://github.com/victormendexx/blog-api)). Professores e
alunos entram pela mesma tela de login: alunos leem e buscam posts; professores também criam,
editam e excluem posts e gerenciam o cadastro de professores e alunos.

## Sumário

- [Sobre o projeto](#sobre-o-projeto)
- [Arquitetura](#arquitetura)
- [Tecnologias utilizadas](#tecnologias-utilizadas)
- [Estrutura de pastas](#estrutura-de-pastas)
- [Como rodar localmente](#como-rodar-localmente)
- [Variáveis de ambiente](#variáveis-de-ambiente)
- [Guia de uso](#guia-de-uso)
- [Scripts](#scripts)
- [Desafios e aprendizados](#desafios-e-aprendizados)

## Sobre o projeto

Este repositório contém **apenas o app mobile**. Ele depende da API do repositório
[`blog-api`](https://github.com/victormendexx/blog-api) em execução. Na Fase 4 a API ganhou os
recursos `/teachers` e `/students` (CRUD com paginação), login de alunos e perfis no token
(`teacher` / `student`).

| Perfil    | Como acessa             | O que pode fazer                                              |
| --------- | ----------------------- | ------------------------------------------------------------- |
| Sem login | —                       | só a tela de login                                            |
| Aluno     | login com email e senha | listar, buscar e ler posts                                    |
| Professor | login com email e senha | tudo acima + criar/editar/excluir posts, professores e alunos |

## Arquitetura

```
src/app/              rotas (Expo Router): cada arquivo é uma tela
   │                  _layout.tsx define o Stack e protege as rotas por perfil
   ▼
src/components/       componentes de UI reutilizáveis (Button, TextField, PostForm, people/...)
   │
   ▼
src/hooks/            useAsyncData (loading/erro/recarregar), useDebouncedValue (busca)
   │
   ▼
src/services/         chamadas HTTP por recurso (posts, auth, teachers/students) via api.ts
   │
   ▼
src/context/          AuthContext: sessão do usuário (token + dados + perfil) via Context API
```

**Proteção de rotas por perfil:** o layout raiz usa três `Stack.Protected` do Expo Router:

| Grupo de telas        | `guard`            | Sem permissão vai para |
| --------------------- | ------------------ | ---------------------- |
| `login`               | `!isAuthenticated` | `/` (já está logado)   |
| `index`, `posts/[id]` | `isAuthenticated`  | `/login`               |
| `admin/*`             | `isTeacher`        | `/`                    |

Sem sessão, qualquer acesso (inclusive por link direto) cai no login. Um aluno que tente abrir
`/admin` volta para a home. Ao entrar ou sair, o Expo Router troca as telas sozinho, sem
navegação manual. No cabeçalho da home, professores veem **Admin** e alunos veem **Sair**.

**Permissões na API, não só na interface:** esconder telas é só conforto de uso. Quem garante a
regra é o back-end: sem token a API responde `401`, e um aluno tentando escrever ou acessar
`/teachers` e `/students` recebe `403`. O app trata essas respostas no interceptor do Axios
(abaixo).

**Cliente de API (`services/api.ts`):** uma única instância do Axios, que:

- injeta o header `Authorization` quando há sessão;
- desembrulha o envelope `{ success, data }` do back-end e lança `ApiError(message, status)` em
  caso de falha (mesmo contrato do front-end web da Fase 3);
- em `401` com sessão ativa (token expirado/inválido): encerra a sessão e avisa "Sessão expirada";
- em `403`: mensagem "Você não tem permissão para esta ação";
- sem resposta (rede, URL errada): mensagem "Não foi possível conectar à API".

Nenhuma tela usa o Axios diretamente.

**Sessão (`context/AuthContext.tsx`):** o token JWT e os dados do professor são salvos com
`expo-secure-store` (Keychain no iOS, Keystore no Android) e restaurados ao abrir o app. Na web,
onde o SecureStore não existe, o Metro usa `services/storage.web.ts` (localStorage). Como o
SecureStore é assíncrono, o token também fica numa variável em memória lida pelo interceptor.

**Formulários:** React Hook Form + Zod, com as mesmas regras de validação dos schemas do back-end.
Os erros de campo aparecem embaixo de cada input; os erros da API (ex.: `409` email duplicado)
aparecem acima do botão de envio.

**Estados de tela:** todas as telas que buscam dados usam `useAsyncData`, que expõe
`data/isLoading/error/reload` e recarrega quando a tela volta a ficar em foco (ex.: ao voltar de
"editar" para a lista). Cada tela trata carregando (`LoadingView`), erro com "Tentar novamente"
(`ErrorView`) e lista vazia (`EmptyView`). Exclusões pedem confirmação (`Alert`).

**Reuso entre professores e alunos:** os dois recursos têm o mesmo contrato na API, então
compartilham as telas `PersonListScreen` e `PersonFormScreen`. Um objeto de configuração
(`components/people/peopleConfig.ts`) define os textos e o serviço da API (ambos têm senha, já
que ambos fazem login). Os arquivos de rota em `src/app/admin/teachers|students` têm 3 linhas.

**Tema:** cores, espaçamentos, tamanhos de fonte e raios ficam em `src/theme/tokens.ts`, com a
paleta "Mural" da Fase 3. Para mudar a identidade visual, edite só esse arquivo.

**Acessibilidade:** botões com `accessibilityRole`/`accessibilityLabel` descritivos (ex.: "Excluir
post X"), label visível em todo campo, erros anunciados ao leitor de tela
(`accessibilityRole="alert"`) e área mínima de toque de 44 pt.

## Tecnologias utilizadas

- **React Native** + **Expo SDK 58** — componentes funcionais e hooks
- **TypeScript**
- **Expo Router** — navegação baseada em arquivos e rotas protegidas
- **Context API** — estado de autenticação
- **Axios** — cliente HTTP com interceptors
- **expo-secure-store** — armazenamento seguro do token
- **React Hook Form** + **Zod** — formulários e validação
- **ESLint** (`eslint-config-expo`) + **Prettier** — qualidade e formatação

## Estrutura de pastas

```
src/
├── app/                      # rotas (Expo Router)
│   ├── _layout.tsx           # Stack raiz + Stack.Protected das rotas /admin
│   ├── index.tsx             # lista de posts + busca (pública)
│   ├── login.tsx             # login único (professor ou aluno)
│   ├── posts/[id].tsx        # leitura do post (pública)
│   └── admin/
│       ├── index.tsx         # menu da área do professor
│       ├── posts/            # index (lista c/ editar/excluir), new, [id] (edição)
│       ├── teachers/         # index (paginada), new, [id]
│       └── students/         # index (paginada), new, [id]
├── components/               # Button, TextField, PostCard, PostForm, Pagination, StateViews...
│   └── people/               # telas compartilhadas de professores e alunos
├── context/                  # AuthContext
├── hooks/                    # useAsyncData, useDebouncedValue
├── services/                 # api.ts, authService, postsService, peopleService
├── theme/                    # tokens.ts (cores, espaçamentos, tipografia)
├── types/                    # tipos compartilhados (Post, Person, Paginated...)
└── utils/                    # confirmDelete, truncate, formatDate
docs/NOTAS.md                 # decisões de arquitetura e desafios
```

## Como rodar localmente

Pré-requisitos: Node.js 20+, a API do back-end rodando (veja o README do
[`blog-api`](https://github.com/victormendexx/blog-api)) e **um** destes:

- o app **Expo Go** no celular (Android ou iOS), na mesma rede Wi-Fi do computador; ou
- um **emulador Android** (Android Studio).

1. Suba a API (no repositório `blog-api`, sem Docker — detalhes no README dele). Em um terminal,
   o MongoDB local (deixe aberto):

   ```bash
   npm run db
   ```

   Em outro terminal, o professor inicial (só na primeira vez) e a API:

   ```bash
   npm run seed
   ```

   ```bash
   npm run dev
   ```

2. Instale as dependências do app e crie o `.env`:

   ```bash
   npm install
   ```

   ```bash
   cp .env.example .env
   ```

3. Ajuste `EXPO_PUBLIC_API_URL` no `.env` (veja a tabela abaixo) e inicie o Metro:

   ```bash
   npx expo start
   ```

4. Abra o app:
   - **Expo Go:** leia o QR code exibido no terminal.
   - **Emulador Android:** com o emulador aberto, pressione `a` no terminal.
   - **Navegador (para desenvolvimento):** pressione `w` ou acesse `http://localhost:8081`. Na web
     a sessão fica no `localStorage` (o SecureStore só existe no celular) e as confirmações usam
     os diálogos do navegador.

> Mudou o `.env`? Pare o Metro e rode `npx expo start --clear`: as variáveis `EXPO_PUBLIC_*` são
> embutidas no bundle quando ele é gerado.

## Variáveis de ambiente

| Variável              | Descrição            | Exemplo     |
| --------------------- | -------------------- | ----------- |
| `EXPO_PUBLIC_API_URL` | URL base da API REST | veja abaixo |

O valor depende de onde o app roda, porque `localhost` dentro do celular/emulador aponta para o
próprio aparelho, não para o computador:

| Onde o app roda     | Valor                            | Observação                                                                                      |
| ------------------- | -------------------------------- | ----------------------------------------------------------------------------------------------- |
| Emulador Android    | `http://10.0.2.2:3000`           | `10.0.2.2` é o "localhost" do computador visto pelo emulador                                    |
| Expo Go no celular  | `http://<IP-do-computador>:3000` | descubra o IP com `ipconfig` (Windows) ou `ip addr` (Linux); celular e computador na mesma rede |
| Simulador iOS / web | `http://localhost:3000`          |                                                                                                 |

**Usando WSL2?** Uma API rodando dentro do WSL responde em `localhost` no Windows (navegador e
emulador Android funcionam), mas **não** no IP da rede, que é o que o celular usa. Para o Expo Go,
ative o modo de rede espelhado do WSL: crie `C:\Users\<seu-usuário>\.wslconfig` com

```ini
[wsl2]
networkingMode=mirrored
```

rode `wsl --shutdown` no PowerShell, abra o WSL de novo e libere a porta 3000 no firewall do
Windows. Se o QR code não conectar ao Metro, rode `npx expo start --tunnel`.

## Guia de uso

**Login (todos)**

- O app abre na tela **Entrar**. Use o email e a senha cadastrados por um professor. A sessão é
  lembrada ao fechar o app (validade do token: 8 h, definida na API).

**Aluno**

- **Página principal** — lista todos os posts (título, autor, data e um resumo). O campo
  "Buscar posts" filtra por palavra-chave no título ou conteúdo. Puxe a lista para atualizar.
- **Leitura** — toque num post para ver o conteúdo completo.
- **Sair** — botão no canto superior direito da página principal.

**Professor**

1. Depois do login, o app abre a página principal (igual à do aluno) com o botão **Admin** no
   canto superior direito.
2. **Novo post** — título, autor (já preenchido com seu nome) e conteúdo. Ao publicar, o app abre
   o post criado.
3. **Gerenciar posts** — lista todos os posts com **Editar** (formulário com os dados atuais) e
   **Excluir** (pede confirmação).
4. **Professores** — lista paginada (10 por página) com **Editar** e **Excluir**, e o botão
   **Cadastrar professor** (nome, email, senha). Na edição, deixe a senha em branco para mantê-la.
   O professor logado não vê o botão de excluir na própria linha.
5. **Alunos** — mesmo padrão dos professores (nome, email e senha). Um email não pode ser usado
   por um professor e por um aluno ao mesmo tempo.
6. **Sair** — botão na tela de Administração; volta para a tela de login.

## Scripts

| Comando             | O que faz                          |
| ------------------- | ---------------------------------- |
| `npm start`         | inicia o Metro (Expo)              |
| `npm run android`   | inicia e abre no emulador Android  |
| `npm run lint`      | ESLint (`expo lint`)               |
| `npm run typecheck` | checagem de tipos (`tsc --noEmit`) |
| `npm run format`    | Prettier em todo o projeto         |

## Desafios e aprendizados

> Relato da equipe — o registro detalhado está em [`docs/NOTAS.md`](docs/NOTAS.md). Substitua os
> colchetes pelas suas palavras.

- **Back-end sem endpoints de professores e alunos:** as telas administrativas exigiram voltar à
  API e implementar `/teachers` e `/students` com paginação antes de começar o app.
- **`localhost` não funciona no celular:** a URL da API precisou ficar configurável por ambiente
  (`10.0.2.2` no emulador, IP da rede no Expo Go).
- **Regras de hooks do React Compiler:** o lint do Expo SDK 58 proíbe `setState` síncrono dentro
  de `useEffect`, o que levou a carregar dados com `useFocusEffect` (que de quebra recarrega as
  listas ao voltar das telas de edição).
- **[Descreva aqui os ajustes feitos ao testar em aparelhos reais.]**

## Autor

Victor Mendes — Pós-graduação em Full Stack Development (FIAP)
