# Tasks — Foco / Pomodoro Flexível

Milestone #18: [spec.md](spec.md) e [plan.md](plan.md). Todas pendentes; não executadas nesta preparação.

Os módulos e diretórios de teste são propostos, sem extensão definida. Ajustar ao bootstrap real sem perder RF/Issue. Cada bloco pertence à branch da sua Issue; IDs T são locais à spec.

Executar somente depois da Definition of Ready. Não há marcação [P] nesta decomposição: arquivos/contratos ainda não existem e não é possível garantir independência. Uma task poderá ganhar [P] depois que a ausência de conflitos for demonstrada.

## US-025 — Issue #25

- [ ] T001 [US-025] Em `src/features/focus/pomodoro`, atender RF-001 (critério 1 de #25): Devem existir presets iniciais como 25/5 e 50/10. Verificar com o cenário correspondente no PR.
- [ ] T002 [US-025] Em `src/features/focus/pomodoro`, atender RF-002 (critério 2 de #25): O usuário deve poder iniciar, pausar, retomar e encerrar a sessão. Verificar com o cenário correspondente no PR.
- [ ] T003 [US-025] Em `src/features/focus/pomodoro`, atender RF-003 (critério 3 de #25): Ao terminar um período, o aplicativo deve informar a mudança para foco ou pausa. Verificar com o cenário correspondente no PR.
- [ ] T004 [US-025] Adicionar testes de comportamento de RF-001, RF-002, RF-003 em `tests/features/focus/pomodoro`; cobrir fluxo principal, ausência de dados e erros pertinentes descritos no spec, sem dados pessoais reais.
- [ ] T005 [US-025] Revisar RNF-001 a RNF-004 na interface/dados de #25, executar verificações aplicáveis e registrar evidências no PR; atualizar estas tasks somente após validação.

## US-026 — Issue #26

- [ ] T006 [US-026] Em `src/features/focus/stopwatch`, atender RF-004 (critério 1 de #26): O cronômetro deve iniciar em zero e contar o tempo decorrido. Verificar com o cenário correspondente no PR.
- [ ] T007 [US-026] Em `src/features/focus/stopwatch`, atender RF-005 (critério 2 de #26): Deve permitir pausar, retomar e finalizar. Verificar com o cenário correspondente no PR.
- [ ] T008 [US-026] Em `src/features/focus/stopwatch`, atender RF-006 (critério 3 de #26): O recurso não deve penalizar o usuário por sessões curtas ou interrompidas. Verificar com o cenário correspondente no PR.
- [ ] T009 [US-026] Adicionar testes de comportamento de RF-004, RF-005, RF-006 em `tests/features/focus/stopwatch`; cobrir fluxo principal, ausência de dados e erros pertinentes descritos no spec, sem dados pessoais reais.
- [ ] T010 [US-026] Revisar RNF-001 a RNF-004 na interface/dados de #26, executar verificações aplicáveis e registrar evidências no PR; atualizar estas tasks somente após validação.
