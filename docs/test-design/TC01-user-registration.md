# TC01 — Registrar um Usuário

## 1. Especificação do Caso de Teste

| Campo | Descrição |
| --- | --- |
| **ID** | TC01 |
| **Título** | Registrar um usuário e excluir a conta |
| **Prioridade** | Crítica (fluxo de cadastro é pré-requisito para compra) |
| **Tipo** | Funcional, positivo (*happy path*) |
| **Pré-condições** | Navegador disponível; e-mail utilizado ainda não cadastrado na aplicação |
| **Dados de teste** | Usuário com todos os campos obrigatórios válidos, gerados dinamicamente (nome, e-mail único, senha, data de nascimento, endereço completo) — ver `src/data/userFactory.js` |
| **Automatizado em** | `test/specs/registration/registerUser.spec.js` |

### Passos e resultado esperado

| # | Passo | Resultado esperado |
| --- | --- | --- |
| 1 | Abrir o navegador e navegar para `https://automationexercise.com` | Home page carregada |
| 2 | Clicar em **Signup / Login** | Página `/login` exibida, com formulário "New User Signup!" |
| 3 | Informar Nome e E-mail e clicar em **Signup** | Redireciona para o formulário "Enter Account Information" |
| 4 | Preencher Título, Nome, E-mail, Senha e Data de Nascimento | Campos preenchidos sem erro de validação |
| 5 | Marcar **Sign up for our newsletter!** | Checkbox selecionado |
| 6 | Marcar **Receive special offers from our partners!** | Checkbox selecionado |
| 7 | Preencher Nome, Sobrenome, Empresa, Endereço, Endereço 2, País, Estado, Cidade, CEP e Celular | Campos preenchidos sem erro de validação |
| 8 | Clicar em **Create Account** | Página de confirmação "ACCOUNT CREATED!" exibida |
| 9 | Clicar em **Continue** | Retorna à Home, usuário autenticado |
| 10 | Clicar em **Delete Account** | Conta é removida |
| 11 | Verificar mensagem e botão final | **"ACCOUNT DELETED!"** visível e botão **Continue** exibido |

## 2. Técnica de Design de Teste (CTFL): Tabela de Decisão

O CTFL sugere três técnicas de caixa-preta como ponto de partida
(particionamento em classes de equivalência, análise de valor limite e
tabela de decisão). Em vez de aplicar as três de forma genérica ao
formulário — o que tenderia a produzir tabelas artificiais só para "cumprir
tabela" —, escolhi a que melhor se encaixa **neste** cenário: TC01 é um
teste de ponta a ponta de uma *regra de negócio* ("a conta é criada com
sucesso"), não um teste de validação de um campo isolado. A **Tabela de
Decisão** é a técnica do CTFL desenhada exatamente para modelar uma ação que
depende da combinação de múltiplas condições independentes — e é isso que
determina se o cadastro é aceito.

**Por que não as outras duas, aqui:**

- **Particionamento em Classes de Equivalência** é a ferramenta certa para
  gerar um *conjunto* de casos de teste a partir de um único campo (ex.:
  "e-mail com formato inválido" e "e-mail duplicado" seriam dois casos de
  teste distintos). Como o desafio pede um único caso de teste — o cenário
  válido de ponta a ponta —, decompor cada campo em suas classes ajudaria a
  desenhar *outros* casos (fora de escopo), não a justificar ou modelar o
  TC01 em si.
- **Análise de Valor Limite** pressupõe um intervalo numérico ou de tamanho
  a testar nas fronteiras. Inspecionando o HTML real do formulário (ver nota
  abaixo), a maioria dos campos **não tem** `minlength`/`maxlength`/`pattern`
  — não há fronteira real a analisar na maior parte do formulário. Os únicos
  campos com um intervalo discreto genuíno são os seletores de dia/ano de
  nascimento, um recorte estreito e tangencial ao objetivo do TC01 (validar
  que um cadastro *completo e válido* funciona fim a fim). Forçar BVA sobre
  campos sem limite definido seria exatamente o tipo de análise artificial
  que se quer evitar.

> As condições abaixo foram verificadas no comportamento real da aplicação
> (atributos `required`/`type`/`pattern` no HTML e a resposta real do
> servidor a uma submissão de teste), não apenas assumidas. Ver [Uso de IA
> neste projeto](../../README.md#uso-de-ia-neste-projeto) para como essa
> verificação foi conduzida.

### 2.1 Tabela de Decisão

Aplicada à regra de negócio "a conta é criada com sucesso", que depende de
três condições independentes observadas no fluxo de cadastro:

- **C1** — Todos os campos obrigatórios foram preenchidos?
- **C2** — O e-mail informado tem formato válido?
- **C3** — O e-mail informado já está cadastrado?

| Regra | C1: campos obrigatórios preenchidos | C2: e-mail em formato válido | C3: e-mail já cadastrado | Ação resultante |
| :---: | :---: | :---: | :---: | --- |
| **R1 — automatizada no TC01** | V | V | F | Conta criada → "ACCOUNT CREATED!" |
| R2 | V | V | V | Bloqueado → "Email Address already exist!" |
| R3 | V | F | — | Bloqueado pelo navegador (validação HTML5 do `input type="email"`) |
| R4 | F | — | — | Bloqueado pelo navegador (campo(s) `required` vazio(s)) |

> C3 é irrelevante ("—") quando C2 é falsa, e C2/C3 são irrelevantes quando
> C1 é falsa — combinações reduzidas por impossibilidade lógica, prática
> recomendada pelo CTFL para manter tabelas de decisão enxutas.

**Por que Newsletter e Special Offers ficam de fora da tabela:** os dois
checkboxes do formulário não alteram a ação resultante — a conta é criada
independentemente do estado de cada um, apenas a preferência persistida
muda. Uma tabela de decisão modela condições que *mudam a ação*; incluir
essas duas caixas geraria quatro linhas com a mesma ação ("conta criada"),
o que não é uma decisão, é apenas variação de dado. Por isso o TC01 as marca
como `true`/`true` (o par mais comum de se encontrar em um cadastro real) e
esse par não aparece como uma "regra" na tabela acima — deliberadamente.

## 3. Backlog de Automação (fora do escopo deste desafio)

Casos derivados da tabela acima. **Nenhum destes está implementado** — são
registrados aqui como evidência de que o espaço de regras foi mapeado por
completo, e não apenas o caminho feliz, ainda que a decisão consciente
tenha sido automatizar somente o que o desafio pediu:

| ID sugerido | Regra de origem | Descrição |
| --- | --- | --- |
| TC02 | R2 | Tentar cadastrar com e-mail já utilizado por uma conta existente e validar a mensagem "Email Address already exist!" |
| TC03 | R3 | Submeter um e-mail em formato inválido e confirmar o bloqueio nativo do navegador |
| TC04 | R4 | Tentar submeter o formulário com um campo obrigatório vazio e validar que a conta não é criada |

## 4. Rastreabilidade

| Requisito do desafio | Caso de teste | Evidência |
| --- | --- | --- |
| "Test Case 1: Registrar um usuário" (passo a passo fornecido) | TC01 | `test/specs/registration/registerUser.spec.js` |
