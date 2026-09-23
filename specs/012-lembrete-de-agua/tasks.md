# Tasks — Lembrete de Água

Milestone #20: [spec.md](spec.md) e [plan.md](plan.md). Todas pendentes; não executadas nesta preparação.

Os módulos e diretórios de teste são propostos, sem extensão definida. Ajustar ao bootstrap real sem perder RF/Issue. Cada bloco pertence à branch da sua Issue; IDs T são locais à spec.

Executar somente depois da Definition of Ready. Não há marcação [P] nesta decomposição: arquivos/contratos ainda não existem e não é possível garantir independência. Uma task poderá ganhar [P] depois que a ausência de conflitos for demonstrada.

## US-029 — Issue #29

- [ ] T001 [US-029] Em `src/features/hydration/reminder-settings`, atender RF-001 (critério 1 de #29): O usuário deve poder definir intervalo ou horários. Verificar com o cenário correspondente no PR.
- [ ] T002 [US-029] Em `src/features/hydration/reminder-settings`, atender RF-002 (critério 2 de #29): As notificações devem ser locais. Verificar com o cenário correspondente no PR.
- [ ] T003 [US-029] Em `src/features/hydration/reminder-settings`, atender RF-003 (critério 3 de #29): Deve ser possível ativar, pausar e desativar lembretes. Verificar com o cenário correspondente no PR.
- [ ] T004 [US-029] Em `src/features/hydration/reminder-settings`, atender RF-004 (critério 4 de #29): O recurso não deve exigir criação de conta. Verificar com o cenário correspondente no PR.
- [ ] T005 [US-029] Adicionar testes de comportamento de RF-001, RF-002, RF-003, RF-004 em `tests/features/hydration/reminder-settings`; cobrir fluxo principal, ausência de dados e erros pertinentes descritos no spec, sem dados pessoais reais.
- [ ] T006 [US-029] Revisar RNF-001 a RNF-004 na interface/dados de #29, executar verificações aplicáveis e registrar evidências no PR; atualizar estas tasks somente após validação.

## US-030 — Issue #30

- [ ] T007 [US-030] Em `src/features/hydration/quiet-hours`, atender RF-005 (critério 1 de #30): Deve ser possível definir início e fim do período silencioso. Verificar com o cenário correspondente no PR.
- [ ] T008 [US-030] Em `src/features/hydration/quiet-hours`, atender RF-006 (critério 2 de #30): Nenhuma notificação de hidratação deve ser emitida nesse intervalo. Verificar com o cenário correspondente no PR.
- [ ] T009 [US-030] Em `src/features/hydration/quiet-hours`, atender RF-007 (critério 3 de #30): A configuração deve persistir localmente. Verificar com o cenário correspondente no PR.
- [ ] T010 [US-030] Adicionar testes de comportamento de RF-005, RF-006, RF-007 em `tests/features/hydration/quiet-hours`; cobrir fluxo principal, ausência de dados e erros pertinentes descritos no spec, sem dados pessoais reais.
- [ ] T011 [US-030] Revisar RNF-001 a RNF-004 na interface/dados de #30, executar verificações aplicáveis e registrar evidências no PR; atualizar estas tasks somente após validação.
