# Tasks — Plano de Apoio / Crise

Milestone #12: [spec.md](spec.md) e [plan.md](plan.md). Todas pendentes; não executadas nesta preparação.

Os módulos e diretórios de teste são propostos, sem extensão definida. Ajustar ao bootstrap real sem perder RF/Issue. Cada bloco pertence à branch da sua Issue; IDs T são locais à spec.

Executar somente depois da Definition of Ready. Não há marcação [P] nesta decomposição: arquivos/contratos ainda não existem e não é possível garantir independência. Uma task poderá ganhar [P] depois que a ausência de conflitos for demonstrada.

## US-011 — Issue #11

- [ ] T001 [US-011] Em `src/features/support-plan/plan-editor`, atender RF-001 (critério 1 de #11): O usuário deve poder cadastrar orientações livres e selecionar orientações sugeridas. Verificar com o cenário correspondente no PR.
- [ ] T002 [US-011] Em `src/features/support-plan/plan-editor`, atender RF-002 (critério 2 de #11): Devem existir exemplos como não me toque, fale pouco, preciso de silêncio e dê-me tempo para responder. Verificar com o cenário correspondente no PR.
- [ ] T003 [US-011] Em `src/features/support-plan/plan-editor`, atender RF-003 (critério 3 de #11): O plano deve poder ser editado a qualquer momento. Verificar com o cenário correspondente no PR.
- [ ] T004 [US-011] Em `src/features/support-plan/plan-editor`, atender RF-004 (critério 4 de #11): O conteúdo deve ficar salvo localmente por padrão. Verificar com o cenário correspondente no PR.
- [ ] T005 [US-011] Adicionar testes de comportamento de RF-001, RF-002, RF-003, RF-004 em `tests/features/support-plan/plan-editor`; cobrir fluxo principal, ausência de dados e erros pertinentes descritos no spec, sem dados pessoais reais.
- [ ] T006 [US-011] Revisar RNF-001 a RNF-004 na interface/dados de #11, executar verificações aplicáveis e registrar evidências no PR; atualizar estas tasks somente após validação.

## US-012 — Issue #12

- [ ] T007 [US-012] Em `src/features/support-plan/support-card`, atender RF-005 (critério 1 de #12): Deve existir uma visualização em tela cheia. Verificar com o cenário correspondente no PR.
- [ ] T008 [US-012] Em `src/features/support-plan/support-card`, atender RF-006 (critério 2 de #12): A visualização deve priorizar texto grande e alto contraste. Verificar com o cenário correspondente no PR.
- [ ] T009 [US-012] Em `src/features/support-plan/support-card`, atender RF-007 (critério 3 de #12): Deve haver acesso direto a partir do painel de regulação. Verificar com o cenário correspondente no PR.
- [ ] T010 [US-012] Adicionar testes de comportamento de RF-005, RF-006, RF-007 em `tests/features/support-plan/support-card`; cobrir fluxo principal, ausência de dados e erros pertinentes descritos no spec, sem dados pessoais reais.
- [ ] T011 [US-012] Revisar RNF-001 a RNF-004 na interface/dados de #12, executar verificações aplicáveis e registrar evidências no PR; atualizar estas tasks somente após validação.

## US-013 — Issue #13

- [ ] T012 [US-013] Em `src/features/support-plan/trusted-contact`, atender RF-008 (critério 1 de #13): O usuário deve poder cadastrar um contato e uma mensagem padrão. Verificar com o cenário correspondente no PR.
- [ ] T013 [US-013] Em `src/features/support-plan/trusted-contact`, atender RF-009 (critério 2 de #13): Ao acionar o recurso, o aplicativo deve abrir o WhatsApp ou mecanismo compatível com a mensagem preenchida. Verificar com o cenário correspondente no PR.
- [ ] T014 [US-013] Em `src/features/support-plan/trusted-contact`, atender RF-010 (critério 3 de #13): O envio final deve permanecer sob controle do usuário. Verificar com o cenário correspondente no PR.
- [ ] T015 [US-013] Em `src/features/support-plan/trusted-contact`, atender RF-011 (critério 4 de #13): Se o WhatsApp não estiver disponível, o aplicativo deve informar isso sem falhar. Verificar com o cenário correspondente no PR.
- [ ] T016 [US-013] Adicionar testes de comportamento de RF-008, RF-009, RF-010, RF-011 em `tests/features/support-plan/trusted-contact`; cobrir fluxo principal, ausência de dados e erros pertinentes descritos no spec, sem dados pessoais reais.
- [ ] T017 [US-013] Revisar RNF-001 a RNF-004 na interface/dados de #13, executar verificações aplicáveis e registrar evidências no PR; atualizar estas tasks somente após validação.
