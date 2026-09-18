# Plano de Testes — automationexercise.com (Web)

## 1. Objetivo

Definir a estratégia de teste automatizado de ponta a ponta (E2E) para o
**Test Case 1 — Registrar um usuário** da aplicação
[automationexercise.com](https://automationexercise.com/), utilizando
WebdriverIO. Este documento cobre escopo, abordagem, técnicas de design de
teste, ambiente e critérios de entrada/saída, seguindo a terminologia do
**CTFL (Certified Tester Foundation Level / ISTQB)**.

## 2. Escopo

### Em escopo

- Automação do **TC01 — Registrar um usuário**, incluindo a exclusão da
  conta ao final (fluxo *happy path* completo, do cadastro à limpeza de
  dados) — ver especificação completa em
  [`docs/test-design/TC01-user-registration.md`](./test-design/TC01-user-registration.md).
- Documentação de design de teste usando **Tabela de Decisão** (técnica de
  caixa-preta do CTFL) sobre a regra de negócio "a conta é criada com
  sucesso". A escolha dessa técnica específica — em vez de aplicar
  também particionamento em classes de equivalência e análise de valor
  limite de forma genérica — é justificada em
  [`docs/test-design/TC01-user-registration.md`](./test-design/TC01-user-registration.md#2-técnica-de-design-de-teste-ctfl-tabela-de-decisão):
  TC01 é um teste de regra de negócio de ponta a ponta, e a maior parte dos
  campos do formulário não tem fronteiras reais a analisar (verificado no
  HTML da aplicação), o que tornaria as outras duas técnicas artificiais
  aqui. A tabela cobre todas as combinações de condição relevantes — não
  apenas o caminho feliz automatizado — para fundamentar por que essa é a
  regra de maior valor para representar o fluxo sozinho, e para deixar
  registrado, como backlog, o que ficou deliberadamente fora da automação.

### Fora de escopo

O desafio técnico define um único caso de teste a automatizar. Por decisão
deliberada, **nenhum cenário além do TC01 foi automatizado** nesta entrega,
mesmo com o mapeamento de teste indicando outros candidatos de alto valor
(seção 6 do documento de design). Especificamente fora de escopo:

- Sintaxe Gherkin/Cucumber (explicitamente vedada pelo desafio).
- Quaisquer outros casos de teste do formulário de cadastro (e-mail
  duplicado, campo obrigatório vazio, datas de calendário inválidas) — estão
  documentados como backlog, não implementados.
- Demais fluxos do site (login, catálogo, carrinho, checkout, contato,
  newsletter).

## 3. Estratégia de Teste

| Nível de teste | Aplicado neste projeto | Observação |
| --- | --- | --- |
| Teste de sistema (E2E, caixa-preta) | Sim | Único nível pertinente para automação via UI de ponta a ponta. |
| Teste de unidade / componente | Não | Fora do controle do time de QA externo à aplicação. |
| Teste de integração de API | Não | Fora do escopo do desafio. |

**Tipo de teste:** funcional, caixa-preta, baseado em especificação
(*specification-based*), técnica: Tabela de Decisão (ver justificativa da
escolha na seção 2 do documento de design do TC01).

**Abordagem de automação:**

- **Framework:** [WebdriverIO](https://webdriver.io/) v9 + Mocha (`describe`/`it`), sem Cucumber/Gherkin.
- **Padrão de projeto:** Page Object Model — cada tela é uma classe própria
  em `src/pages/`, exportada como *singleton*, expondo apenas seus próprios
  elementos (mapeados como getters) e ações. A massa de dados fica isolada
  em `src/data/userFactory.js`, gerando sempre um e-mail único via
  `@faker-js/faker` (a aplicação rejeita e-mails duplicados).
- **Estrutura de teste:** Arrange–Act–Assert (AAA), com cada fase do "Act"
  também instrumentada como um passo nomeado no Allure (`allureReporter.step`),
  para que o relatório funcione como uma narrativa do que aconteceu, não
  apenas um resultado passa/falha.
- **Execução:** headless por padrão (Chrome, driver gerenciado
  automaticamente pelo WebdriverIO), com opção de execução visível para
  depuração local.
- **Resiliência:** `specFileRetries: 1` — uma nova tentativa automática do
  spec absorve instabilidades pontuais do ambiente público compartilhado sem
  mascarar uma falha real e repetível.
- **Relatório:** Allure Reports (requisito do desafio), com passos nomeados
  (`allureReporter.step`) e anexação automática de screenshot em caso de
  falha, para que o relatório narre o que aconteceu, não só o resultado
  final.
- **Integração contínua:** GitHub Actions, executando a suíte a cada push/PR
  para `main` e publicando o relatório Allure como artefato do workflow.

## 4. Ambiente e Ferramentas

| Item | Detalhe |
| --- | --- |
| Aplicação sob teste | https://automationexercise.com (ambiente público, sem sandbox dedicado) |
| Navegador | Google Chrome (driver gerenciado automaticamente pelo WebdriverIO) |
| Runtime | Node.js >= 18.20 |
| Test runner | WebdriverIO CLI + Mocha |
| Relatório | Allure Reports (`@wdio/allure-reporter` + `allure-commandline`) |
| CI | GitHub Actions (`ubuntu-latest`) |

> Por se tratar de uma aplicação pública de terceiros usada como ambiente de
> prática, não há um ambiente de homologação isolado: o usuário criado pelo
> teste é sempre removido ao final da mesma execução (`Delete Account`),
> evitando resíduo de massa de dados no ambiente compartilhado.

## 5. Critérios de Entrada e Saída

**Entrada:**
- Aplicação acessível publicamente e sem instabilidade conhecida.
- Dependências instaladas (`npm install`).

**Saída (Definition of Done da suíte):**
- TC01 executa integralmente em modo headless, localmente e no CI.
- O relatório Allure é gerado sem etapas manuais adicionais além dos
  scripts npm documentados no README.
- Nenhum erro de lint (`npm run lint`).

## 6. Riscos e Mitigações

| Risco | Impacto | Mitigação |
| --- | --- | --- |
| Aplicação de terceiros pode mudar seletores/layout sem aviso | Alto | Seletores centralizados no Page Object de cada tela (`data-qa` atributos, mais estáveis que texto visível). |
| Instabilidade pontual do ambiente público compartilhado | Médio | `specFileRetries: 1` (`wdio.conf.js`); esperas explícitas via mecanismos nativos do WebdriverIO (`waitForClickable`, `waitForDisplayed` implícitos nas asserções `expect`), sem `sleep` fixo. |
| Emails duplicados entre execuções | Médio | Geração de e-mail único por execução via `@faker-js/faker` (`src/data/userFactory.js`). |
| Escopo estreito pode parecer incompleto a um revisor apressado | Baixo | Este documento e `docs/test-design/TC01-user-registration.md` deixam explícito que a análise de teste cobre mais cenários do que os automatizados, e por que a automação foi deliberadamente contida ao TC01. |

## 7. Trabalho Futuro (fora do escopo deste desafio)

- Automatizar os casos derivados das demais regras da tabela de decisão em
  [`docs/test-design/TC01-user-registration.md`](./test-design/TC01-user-registration.md)
  (ex.: cadastro com e-mail já existente, e-mail em formato inválido, campo
  obrigatório vazio) — cada um se beneficiaria de particionamento em classes
  de equivalência ou análise de valor limite quando aplicado ao seu próprio
  campo, técnicas que não se justificavam para o TC01 em si.
- Testes de API para o mesmo fluxo de cadastro, reduzindo dependência de UI.
- Execução cross-browser (Firefox/Edge) via matrix build no GitHub Actions.
