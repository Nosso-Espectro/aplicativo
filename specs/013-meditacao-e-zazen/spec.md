---
milestone: 21
priority: P2
tag: m013-meditacao-e-zazen
status: draft
ready_stories: []
source_checked: 2026-09-23
---

# Meditação e Zazen

Milestone GitHub: [P2 — Meditação e Zazen](https://github.com/Nosso-Espectro/aplicativo/milestone/21) (número 21).

Estado consultado: aberta; todas as histórias abaixo estão abertas. Especificação em revisão, não implementação concluída.

## Contexto

As histórias pedem uma prática opcional com temporizador simples e conteúdo introdutório.

Descrição original da milestone:

> Criar uma área simples de meditação contendo temporizador, instruções básicas de postura e um guia introdutório de Zazen. A proposta é fornecer um recurso opcional de autorregulação, sem apresentar a prática como tratamento médico ou psicológico.

## Objetivo

Disponibilizar timer de meditação e guia de Zazen sem atribuir finalidade de tratamento.

## Público e necessidades

As personas e necessidades são as declaradas nas histórias abaixo. Não se inferem diagnóstico, indicação clínica ou capacidades individuais além do texto do backlog.

## Histórias de usuário

### US-031 — Usar temporizador de meditação

GitHub Issue: [#31](https://github.com/Nosso-Espectro/aplicativo/issues/31)

Como usuário que pratica meditação, quero iniciar um temporizador simples, para realizar a prática sem distrações.

#### Critérios de aceite

- [ ] O usuário deve poder escolher a duração.
- [ ] A tela durante a prática deve ser minimalista.
- [ ] O final da sessão deve usar um aviso discreto e configurável.

### US-032 — Consultar guia introdutório de Zazen

GitHub Issue: [#32](https://github.com/Nosso-Espectro/aplicativo/issues/32)

Como usuário interessado em Zazen, quero acessar um guia básico e objetivo, para conhecer uma forma inicial de prática.

#### Critérios de aceite

- [ ] O conteúdo deve explicar postura, respiração e início da prática de maneira introdutória.
- [ ] O guia deve funcionar offline.
- [ ] O conteúdo não deve apresentar a prática como tratamento médico ou psicológico.

### Definition of Done original (comum às Issues #31, #32)

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

- **RF-001** — O usuário deve poder escolher a duração. (#31, critério 1.)
- **RF-002** — A tela durante a prática deve ser minimalista. (#31, critério 2.)
- **RF-003** — O final da sessão deve usar um aviso discreto e configurável. (#31, critério 3.)
- **RF-004** — O conteúdo deve explicar postura, respiração e início da prática de maneira introdutória. (#32, critério 1.)
- **RF-005** — O guia deve funcionar offline. (#32, critério 2.)
- **RF-006** — O conteúdo não deve apresentar a prática como tratamento médico ou psicológico. (#32, critério 3.)

Os termos qualitativos do backlog foram preservados; limites ainda não definidos estão em “Questões em aberto”. RFs são locais a esta spec; use o caminho da spec junto ao ID ao referenciá-los.

## Requisitos não funcionais

- **RNF-001** — A interface deve ser utilizável em dispositivo móvel, com foco, contraste, alvos de toque e textos compreensíveis verificados nos fluxos da história. Fonte: DoD/observações de #31, #32.
- **RNF-002** — Nenhum dado sensível deve ser enviado a serviço externo sem necessidade e consentimento adequado; verificar as saídas de rede dos fluxos implementados. Fonte: DoD/observações de #31, #32.
- **RNF-003** — Os estados de erro e ausência de dados pertinentes devem ser tratados e verificados sem impedir o fluxo restante. Fonte: DoD/observações de #31, #32.
- **RNF-004** — Recursos de apoio não devem ser apresentados como diagnóstico, tratamento ou substituição de acompanhamento profissional; conferir textos e saídas. Fonte: DoD/observações de #31, #32.

Offline e persistência seguem os critérios específicos dos RFs; não se presume sincronização. Desempenho numérico e tempos máximos não foram definidos no backlog.

## Fora de escopo

Implementações de outras milestones, requisitos não rastreados e decisões funcionais listadas como pendentes. Nesta execução apenas documentação e ferramentas de engenharia; nenhuma funcionalidade é implementada.

## Dependências funcionais

Não há dependência entre milestones explicitamente exigida pelas histórias. A fundação técnica é tratada no plano.

## Casos de erro

Duração inválida, interrupção do timer e ausência de conteúdo local; não transformar o guia em tratamento (#31/#32).

São cenários derivados dos critérios e da DoD, não novas funcionalidades. As respostas ainda indefinidas devem ser acordadas antes da implementação correspondente.

## Questões em aberto

- Q-MEDIT-01 — Definir origem/revisão do guia e forma de aviso discreto configurável (#31/#32).
- Q-MEDIT-02 — Quais controles de pausa/cancelamento e comportamento em segundo plano serão necessários? #31 não os detalha.

Questões transversais: [auditoria do backlog](../../docs/backlog-audit.md). Uma história só está Ready quando suas ambiguidades bloqueantes forem resolvidas no GitHub e refletidas aqui.

## Rastreabilidade

| Requisito | Issue | História | Task principal |
| --- | --- | --- | --- |
| RF-001 | [#31](https://github.com/Nosso-Espectro/aplicativo/issues/31) | US-031 | T001 |
| RF-002 | [#31](https://github.com/Nosso-Espectro/aplicativo/issues/31) | US-031 | T002 |
| RF-003 | [#31](https://github.com/Nosso-Espectro/aplicativo/issues/31) | US-031 | T003 |
| RF-004 | [#32](https://github.com/Nosso-Espectro/aplicativo/issues/32) | US-032 | T006 |
| RF-005 | [#32](https://github.com/Nosso-Espectro/aplicativo/issues/32) | US-032 | T007 |
| RF-006 | [#32](https://github.com/Nosso-Espectro/aplicativo/issues/32) | US-032 | T008 |
| RNF-001 | #31, #32 | Todas acima | Revisão por história em tasks.md |
| RNF-002 | #31, #32 | Todas acima | Revisão por história em tasks.md |
| RNF-003 | #31, #32 | Todas acima | Revisão por história em tasks.md |
| RNF-004 | #31, #32 | Todas acima | Revisão por história em tasks.md |

As tasks de testes cobrem os RFs da respectiva história. Branches previstas, commits, PRs e tags seguem o [workflow](../../docs/development-workflow.md) e o [índice](../README.md); nenhum desses artefatos Git foi criado nesta preparação.
