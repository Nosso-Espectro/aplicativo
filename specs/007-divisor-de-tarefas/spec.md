---
milestone: 15
priority: P1
tag: m007-divisor-de-tarefas
status: draft
ready_stories: ["US-019", "US-020", "US-076"]
source_checked: 2026-10-14
---

# Divisor de Tarefas

Milestone GitHub: [P1 — Divisor de Tarefas](https://github.com/Nosso-Espectro/aplicativo/milestone/15) (número 15).

US-019 integrada pelo PR75 e US-020 pelo PR77. US-076 Ready após refino conservador sob delegação funcional, ainda sem implementação; catálogo separado dos modelos pessoais. Gates nativos permanecem abertos, sem aprovação de milestone/release.

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

### US-076 — Consultar modelos comuns de tarefas

GitHub Issue: [#76](https://github.com/Nosso-Espectro/aplicativo/issues/76)

Como usuário, quero consultar modelos comuns de tarefas e criar uma cópia que posso ajustar, para começar sem cadastrar todas as etapas novamente.

#### Critérios de aceite

- [ ] Os três modelos comuns originais do TEAr devem estar disponíveis localmente desde a primeira abertura: Organizar uma mesa, Preparar uma mochila e Organizar uma pequena área do quarto, conforme conteúdo versionado no refinamento.
- [ ] O catálogo deve ser somente leitura, separado dos modelos pessoais, sem edição/remoção automática ou escrita no banco ao consultar; novas versões não devem modificar cópias existentes.
- [ ] Usar um modelo comum deve abrir rascunho de tarefa editável/cancelável com IDs novos e todas as etapas não concluídas; nenhum salvamento ou execução automática.
- [ ] Salvar explicitamente deve usar o banco privado de tarefas existente e confirmar somente após commit; erro preserva o rascunho, retry humano e duplicatas/ações antigas não criam sucesso falso.
- [ ] Leitura do catálogo deve continuar disponível se o banco falhar; gravação deve ficar indisponível com erro/retry explícito. Sair/blur descarta rascunho e callbacks antigos não salvam/navegam.
- [ ] Preservar modelos pessoais/tarefas/progresso e outros módulos, com entrada por Tarefas/Modelos, retornos/fallback, modo9, alvos48dp e texto ampliável. Sem DB/deps/permissões/rede/conta/IA/histórico/estímulos novos ou conteúdo clínico.

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
- **RF-008** — Catálogo local original/read-only separado dos modelos pessoais. (#76, critérios 1/2.)
- **RF-009** — Criar rascunho independente editável/cancelável, IDs próprios/statusfalse, sem escrita automática. (#76, critério 3.)
- **RF-010** — Gravação humana confirmada/retry/guards e isolamento/offline/retornos acessíveis. (#76, critérios 4/5/6.)

Os termos qualitativos do backlog foram preservados; limites ainda não definidos estão em “Questões em aberto”. RFs são locais a esta spec; use o caminho da spec junto ao ID ao referenciá-los.

## Requisitos não funcionais

- **RNF-001** — A interface deve ser utilizável em dispositivo móvel, com foco, contraste, alvos de toque e textos compreensíveis verificados nos fluxos da história. Fonte: DoD/observações de #19, #20.
- **RNF-002** — Nenhum dado sensível deve ser enviado a serviço externo sem necessidade e consentimento adequado; verificar as saídas de rede dos fluxos implementados. Fonte: DoD/observações de #19, #20.
- **RNF-003** — Os estados de erro e ausência de dados pertinentes devem ser tratados e verificados sem impedir o fluxo restante. Fonte: DoD/observações de #19, #20.
- **RNF-004** — Recursos de apoio não devem ser apresentados como diagnóstico, tratamento ou substituição de acompanhamento profissional; conferir textos e saídas. Fonte: DoD/observações de #19, #20.

Offline e persistência seguem os critérios específicos dos RFs; não se presume sincronização. Desempenho numérico e tempos máximos não foram definidos no backlog.

## Fora de escopo

US-019 não implementa modelos/catálogo de #20, histórico, compartilhamento, timer/avisos, navegação inferior ou funcionalidades de outros módulos. Sem dependência/permissão/rede/backend/IA nova.

Decomposição automática com IA pertence à milestone P3, não a esta entrega manual.

## Dependências funcionais

Não há dependência entre milestones explicitamente exigida pelas histórias. A fundação técnica é tratada no plano.

## Casos de erro

Tarefa sem etapas, falha ao salvar progresso e modelo removido; cópia não deve modificar original (#19/#20).

São cenários derivados dos critérios e da DoD, não novas funcionalidades. As respostas ainda indefinidas devem ser acordadas antes da implementação correspondente.

## Questões em aberto

- Q-TAREFA-01 — Resolvida: #19 não tem estado em execução; #20 permite editar e remover modelos pessoais mediante confirmação, sem modificar tarefas já criadas.
- Q-TAREFA-02 — Resolvida na #76 sob delegação funcional: três modelos editoriais originais/read-only/locais, cópia editável antes de save humano, sem modificar modelos pessoais ou instâncias. Refinamento [6176720977](https://github.com/Nosso-Espectro/aplicativo/issues/76#issuecomment-6176720977); texto final/proveniência no plano. Ready não comprova implementação/gate. IA pertence à milestone P3.

## Refinamento aprovado US-020

O usuário aprovou explicitamente o escopo e a recomendação no chat em2026-10-14,
registrado na [Issue20](https://github.com/Nosso-Espectro/aplicativo/issues/20#issuecomment-6162554130).
Salvar uma tarefa real como modelo pessoal local, com título e etapas na ordem
confirmada, sem guardar progresso. Modelos podem ser editados/removidos com
confirmação; salvar/cancelar e drafts separados. Cópia cria tarefa independente,
com IDs próprios e todas etapas não concluídas; editar/excluir modelo não altera
cópias existentes, nem excluir tarefa apaga modelo. Títulos obrigatórios, modelo
sem etapas válido conforme tarefa vazia, lista inicialmente vazia. Commit antes
de sucesso, revisão obsoleta/alvo removido recusados, erro genérico/retry/draft,
offline e isolamento dos outros módulos preservados. Acesso real por Tarefas,
48dp/texto escalável/modo9/retornos. Catálogo pronto na #76, sem rede/dependência/
permissão/IA/histórico/execução automática nesta branch. Critérios RF-005–RF-007
originais preservados; aprovação de escopo não comprova implementação ou gate.

Questões transversais: [auditoria do backlog](../../docs/backlog-audit.md). Uma história só está Ready quando suas ambiguidades bloqueantes forem resolvidas no GitHub e refletidas aqui.

Refinamento delegado na [origem](https://github.com/Nosso-Espectro/aplicativo/issues/19#issuecomment-6159780574):
lista local inicialmente vazia, múltiplas tarefas com título livre obrigatório,
editor salvar/cancelar explícitos. Tarefa sem etapas válida, progresso0de0/0%,
não concluir automaticamente. Etapas com texto obrigatório/identidade estável,
adicionar/editar, subir/descer preservando texto/status, remover com confirmação.
Checkbox de conclusão reversível e progresso derivado das escolhas da pessoa,
sem execução automática ou inferência clínica. Remoção da tarefa inteira confirma
somente esse módulo. Estado confirmado depois do commit; erro genérico preserva
draft/versão confirmada, retry/duplicatas/revisão obsoleta recusada, dados removidos
não reaparecem por save antigo. SQLite privado schema1/fila/transação/readback/
rollback/reabertura/offline, sem histórico ou dados de outros módulos. Entrada
pelo quadro/rota própria/lista-editor-retorno, alvos48dp/texto escalável/contraste/
modo9. Modelos/catálogo/Q-TAREFA-02 permanecem [na #20](https://github.com/Nosso-Espectro/aplicativo/issues/20#issuecomment-6159780837),
não aprovar esses critérios nem a milestone por esta entrega. Tasks ainda pendentes.

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
| RF-008 | [#76](https://github.com/Nosso-Espectro/aplicativo/issues/76) | US-076 | T015 |
| RF-009 | [#76](https://github.com/Nosso-Espectro/aplicativo/issues/76) | US-076 | T016 |
| RF-010 | [#76](https://github.com/Nosso-Espectro/aplicativo/issues/76) | US-076 | T017 |
| RNF-001 | #19, #20 | Todas acima | Revisão por história em tasks.md |
| RNF-002 | #19, #20 | Todas acima | Revisão por história em tasks.md |
| RNF-003 | #19, #20 | Todas acima | Revisão por história em tasks.md |
| RNF-004 | #19, #20 | Todas acima | Revisão por história em tasks.md |

As tasks de testes cobrem os RFs da respectiva história. Branches previstas, commits, PRs e tags seguem o [workflow](../../docs/development-workflow.md) e o [índice](../README.md); nenhum desses artefatos Git foi criado nesta preparação.
