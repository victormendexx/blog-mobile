# Notas de arquitetura e desafios — Fase 4

Registro das decisões e problemas encontrados durante a Fase 4, para o documento final do Tech
Challenge. Cada item diz **o que** foi decidido, **por quê** e, quando houver, a alternativa
descartada.

## 1. Escopo

- **Princípio:** fazer o mínimo exigido pelo enunciado da Fase 4, sem extras.
- **Comentários em posts:** fora do escopo (são opcionais no enunciado e exigiriam um novo model
  no back-end).
- **Sem CI/Docker no mobile:** o app é distribuído pelo Expo Go durante a avaliação; uma imagem
  Docker não se aplica a um app mobile. Lint, typecheck e Prettier ficaram como scripts locais.

## 2. Mudanças no back-end (`blog-api`)

- **Problema:** a API só tinha login de professor e CRUD de posts. Os requisitos 5 a 8 (criar,
  editar e listar professores e alunos) não tinham endpoints.
- **Decisão:** estender o `blog-api` diretamente, no mesmo padrão em camadas
  (routes → controllers → services → models, validação Zod, `AppError`):
  - `/teachers` e `/students`: `GET` paginado, `GET /:id`, `POST`, `PUT /:id`, `DELETE /:id`;
  - todas protegidas por `requireAuth` (sem token → `401`);
  - email único → `409` em vez de `500` (conversão do erro `11000` do MongoDB);
  - paginação só onde o enunciado pede (professores e alunos), com resposta
    `{ items, page, limit, total, totalPages }`, `limit` padrão 10 e máximo 50.
- **Alunos sem login (1ª versão, depois revista — ver seção 7):** o enunciado só exige "login
  para professores", então `Student` começou como um registro administrativo (`name`, `email`),
  sem senha, e o JWT não tinha `role`: ter token já significava "é professor".
- **Senha nunca exposta:** o model `Teacher` remove `passwordHash` no `toJSON`, então nenhuma
  resposta da API vaza o hash, mesmo em listagens.
- **Testes:** 13 testes de integração novos (Supertest + mongodb-memory-server), cobrindo sucesso,
  `401`, `400`, `404`, `409` e paginação. Total: 33 testes passando.

## 3. Stack do app

| Escolha                     | Motivo                                                                                                     | Alternativa descartada                                                                        |
| --------------------------- | ---------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| Expo (SDK 58) + Expo Router | setup sem Android Studio/Xcode, teste no Expo Go, rotas por arquivo parecidas com o React Router da Fase 3 | React Native CLI (setup nativo pesado); React Navigation manual (mais código de configuração) |
| Context API                 | só a sessão é estado global; o resto é estado local de cada tela                                           | Redux (opcional no enunciado e desproporcional para um único estado global)                   |
| Axios + interceptors        | um ponto único para token, envelope `{success,data}` e tratamento de 401/403                               | `fetch` como na Fase 3 (interceptors teriam de ser escritos à mão)                            |
| expo-secure-store           | token guardado criptografado (Keychain/Keystore)                                                           | AsyncStorage (texto puro no aparelho)                                                         |
| React Hook Form + Zod       | validação declarativa com as mesmas regras do back-end, que também usa Zod                                 | `useState` por campo (muito código repetido em 4 formulários)                                 |

## 4. Decisões de arquitetura no app

- **Rotas protegidas com `Stack.Protected`:** recurso nativo do Expo Router. As rotas `/admin/*`
  só existem quando `isAuthenticated` é verdadeiro; caso contrário, redirecionam para `/login`.
  Também cobre o caso de a sessão expirar no meio do uso: as telas de admin saem da pilha
  sozinhas. _Alternativa descartada:_ um `_layout.tsx` dentro de `admin/` com `<Redirect>` — exigiria
  um segundo Stack aninhado, com problemas de botão "voltar" na primeira tela.
- **Defesa em duas camadas:** a interface esconde botões de escrita sem sessão, mas a regra é
  garantida pela API (`requireAuth`). O app trata `401` (sessão expirada → logout + aviso), `403`
  (sem permissão) e falha de rede com mensagens claras.
- **Token em memória + SecureStore:** o SecureStore é assíncrono e o interceptor do Axios precisa
  do token a cada requisição. O `AuthContext` grava no SecureStore e mantém uma cópia em memória
  em `api.ts` (`setAuthToken`).
- **Contrato de erro igual ao da Fase 3:** `apiRequest` desembrulha `{ success, data }` e lança
  `ApiError(message, status)`, como o `apiFetch` do front web. As telas só exibem `error.message`.
- **Um hook para todo carregamento de dados (`useAsyncData`):** padroniza loading/erro/vazio em
  todas as telas e descarta respostas antigas (evita que uma busca lenta sobrescreva uma mais nova).
