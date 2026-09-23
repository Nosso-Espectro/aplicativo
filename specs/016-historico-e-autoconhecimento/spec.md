---
milestone: 24
priority: P3
tag: m016-historico-e-autoconhecimento
status: draft
ready_stories: []
source_checked: 2026-09-23
---

# Histórico e Autoconhecimento

Milestone GitHub: [P3 — Histórico e Autoconhecimento](https://github.com/Nosso-Espectro/aplicativo/milestone/24) (número 24).

Estado consultado: aberta; todas as histórias abaixo estão abertas. Especificação em revisão, não implementação concluída.

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

Implementações de outras milestones, requisitos não rastreados e decisões funcionais listadas como pendentes. Nesta execução apenas documentação e ferramentas de engenharia; nenhuma funcionalidade é implementada.

## Dependências funcionais

- [P1 — Check-in Corporal e Sensorial](../008-check-in-corporal-e-sensorial/spec.md): relação de uso/integração descrita nas histórias ou nas questões abaixo; não altera a prioridade original.
- [P0 — Rotina Visual](../002-rotina-visual/spec.md): relação de uso/integração descrita nas histórias ou nas questões abaixo; não altera a prioridade original.

## Casos de erro

Sem registros, filtro/período vazio e falha de exclusão; manter coerência dos agregados (#38–#40).

São cenários derivados dos critérios e da DoD, não novas funcionalidades. As respostas ainda indefinidas devem ser acordadas antes da implementação correspondente.

## Questões em aberto

- Q-HIST-01 — Quais eventos geram registros, quais campos, retenção e ativação de coleta? #38 não autoriza instrumentar todo o app silenciosamente.
- Q-HIST-02 — Direção cronológica, tipos de filtro, períodos e definição de tendências precisam de critérios mensuráveis (#38/#39).
- Q-HIST-03 — Como a exclusão afeta dados originais de rotinas/check-ins versus cópias no histórico (#40)? Não inferir remoção global.

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

As tasks de testes cobrem os RFs da respectiva história. Branches previstas, commits, PRs e tags seguem o [workflow](../../docs/development-workflow.md) e o [índice](../README.md); nenhum desses artefatos Git foi criado nesta preparação.
