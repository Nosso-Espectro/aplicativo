# Tasks — Perfil de Comunicação

Milestone #13: [spec.md](spec.md) e [plan.md](plan.md). Todas pendentes; não executadas nesta preparação.

Os módulos e diretórios de teste são propostos, sem extensão definida. Ajustar ao bootstrap real sem perder RF/Issue. Cada bloco pertence à branch da sua Issue; IDs T são locais à spec.

Executar somente depois da Definition of Ready. Não há marcação [P] nesta decomposição: arquivos/contratos ainda não existem e não é possível garantir independência. Uma task poderá ganhar [P] depois que a ausência de conflitos for demonstrada.

## US-014 — Issue #14

- [ ] T001 [US-014] Em `src/features/communication-profile/preferences`, atender RF-001 (critério 1 de #14): O perfil deve permitir registrar formas preferidas de comunicação. Verificar com o cenário correspondente no PR.
- [ ] T002 [US-014] Em `src/features/communication-profile/preferences`, atender RF-002 (critério 2 de #14): Deve ser possível informar necessidade de tempo adicional para responder. Verificar com o cenário correspondente no PR.
- [ ] T003 [US-014] Em `src/features/communication-profile/preferences`, atender RF-003 (critério 3 de #14): Deve ser possível editar e remover informações. Verificar com o cenário correspondente no PR.
- [ ] T004 [US-014] Em `src/features/communication-profile/preferences`, atender RF-004 (critério 4 de #14): Os dados devem permanecer locais por padrão. Verificar com o cenário correspondente no PR.
- [ ] T005 [US-014] Adicionar testes de comportamento de RF-001, RF-002, RF-003, RF-004 em `tests/features/communication-profile/preferences`; cobrir fluxo principal, ausência de dados e erros pertinentes descritos no spec, sem dados pessoais reais.
- [ ] T006 [US-014] Revisar RNF-001 a RNF-004 na interface/dados de #14, executar verificações aplicáveis e registrar evidências no PR; atualizar estas tasks somente após validação.

## US-015 — Issue #15

- [ ] T007 [US-015] Em `src/features/communication-profile/sensitivities`, atender RF-005 (critério 1 de #15): Deve ser possível registrar sensibilidades relacionadas a som, luz, toque, temperatura e outras. Verificar com o cenário correspondente no PR.
- [ ] T008 [US-015] Em `src/features/communication-profile/sensitivities`, atender RF-006 (critério 2 de #15): Deve ser possível registrar estratégias que ajudam e estratégias que devem ser evitadas. Verificar com o cenário correspondente no PR.
- [ ] T009 [US-015] Em `src/features/communication-profile/sensitivities`, atender RF-007 (critério 3 de #15): As informações devem poder ser reutilizadas no Plano de Apoio. Verificar com o cenário correspondente no PR.
- [ ] T010 [US-015] Adicionar testes de comportamento de RF-005, RF-006, RF-007 em `tests/features/communication-profile/sensitivities`; cobrir fluxo principal, ausência de dados e erros pertinentes descritos no spec, sem dados pessoais reais.
- [ ] T011 [US-015] Revisar RNF-001 a RNF-004 na interface/dados de #15, executar verificações aplicáveis e registrar evidências no PR; atualizar estas tasks somente após validação.

## US-016 — Issue #16

- [ ] T012 [US-016] Em `src/features/communication-profile/profile-summary`, atender RF-008 (critério 1 de #16): A visualização deve selecionar apenas informações marcadas pelo usuário para compartilhamento. Verificar com o cenário correspondente no PR.
- [ ] T013 [US-016] Em `src/features/communication-profile/profile-summary`, atender RF-009 (critério 2 de #16): O resumo deve ser legível em tela cheia. Verificar com o cenário correspondente no PR.
- [ ] T014 [US-016] Em `src/features/communication-profile/profile-summary`, atender RF-010 (critério 3 de #16): Nenhuma informação deve ser compartilhada automaticamente. Verificar com o cenário correspondente no PR.
- [ ] T015 [US-016] Adicionar testes de comportamento de RF-008, RF-009, RF-010 em `tests/features/communication-profile/profile-summary`; cobrir fluxo principal, ausência de dados e erros pertinentes descritos no spec, sem dados pessoais reais.
- [ ] T016 [US-016] Revisar RNF-001 a RNF-004 na interface/dados de #16, executar verificações aplicáveis e registrar evidências no PR; atualizar estas tasks somente após validação.
