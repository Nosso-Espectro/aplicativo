---
milestone: 22
priority: P2
tag: m014-microconteudos-podcasts
status: draft
ready_stories: []
source_checked: 2026-09-23
---

# Microconteúdos / Podcasts

Milestone GitHub: [P2 — Microconteúdos / Podcasts](https://github.com/Nosso-Espectro/aplicativo/milestone/22) (número 22).

Estado consultado: aberta; todas as histórias abaixo estão abertas. Especificação em revisão, não implementação concluída.

## Contexto

O usuário quer localizar e ouvir conteúdos curtos sem sair do aplicativo.

Descrição original da milestone:

> Criar uma área para publicação de conteúdos curtos em áudio sobre autismo, neurodiversidade, acessibilidade, cotidiano e estratégias de autonomia. O player deverá permitir reprodução, pausa e acompanhamento do episódio. Em uma fase posterior, poderá receber conteúdos de autores e colaboradores do projeto TEAr.

## Objetivo

Listar episódios com informações essenciais e controlar a reprodução durante a sessão.

## Público e necessidades

As personas e necessidades são as declaradas nas histórias abaixo. Não se inferem diagnóstico, indicação clínica ou capacidades individuais além do texto do backlog.

## Histórias de usuário

### US-033 — Listar microconteúdos em áudio

GitHub Issue: [#33](https://github.com/Nosso-Espectro/aplicativo/issues/33)

Como usuário, quero encontrar conteúdos curtos sobre autismo e neurodiversidade, para consumir informação de forma acessível e rápida.

#### Critérios de aceite

- [ ] Os episódios devem apresentar título, duração e descrição curta.
- [ ] A lista deve indicar claramente conteúdos já reproduzidos quando essa informação existir.
- [ ] A ausência de conexão deve ser tratada de forma compreensível.

### US-034 — Reproduzir micro-podcast

GitHub Issue: [#34](https://github.com/Nosso-Espectro/aplicativo/issues/34)

Como usuário, quero ouvir um episódio dentro do aplicativo, para acessar o conteúdo sem depender de um player externo.

#### Critérios de aceite

- [ ] O player deve permitir reproduzir, pausar e avançar ou retroceder.
- [ ] A posição de reprodução deve ser mantida durante a sessão.
- [ ] O usuário deve conseguir retornar à lista sem perder o controle básico do áudio.

### Definition of Done original (comum às Issues #33, #34)

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

- **RF-001** — Os episódios devem apresentar título, duração e descrição curta. (#33, critério 1.)
- **RF-002** — A lista deve indicar claramente conteúdos já reproduzidos quando essa informação existir. (#33, critério 2.)
- **RF-003** — A ausência de conexão deve ser tratada de forma compreensível. (#33, critério 3.)
- **RF-004** — O player deve permitir reproduzir, pausar e avançar ou retroceder. (#34, critério 1.)
- **RF-005** — A posição de reprodução deve ser mantida durante a sessão. (#34, critério 2.)
- **RF-006** — O usuário deve conseguir retornar à lista sem perder o controle básico do áudio. (#34, critério 3.)

Os termos qualitativos do backlog foram preservados; limites ainda não definidos estão em “Questões em aberto”. RFs são locais a esta spec; use o caminho da spec junto ao ID ao referenciá-los.

## Requisitos não funcionais

- **RNF-001** — A interface deve ser utilizável em dispositivo móvel, com foco, contraste, alvos de toque e textos compreensíveis verificados nos fluxos da história. Fonte: DoD/observações de #33, #34.
- **RNF-002** — Nenhum dado sensível deve ser enviado a serviço externo sem necessidade e consentimento adequado; verificar as saídas de rede dos fluxos implementados. Fonte: DoD/observações de #33, #34.
- **RNF-003** — Os estados de erro e ausência de dados pertinentes devem ser tratados e verificados sem impedir o fluxo restante. Fonte: DoD/observações de #33, #34.
- **RNF-004** — Recursos de apoio não devem ser apresentados como diagnóstico, tratamento ou substituição de acompanhamento profissional; conferir textos e saídas. Fonte: DoD/observações de #33, #34.

Offline e persistência seguem os critérios específicos dos RFs; não se presume sincronização. Desempenho numérico e tempos máximos não foram definidos no backlog.

## Fora de escopo

Implementações de outras milestones, requisitos não rastreados e decisões funcionais listadas como pendentes. Nesta execução apenas documentação e ferramentas de engenharia; nenhuma funcionalidade é implementada.

Publicação por autores/colaboradores está descrita como fase posterior; não criar portal editorial nesta entrega.

## Dependências funcionais

Não há dependência entre milestones explicitamente exigida pelas histórias. A fundação técnica é tratada no plano.

## Casos de erro

Sem conexão (#33), áudio indisponível e falha no player; manter controle ao voltar à lista (#34).

São cenários derivados dos critérios e da DoD, não novas funcionalidades. As respostas ainda indefinidas devem ser acordadas antes da implementação correspondente.

## Questões em aberto

- Q-POD-01 — Origem, licenças, curadoria, hospedagem e atualização dos episódios não definidas. Não criar backend editorial nem assumir serviço externo (#33/#34).
- Q-POD-02 — Qual disponibilidade offline, persistência de reproduzido e comportamento em segundo plano? #34 só exige posição na sessão.

Questões transversais: [auditoria do backlog](../../docs/backlog-audit.md). Uma história só está Ready quando suas ambiguidades bloqueantes forem resolvidas no GitHub e refletidas aqui.

## Rastreabilidade

| Requisito | Issue | História | Task principal |
| --- | --- | --- | --- |
| RF-001 | [#33](https://github.com/Nosso-Espectro/aplicativo/issues/33) | US-033 | T001 |
| RF-002 | [#33](https://github.com/Nosso-Espectro/aplicativo/issues/33) | US-033 | T002 |
| RF-003 | [#33](https://github.com/Nosso-Espectro/aplicativo/issues/33) | US-033 | T003 |
| RF-004 | [#34](https://github.com/Nosso-Espectro/aplicativo/issues/34) | US-034 | T006 |
| RF-005 | [#34](https://github.com/Nosso-Espectro/aplicativo/issues/34) | US-034 | T007 |
| RF-006 | [#34](https://github.com/Nosso-Espectro/aplicativo/issues/34) | US-034 | T008 |
| RNF-001 | #33, #34 | Todas acima | Revisão por história em tasks.md |
| RNF-002 | #33, #34 | Todas acima | Revisão por história em tasks.md |
| RNF-003 | #33, #34 | Todas acima | Revisão por história em tasks.md |
| RNF-004 | #33, #34 | Todas acima | Revisão por história em tasks.md |

As tasks de testes cobrem os RFs da respectiva história. Branches previstas, commits, PRs e tags seguem o [workflow](../../docs/development-workflow.md) e o [índice](../README.md); nenhum desses artefatos Git foi criado nesta preparação.
