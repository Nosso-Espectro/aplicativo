# Tasks — Timer Visual de Transição

Milestone #14: [spec.md](spec.md) e [plan.md](plan.md). Todas pendentes; não executadas nesta preparação.

Os módulos e diretórios de teste são propostos, sem extensão definida. Ajustar ao bootstrap real sem perder RF/Issue. Cada bloco pertence à branch da sua Issue; IDs T são locais à spec.

Executar somente depois da Definition of Ready. Não há marcação [P] nesta decomposição: arquivos/contratos ainda não existem e não é possível garantir independência. Uma task poderá ganhar [P] depois que a ausência de conflitos for demonstrada.

## US-017 — Issue #17

- [ ] T001 [US-017] Em `src/features/transition-timer/visual-timer`, atender RF-001 (critério 1 de #17): Deve ser possível definir a duração do timer. Verificar com o cenário correspondente no PR.
- [ ] T002 [US-017] Em `src/features/transition-timer/visual-timer`, atender RF-002 (critério 2 de #17): O tempo restante deve ter representação visual além dos números. Verificar com o cenário correspondente no PR.
- [ ] T003 [US-017] Em `src/features/transition-timer/visual-timer`, atender RF-003 (critério 3 de #17): O timer deve permitir iniciar, pausar, retomar e cancelar. Verificar com o cenário correspondente no PR.
- [ ] T004 [US-017] Adicionar testes de comportamento de RF-001, RF-002, RF-003 em `tests/features/transition-timer/visual-timer`; cobrir fluxo principal, ausência de dados e erros pertinentes descritos no spec, sem dados pessoais reais.
- [ ] T005 [US-017] Revisar RNF-001 a RNF-004 na interface/dados de #17, executar verificações aplicáveis e registrar evidências no PR; atualizar estas tasks somente após validação.

## US-018 — Issue #18

- [ ] T006 [US-018] Em `src/features/transition-timer/progress-alerts`, atender RF-004 (critério 1 de #18): O usuário deve poder ativar avisos em marcos como 10, 5 e 2 minutos. Verificar com o cenário correspondente no PR.
- [ ] T007 [US-018] Em `src/features/transition-timer/progress-alerts`, atender RF-005 (critério 2 de #18): Os avisos devem respeitar configurações de som e vibração do usuário. Verificar com o cenário correspondente no PR.
- [ ] T008 [US-018] Em `src/features/transition-timer/progress-alerts`, atender RF-006 (critério 3 de #18): Deve ser possível desabilitar todos os avisos. Verificar com o cenário correspondente no PR.
- [ ] T009 [US-018] Adicionar testes de comportamento de RF-004, RF-005, RF-006 em `tests/features/transition-timer/progress-alerts`; cobrir fluxo principal, ausência de dados e erros pertinentes descritos no spec, sem dados pessoais reais.
- [ ] T010 [US-018] Revisar RNF-001 a RNF-004 na interface/dados de #18, executar verificações aplicáveis e registrar evidências no PR; atualizar estas tasks somente após validação.
