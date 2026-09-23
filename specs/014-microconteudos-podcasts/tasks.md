# Tasks — Microconteúdos / Podcasts

Milestone #22: [spec.md](spec.md) e [plan.md](plan.md). Todas pendentes; não executadas nesta preparação.

Os módulos e diretórios de teste são propostos, sem extensão definida. Ajustar ao bootstrap real sem perder RF/Issue. Cada bloco pertence à branch da sua Issue; IDs T são locais à spec.

Executar somente depois da Definition of Ready. Não há marcação [P] nesta decomposição: arquivos/contratos ainda não existem e não é possível garantir independência. Uma task poderá ganhar [P] depois que a ausência de conflitos for demonstrada.

## US-033 — Issue #33

- [ ] T001 [US-033] Em `src/features/micro-podcasts/episode-list`, atender RF-001 (critério 1 de #33): Os episódios devem apresentar título, duração e descrição curta. Verificar com o cenário correspondente no PR.
- [ ] T002 [US-033] Em `src/features/micro-podcasts/episode-list`, atender RF-002 (critério 2 de #33): A lista deve indicar claramente conteúdos já reproduzidos quando essa informação existir. Verificar com o cenário correspondente no PR.
- [ ] T003 [US-033] Em `src/features/micro-podcasts/episode-list`, atender RF-003 (critério 3 de #33): A ausência de conexão deve ser tratada de forma compreensível. Verificar com o cenário correspondente no PR.
- [ ] T004 [US-033] Adicionar testes de comportamento de RF-001, RF-002, RF-003 em `tests/features/micro-podcasts/episode-list`; cobrir fluxo principal, ausência de dados e erros pertinentes descritos no spec, sem dados pessoais reais.
- [ ] T005 [US-033] Revisar RNF-001 a RNF-004 na interface/dados de #33, executar verificações aplicáveis e registrar evidências no PR; atualizar estas tasks somente após validação.

## US-034 — Issue #34

- [ ] T006 [US-034] Em `src/features/micro-podcasts/episode-player`, atender RF-004 (critério 1 de #34): O player deve permitir reproduzir, pausar e avançar ou retroceder. Verificar com o cenário correspondente no PR.
- [ ] T007 [US-034] Em `src/features/micro-podcasts/episode-player`, atender RF-005 (critério 2 de #34): A posição de reprodução deve ser mantida durante a sessão. Verificar com o cenário correspondente no PR.
- [ ] T008 [US-034] Em `src/features/micro-podcasts/episode-player`, atender RF-006 (critério 3 de #34): O usuário deve conseguir retornar à lista sem perder o controle básico do áudio. Verificar com o cenário correspondente no PR.
- [ ] T009 [US-034] Adicionar testes de comportamento de RF-004, RF-005, RF-006 em `tests/features/micro-podcasts/episode-player`; cobrir fluxo principal, ausência de dados e erros pertinentes descritos no spec, sem dados pessoais reais.
- [ ] T010 [US-034] Revisar RNF-001 a RNF-004 na interface/dados de #34, executar verificações aplicáveis e registrar evidências no PR; atualizar estas tasks somente após validação.
