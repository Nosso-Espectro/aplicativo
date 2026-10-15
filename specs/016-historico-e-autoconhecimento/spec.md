---
milestone: 24
priority: P3
tag: m016-historico-e-autoconhecimento
status: ready
ready_stories: ["US-038", "US-040"]
source_checked: 2026-10-15
---

# Histórico e Autoconhecimento

Milestone GitHub: [P3 — Histórico e Autoconhecimento](https://github.com/Nosso-Espectro/aplicativo/milestone/24) (número 24).

Estado consultado em 2026-10-15: milestone aberta, US-038 integrada pelo PR107;
US-040 autorizada e Ready, US-039 ainda sem Ready. Gates nativos continuam pendentes.

## Contexto

Registros anteriores podem ser consultados pelo próprio usuário para observar recorrências sem interpretação clínica.

Descrição original da milestone:

> Permitir ao usuário consultar informações registradas ao longo do tempo, como check-ins, situações de sobrecarga, estratégias utilizadas e rotinas concluídas. O objetivo é possibilitar identificação de padrões pessoais sem transformar o recurso em diagnóstico automatizado.

## Objetivo

Oferecer histórico filtrável, tendências descritivas e exclusão controlada de registros.

## Público e necessidades

As personas e necessidades são as declaradas nas histórias abaixo. Não se inferem diagnóstico, indicação clínica ou capacidades individuais além do texto do backlog.

## Histórias de usuário

### US-038 — Consultar histórico de registros

GitHub Issue: [#38](https://github.com/Nosso-Espectro/aplicativo/issues/38)

Como usuário, quero visualizar registros anteriores de check-ins e uso de ferramentas, para observar padrões pessoais ao longo do tempo.

#### Critérios de aceite

- [ ] O histórico deve apresentar registros em ordem cronológica.
- [ ] O usuário deve conseguir filtrar por tipo de registro.
- [ ] A apresentação não deve inferir diagnóstico ou causa clínica.

### US-039 — Visualizar tendências simples

GitHub Issue: [#39](https://github.com/Nosso-Espectro/aplicativo/issues/39)

Como usuário, quero visualizar tendências básicas dos meus registros, para perceber situações recorrentes e discutir minhas observações quando desejar.

#### Critérios de aceite

- [ ] As tendências devem usar apenas dados registrados pelo próprio usuário.
- [ ] O aplicativo deve diferenciar claramente contagem/tendência de interpretação clínica.
- [ ] O usuário deve poder escolher o período analisado.

### US-040 — Excluir dados do histórico

GitHub Issue: [#40](https://github.com/Nosso-Espectro/aplicativo/issues/40)

Como usuário, quero excluir registros do meu histórico, para manter controle sobre meus dados pessoais.

#### Critérios de aceite

- [ ] Deve ser possível excluir um registro individual.
- [ ] Deve existir opção para excluir todo o histórico mediante confirmação explícita.
- [ ] A exclusão deve atualizar imediatamente as visualizações derivadas.

### Definition of Done original (comum às Issues #38, #39, #40)

- [ ] Critérios de aceite atendidos.
- [ ] Fluxo principal testado.
- [ ] Estados de erro e ausência de dados tratados.
- [ ] Interface utilizável em dispositivo móvel.
- [ ] Acessibilidade básica validada: foco, contraste, tamanho de toque e textos compreensíveis.
- [ ] Nenhum dado sensível é enviado para serviço externo sem necessidade e consentimento adequado.
- [ ] Documentação técnica mínima atualizada quando aplicável.

### Observações de produto originais (comuns às Issues)

Esta história deve priorizar autonomia, previsibilidade, baixa carga cognitiva e controle do usuário. O aplicativo não deve apresentar recursos de apoio como diagnóstico, tratamento ou substituição de acompanhamento profissional.

## Requisitos funcionais

### Refinamento autorizado de US-038 em 2026-10-15

Origem: confirmação humana para iniciar #38 e salvar somente por ação explícita;
[registro na Issue](https://github.com/Nosso-Espectro/aplicativo/issues/38#issuecomment-6190658207).
Os critérios originais acima permanecem inalterados. US-040 foi refinada separadamente abaixo.

- No resumo final do check-in com alguma resposta e na rotina concluída, oferecer
  `Salvar no histórico`. Sem toque, nenhum registro; perguntas puladas não são salvas.
- Snapshot independente com ID próprio, instante da ação e tipo. Check-in guarda
  somente respostas fornecidas; rotina guarda nome e quantidade de etapas, sem imagens
  nem IDs de origem. Alterações nas origens não modificam os registros anteriores.
- SQLite local entre sessões, sem expiração automática, servidor, rede ou coleta de
  outras ferramentas. Exclusão individual/global segue o refinamento separado de #40 abaixo.
- Lista mais recente primeiro; empates por ordem de inserção decrescente. Exibir data
  e hora locais e filtros `Todos`, `Check-ins`, `Rotinas concluídas`.
- Abrir pela lista de Ferramentas; voltar ao quadro. Estados de carregamento, vazio,
  filtro vazio, erro genérico e retry. Sem inferência clínica, tendências ou agregados.
- Um salvamento por intenção visível; bloquear duplos toques, retry com o mesmo ID,
  comandos após blur/unmount e feedback tardio. Commit já autorizado pode terminar;
  não prometer cancelamento SQLite nem coleta retroativa de sessões temporárias.
- Preservar navegação, modo de baixa estimulação e usos atuais sem salvar. Sem novas
  dependências/permissões. SQLite Expo, offline real, ampliação e leitores em aparelho
  permanecem verificações nativas pendentes, distintas da suíte sintética/SQLite Node.

### Refinamento autorizado de US-040 em 2026-10-15

Origem: pedido humano para prosseguir com #40 após recomendação de priorizar controle
dos dados; [registro na Issue](https://github.com/Nosso-Espectro/aplicativo/issues/40#issuecomment-6191026963).
Preservar os três critérios originais e a entrega de #38.

- Excluir apenas snapshots do histórico, nunca rotinas/etapas ou dados das origens.
- Exclusão individual com identificação do registro, confirmação e opção de manter.
  Exclusão total confirma a quantidade de todos os tipos, independentemente do filtro,
  informa que não pode ser desfeita e não afeta rotinas.
- Se o conjunto mudar durante a confirmação total, não ampliar silenciosamente o alvo:
  falhar sem excluir, oferecer atualizar e exigir confirmação nova do conjunto atual.
- Cancelar, trocar filtro, sair, blur e unmount revogam confirmações e comandos antigos.
  Duplos toques não duplicam operações. Commit já autorizado pode terminar após saída,
  sem navegação/feedback tardios; não prometer cancelamento de SQLite.
- Após commit confirmado, atualizar lista/filtros derivados imediatamente. Falha não
  simula sucesso nem esvazia a lista; permitir atualizar e confirmar novamente.
- Schema 2 migra schema 1 sem perda. IDs técnicos de registros removidos são mantidos
  sem respostas, nome da rotina ou conteúdo, para impedir reintrodução por retries antigos.
  Trata-se de exclusão lógica: não prometer apagamento forense, de WAL ou backups do OS.
- Preservar ordenação, filtros, mode9, navegação e opt-in de #38. Sem #39, IA, rede,
  novas permissões/dependências ou logs pessoais. Testes sintéticos/SQLite Node não
  substituem SQLite Expo, leitores e fluxo offline em aparelho.

- **RF-001** — O histórico deve apresentar registros em ordem cronológica. (#38, critério 1.)
- **RF-002** — O usuário deve conseguir filtrar por tipo de registro. (#38, critério 2.)
- **RF-003** — A apresentação não deve inferir diagnóstico ou causa clínica. (#38, critério 3.)
- **RF-004** — As tendências devem usar apenas dados registrados pelo próprio usuário. (#39, critério 1.)
- **RF-005** — O aplicativo deve diferenciar claramente contagem/tendência de interpretação clínica. (#39, critério 2.)
- **RF-006** — O usuário deve poder escolher o período analisado. (#39, critério 3.)
- **RF-007** — Deve ser possível excluir um registro individual. (#40, critério 1.)
- **RF-008** — Deve existir opção para excluir todo o histórico mediante confirmação explícita. (#40, critério 2.)
- **RF-009** — A exclusão deve atualizar imediatamente as visualizações derivadas. (#40, critério 3.)

Os termos qualitativos do backlog foram preservados; limites ainda não definidos estão em “Questões em aberto”. RFs são locais a esta spec; use o caminho da spec junto ao ID ao referenciá-los.

## Requisitos não funcionais

- **RNF-001** — A interface deve ser utilizável em dispositivo móvel, com foco, contraste, alvos de toque e textos compreensíveis verificados nos fluxos da história. Fonte: DoD/observações de #38, #39, #40.
- **RNF-002** — Nenhum dado sensível deve ser enviado a serviço externo sem necessidade e consentimento adequado; verificar as saídas de rede dos fluxos implementados. Fonte: DoD/observações de #38, #39, #40.
- **RNF-003** — Os estados de erro e ausência de dados pertinentes devem ser tratados e verificados sem impedir o fluxo restante. Fonte: DoD/observações de #38, #39, #40.
- **RNF-004** — Recursos de apoio não devem ser apresentados como diagnóstico, tratamento ou substituição de acompanhamento profissional; conferir textos e saídas. Fonte: DoD/observações de #38, #39, #40.

Offline e persistência seguem os critérios específicos dos RFs; não se presume sincronização. Desempenho numérico e tempos máximos não foram definidos no backlog.

## Fora de escopo

US-039, IA, backend, sincronização, captura automática, instrumentação de outras ferramentas e demais requisitos não rastreados continuam fora das entregas autorizadas de US-038/US-040.

## Dependências funcionais

- [P1 — Check-in Corporal e Sensorial](../008-check-in-corporal-e-sensorial/spec.md): relação de uso/integração descrita nas histórias ou nas questões abaixo; não altera a prioridade original.
- [P0 — Rotina Visual](../002-rotina-visual/spec.md): relação de uso/integração descrita nas histórias ou nas questões abaixo; não altera a prioridade original.

## Casos de erro

Sem registros, filtro/período vazio e falha de exclusão; manter coerência dos agregados (#38–#40).

São cenários derivados dos critérios e da DoD, não novas funcionalidades. As respostas ainda indefinidas devem ser acordadas antes da implementação correspondente.

## Questões em aberto

- Q-HIST-01 — Resolvida para #38 pelo refinamento acima: opt-in por registro, dois tipos e campos mínimos, retenção local sem expiração automática. Não instrumentar outros módulos.
- Q-HIST-02 — Direção e tipos resolvidos para #38 acima; períodos e tendências de #39 continuam pendentes.
- Q-HIST-03 — Resolvida em #40 pelo refinamento acima: remover apenas snapshots do histórico e preservar as origens, sem promessa de apagamento forense/backup OS.

Questões transversais: [auditoria do backlog](../../docs/backlog-audit.md). Uma história só está Ready quando suas ambiguidades bloqueantes forem resolvidas no GitHub e refletidas aqui.

## Rastreabilidade

| Requisito | Issue | História | Task principal |
| --- | --- | --- | --- |
| RF-001 | [#38](https://github.com/Nosso-Espectro/aplicativo/issues/38) | US-038 | T001 |
| RF-002 | [#38](https://github.com/Nosso-Espectro/aplicativo/issues/38) | US-038 | T002 |
| RF-003 | [#38](https://github.com/Nosso-Espectro/aplicativo/issues/38) | US-038 | T003 |
| RF-004 | [#39](https://github.com/Nosso-Espectro/aplicativo/issues/39) | US-039 | T006 |
| RF-005 | [#39](https://github.com/Nosso-Espectro/aplicativo/issues/39) | US-039 | T007 |
| RF-006 | [#39](https://github.com/Nosso-Espectro/aplicativo/issues/39) | US-039 | T008 |
| RF-007 | [#40](https://github.com/Nosso-Espectro/aplicativo/issues/40) | US-040 | T011 |
| RF-008 | [#40](https://github.com/Nosso-Espectro/aplicativo/issues/40) | US-040 | T012 |
| RF-009 | [#40](https://github.com/Nosso-Espectro/aplicativo/issues/40) | US-040 | T013 |
| RNF-001 | #38, #39, #40 | Todas acima | Revisão por história em tasks.md |
| RNF-002 | #38, #39, #40 | Todas acima | Revisão por história em tasks.md |
| RNF-003 | #38, #39, #40 | Todas acima | Revisão por história em tasks.md |
| RNF-004 | #38, #39, #40 | Todas acima | Revisão por história em tasks.md |

As tasks de testes cobrem os RFs da respectiva história. Branches, commits e PRs seguem o [workflow](../../docs/development-workflow.md) e o [índice](../README.md). Entregas autorizadas US-038/US-040; não há release ou tag desta milestone.
