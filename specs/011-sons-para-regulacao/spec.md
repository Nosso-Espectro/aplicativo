---
milestone: 19
priority: P1
tag: m011-sons-para-regulacao
status: draft
ready_stories: []
source_checked: 2026-09-23
---

# Sons para Regulação

Milestone GitHub: [P1 — Sons para Regulação](https://github.com/Nosso-Espectro/aplicativo/milestone/19) (número 19).

Estado consultado: aberta; todas as histórias abaixo estão abertas. Especificação em revisão, não implementação concluída.

## Contexto

As histórias pedem controle sobre sons contínuos usados para concentração ou regulação.

Descrição original da milestone:

> Disponibilizar reprodução contínua de sons que possam auxiliar concentração ou regulação sensorial, como ruído branco, ruído marrom, chuva e oceano. Deve ser possível reproduzir os sons em segundo plano e combiná-los com temporizadores. Sempre que possível, a reprodução deverá funcionar offline.

## Objetivo

Permitir selecionar sons, controlar reprodução e volume e definir quando parar.

## Público e necessidades

As personas e necessidades são as declaradas nas histórias abaixo. Não se inferem diagnóstico, indicação clínica ou capacidades individuais além do texto do backlog.

## Histórias de usuário

### US-027 — Reproduzir sons de regulação

GitHub Issue: [#27](https://github.com/Nosso-Espectro/aplicativo/issues/27)

Como usuário, quero reproduzir sons contínuos como ruído branco, ruído marrom, chuva e oceano, para apoiar concentração ou regulação sensorial.

#### Critérios de aceite

- [ ] Deve haver ao menos quatro opções iniciais de som.
- [ ] O usuário deve poder iniciar, pausar e ajustar volume.
- [ ] Os sons essenciais devem funcionar offline.

### US-028 — Definir temporizador para sons

GitHub Issue: [#28](https://github.com/Nosso-Espectro/aplicativo/issues/28)

Como usuário, quero definir por quanto tempo um som será reproduzido, para não precisar interrompê-lo manualmente.

#### Critérios de aceite

- [ ] Deve ser possível definir uma duração.
- [ ] Ao final, a reprodução deve ser encerrada de forma previsível.
- [ ] O usuário deve poder cancelar o temporizador sem interromper imediatamente o áudio, se desejar.

### Definition of Done original (comum às Issues #27, #28)

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

- **RF-001** — Deve haver ao menos quatro opções iniciais de som. (#27, critério 1.)
- **RF-002** — O usuário deve poder iniciar, pausar e ajustar volume. (#27, critério 2.)
- **RF-003** — Os sons essenciais devem funcionar offline. (#27, critério 3.)
- **RF-004** — Deve ser possível definir uma duração. (#28, critério 1.)
- **RF-005** — Ao final, a reprodução deve ser encerrada de forma previsível. (#28, critério 2.)
- **RF-006** — O usuário deve poder cancelar o temporizador sem interromper imediatamente o áudio, se desejar. (#28, critério 3.)

Os termos qualitativos do backlog foram preservados; limites ainda não definidos estão em “Questões em aberto”. RFs são locais a esta spec; use o caminho da spec junto ao ID ao referenciá-los.

## Requisitos não funcionais

- **RNF-001** — A interface deve ser utilizável em dispositivo móvel, com foco, contraste, alvos de toque e textos compreensíveis verificados nos fluxos da história. Fonte: DoD/observações de #27, #28.
- **RNF-002** — Nenhum dado sensível deve ser enviado a serviço externo sem necessidade e consentimento adequado; verificar as saídas de rede dos fluxos implementados. Fonte: DoD/observações de #27, #28.
- **RNF-003** — Os estados de erro e ausência de dados pertinentes devem ser tratados e verificados sem impedir o fluxo restante. Fonte: DoD/observações de #27, #28.
- **RNF-004** — Recursos de apoio não devem ser apresentados como diagnóstico, tratamento ou substituição de acompanhamento profissional; conferir textos e saídas. Fonte: DoD/observações de #27, #28.

Offline e persistência seguem os critérios específicos dos RFs; não se presume sincronização. Desempenho numérico e tempos máximos não foram definidos no backlog.

## Fora de escopo

Implementações de outras milestones, requisitos não rastreados e decisões funcionais listadas como pendentes. Nesta execução apenas documentação e ferramentas de engenharia; nenhuma funcionalidade é implementada.

## Dependências funcionais

Não há dependência entre milestones explicitamente exigida pelas histórias. A fundação técnica é tratada no plano.

## Casos de erro

Arquivo indisponível, falha de reprodução e interrupção do áudio; cancelamento do timer separado do player (#27/#28).

São cenários derivados dos critérios e da DoD, não novas funcionalidades. As respostas ainda indefinidas devem ser acordadas antes da implementação correspondente.

## Questões em aberto

- Q-SOM-01 — Reprodução em segundo plano aparece na milestone, mas não tem critérios nas Issues #27/#28. Definir plataformas, interrupções e Issue responsável.
- Q-SOM-02 — Definir arquivos/licenças dos quatro sons, comportamento de término e interação com TTS (#27/#28). Não iniciar áudio automaticamente.

Questões transversais: [auditoria do backlog](../../docs/backlog-audit.md). Uma história só está Ready quando suas ambiguidades bloqueantes forem resolvidas no GitHub e refletidas aqui.

## Rastreabilidade

| Requisito | Issue | História | Task principal |
| --- | --- | --- | --- |
| RF-001 | [#27](https://github.com/Nosso-Espectro/aplicativo/issues/27) | US-027 | T001 |
| RF-002 | [#27](https://github.com/Nosso-Espectro/aplicativo/issues/27) | US-027 | T002 |
| RF-003 | [#27](https://github.com/Nosso-Espectro/aplicativo/issues/27) | US-027 | T003 |
| RF-004 | [#28](https://github.com/Nosso-Espectro/aplicativo/issues/28) | US-028 | T006 |
| RF-005 | [#28](https://github.com/Nosso-Espectro/aplicativo/issues/28) | US-028 | T007 |
| RF-006 | [#28](https://github.com/Nosso-Espectro/aplicativo/issues/28) | US-028 | T008 |
| RNF-001 | #27, #28 | Todas acima | Revisão por história em tasks.md |
| RNF-002 | #27, #28 | Todas acima | Revisão por história em tasks.md |
| RNF-003 | #27, #28 | Todas acima | Revisão por história em tasks.md |
| RNF-004 | #27, #28 | Todas acima | Revisão por história em tasks.md |

As tasks de testes cobrem os RFs da respectiva história. Branches previstas, commits, PRs e tags seguem o [workflow](../../docs/development-workflow.md) e o [índice](../README.md); nenhum desses artefatos Git foi criado nesta preparação.
