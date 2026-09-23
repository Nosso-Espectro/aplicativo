# Tasks — Histórico e Autoconhecimento

Milestone #24: [spec.md](spec.md) e [plan.md](plan.md). Todas pendentes; não executadas nesta preparação.

Os módulos e diretórios de teste são propostos, sem extensão definida. Ajustar ao bootstrap real sem perder RF/Issue. Cada bloco pertence à branch da sua Issue; IDs T são locais à spec.

Executar somente depois da Definition of Ready. Não há marcação [P] nesta decomposição: arquivos/contratos ainda não existem e não é possível garantir independência. Uma task poderá ganhar [P] depois que a ausência de conflitos for demonstrada.

## US-038 — Issue #38

- [ ] T001 [US-038] Em `src/features/history/record-list`, atender RF-001 (critério 1 de #38): O histórico deve apresentar registros em ordem cronológica. Verificar com o cenário correspondente no PR.
- [ ] T002 [US-038] Em `src/features/history/record-list`, atender RF-002 (critério 2 de #38): O usuário deve conseguir filtrar por tipo de registro. Verificar com o cenário correspondente no PR.
- [ ] T003 [US-038] Em `src/features/history/record-list`, atender RF-003 (critério 3 de #38): A apresentação não deve inferir diagnóstico ou causa clínica. Verificar com o cenário correspondente no PR.
- [ ] T004 [US-038] Adicionar testes de comportamento de RF-001, RF-002, RF-003 em `tests/features/history/record-list`; cobrir fluxo principal, ausência de dados e erros pertinentes descritos no spec, sem dados pessoais reais.
- [ ] T005 [US-038] Revisar RNF-001 a RNF-004 na interface/dados de #38, executar verificações aplicáveis e registrar evidências no PR; atualizar estas tasks somente após validação.

## US-039 — Issue #39

- [ ] T006 [US-039] Em `src/features/history/trends`, atender RF-004 (critério 1 de #39): As tendências devem usar apenas dados registrados pelo próprio usuário. Verificar com o cenário correspondente no PR.
- [ ] T007 [US-039] Em `src/features/history/trends`, atender RF-005 (critério 2 de #39): O aplicativo deve diferenciar claramente contagem/tendência de interpretação clínica. Verificar com o cenário correspondente no PR.
- [ ] T008 [US-039] Em `src/features/history/trends`, atender RF-006 (critério 3 de #39): O usuário deve poder escolher o período analisado. Verificar com o cenário correspondente no PR.
- [ ] T009 [US-039] Adicionar testes de comportamento de RF-004, RF-005, RF-006 em `tests/features/history/trends`; cobrir fluxo principal, ausência de dados e erros pertinentes descritos no spec, sem dados pessoais reais.
- [ ] T010 [US-039] Revisar RNF-001 a RNF-004 na interface/dados de #39, executar verificações aplicáveis e registrar evidências no PR; atualizar estas tasks somente após validação.

## US-040 — Issue #40

- [ ] T011 [US-040] Em `src/features/history/record-deletion`, atender RF-007 (critério 1 de #40): Deve ser possível excluir um registro individual. Verificar com o cenário correspondente no PR.
- [ ] T012 [US-040] Em `src/features/history/record-deletion`, atender RF-008 (critério 2 de #40): Deve existir opção para excluir todo o histórico mediante confirmação explícita. Verificar com o cenário correspondente no PR.
- [ ] T013 [US-040] Em `src/features/history/record-deletion`, atender RF-009 (critério 3 de #40): A exclusão deve atualizar imediatamente as visualizações derivadas. Verificar com o cenário correspondente no PR.
- [ ] T014 [US-040] Adicionar testes de comportamento de RF-007, RF-008, RF-009 em `tests/features/history/record-deletion`; cobrir fluxo principal, ausência de dados e erros pertinentes descritos no spec, sem dados pessoais reais.
- [ ] T015 [US-040] Revisar RNF-001 a RNF-004 na interface/dados de #40, executar verificações aplicáveis e registrar evidências no PR; atualizar estas tasks somente após validação.
