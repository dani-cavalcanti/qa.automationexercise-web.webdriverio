# qa.automationexercise-web.webdriverio

Automação E2E do **TC01 — Registrar um usuário** de
[automationexercise.com](https://automationexercise.com/), em
**WebdriverIO** (sem sintaxe Gherkin/Cucumber), com **Page Object Model**,
execução **headless**, relatório **Allure** e pipeline de **CI no GitHub
Actions**.

O desafio técnico pede a automação de um único caso de teste. Esta entrega
se atém estritamente a esse escopo — a análise de teste (seção
[Documentação de testes (CTFL)](#documentação-de-testes-ctfl)) vai além do
caminho feliz automatizado, mas a automação em si não. Essa é uma decisão
deliberada, não uma limitação: ver a justificativa em
[Uso de IA neste projeto](#uso-de-ia-neste-projeto) e em `docs/test-plan.md`.

## Sumário

- [Como este projeto atende aos critérios avaliados](#como-este-projeto-atende-aos-critérios-avaliados)
- [Stack e decisões de arquitetura](#stack-e-decisões-de-arquitetura)
- [Estrutura do projeto](#estrutura-do-projeto)
- [Pré-requisitos](#pré-requisitos)
- [Instalação](#instalação)
- [Executando os testes](#executando-os-testes)
- [Relatório Allure](#relatório-allure)
- [Performance](#performance)
- [Lint](#lint)
- [Integração contínua (GitHub Actions)](#integração-contínua-github-actions)
- [Documentação de testes (CTFL)](#documentação-de-testes-ctfl)
- [Uso de IA neste projeto](#uso-de-ia-neste-projeto)

## Como este projeto atende aos critérios avaliados

| Critério | Como é atendido | Onde ver |
| --- | --- | --- |
| Código de fácil entendimento | Nomes descritivos por intenção (`goToSignupLogin`, `fillAccountInformation`), uma responsabilidade por classe, sem lógica de teste escondida em helpers genéricos | `src/pages/*.page.js` |
| Documentação dos métodos (não linha a linha) | Um JSDoc por método público explicando o que ele representa e, quando não óbvio, por quê — nenhum comentário explicando cada linha | `src/pages/*.page.js`, `src/data/userFactory.js` |
| Estrutura de teste Triple A | Arrange/Act/Assert marcados explicitamente como comentários no spec | `test/specs/registration/registerUser.spec.js` |
| Padrão de projeto | **Page Object Model** — cada página é uma classe exportada como *singleton* | `src/pages/` |
| Execução em modo headless | Chrome headless por padrão (`--headless=new`); `HEADLESS=false` alterna para depuração local | `wdio.conf.js` |
| Testes organizados em suítes | Suíte nomeada `registration` em `wdio.conf.js` → `suites`, executável isoladamente | `wdio.conf.js`, `npm run test:registration` |
| Performance de execução | ~9s por execução local; sem `sleep` fixo; ver [Performance](#performance) para as decisões que sustentam esse tempo | seção Performance |
| Organização do código/testes/arquivos | Pastas por responsabilidade (`src/pages`, `src/data`, `test/specs`, `docs`) | [Estrutura do projeto](#estrutura-do-projeto) |
| Integração com Allure Reports | Reporter `allure` configurado em `wdio.conf.js`, com passos nomeados (`allureReporter.step`) e screenshot automático em falha | `wdio.conf.js`, seção [Relatório Allure](#relatório-allure) |
| Pipeline no GitHub Actions | Workflow que instala, roda os testes headless e publica o relatório Allure como artefato | `.github/workflows/ci.yml` |
| Mapeamento de elementos | Todo elemento é um getter no Page Object da tela correspondente — nenhum seletor CSS aparece dentro de um spec | `src/pages/*.page.js` |
| README com configuração/instalação/execução | Este documento | seções abaixo |

## Stack e decisões de arquitetura

| Item | Escolha | Por quê |
| --- | --- | --- |
| Framework de automação | [WebdriverIO](https://webdriver.io/) v9 | Requisito do desafio. |
| Test runner | Mocha (`describe`/`it`) | WebdriverIO usa Mocha nativamente para suítes não-BDD/Gherkin; mantém a sintaxe fora do Cucumber, conforme exigido. |
| Padrão de projeto | **Page Object Model** (`src/pages/`) | Cada tela é uma classe própria, exportada como *singleton*, expondo só seus próprios elementos (mapeados como getters) e ações — o teste não conhece um único seletor CSS diretamente. |
| Massa de dados | `src/data/userFactory.js` + `@faker-js/faker` | Uma função de fábrica gera um usuário válido com e-mail único a cada execução (a aplicação rejeita e-mails duplicados), mantendo o spec livre da lista de ~19 campos do formulário. |
| Estrutura do teste | **AAA (Arrange–Act–Assert)** | O spec segue essas três seções explicitamente; cada fase do "Act" também é um passo nomeado no Allure (`allureReporter.step`), para que o relatório narre o que aconteceu, não só o resultado final. |
| Resiliência | `specFileRetries: 1` + `wdio:enforceWebDriverClassic` | Uma nova tentativa automática absorve instabilidade pontual do ambiente público; o protocolo WebDriver clássico evita uma disputa de tempo real observada entre o WebDriver Bidi e a navegação da SPA (ver [Uso de IA](#uso-de-ia-neste-projeto)). |
| Relatório | Allure Reports | Requisito do desafio; passos nomeados e screenshot anexado automaticamente em caso de falha. |
| CI | GitHub Actions | Requisito do desafio; executa o teste a cada push/PR e publica o relatório Allure como artefato do workflow. |
| Qualidade de código | ESLint (flat config) + Prettier | Evita bugs comuns e mantém um estilo consistente. |

## Estrutura do projeto

```
.
├── .github/workflows/ci.yml            # Pipeline do GitHub Actions
├── docs/
│   ├── test-plan.md                    # Plano de testes (escopo, estratégia, riscos)
│   └── test-design/
│       └── TC01-user-registration.md   # Especificação do TC01 + Tabela de Decisão (CTFL)
├── src/
│   ├── pages/                          # Page Objects (1 classe por tela, elementos mapeados como getters)
│   └── data/
│       ├── userFactory.js              # Fábrica de dados de usuário (Faker)
│       └── constants.js                # Enums de domínio (Title, Country)
├── test/specs/registration/
│   └── registerUser.spec.js            # TC01
├── wdio.conf.js                        # Configuração única do WebdriverIO (headless, suíte, reporter, hooks)
└── package.json
```

A separação `src/pages` (o "como interagir com a aplicação") de
`test/specs` (o "o que verificar") e `src/data` (o "com quais dados") é o
que permitiria a suíte crescer sem duplicar seletores ou massa de dados —
mas, respeitando o escopo do desafio, hoje só existe o TC01 usando essa
estrutura.

## Pré-requisitos

- **Node.js** >= 18.20 (recomendado: 20 LTS) e npm
- **Google Chrome** instalado localmente (o WebdriverIO gerencia o
  `chromedriver` compatível automaticamente — não é necessário instalá-lo à parte)
- **Java Runtime (JRE) 8+** — necessário apenas para **gerar/abrir** o
  relatório HTML do Allure localmente (`allure-commandline` é uma ferramenta
  Java). Não é necessário para rodar o teste em si. No GitHub Actions o Java
  já é provisionado pelo workflow.

## Instalação

```bash
npm install
```

## Executando os testes

Por padrão, `npm test` roda o TC01 em **modo headless** (requisito do
desafio):

```bash
npm test
```

Outras variações úteis:

```bash
# Roda com o navegador visível (útil para depuração local)
npm run test:headed

# Roda pela suíte nomeada (idêntica ao default hoje; existe para o dia em
# que outro caso de teste for adicionado a test/specs/registration/)
npm run test:registration

# Aponta para outra URL base sem alterar código (ex.: um ambiente de homologação)
BASE_URL=https://outra-instancia.exemplo.com npm test
```

O teste cria e remove seus próprios dados (a conta de usuário), garantindo
que rodar a suíte repetidamente não deixa resíduo no ambiente público
compartilhado.

## Relatório Allure

Os resultados brutos são gravados em `reports/allure-results` a cada
execução (a pasta é limpa automaticamente no início de cada rodada, via
hook `onPrepare` em `wdio.conf.js`, para não acumular histórico de execuções
antigas). O relatório mostra a linha do tempo dos passos nomeados no spec
(`allureReporter.step`), não só o pass/fail final, e anexa um screenshot
automaticamente quando o teste falha.

Para gerar e abrir o relatório HTML (requer Java, ver
[Pré-requisitos](#pré-requisitos)):

```bash
npm run allure:generate   # gera reports/allure-report
npm run allure:open       # abre o relatório no navegador
# ou, em um único comando:
npm run report
```

## Performance

O TC01 completo (cadastro + exclusão de conta) executa em **~9 segundos**
em modo headless numa máquina comum. Decisões que sustentam esse tempo:

- **Sem `sleep` fixo em nenhum ponto** — todas as esperas usam os mecanismos
  nativos do WebdriverIO (`waitForClickable`, e o retry automático embutido
  em cada assertiva `expect`), que resolvem assim que a condição é
  satisfeita, em vez de aguardar um tempo fixo "por segurança".
- **Protocolo WebDriver clássico** (`wdio:enforceWebDriverClassic: true`) —
  ao investigar uma falha intermitente, identifiquei uma disputa de tempo
  real entre o protocolo WebDriver Bidi (padrão do WebdriverIO) e a
  navegação da SPA sob teste. Forçar o protocolo clássico eliminou tanto a
  instabilidade quanto o custo de retries internos que ela gerava.
- **Allure sem instrumentação verbosa** —
  `disableWebdriverStepsReporting`/`disableWebdriverScreenshotsReporting`
  desativados evitam que cada comando individual do WebDriver (dezenas por
  teste) vire um passo ou uma captura de tela no relatório, o que tornaria a
  geração do relatório mais lenta e o resultado mais difícil de ler.
- **`specFileRetries: 1`**, não mais — uma única nova tentativa automática
  absorve uma instabilidade pontual do ambiente público sem inflar o tempo
  total em caso de falha real e repetível.

## Lint

```bash
npm run lint       # verifica
npm run lint:fix    # corrige automaticamente o que for possível
```

## Integração contínua (GitHub Actions)

O workflow [`ci.yml`](.github/workflows/ci.yml) roda em todo `push`/`pull_request`
para `main` (e sob demanda via `workflow_dispatch`):

1. Faz checkout e instala as dependências (`npm ci`).
2. Executa o TC01 em modo headless (`npm test`).
3. Gera o relatório Allure (`npm run allure:generate`), com Java provisionado
   no runner.
4. Publica o relatório Allure e os resultados brutos como **artefatos do
   workflow**, disponíveis para download na aba *Actions* de cada execução —
   inclusive quando o teste falha (`if: always()`), para permitir
   diagnóstico.

## Documentação de testes (CTFL)

A documentação de design de teste segue a terminologia do **CTFL v4.0
(ISTQB)**:

- [`docs/test-plan.md`](docs/test-plan.md) — escopo, estratégia, ambiente, riscos.
- [`docs/test-design/TC01-user-registration.md`](docs/test-design/TC01-user-registration.md) —
  especificação formal do TC01 e uma **Tabela de Decisão** sobre a regra "a
  conta é criada com sucesso", cobrindo todas as combinações de condição
  relevantes (não apenas o caminho feliz automatizado), complementada por
  **Suposição de Erro/Teste Exploratório** para verificar o comportamento
  real da aplicação. O documento avalia as quatro técnicas caixa-preta de
  nível K3 do CTFL v4.0 (particionamento, valor limite, tabela de decisão e
  transição de estado) e justifica explicitamente por que a Tabela de
  Decisão é a que melhor se encaixa neste cenário — aplicar as demais de
  forma genérica produziria análise artificial, algo que se decidiu evitar —
  trazendo um backlog dos cenários mapeados mas **não** implementados, por
  decisão de escopo.

As condições documentadas (ex.: quais campos têm `required`, a mensagem
exata de erro para e-mail duplicado) foram **verificadas no comportamento
real da aplicação**, não apenas presumidas — ver [Uso de IA neste
projeto](#uso-de-ia-neste-projeto) para como isso foi feito.

## Uso de IA neste projeto

Fui transparente sobre o uso de IA porque foi explicitamente pedido pelo
desafio e porque acredito que **o "como" importa mais que o "se"**. Usei o
**Claude Code** como par de desenvolvimento durante toda a construção deste
repositório, mas as decisões de escopo, arquitetura e a validação final
foram minhas. Concretamente:

- **Scaffolding e boilerplate**: pedi para a IA montar a estrutura inicial
  do projeto (configuração do WebdriverIO, `package.json`, ESLint) para não
  gastar tempo com tarefas mecânicas e repetíveis, e revisei cada arquivo
  gerado antes de seguir em frente.
- **Verificação empírica em vez de suposição**: em vez de aceitar seletores
  ou regras de validação "de memória", pedi que a IA escrevesse um pequeno
  script usando o próprio WebdriverIO para inspecionar o HTML real do
  formulário de cadastro (atributos `required`, `type`, ausência de
  `pattern`/`maxlength`, intervalo real dos `<select>` de dia/mês/ano, e a
  resposta real do servidor a um e-mail duplicado). Isso gerou dados
  concretos (ex.: o `<select>` de ano vai até 2021, não até o ano atual) que
  usei na documentação — evitando uma documentação de teste "bonita" mas
  desalinhada com o comportamento real da aplicação.
- **Depuração de flakiness real**: a primeira execução do teste falhou de
  forma intermitente por uma disputa de tempo entre o protocolo WebDriver
  Bidi e a navegação da SPA (erro `execution contexts cleared`). Analisei o
  log, decidi forçar o protocolo WebDriver clássico
  (`wdio:enforceWebDriverClassic`) e validei a correção rodando o teste
  várias vezes seguidas antes de considerar o problema resolvido — não
  aceitei "passou uma vez" como critério de pronto.
- **Redação da documentação CTFL**: pedi à IA para estruturar a análise a
  partir dos dados reais coletados na etapa de verificação empírica, e
  revisei o raciocínio (por exemplo, quais condições da tabela de decisão
  são logicamente irrelevantes e por quê) antes de aceitar o conteúdo.
- **Correção de rota (controle de escopo)**: em uma iteração anterior, deixei
  a IA ampliar a automação para 8 casos de teste em 4 áreas (login, logout,
  contato, newsletter), por considerar a cobertura de um único caso pobre
  para representar um projeto real. Ao revisar, entendi que isso extrapolava
  o que o desafio pediu — e pedi explicitamente para reverter a automação a
  apenas o TC01, mantendo o rigor técnico (Page Objects bem definidos,
  passos nomeados no Allure) e a profundidade da análise de teste, mas sem
  código para cenários não solicitados. Isso significou pedir para a IA
  remover Page Objects, specs e documentos inteiros que ela havia acabado de
  escrever — decisão de disciplina de escopo, não de qualidade técnica do
  que foi removido.
- **Escolha deliberada de UMA técnica CTFL**: a primeira versão da
  documentação aplicava as três técnicas sugeridas pelo desafio
  (particionamento, valor limite e tabela de decisão) ao mesmo formulário.
  Ao reler, percebi que isso soava artificial — parecia "cumprir uma lista"
  em vez de escolher a ferramenta certa para o cenário. Pedi à IA para
  escolher e justificar apenas uma técnica; ela recomendou Tabela de Decisão
  (por TC01 ser um teste de regra de negócio de ponta a ponta, e por a
  maioria dos campos não ter fronteiras reais para BVA — algo já verificado
  empiricamente na rodada anterior). Concordei com a justificativa técnica e
  pedi a reescrita do documento em cima dela.
- **Remoção do relatório visual (Mochawesome)**: numa rodada anterior, tinha
  pedido um segundo relatório (Mochawesome) por achar o Allure pouco
  amigável para stakeholders não técnicos. Ao reavaliar o checklist oficial
  do desafio — que pede especificamente integração com Allure Reports, sem
  mencionar nenhum outro relatório — decidi remover o Mochawesome por
  completo (dependências, scripts, step do workflow) para manter o projeto
  estritamente alinhado ao que é avaliado, em vez de carregar uma
  ferramenta extra que não fazia parte do pedido.
- **Aprofundamento técnico a partir do syllabus completo do CTFL v4.0**: recebi
  um resumo detalhado das categorias de técnica do CTFL v4.0 (caixa-preta,
  caixa-branca, baseada em experiência, e as abordagens colaborativas
  ATDD/BDD) e pedi para revisar a documentação à luz dele. Isso corrigiu uma
  imprecisão que eu não tinha percebido — o documento afirmava que o CTFL
  "sugere três técnicas de caixa-preta", quando na verdade são quatro no
  nível K3 (a quarta é Transição de Estado) — e me levou a pedir uma análise
  explícita de por que Transição de Estado também não se encaixa no TC01
  (o fluxo é sequencial, sem transições alternativas a testar), por que
  Teste Caixa-Branca está fora de alcance por definição (não temos acesso ao
  código-fonte de uma aplicação de terceiros) e a formalizar, como Suposição
  de Erro/Teste Exploratório, o trabalho de verificação empírica que eu já
  vinha pedindo desde a primeira rodada. Revisei cada afirmação técnica nova
  antes de aceitar, em particular a comparação entre Tabela de Decisão e
  Transição de Estado, que exigia entender a diferença real entre as duas
  técnicas, não apenas repetir a definição do syllabus.
- **O que não deleguei**: a decisão de escopo (o quê automatizar e o que
  deixar como análise documentada mas não implementada), a escolha das
  técnicas de teste e ferramentas a manter no projeto, a revisão linha a
  linha do código antes de aceitar, e a validação final (rodar o teste
  múltiplas vezes, o lint e a geração do relatório) foram feitas por mim.

Em resumo: usei a IA para acelerar trabalho mecânico e para me dar mais
tempo para o que realmente exige julgamento de SDET — decidir o que testar
e o que não testar, e verificar se o comportamento documentado corresponde
ao comportamento real da aplicação.
