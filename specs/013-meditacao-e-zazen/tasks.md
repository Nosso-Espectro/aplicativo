# Tasks — Meditação e Zazen

Milestone #21: [spec.md](spec.md) e [plan.md](plan.md). Todas pendentes; não executadas nesta preparação.

Os módulos e diretórios de teste são propostos, sem extensão definida. Ajustar ao bootstrap real sem perder RF/Issue. Cada bloco pertence à branch da sua Issue; IDs T são locais à spec.

Executar somente depois da Definition of Ready. Não há marcação [P] nesta decomposição: arquivos/contratos ainda não existem e não é possível garantir independência. Uma task poderá ganhar [P] depois que a ausência de conflitos for demonstrada.

## US-031 — Issue #31

- [ ] T001 [US-031] Em `src/features/meditation/meditation-timer`, atender RF-001 (critério 1 de #31): O usuário deve poder escolher a duração. Verificar com o cenário correspondente no PR.
- [ ] T002 [US-031] Em `src/features/meditation/meditation-timer`, atender RF-002 (critério 2 de #31): A tela durante a prática deve ser minimalista. Verificar com o cenário correspondente no PR.
- [ ] T003 [US-031] Em `src/features/meditation/meditation-timer`, atender RF-003 (critério 3 de #31): O final da sessão deve usar um aviso discreto e configurável. Verificar com o cenário correspondente no PR.
- [ ] T004 [US-031] Adicionar testes de comportamento de RF-001, RF-002, RF-003 em `tests/features/meditation/meditation-timer`; cobrir fluxo principal, ausência de dados e erros pertinentes descritos no spec, sem dados pessoais reais.
- [ ] T005 [US-031] Revisar RNF-001 a RNF-004 na interface/dados de #31, executar verificações aplicáveis e registrar evidências no PR; atualizar estas tasks somente após validação.

## US-032 — Issue #32

- [ ] T006 [US-032] Em `src/features/meditation/zazen-guide`, atender RF-004 (critério 1 de #32): O conteúdo deve explicar postura, respiração e início da prática de maneira introdutória. Verificar com o cenário correspondente no PR.
- [ ] T007 [US-032] Em `src/features/meditation/zazen-guide`, atender RF-005 (critério 2 de #32): O guia deve funcionar offline. Verificar com o cenário correspondente no PR.
- [ ] T008 [US-032] Em `src/features/meditation/zazen-guide`, atender RF-006 (critério 3 de #32): O conteúdo não deve apresentar a prática como tratamento médico ou psicológico. Verificar com o cenário correspondente no PR.
- [ ] T009 [US-032] Adicionar testes de comportamento de RF-004, RF-005, RF-006 em `tests/features/meditation/zazen-guide`; cobrir fluxo principal, ausência de dados e erros pertinentes descritos no spec, sem dados pessoais reais.
- [ ] T010 [US-032] Revisar RNF-001 a RNF-004 na interface/dados de #32, executar verificações aplicáveis e registrar evidências no PR; atualizar estas tasks somente após validação.
