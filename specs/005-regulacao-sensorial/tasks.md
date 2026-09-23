# Tasks — Regulação Sensorial

Milestone #11: [spec.md](spec.md) e [plan.md](plan.md). Todas pendentes; não executadas nesta preparação.

Os módulos e diretórios de teste são propostos, sem extensão definida. Ajustar ao bootstrap real sem perder RF/Issue. Cada bloco pertence à branch da sua Issue; IDs T são locais à spec.

Executar somente depois da Definition of Ready. Não há marcação [P] nesta decomposição: arquivos/contratos ainda não existem e não é possível garantir independência. Uma task poderá ganhar [P] depois que a ausência de conflitos for demonstrada.

## US-009 — Issue #9

- [ ] T001 [US-009] Em `src/features/regulation/low-stimulation`, atender RF-001 (critério 1 de #9): O modo deve reduzir animações e elementos não essenciais. Verificar com o cenário correspondente no PR.
- [ ] T002 [US-009] Em `src/features/regulation/low-stimulation`, atender RF-002 (critério 2 de #9): A interface deve manter contraste suficiente e legibilidade. Verificar com o cenário correspondente no PR.
- [ ] T003 [US-009] Em `src/features/regulation/low-stimulation`, atender RF-003 (critério 3 de #9): O usuário deve conseguir ativar e desativar o modo rapidamente. Verificar com o cenário correspondente no PR.
- [ ] T004 [US-009] Em `src/features/regulation/low-stimulation`, atender RF-004 (critério 4 de #9): A preferência deve persistir entre sessões. Verificar com o cenário correspondente no PR.
- [ ] T005 [US-009] Adicionar testes de comportamento de RF-001, RF-002, RF-003, RF-004 em `tests/features/regulation/low-stimulation`; cobrir fluxo principal, ausência de dados e erros pertinentes descritos no spec, sem dados pessoais reais.
- [ ] T006 [US-009] Revisar RNF-001 a RNF-004 na interface/dados de #9, executar verificações aplicáveis e registrar evidências no PR; atualizar estas tasks somente após validação.

## US-010 — Issue #10

- [ ] T007 [US-010] Em `src/features/regulation/quick-panel`, atender RF-005 (critério 1 de #10): O painel deve oferecer atalhos para comunicação, sons, temporizador e contato de apoio. Verificar com o cenário correspondente no PR.
- [ ] T008 [US-010] Em `src/features/regulation/quick-panel`, atender RF-006 (critério 2 de #10): O painel deve ser acessível a partir da tela inicial. Verificar com o cenário correspondente no PR.
- [ ] T009 [US-010] Em `src/features/regulation/quick-panel`, atender RF-007 (critério 3 de #10): Os controles devem possuir alvos de toque amplos e textos objetivos. Verificar com o cenário correspondente no PR.
- [ ] T010 [US-010] Adicionar testes de comportamento de RF-005, RF-006, RF-007 em `tests/features/regulation/quick-panel`; cobrir fluxo principal, ausência de dados e erros pertinentes descritos no spec, sem dados pessoais reais.
- [ ] T011 [US-010] Revisar RNF-001 a RNF-004 na interface/dados de #10, executar verificações aplicáveis e registrar evidências no PR; atualizar estas tasks somente após validação.
