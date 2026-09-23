---
milestone: 15
priority: P1
tag: m007-divisor-de-tarefas
status: draft
ready_stories: []
source_checked: 2026-09-23
---

# Divisor de Tarefas

Milestone GitHub: [P1 — Divisor de Tarefas](https://github.com/Nosso-Espectro/aplicativo/milestone/15) (número 15).

Estado consultado: aberta; todas as histórias abaixo estão abertas. Especificação em revisão, não implementação concluída.

## Contexto

Tarefas grandes precisam ser convertidas manualmente em passos concretos e reutilizáveis.

Descrição original da milestone:

> Criar uma ferramenta para transformar tarefas grandes ou abstratas em pequenas ações concretas. O usuário poderá escrever uma atividade como arrumar o quarto e dividir manualmente em etapas menores. Devem existir modelos reutilizáveis para tarefas comuns. Uma futura integração com IA poderá automatizar essa decomposição.

## Objetivo

Permitir organizar subtarefas, acompanhar progresso e criar cópias independentes de modelos.

## Público e necessidades

As personas e necessidades são as declaradas nas histórias abaixo. Não se inferem diagnóstico, indicação clínica ou capacidades individuais além do texto do backlog.

## Histórias de usuário

### US-019 — Dividir uma tarefa em pequenas etapas

GitHub Issue: [#19](https://github.com/Nosso-Espectro/aplicativo/issues/19)

Como pessoa com dificuldade de função executiva, quero quebrar uma tarefa grande em etapas menores, para tornar o início e a execução mais manejáveis.

#### Critérios de aceite

- [ ] Deve ser possível criar uma tarefa principal.
- [ ] O usuário deve poder adicionar, editar, ordenar e remover subtarefas.
- [ ] Cada subtarefa deve poder ser marcada como concluída.
- [ ] O progresso da tarefa deve ser persistido localmente.

### US-020 — Salvar tarefa como modelo reutilizável

GitHub Issue: [#20](https://github.com/Nosso-Espectro/aplicativo/issues/20)

Como usuário, quero transformar uma sequência de etapas em modelo, para reutilizar processos recorrentes sem cadastrá-los novamente.

#### Critérios de aceite

- [ ] Uma tarefa existente deve poder ser salva como modelo.
- [ ] O usuário deve poder criar nova tarefa a partir do modelo.
- [ ] Editar uma cópia criada do modelo não deve alterar o modelo original.

### Definition of Done original (comum às Issues #19, #20)

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

- **RF-001** — Deve ser possível criar uma tarefa principal. (#19, critério 1.)
- **RF-002** — O usuário deve poder adicionar, editar, ordenar e remover subtarefas. (#19, critério 2.)
- **RF-003** — Cada subtarefa deve poder ser marcada como concluída. (#19, critério 3.)
- **RF-004** — O progresso da tarefa deve ser persistido localmente. (#19, critério 4.)
- **RF-005** — Uma tarefa existente deve poder ser salva como modelo. (#20, critério 1.)
- **RF-006** — O usuário deve poder criar nova tarefa a partir do modelo. (#20, critério 2.)
- **RF-007** — Editar uma cópia criada do modelo não deve alterar o modelo original. (#20, critério 3.)

Os termos qualitativos do backlog foram preservados; limites ainda não definidos estão em “Questões em aberto”. RFs são locais a esta spec; use o caminho da spec junto ao ID ao referenciá-los.

## Requisitos não funcionais

- **RNF-001** — A interface deve ser utilizável em dispositivo móvel, com foco, contraste, alvos de toque e textos compreensíveis verificados nos fluxos da história. Fonte: DoD/observações de #19, #20.
- **RNF-002** — Nenhum dado sensível deve ser enviado a serviço externo sem necessidade e consentimento adequado; verificar as saídas de rede dos fluxos implementados. Fonte: DoD/observações de #19, #20.
- **RNF-003** — Os estados de erro e ausência de dados pertinentes devem ser tratados e verificados sem impedir o fluxo restante. Fonte: DoD/observações de #19, #20.
- **RNF-004** — Recursos de apoio não devem ser apresentados como diagnóstico, tratamento ou substituição de acompanhamento profissional; conferir textos e saídas. Fonte: DoD/observações de #19, #20.

Offline e persistência seguem os critérios específicos dos RFs; não se presume sincronização. Desempenho numérico e tempos máximos não foram definidos no backlog.

## Fora de escopo

Implementações de outras milestones, requisitos não rastreados e decisões funcionais listadas como pendentes. Nesta execução apenas documentação e ferramentas de engenharia; nenhuma funcionalidade é implementada.

Decomposição automática com IA pertence à milestone P3, não a esta entrega manual.

## Dependências funcionais

Não há dependência entre milestones explicitamente exigida pelas histórias. A fundação técnica é tratada no plano.

## Casos de erro

Tarefa sem etapas, falha ao salvar progresso e modelo removido; cópia não deve modificar original (#19/#20).

São cenários derivados dos critérios e da DoD, não novas funcionalidades. As respostas ainda indefinidas devem ser acordadas antes da implementação correspondente.

## Questões em aberto

- Q-TAREFA-01 — Como editar/remover modelos e tratar exclusão de uma subtarefa em execução? Estes comportamentos não estão detalhados (#19/#20).
- Q-TAREFA-02 — A milestone menciona modelos para tarefas comuns; #20 cobre modelos criados pelo usuário. Definir se há catálogo inicial e sua Issue. IA pertence à milestone P3.

Questões transversais: [auditoria do backlog](../../docs/backlog-audit.md). Uma história só está Ready quando suas ambiguidades bloqueantes forem resolvidas no GitHub e refletidas aqui.

## Rastreabilidade

| Requisito | Issue | História | Task principal |
| --- | --- | --- | --- |
| RF-001 | [#19](https://github.com/Nosso-Espectro/aplicativo/issues/19) | US-019 | T001 |
| RF-002 | [#19](https://github.com/Nosso-Espectro/aplicativo/issues/19) | US-019 | T002 |
| RF-003 | [#19](https://github.com/Nosso-Espectro/aplicativo/issues/19) | US-019 | T003 |
| RF-004 | [#19](https://github.com/Nosso-Espectro/aplicativo/issues/19) | US-019 | T004 |
| RF-005 | [#20](https://github.com/Nosso-Espectro/aplicativo/issues/20) | US-020 | T007 |
| RF-006 | [#20](https://github.com/Nosso-Espectro/aplicativo/issues/20) | US-020 | T008 |
| RF-007 | [#20](https://github.com/Nosso-Espectro/aplicativo/issues/20) | US-020 | T009 |
| RNF-001 | #19, #20 | Todas acima | Revisão por história em tasks.md |
| RNF-002 | #19, #20 | Todas acima | Revisão por história em tasks.md |
| RNF-003 | #19, #20 | Todas acima | Revisão por história em tasks.md |
| RNF-004 | #19, #20 | Todas acima | Revisão por história em tasks.md |

As tasks de testes cobrem os RFs da respectiva história. Branches previstas, commits, PRs e tags seguem o [workflow](../../docs/development-workflow.md) e o [índice](../README.md); nenhum desses artefatos Git foi criado nesta preparação.
