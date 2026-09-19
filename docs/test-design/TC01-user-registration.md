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

## 2. Abordagem de Design de Teste (CTFL v4.0)

O syllabus CTFL v4.0 organiza as técnicas de design de teste em três
categorias, além das abordagens colaborativas (Capítulo 4 —
[Análise e Modelagem de Teste](https://istqb.org/certifications/certified-tester-foundation-level-ctfl-v4-0/)):

| Categoria | Nível de cobrança | Aplicável aqui? |
| --- | --- | --- |
| Caixa-preta (baseada em especificação): Particionamento de Equivalência, Valor Limite, Tabela de Decisão, Transição de Estado | K3 (aplicação) | Sim — é a categoria certa para testar comportamento por UI sem acesso ao código-fonte da aplicação de terceiros. |
| Caixa-branca (baseada em estrutura): Teste de Instrução, Teste de Ramificação | K2 (compreensão) | **Não** — exige acesso ao código-fonte para medir cobertura de instrução/ramificação; como testers externos de uma aplicação pública de terceiros, essa categoria está fora de alcance por definição, não por escolha. |
| Baseada em experiência: Suposição de Erro, Teste Exploratório, Checklist | K2 (compreensão) | Sim, como **complemento** — ver seção 2.2. |

Dentro da categoria caixa-preta, o desafio nomeia três técnicas
(particionamento, valor limite, tabela de decisão) das **quatro** que o
CTFL v4.0 define nesse nível (a quarta é Transição de Estado). Em vez de
aplicar as técnicas nomeadas de forma genérica ao mesmo formulário — o que
tenderia a produzir análises artificiais só para "cumprir a lista" —,
avaliei as quatro e escolhi a que melhor se encaixa **neste** cenário
específico.

### 2.1 Técnica escolhida: Tabela de Decisão

TC01 é um teste de ponta a ponta de uma *regra de negócio* ("a conta é
criada com sucesso"), não um teste de validação de um campo isolado nem de
uma máquina de estados com transições alternativas. A **Tabela de Decisão**
é a técnica desenhada exatamente para modelar uma ação que depende da
combinação de múltiplas condições independentes — e é isso que determina se
o cadastro é aceito.

**Por que não as outras três, aqui:**

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
- **Transição de Estado** se aplica quando o comportamento do sistema depende
  do *histórico* (o mesmo evento produz resultados diferentes dependendo do
  estado atual) — por exemplo, um pedido só pode ir de "Aprovado" para
  "Enviado", nunca diretamente de "Pendente" para "Enviado". O fluxo do TC01
  (Home → Signup → Account Information → Account Created → Home logado →
  Account Deleted) é sequencial e linear: cada passo só é alcançável pelo
  anterior, e não há um evento que produza saídas diferentes dependendo de
  em qual estado o sistema já estava. Modelar isso como máquina de estados
  só agregaria valor se o objetivo fosse testar *transições inválidas* (ex.:
  tentar excluir uma conta sem estar logado) — o que é exatamente o tipo de
  caso negativo fora do escopo de um único teste de caminho feliz (ver
  backlog, seção 3).

> As condições da tabela abaixo foram verificadas no comportamento real da
> aplicação (atributos `required`/`type`/`pattern` no HTML e a resposta real
> do servidor a uma submissão de teste), não apenas assumidas — ver seção
> 2.2.

### 2.2 Técnica complementar: Suposição de Erro / Teste Exploratório

O CTFL v4.0 classifica Suposição de Erro (*Error Guessing*) e Teste
Exploratório como técnicas baseadas em experiência, explicitamente
complementares às técnicas caixa-preta — usadas para checar se as condições
de uma tabela de decisão refletem a realidade, e não apenas o que a
especificação declara. Foi exatamente esse o uso feito aqui: antes de
assumir, por exemplo, que "e-mail duplicado" gera um erro específico, ou
que um campo tem uma restrição de tamanho, o comportamento foi checado
executando ações exploratórias reais contra a aplicação (submeter um e-mail
já cadastrado e capturar a mensagem exata retornada; inspecionar o atributo
`required` de cada campo do formulário; verificar o intervalo real dos
`<select>` de dia/mês/ano). Essa suposição de erro dirigida é o que
diferencia as condições **C1**–**C3** da tabela abaixo de uma tabela de
decisão "de livro-texto" — elas descrevem o comportamento real verificado da
aplicação, não uma hipótese sobre como um formulário de cadastro
"normalmente" se comporta.

> Ver [Uso de IA neste projeto](../../README.md#uso-de-ia-neste-projeto)
> para como essa verificação foi conduzida.

**Nota sobre colaboração (ATDD/BDD):** o CTFL v4.0 destaca ATDD e BDD como
abordagens colaborativas de design de teste, tipicamente expressas no
formato Dado/Quando/Então (Gherkin). O desafio veda explicitamente essa
sintaxe; por isso, os testes usam `describe`/`it` do Mocha. O espírito de
ATDD — definir o critério de aceite antes de escrever o código de automação
— ainda está presente: a tabela de decisão abaixo foi desenhada antes do
`registerUser.spec.js`, e é ela que determina qual das quatro regras
possíveis (R1–R4) o spec automatiza.

### 2.3 Tabela de Decisão

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
| TC05 | Transição de Estado (inválida) | Tentar acessar `/delete_account` sem uma sessão autenticada e validar que a exclusão é recusada/redirecionada — candidato natural para Transição de Estado, técnica não escolhida para o TC01 em si (seção 2.1) mas aplicável a esse caso negativo específico |

## 4. Rastreabilidade

| Requisito do desafio | Caso de teste | Evidência |
| --- | --- | --- |
| "Test Case 1: Registrar um usuário" (passo a passo fornecido) | TC01 | `test/specs/registration/registerUser.spec.js` |