- **Telas compartilhadas entre professores e alunos:** como a API tem o mesmo contrato, as telas
  de listagem e formulário são genéricas (`PersonListScreen`, `PersonFormScreen`) e configuradas
  por `peopleConfig.ts`. Resultado: o requisito 8 ("replicar para estudantes") custou 3 arquivos
  de 3–5 linhas.
- **Paginação explícita (Anterior/Próxima + "Página X de Y")** em vez de scroll infinito: deixa
  visível que a listagem é paginada, como pede o requisito 7, e é mais simples de testar.
- **Professor não exclui a si mesmo:** o botão de excluir não aparece na linha do professor
  logado, para evitar que alguém apague a conta em uso e fique com um token de um usuário
  inexistente.
- **Autor pré-preenchido:** o campo "autor" do novo post vem com o nome do professor logado, mas
  continua editável (o enunciado pede o campo autor no formulário).
- **Tema em tokens:** `src/theme/tokens.ts` concentra cores, espaçamentos e tipografia. A paleta
  "Mural" da Fase 3 é o ponto de partida; o grupo pode trocar a identidade visual editando só esse
  arquivo. Fontes do sistema (serifada nos títulos), sem fontes customizadas.

## 5. Desafios encontrados

- **Endpoints faltando no back-end:** descoberto na análise inicial; resolvido estendendo a API
  antes de começar o app (seção 2).
- **README do back-end com blocos de código quebrados:** os blocos estavam escritos como
  `` \`\`\` ``, que o GitHub mostra como texto. Corrigido junto com a atualização da referência da
  API.
- **Índice único em testes:** no `mongodb-memory-server`, o índice `unique` do email é criado de
  forma assíncrona, então o teste de `409` poderia rodar antes de o índice existir e falhar de
  forma intermitente. Prevenção: `await Model.init()` no início desses testes.
- **`localhost` dentro do celular/emulador:** aponta para o próprio aparelho. A URL da API virou a
  variável `EXPO_PUBLIC_API_URL`, documentada para emulador (`10.0.2.2`) e Expo Go (IP da rede).
  Em WSL2, o IP do WSL não é visível na rede local — é preciso usar o IP do Windows.
- **Expo muda a cada SDK:** no SDK 58 as rotas ficam em `src/app/` (não mais `app/`) e existe
  `Stack.Protected` com `redirectTo`. As APIs foram conferidas nos tipos instalados em
  `node_modules`, não de memória.
- **Regras do React Compiler no lint:** o `eslint-config-expo` do SDK 58 acusa erro em `setState`
  síncrono dentro de `useEffect` (`react-hooks/set-state-in-effect`). O carregamento de dados foi
  movido para `useFocusEffect` (que também recarrega as listas ao voltar da tela de edição), e o
  ajuste de página após exclusão saiu de um `useEffect` para o próprio handler de exclusão.
- **Import do Axios:** o lint avisou que `axios.create` também existe como export nomeado
  (`import/no-named-as-default-member`); trocado para `import { create } from 'axios'`.
- **Zod 4:** o `npx expo install` trouxe o Zod 4 (o back-end usa o 3). A API usada (`z.object`,
  `.trim()`, `.email()`, `.min()`) é compatível; `.email()` em string está marcado como
  descontinuado no 4, mas funciona.

- **`expo-secure-store` não existe na web:** ao abrir o app no navegador (`localhost:8081`), o
  restore da sessão quebrava com `ExpoSecureStore.default.deleteValueWithKeyAsync is not a
function`. Solução: arquivos por plataforma, que o Metro escolhe sozinho —
  `services/storage.ts` (SecureStore no celular) e `services/storage.web.ts` (localStorage no
  navegador). O mesmo para os diálogos: o `Alert.alert` do React Native não mostra botões na web,
  então a confirmação de exclusão nunca respondia; `utils/dialogs.web.ts` usa `window.confirm`.
- **URL da API sem protocolo/porta:** com `EXPO_PUBLIC_API_URL=192.168.1.13`, o Axios tratou o valor
  como caminho relativo e chamou o próprio Metro (`localhost:8081/192.168.1.13/posts`), que
  respondeu HTML com status 200 — o app só mostrava "Erro inesperado". Agora `api.ts` acrescenta
  `http://` quando falta e, se a resposta não tiver o envelope da API, mostra "Resposta inválida
  de <URL>. Confira EXPO_PUBLIC_API_URL no .env (inclua a porta)".
