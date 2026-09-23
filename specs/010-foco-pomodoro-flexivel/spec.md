---
milestone: 18
priority: P1
tag: m010-foco-pomodoro-flexivel
status: draft
ready_stories: []
source_checked: 2026-09-23
---

# Foco / Pomodoro Flexível

Milestone GitHub: [P1 — Foco / Pomodoro Flexível](https://github.com/Nosso-Espectro/aplicativo/milestone/18) (número 18).

Estado consultado: aberta; todas as histórias abaixo estão abertas. Especificação em revisão, não implementação concluída.

## Contexto

As histórias descrevem preferências diferentes para organizar períodos de foco e descanso.

Descrição original da milestone:

> Implementar uma ferramenta de foco que permita utilizar tanto o método Pomodoro tradicional quanto sessões livres. O usuário poderá escolher tempos pré-configurados, personalizar intervalos ou utilizar um cronômetro sem duração definida. A aplicação deverá evitar penalizações ou mecanismos excessivamente competitivos.

## Objetivo

Oferecer sessões Pomodoro e cronômetro livre sem penalizar interrupções.

## Público e necessidades

As personas e necessidades são as declaradas nas histórias abaixo. Não se inferem diagnóstico, indicação clínica ou capacidades individuais além do texto do backlog.

## Histórias de usuário

### US-025 — Executar sessão Pomodoro

GitHub Issue: [#25](https://github.com/Nosso-Espectro/aplicativo/issues/25)

Como usuário que precisa de apoio para manter o foco, quero iniciar uma sessão Pomodoro com intervalos definidos, para estruturar períodos de atividade e descanso.

#### Critérios de aceite

- [ ] Devem existir presets iniciais como 25/5 e 50/10.
- [ ] O usuário deve poder iniciar, pausar, retomar e encerrar a sessão.
- [ ] Ao terminar um período, o aplicativo deve informar a mudança para foco ou pausa.

### US-026 — Usar cronômetro de foco livre

GitHub Issue: [#26](https://github.com/Nosso-Espectro/aplicativo/issues/26)

Como usuário que não se adapta a blocos fixos, quero usar um cronômetro sem duração pré-definida, para trabalhar até o meu limite pessoal.

#### Critérios de aceite

- [ ] O cronômetro deve iniciar em zero e contar o tempo decorrido.
- [ ] Deve permitir pausar, retomar e finalizar.
- [ ] O recurso não deve penalizar o usuário por sessões curtas ou interrompidas.

### Definition of Done original (comum às Issues #25, #26)

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

- **RF-001** — Devem existir presets iniciais como 25/5 e 50/10. (#25, critério 1.)
- **RF-002** — O usuário deve poder iniciar, pausar, retomar e encerrar a sessão. (#25, critério 2.)
- **RF-003** — Ao terminar um período, o aplicativo deve informar a mudança para foco ou pausa. (#25, critério 3.)
- **RF-004** — O cronômetro deve iniciar em zero e contar o tempo decorrido. (#26, critério 1.)
- **RF-005** — Deve permitir pausar, retomar e finalizar. (#26, critério 2.)
- **RF-006** — O recurso não deve penalizar o usuário por sessões curtas ou interrompidas. (#26, critério 3.)

Os termos qualitativos do backlog foram preservados; limites ainda não definidos estão em “Questões em aberto”. RFs são locais a esta spec; use o caminho da spec junto ao ID ao referenciá-los.

## Requisitos não funcionais

- **RNF-001** — A interface deve ser utilizável em dispositivo móvel, com foco, contraste, alvos de toque e textos compreensíveis verificados nos fluxos da história. Fonte: DoD/observações de #25, #26.
- **RNF-002** — Nenhum dado sensível deve ser enviado a serviço externo sem necessidade e consentimento adequado; verificar as saídas de rede dos fluxos implementados. Fonte: DoD/observações de #25, #26.
- **RNF-003** — Os estados de erro e ausência de dados pertinentes devem ser tratados e verificados sem impedir o fluxo restante. Fonte: DoD/observações de #25, #26.
- **RNF-004** — Recursos de apoio não devem ser apresentados como diagnóstico, tratamento ou substituição de acompanhamento profissional; conferir textos e saídas. Fonte: DoD/observações de #25, #26.

Offline e persistência seguem os critérios específicos dos RFs; não se presume sincronização. Desempenho numérico e tempos máximos não foram definidos no backlog.

## Fora de escopo

Implementações de outras milestones, requisitos não rastreados e decisões funcionais listadas como pendentes. Nesta execução apenas documentação e ferramentas de engenharia; nenhuma funcionalidade é implementada.

## Dependências funcionais

Não há dependência entre milestones explicitamente exigida pelas histórias. A fundação técnica é tratada no plano.

## Casos de erro

Pausa/retomada e interrupção da sessão; sem penalizações por encerrar cedo (#25/#26).

São cenários derivados dos critérios e da DoD, não novas funcionalidades. As respostas ainda indefinidas devem ser acordadas antes da implementação correspondente.

## Questões em aberto

- Q-FOCO-01 — A milestone menciona personalização de intervalos, mas #25 só exige presets. Falta atribuir critérios dessa personalização.
- Q-FOCO-02 — Transição foco/pausa é automática ou depende de confirmação? Como avisar sem estímulo inesperado e como tratar segundo plano (#25/#26)?

Questões transversais: [auditoria do backlog](../../docs/backlog-audit.md). Uma história só está Ready quando suas ambiguidades bloqueantes forem resolvidas no GitHub e refletidas aqui.

## Rastreabilidade

| Requisito | Issue | História | Task principal |
| --- | --- | --- | --- |
| RF-001 | [#25](https://github.com/Nosso-Espectro/aplicativo/issues/25) | US-025 | T001 |
| RF-002 | [#25](https://github.com/Nosso-Espectro/aplicativo/issues/25) | US-025 | T002 |
| RF-003 | [#25](https://github.com/Nosso-Espectro/aplicativo/issues/25) | US-025 | T003 |
| RF-004 | [#26](https://github.com/Nosso-Espectro/aplicativo/issues/26) | US-026 | T006 |
| RF-005 | [#26](https://github.com/Nosso-Espectro/aplicativo/issues/26) | US-026 | T007 |
| RF-006 | [#26](https://github.com/Nosso-Espectro/aplicativo/issues/26) | US-026 | T008 |
| RNF-001 | #25, #26 | Todas acima | Revisão por história em tasks.md |
| RNF-002 | #25, #26 | Todas acima | Revisão por história em tasks.md |
| RNF-003 | #25, #26 | Todas acima | Revisão por história em tasks.md |
| RNF-004 | #25, #26 | Todas acima | Revisão por história em tasks.md |

As tasks de testes cobrem os RFs da respectiva história. Branches previstas, commits, PRs e tags seguem o [workflow](../../docs/development-workflow.md) e o [índice](../README.md); nenhum desses artefatos Git foi criado nesta preparação.
