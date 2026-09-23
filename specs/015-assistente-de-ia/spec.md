---
milestone: 23
priority: P3
tag: m015-assistente-de-ia
status: draft
ready_stories: []
source_checked: 2026-09-23
---

# Assistente de IA

Milestone GitHub: [P3 — Assistente de IA](https://github.com/Nosso-Espectro/aplicativo/milestone/23) (número 23).

Estado consultado: aberta; todas as histórias abaixo estão abertas. Especificação em revisão, não implementação concluída.

## Contexto

As histórias pedem ajuda para decompor tarefas e reformular textos, preservando revisão e controle do usuário.

Descrição original da milestone:

> Desenvolver um assistente de IA com escopo limitado e bem definido. Inicialmente, a IA deverá auxiliar em tarefas práticas, como decompor atividades em etapas, reformular mensagens, simplificar textos ou estruturar rotinas. Não deverá realizar diagnóstico, aconselhamento médico ou substituir acompanhamento profissional.

## Objetivo

Apresentar sugestões editáveis e identificadas como IA, com limites claros e confirmação antes de alterações.

## Público e necessidades

As personas e necessidades são as declaradas nas histórias abaixo. Não se inferem diagnóstico, indicação clínica ou capacidades individuais além do texto do backlog.

## Histórias de usuário

### US-035 — Decompor tarefa com IA

GitHub Issue: [#35](https://github.com/Nosso-Espectro/aplicativo/issues/35)

Como usuário com dificuldade para iniciar uma tarefa, quero pedir à IA que proponha pequenas etapas, para transformar uma atividade abstrata em ações concretas.

#### Critérios de aceite

- [ ] O usuário deve fornecer a tarefa em texto.
- [ ] A resposta deve retornar uma sequência editável de etapas.
- [ ] O usuário deve confirmar antes de salvar as etapas como tarefa.
- [ ] O recurso deve informar que a saída pode conter erros e deve ser revisada.

### US-036 — Simplificar ou reformular uma mensagem com IA

GitHub Issue: [#36](https://github.com/Nosso-Espectro/aplicativo/issues/36)

Como usuário que precisa adaptar uma mensagem, quero pedir à IA para simplificar ou reorganizar o texto, para facilitar minha comunicação.

#### Critérios de aceite

- [ ] O usuário deve escolher entre ações como simplificar, tornar mais direto ou organizar em tópicos.
- [ ] O texto original não deve ser substituído sem confirmação.
- [ ] O usuário deve poder copiar ou salvar a versão resultante.

### US-037 — Aplicar limites de segurança ao assistente

GitHub Issue: [#37](https://github.com/Nosso-Espectro/aplicativo/issues/37)

Como usuário, quero que o assistente deixe claros seus limites, para não confundir apoio prático com diagnóstico ou atendimento profissional.

#### Critérios de aceite

- [ ] O assistente não deve se apresentar como profissional de saúde.
- [ ] Pedidos de diagnóstico devem receber orientação de limite e busca de avaliação profissional apropriada.
- [ ] O produto deve informar quando conteúdo for gerado por IA.
- [ ] Dados enviados ao serviço devem ser minimizados e a política de privacidade deve ser acessível.

### Definition of Done original (comum às Issues #35, #36, #37)

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

- **RF-001** — O usuário deve fornecer a tarefa em texto. (#35, critério 1.)
- **RF-002** — A resposta deve retornar uma sequência editável de etapas. (#35, critério 2.)
- **RF-003** — O usuário deve confirmar antes de salvar as etapas como tarefa. (#35, critério 3.)
- **RF-004** — O recurso deve informar que a saída pode conter erros e deve ser revisada. (#35, critério 4.)
- **RF-005** — O usuário deve escolher entre ações como simplificar, tornar mais direto ou organizar em tópicos. (#36, critério 1.)
- **RF-006** — O texto original não deve ser substituído sem confirmação. (#36, critério 2.)
- **RF-007** — O usuário deve poder copiar ou salvar a versão resultante. (#36, critério 3.)
- **RF-008** — O assistente não deve se apresentar como profissional de saúde. (#37, critério 1.)
- **RF-009** — Pedidos de diagnóstico devem receber orientação de limite e busca de avaliação profissional apropriada. (#37, critério 2.)
- **RF-010** — O produto deve informar quando conteúdo for gerado por IA. (#37, critério 3.)
- **RF-011** — Dados enviados ao serviço devem ser minimizados e a política de privacidade deve ser acessível. (#37, critério 4.)

Os termos qualitativos do backlog foram preservados; limites ainda não definidos estão em “Questões em aberto”. RFs são locais a esta spec; use o caminho da spec junto ao ID ao referenciá-los.

## Requisitos não funcionais

- **RNF-001** — A interface deve ser utilizável em dispositivo móvel, com foco, contraste, alvos de toque e textos compreensíveis verificados nos fluxos da história. Fonte: DoD/observações de #35, #36, #37.
- **RNF-002** — Nenhum dado sensível deve ser enviado a serviço externo sem necessidade e consentimento adequado; verificar as saídas de rede dos fluxos implementados. Fonte: DoD/observações de #35, #36, #37.
- **RNF-003** — Os estados de erro e ausência de dados pertinentes devem ser tratados e verificados sem impedir o fluxo restante. Fonte: DoD/observações de #35, #36, #37.
- **RNF-004** — Recursos de apoio não devem ser apresentados como diagnóstico, tratamento ou substituição de acompanhamento profissional; conferir textos e saídas. Fonte: DoD/observações de #35, #36, #37.

Offline e persistência seguem os critérios específicos dos RFs; não se presume sincronização. Desempenho numérico e tempos máximos não foram definidos no backlog.

## Fora de escopo

Implementações de outras milestones, requisitos não rastreados e decisões funcionais listadas como pendentes. Nesta execução apenas documentação e ferramentas de engenharia; nenhuma funcionalidade é implementada.

Esta milestone P3 não integra o MVP. Diagnóstico e aconselhamento médico estão fora do escopo declarado.

## Dependências funcionais

- [P1 — Divisor de Tarefas](../007-divisor-de-tarefas/spec.md): relação de uso/integração descrita nas histórias ou nas questões abaixo; não altera a prioridade original.

## Casos de erro

Serviço indisponível, resposta inválida e solicitação fora do escopo; manter original sem confirmação e informar os limites (#35–#37).

São cenários derivados dos critérios e da DoD, não novas funcionalidades. As respostas ainda indefinidas devem ser acordadas antes da implementação correspondente.

## Questões em aberto

- Q-IA-01 — Processamento local ou serviço externo, fornecedor, credenciais, custos e consentimento precisam ser definidos; manter fora do MVP sem backend (#35–#37).
- Q-IA-02 — Destino de “salvar” mensagem (#36), limites de entrada e respostas em falha/sem conexão precisam de decisão explícita.
- Q-IA-03 — Cobertura de #37 precisa acompanhar o primeiro fluxo #35/#36; ordem recomendada inicia pelos limites. Nenhuma função clínica será adicionada.

Questões transversais: [auditoria do backlog](../../docs/backlog-audit.md). Uma história só está Ready quando suas ambiguidades bloqueantes forem resolvidas no GitHub e refletidas aqui.

## Rastreabilidade

| Requisito | Issue | História | Task principal |
| --- | --- | --- | --- |
| RF-001 | [#35](https://github.com/Nosso-Espectro/aplicativo/issues/35) | US-035 | T001 |
| RF-002 | [#35](https://github.com/Nosso-Espectro/aplicativo/issues/35) | US-035 | T002 |
| RF-003 | [#35](https://github.com/Nosso-Espectro/aplicativo/issues/35) | US-035 | T003 |
| RF-004 | [#35](https://github.com/Nosso-Espectro/aplicativo/issues/35) | US-035 | T004 |
| RF-005 | [#36](https://github.com/Nosso-Espectro/aplicativo/issues/36) | US-036 | T007 |
| RF-006 | [#36](https://github.com/Nosso-Espectro/aplicativo/issues/36) | US-036 | T008 |
| RF-007 | [#36](https://github.com/Nosso-Espectro/aplicativo/issues/36) | US-036 | T009 |
| RF-008 | [#37](https://github.com/Nosso-Espectro/aplicativo/issues/37) | US-037 | T012 |
| RF-009 | [#37](https://github.com/Nosso-Espectro/aplicativo/issues/37) | US-037 | T013 |
| RF-010 | [#37](https://github.com/Nosso-Espectro/aplicativo/issues/37) | US-037 | T014 |
| RF-011 | [#37](https://github.com/Nosso-Espectro/aplicativo/issues/37) | US-037 | T015 |
| RNF-001 | #35, #36, #37 | Todas acima | Revisão por história em tasks.md |
| RNF-002 | #35, #36, #37 | Todas acima | Revisão por história em tasks.md |
| RNF-003 | #35, #36, #37 | Todas acima | Revisão por história em tasks.md |
| RNF-004 | #35, #36, #37 | Todas acima | Revisão por história em tasks.md |

As tasks de testes cobrem os RFs da respectiva história. Branches previstas, commits, PRs e tags seguem o [workflow](../../docs/development-workflow.md) e o [índice](../README.md); nenhum desses artefatos Git foi criado nesta preparação.