- **Docker Desktop quebrado no WSL:** o motor Linux do Docker Desktop passou a responder
  `Internal Server Error` e os comandos `docker` travavam, então nem a API nem o MongoDB subiam.
  Decisão: não depender de Docker no desenvolvimento. O `blog-api` ganhou `npm run db`, que sobe
  um MongoDB local com o binário do `mongodb-memory-server` (já usado nos testes) e grava os dados
  em `.mongo-data/`. Também passou a falhar em 5 s com mensagem clara quando o banco não está
  acessível — antes o `npm run dev` ficava 30 s parado e parecia travado.
- **API dentro do WSL2 não aparece no IP da rede:** um servidor rodando no WSL responde em
  `localhost` no Windows, mas não no IP da rede (ex.: `192.168.1.13`). Para o Expo Go no celular a
  API precisa rodar pelo Docker Desktop (porta publicada no Windows) ou ter a porta encaminhada.
- **Voltar depois de salvar sem histórico:** abrindo um formulário por link direto (ou após
  recarregar na web), `router.back()` não tinha para onde voltar e a tela ficava parada. Criado
  `goBackOr(rota)`: volta se puder, senão vai para a listagem.

## 6. Verificação feita

- `npm run typecheck` e `npm run lint` sem erros; `npx expo-doctor` 20/20; bundle Android gerado
  com `npx expo export --platform android`.
- **Integração real com a API:** os services do app foram executados contra o `blog-api` rodando
  com um MongoDB em memória: login (certo e errado), CRUD de posts, busca, cadastro de 12 alunos
  com paginação (página 2 = 2 itens), email duplicado (`409`), CRUD de professor sem expor o hash,
  e `401` sem token e com token inválido.
- **Interface testada no navegador (Expo web, `localhost:8081`)** contra a API real: lista e busca
  (com e sem resultado), login, criação de post (com validação de campos vazios e autor
  pré-preenchido), edição de post com dados carregados, cadastro de professor (senha curta → erro,
  email duplicado → `409` exibido), paginação de professores e alunos, professor logado sem botão
  de excluir a si mesmo, exclusão do último aluno da página 2 (voltou para a página 1), formulário
  de aluno sem campo de senha e sessão expirada (token inválido → aviso, logout e tela de login).
- **Não verificado:** exclusão de post pela interface (mesmo fluxo já testado em alunos) e o app
  em celular/emulador. [Registre aqui o que foi ajustado no teste com Expo Go.]

## 7. Mudança de decisão: login de alunos e perfis

- **Contexto:** depois de testar a primeira versão, a equipe não gostou da dinâmica dos alunos:
  eles eram só um cadastro, sem uso no app. Decidimos que alunos também fazem login e que **ler
  os posts exige login** — sem isso, a conta de aluno não teria função (veria o mesmo que um
  visitante).
- **Tela de login única:** professores e alunos usam o mesmo `POST /auth/login`. A API procura
  primeiro entre os professores e depois entre os alunos.
- **Perfil no token:** o JWT passou a carregar `role` (`teacher` | `student`). Tokens antigos, sem
  `role`, são recusados com `401` (basta entrar de novo).
- **`requireTeacher`:** novo middleware no back-end. Leitura de posts exige só login
  (`requireAuth`); escrita de posts e todo o `/teachers` e `/students` exigem professor. Aluno
  recebe `403`.
- **Email único entre as duas coleções:** professores e alunos continuaram em coleções separadas
  (menos mudança que unificar tudo num `User`), então o email é checado também na coleção do
  outro perfil — senão o mesmo email poderia existir nos dois e o login ficaria ambíguo (`409`).
- **Compatibilidade com o front web da Fase 3:** a resposta do login passou a ser
  `{ token, user: { id, name, email, role } }`, mas para professores continua trazendo também o
  campo `teacher`, que o front web lê. Observação: como a leitura de posts agora exige login, a
  listagem pública do front web deixa de funcionar sem login.
- **No app:** o `AuthContext` expõe `user`, `isAuthenticated` e `isTeacher`; o layout usa três
  `Stack.Protected` (login só sem sessão; leitura para qualquer logado; `admin/*` só para
  professor). O formulário de aluno ganhou o campo senha (as telas de professor e aluno ficaram
  ainda mais iguais, e a opção `withPassword` da configuração foi removida).
- **Dados antigos:** alunos cadastrados antes da mudança não têm senha; para entrarem, um
  professor edita o cadastro e define uma.
- **Verificação:** 40 testes no back-end (novos: login de aluno, `403` do aluno na escrita e nas
  rotas de administração, email duplicado entre perfis, senha nunca exposta). No navegador:
  sem sessão a home redireciona para o login; aluno entra, vê os posts e o botão Sair, é mandado
  de volta à home ao abrir `/admin`, e a API recusa a escrita com `403`; professor entra, vê
  Admin, o cadastro de aluno tem senha e recusa o email de um professor; Sair leva ao login.
