# Tasks — Divisor de Tarefas

Milestone #15: [spec.md](spec.md) e [plan.md](plan.md). Todas pendentes; não executadas nesta preparação.

Os módulos e diretórios de teste são propostos, sem extensão definida. Ajustar ao bootstrap real sem perder RF/Issue. Cada bloco pertence à branch da sua Issue; IDs T são locais à spec.

Executar somente depois da Definition of Ready. Não há marcação [P] nesta decomposição: arquivos/contratos ainda não existem e não é possível garantir independência. Uma task poderá ganhar [P] depois que a ausência de conflitos for demonstrada.

## US-019 — Issue #19

- [ ] T001 [US-019] Em `src/features/task-breakdown/task-editor`, atender RF-001 (critério 1 de #19): Deve ser possível criar uma tarefa principal. Verificar com o cenário correspondente no PR.
- [ ] T002 [US-019] Em `src/features/task-breakdown/task-editor`, atender RF-002 (critério 2 de #19): O usuário deve poder adicionar, editar, ordenar e remover subtarefas. Verificar com o cenário correspondente no PR.
- [ ] T003 [US-019] Em `src/features/task-breakdown/task-editor`, atender RF-003 (critério 3 de #19): Cada subtarefa deve poder ser marcada como concluída. Verificar com o cenário correspondente no PR.
- [ ] T004 [US-019] Em `src/features/task-breakdown/task-editor`, atender RF-004 (critério 4 de #19): O progresso da tarefa deve ser persistido localmente. Verificar com o cenário correspondente no PR.
- [ ] T005 [US-019] Adicionar testes de comportamento de RF-001, RF-002, RF-003, RF-004 em `tests/features/task-breakdown/task-editor`; cobrir fluxo principal, ausência de dados e erros pertinentes descritos no spec, sem dados pessoais reais.
- [ ] T006 [US-019] Revisar RNF-001 a RNF-004 na interface/dados de #19, executar verificações aplicáveis e registrar evidências no PR; atualizar estas tasks somente após validação.

## US-020 — Issue #20

- [ ] T007 [US-020] Em `src/features/task-breakdown/task-templates`, atender RF-005 (critério 1 de #20): Uma tarefa existente deve poder ser salva como modelo. Verificar com o cenário correspondente no PR.
- [ ] T008 [US-020] Em `src/features/task-breakdown/task-templates`, atender RF-006 (critério 2 de #20): O usuário deve poder criar nova tarefa a partir do modelo. Verificar com o cenário correspondente no PR.
- [ ] T009 [US-020] Em `src/features/task-breakdown/task-templates`, atender RF-007 (critério 3 de #20): Editar uma cópia criada do modelo não deve alterar o modelo original. Verificar com o cenário correspondente no PR.
- [ ] T010 [US-020] Adicionar testes de comportamento de RF-005, RF-006, RF-007 em `tests/features/task-breakdown/task-templates`; cobrir fluxo principal, ausência de dados e erros pertinentes descritos no spec, sem dados pessoais reais.
- [ ] T011 [US-020] Revisar RNF-001 a RNF-004 na interface/dados de #20, executar verificações aplicáveis e registrar evidências no PR; atualizar estas tasks somente após validação.
