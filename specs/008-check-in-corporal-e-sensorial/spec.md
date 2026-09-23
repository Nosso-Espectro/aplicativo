---
milestone: 16
priority: P1
tag: m008-check-in-corporal-e-sensorial
status: draft
ready_stories: []
source_checked: 2026-09-23
---

# Check-in Corporal e Sensorial

Milestone GitHub: [P1 — Check-in Corporal e Sensorial](https://github.com/Nosso-Espectro/aplicativo/milestone/16) (número 16).

Estado consultado: aberta; todas as histórias abaixo estão abertas. Especificação em revisão, não implementação concluída.

## Contexto

As histórias pedem perguntas objetivas sobre corpo e ambiente para apoiar a percepção de necessidades.

Descrição original da milestone:

> Implementar um check-in simples para ajudar o usuário a identificar necessidades físicas e sensoriais. Em vez de depender apenas da identificação de emoções, o aplicativo poderá perguntar sobre fome, sede, dor, cansaço, ruído, iluminação, temperatura, necessidade de isolamento e outros fatores. O objetivo é favorecer autopercepção e identificação de possíveis fontes de desconforto.

## Objetivo

Oferecer check-in opcional por pergunta e resumo das respostas, sem conclusão clínica.

## Público e necessidades

As personas e necessidades são as declaradas nas histórias abaixo. Não se inferem diagnóstico, indicação clínica ou capacidades individuais além do texto do backlog.

## Histórias de usuário

### US-021 — Realizar check-in corporal e sensorial guiado

GitHub Issue: [#21](https://github.com/Nosso-Espectro/aplicativo/issues/21)

Como pessoa que pode ter dificuldade em identificar a origem do desconforto, quero responder perguntas objetivas sobre meu corpo e ambiente, para perceber possíveis necessidades.

#### Critérios de aceite

- [ ] O check-in deve abordar itens como sede, fome, dor, cansaço, ruído, luz, temperatura e necessidade de ficar sozinho.
- [ ] As respostas devem utilizar controles simples e objetivos.
- [ ] O usuário deve poder pular perguntas.
- [ ] O aplicativo não deve apresentar o resultado como diagnóstico.

### US-022 — Exibir resumo do check-in

GitHub Issue: [#22](https://github.com/Nosso-Espectro/aplicativo/issues/22)

Como usuário, quero visualizar um resumo das respostas do check-in, para decidir quais ações de autocuidado ou regulação fazem sentido para mim.

#### Critérios de aceite

- [ ] O resumo deve mostrar apenas as respostas fornecidas.
- [ ] Sugestões devem ser apresentadas como possibilidades, não como prescrição clínica.
- [ ] O usuário deve poder acessar diretamente ferramentas relacionadas, como água, regulação ou contato de apoio.

### Definition of Done original (comum às Issues #21, #22)

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

- **RF-001** — O check-in deve abordar itens como sede, fome, dor, cansaço, ruído, luz, temperatura e necessidade de ficar sozinho. (#21, critério 1.)
- **RF-002** — As respostas devem utilizar controles simples e objetivos. (#21, critério 2.)
- **RF-003** — O usuário deve poder pular perguntas. (#21, critério 3.)
- **RF-004** — O aplicativo não deve apresentar o resultado como diagnóstico. (#21, critério 4.)
- **RF-005** — O resumo deve mostrar apenas as respostas fornecidas. (#22, critério 1.)
- **RF-006** — Sugestões devem ser apresentadas como possibilidades, não como prescrição clínica. (#22, critério 2.)
- **RF-007** — O usuário deve poder acessar diretamente ferramentas relacionadas, como água, regulação ou contato de apoio. (#22, critério 3.)

Os termos qualitativos do backlog foram preservados; limites ainda não definidos estão em “Questões em aberto”. RFs são locais a esta spec; use o caminho da spec junto ao ID ao referenciá-los.

## Requisitos não funcionais

- **RNF-001** — A interface deve ser utilizável em dispositivo móvel, com foco, contraste, alvos de toque e textos compreensíveis verificados nos fluxos da história. Fonte: DoD/observações de #21, #22.
- **RNF-002** — Nenhum dado sensível deve ser enviado a serviço externo sem necessidade e consentimento adequado; verificar as saídas de rede dos fluxos implementados. Fonte: DoD/observações de #21, #22.
- **RNF-003** — Os estados de erro e ausência de dados pertinentes devem ser tratados e verificados sem impedir o fluxo restante. Fonte: DoD/observações de #21, #22.
- **RNF-004** — Recursos de apoio não devem ser apresentados como diagnóstico, tratamento ou substituição de acompanhamento profissional; conferir textos e saídas. Fonte: DoD/observações de #21, #22.

Offline e persistência seguem os critérios específicos dos RFs; não se presume sincronização. Desempenho numérico e tempos máximos não foram definidos no backlog.

## Fora de escopo

Implementações de outras milestones, requisitos não rastreados e decisões funcionais listadas como pendentes. Nesta execução apenas documentação e ferramentas de engenharia; nenhuma funcionalidade é implementada.

## Dependências funcionais

- [P0 — Regulação Sensorial](../005-regulacao-sensorial/spec.md): relação de uso/integração descrita nas histórias ou nas questões abaixo; não altera a prioridade original.
- [P0 — Plano de Apoio / Crise](../004-plano-de-apoio-crise/spec.md): relação de uso/integração descrita nas histórias ou nas questões abaixo; não altera a prioridade original.
- [P0 — Comunicação Visual / CAA](../001-comunicacao-visual-caa/spec.md): relação de uso/integração descrita nas histórias ou nas questões abaixo; não altera a prioridade original.
- [P2 — Lembrete de Água](../012-lembrete-de-agua/spec.md): relação de uso/integração descrita nas histórias ou nas questões abaixo; não altera a prioridade original.

## Casos de erro

Perguntas puladas e resumo sem respostas (#21/#22); não preencher respostas por inferência.

São cenários derivados dos critérios e da DoD, não novas funcionalidades. As respostas ainda indefinidas devem ser acordadas antes da implementação correspondente.

## Questões em aberto

- Q-CHECK-01 — Quais escalas de resposta e sugestões serão usadas e quem revisará o conteúdo (#21/#22)? Não inferir diagnóstico.
- Q-CHECK-02 — “Água” em #22 é cartão CAA (#1) ou lembretes P2 (#29)? Resolver destino antes de implementar atalho.
- Q-CHECK-03 — Retenção de respostas não definida; coleta para Histórico P3 (#38) requer decisão explícita.

Questões transversais: [auditoria do backlog](../../docs/backlog-audit.md). Uma história só está Ready quando suas ambiguidades bloqueantes forem resolvidas no GitHub e refletidas aqui.

## Rastreabilidade

| Requisito | Issue | História | Task principal |
| --- | --- | --- | --- |
| RF-001 | [#21](https://github.com/Nosso-Espectro/aplicativo/issues/21) | US-021 | T001 |
| RF-002 | [#21](https://github.com/Nosso-Espectro/aplicativo/issues/21) | US-021 | T002 |
| RF-003 | [#21](https://github.com/Nosso-Espectro/aplicativo/issues/21) | US-021 | T003 |
| RF-004 | [#21](https://github.com/Nosso-Espectro/aplicativo/issues/21) | US-021 | T004 |
| RF-005 | [#22](https://github.com/Nosso-Espectro/aplicativo/issues/22) | US-022 | T007 |
| RF-006 | [#22](https://github.com/Nosso-Espectro/aplicativo/issues/22) | US-022 | T008 |
| RF-007 | [#22](https://github.com/Nosso-Espectro/aplicativo/issues/22) | US-022 | T009 |
| RNF-001 | #21, #22 | Todas acima | Revisão por história em tasks.md |
| RNF-002 | #21, #22 | Todas acima | Revisão por história em tasks.md |
| RNF-003 | #21, #22 | Todas acima | Revisão por história em tasks.md |
| RNF-004 | #21, #22 | Todas acima | Revisão por história em tasks.md |

As tasks de testes cobrem os RFs da respectiva história. Branches previstas, commits, PRs e tags seguem o [workflow](../../docs/development-workflow.md) e o [índice](../README.md); nenhum desses artefatos Git foi criado nesta preparação.
