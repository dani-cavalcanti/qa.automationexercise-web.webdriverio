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

| Critério                                     | Como é atendido                                                                                                                                                   | Onde ver                                                    |
| -------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| Código de fácil entendimento                 | Nomes descritivos por intenção (`goToSignupLogin`, `fillAccountInformation`), uma responsabilidade por classe, sem lógica de teste escondida em helpers genéricos | `src/pages/*.page.js`                                       |
| Documentação dos métodos (não linha a linha) | Um JSDoc por método público explicando o que ele representa e, quando não óbvio, por quê — nenhum comentário explicando cada linha                                | `src/pages/*.page.js`, `src/data/userFactory.js`            |
| Estrutura de teste Triple A                  | Arrange/Act/Assert marcados explicitamente como comentários no spec                                                                                               | `test/specs/registration/registerUser.spec.js`              |
| Padrão de projeto                            | **Page Object Model** — cada página é uma classe exportada como _singleton_                                                                                       | `src/pages/`                                                |
| Execução em modo headless                    | Chrome headless por padrão (`--headless=new`); `HEADLESS=false` alterna para depuração local                                                                      | `wdio.conf.js`                                              |
| Testes organizados em suítes                 | Suíte nomeada `registration` em `wdio.conf.js` → `suites`, executável isoladamente                                                                                | `wdio.conf.js`, `npm run test:registration`                 |
| Performance de execução                      | ~9s por execução local; sem `sleep` fixo; ver [Performance](#performance) para as decisões que sustentam esse tempo                                               | seção Performance                                           |
| Organização do código/testes/arquivos        | Pastas por responsabilidade (`src/pages`, `src/data`, `test/specs`, `docs`)                                                                                       | [Estrutura do projeto](#estrutura-do-projeto)               |
| Integração com Allure Reports                | Reporter `allure` configurado em `wdio.conf.js`, com passos nomeados (`allureReporter.step`) e screenshot automático em falha                                     | `wdio.conf.js`, seção [Relatório Allure](#relatório-allure) |
| Pipeline no GitHub Actions                   | Workflow que instala, roda os testes headless e publica o relatório Allure como artefato                                                                          | `.github/workflows/ci.yml`                                  |
| Mapeamento de elementos                      | Todo elemento é um getter no Page Object da tela correspondente — nenhum seletor CSS aparece dentro de um spec                                                    | `src/pages/*.page.js`                                       |
| README com configuração/instalação/execução  | Este documento                                                                                                                                                    | seções abaixo                                               |

## Stack e decisões de arquitetura

| Item                   | Escolha                                               | Por quê                                                                                                                                                                                                                                            |
| ---------------------- | ----------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Framework de automação | [WebdriverIO](https://webdriver.io/) v9               | Requisito do desafio.                                                                                                                                                                                                                              |
| Test runner            | Mocha (`describe`/`it`)                               | WebdriverIO usa Mocha nativamente para suítes não-BDD/Gherkin; mantém a sintaxe fora do Cucumber, conforme exigido.                                                                                                                                |
| Padrão de projeto      | **Page Object Model** (`src/pages/`)                  | Cada tela é uma classe própria, exportada como _singleton_, expondo só seus próprios elementos (mapeados como getters) e ações — o teste não conhece um único seletor CSS diretamente.                                                             |
| Massa de dados         | `src/data/userFactory.js` + `@faker-js/faker`         | Uma função de fábrica gera um usuário válido com e-mail único a cada execução (a aplicação rejeita e-mails duplicados), mantendo o spec livre da lista de ~19 campos do formulário.                                                                |
| Estrutura do teste     | **AAA (Arrange–Act–Assert)**                          | O spec segue essas três seções explicitamente; cada fase do "Act" também é um passo nomeado no Allure (`allureReporter.step`), para que o relatório narre o que aconteceu, não só o resultado final.                                               |
| Resiliência            | `specFileRetries: 1` + `wdio:enforceWebDriverClassic` | Uma nova tentativa automática absorve instabilidade pontual do ambiente público; o protocolo WebDriver clássico evita uma disputa de tempo real observada entre o WebDriver Bidi e a navegação da SPA (ver [Uso de IA](#uso-de-ia-neste-projeto)). |
| Relatório              | Allure Reports                                        | Requisito do desafio; passos nomeados e screenshot anexado automaticamente em caso de falha.                                                                                                                                                       |
| CI                     | GitHub Actions                                        | Requisito do desafio; executa o teste a cada push/PR e publica o relatório Allure como artefato do workflow.                                                                                                                                       |
| Qualidade de código    | ESLint (flat config) + Prettier                       | Evita bugs comuns e mantém um estilo consistente.                                                                                                                                                                                                  |

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
   workflow**, disponíveis para download na aba _Actions_ de cada execução —
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

### Como e por que usei IA neste desafio

Usei o Claude Code (Anthropic) como par de desenvolvimento durante todo o
desafio, mas de forma supervisionada — validando cada etapa antes de seguir
para a próxima, em vez de aceitar a primeira saída gerada. Este é um resumo
honesto de onde a IA ajudou, onde eu direcionei/critiquei o resultado, e
por quê.

#### 1. Verificação do comportamento real da aplicação (antes de escrever a documentação de teste)

Em vez de confiar na minha memória sobre como o formulário de cadastro do
automationexercise.com valida seus campos (ou na "memória" do modelo, que
pode estar desatualizada ou simplesmente errada), pedi para o Claude
escrever pequenos scripts descartáveis usando o próprio WebdriverIO para
inspecionar o HTML real da aplicação em produção. Como é uma aplicação
pública de terceiros, sem acesso ao código-fonte, a única fonte de verdade
confiável era observar o comportamento real dela em execução — não a
documentação (que não existe) nem a memória de quem já usou sites
parecidos. Isso me deu, com certeza, e não por suposição:

- quais campos realmente têm o atributo `required` (e quais não têm — ex.:
  Senha, Celular e CEP não têm `minlength`/`maxlength`/`pattern` no HTML,
  algo que só a inspeção real revelou, não a documentação da aplicação);
- o intervalo real dos `<select>` de dia/mês/ano do formulário — o de ano
  vai só até 2021, não até o ano atual, uma fronteira de dados da própria
  aplicação que eu não teria adivinhado;
- as mensagens de erro exatas retornadas pelo servidor ("Email Address
  already exist!" para cadastro com e-mail duplicado, "Your email or
  password is incorrect!" para login inválido) — inclusive confirmando que
  um e-mail **nunca cadastrado** retorna a mesma mensagem genérica de senha
  incorreta, uma afirmação de segurança não trivial que fiz questão de
  verificar manualmente antes de deixá-la entrar na documentação.

Essa etapa foi decisiva: documentar uma Tabela de Decisão "de livro-texto"
sobre um formulário real sem checar o comportamento de fato é o tipo de
documentação bonita mas desalinhada com a realidade que eu queria evitar.

#### 2. Estruturação do projeto e redação do teste

Direcionei explicitamente a arquitetura (Page Object Model com uma classe
por tela exportada como _singleton_, dados de teste isolados numa fábrica
própria, o motivo de cada pasta) e a forma de expressar o padrão AAA
exigido pelo desafio dentro da sintaxe do WebdriverIO/Mocha (Arrange/Act/
Assert como comentários explícitos no spec, e cada fase do "Act" também
como um passo nomeado no relatório Allure via `allureReporter.step`). Pedi
para a IA implementar essa estrutura de forma consistente, e revisei
arquivo por arquivo o resultado antes de aceitar.

#### 3. Verificação ativa, não confiança cega

Cada decisão técnica potencialmente arriscada foi checada contra a fonte,
não assumida:

- a assinatura exata do `allureReporter.step()` foi conferida lendo o
  arquivo de tipos dentro de `node_modules/@wdio/allure-reporter`, não
  apenas assumida da documentação;
- uma falha intermitente real (disputa de tempo entre o protocolo WebDriver
  Bidi e a navegação da SPA sob teste, erro `execution contexts cleared`)
  foi diagnosticada a partir do log de execução, corrigida com
  `wdio:enforceWebDriverClassic`, e a correção só foi aceita depois de
  rodar a suíte várias vezes seguidas — não "passou uma vez" como critério
  de pronto. Inclusive nesta própria revisão final, uma execução pegou uma
  instabilidade pontual real do ambiente público e o mecanismo de retry
  (`specFileRetries: 1`) a absorveu automaticamente, exatamente como
  documentado na seção [Performance](#performance);
- ESLint e Prettier foram rodados e corrigidos antes de considerar qualquer
  arquivo "pronto";
- removi decisões que a IA havia tomado por conta própria assim que ficou
  claro, na prática ou numa releitura minha, que extrapolavam o pedido: a
  suíte tinha crescido para 8 casos de teste em 4 áreas (login, logout,
  contato, newsletter) — revertida para o único TC01 pedido pelo desafio;
  um segundo relatório visual (Mochawesome) tinha sido adicionado sem estar
  no checklist oficial do desafio — removido por completo; e um "Builder"
  de dados de teste tinha métodos encadeáveis (`withTitle`, `withPassword`
  etc.) que nenhum teste usava — simplificado para uma fábrica direta
  (`userFactory.js`). Prefiro menos código a código "por precaução" que
  ninguém exercita.

#### 4. O que eu fiz, e o que a IA fez

| Decisão                                                                        | Quem definiu                                                                             |
| ------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------- |
| Escopo (automatizar somente o TC01, mesmo mapeando mais cenários como backlog) | Eu, revertendo uma expansão que a IA havia proposto                                      |
| Qual técnica do CTFL usar como principal (Tabela de Decisão) e por quê         | Eu, a partir de uma análise que pedi à IA e revisei criticamente                         |
| Verificação do comportamento real do formulário/aplicação                      | IA, sob minha orientação, com validação minha do resultado                               |
| Arquitetura de pastas (Page Objects, dados, specs, docs)                       | Eu, com a IA implementando conforme a diretriz                                           |
| Redação de cada método, spec e documento                                       | IA, revisado e ajustado por mim                                                          |
| Diagnóstico e correção da flakiness real (Bidi × navegação da SPA)             | IA, a partir do log; aceitação da correção validada por mim rodando a suíte várias vezes |
| Validação final (rodar a suíte, lint, gerar o relatório)                       | Eu                                                                                       |

Em resumo: usei a IA como acelerador de execução e como forma de verificar
rapidamente o comportamento real da aplicação, em vez de documentá-lo de
memória, mas mantive o julgamento técnico — o que testar, o que
simplificar, onde parar — comigo, validando o resultado a cada etapa em vez
de aceitá-lo às cegas.
