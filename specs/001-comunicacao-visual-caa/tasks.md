# Tasks — Comunicação Visual / CAA

Milestone #9: [spec.md](spec.md) e [plan.md](plan.md). Todas pendentes; não executadas nesta preparação.

Os módulos e diretórios de teste são propostos, sem extensão definida. Ajustar ao bootstrap real sem perder RF/Issue. Cada bloco pertence à branch da sua Issue; IDs T são locais à spec.

Executar somente depois da Definition of Ready. Não há marcação [P] nesta decomposição: arquivos/contratos ainda não existem e não é possível garantir independência. Uma task poderá ganhar [P] depois que a ausência de conflitos for demonstrada.

## US-001 — Issue #1

- [ ] T001 [US-001] Em `src/features/communication/card-board`, atender RF-001 (critério 1 de #1): Ao abrir o módulo, devo visualizar categorias e cartões essenciais sem necessidade de internet. Verificar com o cenário correspondente no PR.
- [ ] T002 [US-001] Em `src/features/communication/card-board`, atender RF-002 (critério 2 de #1): Devem existir cartões iniciais para sim, não, ajuda, água, banheiro, fome, dor, silêncio, sair daqui e preciso de tempo. Verificar com o cenário correspondente no PR.
- [ ] T003 [US-001] Em `src/features/communication/card-board`, atender RF-003 (critério 3 de #1): Cada cartão deve apresentar pictograma ou imagem, texto legível e área de toque ampla. Verificar com o cenário correspondente no PR.
- [ ] T004 [US-001] Em `src/features/communication/card-board`, atender RF-004 (critério 4 de #1): O usuário deve conseguir navegar pelo quadro com poucos toques. Verificar com o cenário correspondente no PR.
- [ ] T005 [US-001] Adicionar testes de comportamento de RF-001, RF-002, RF-003, RF-004 em `tests/features/communication/card-board`; cobrir fluxo principal, ausência de dados e erros pertinentes descritos no spec, sem dados pessoais reais.
- [ ] T006 [US-001] Revisar RNF-001 a RNF-004 na interface/dados de #1, executar verificações aplicáveis e registrar evidências no PR; atualizar estas tasks somente após validação.

## US-002 — Issue #2

- [ ] T007 [US-002] Em `src/features/communication/sentence`, atender RF-005 (critério 1 de #2): Os cartões selecionados devem aparecer em uma área de frase na ordem escolhida. Verificar com o cenário correspondente no PR.
- [ ] T008 [US-002] Em `src/features/communication/sentence`, atender RF-006 (critério 2 de #2): Deve ser possível remover um cartão individual sem apagar toda a frase. Verificar com o cenário correspondente no PR.
- [ ] T009 [US-002] Em `src/features/communication/sentence`, atender RF-007 (critério 3 de #2): Deve existir ação para limpar toda a frase. Verificar com o cenário correspondente no PR.
- [ ] T010 [US-002] Em `src/features/communication/sentence`, atender RF-008 (critério 4 de #2): A frase montada deve permanecer disponível enquanto o usuário navega entre categorias. Verificar com o cenário correspondente no PR.
- [ ] T011 [US-002] Adicionar testes de comportamento de RF-005, RF-006, RF-007, RF-008 em `tests/features/communication/sentence`; cobrir fluxo principal, ausência de dados e erros pertinentes descritos no spec, sem dados pessoais reais.
- [ ] T012 [US-002] Revisar RNF-001 a RNF-004 na interface/dados de #2, executar verificações aplicáveis e registrar evidências no PR; atualizar estas tasks somente após validação.

## US-003 — Issue #3

- [ ] T013 [US-003] Em `src/features/communication/speech`, atender RF-009 (critério 1 de #3): Deve existir um botão claro para reproduzir a frase montada. Verificar com o cenário correspondente no PR.
- [ ] T014 [US-003] Em `src/features/communication/speech`, atender RF-010 (critério 2 de #3): A leitura deve utilizar o mecanismo de Text-to-Speech disponível no dispositivo. Verificar com o cenário correspondente no PR.
- [ ] T015 [US-003] Em `src/features/communication/speech`, atender RF-011 (critério 3 de #3): A ausência de voz instalada deve gerar orientação compreensível, sem travar o aplicativo. Verificar com o cenário correspondente no PR.
- [ ] T016 [US-003] Em `src/features/communication/speech`, atender RF-012 (critério 4 de #3): O recurso deve funcionar sem depender de um servidor remoto. Verificar com o cenário correspondente no PR.
- [ ] T017 [US-003] Adicionar testes de comportamento de RF-009, RF-010, RF-011, RF-012 em `tests/features/communication/speech`; cobrir fluxo principal, ausência de dados e erros pertinentes descritos no spec, sem dados pessoais reais.
- [ ] T018 [US-003] Revisar RNF-001 a RNF-004 na interface/dados de #3, executar verificações aplicáveis e registrar evidências no PR; atualizar estas tasks somente após validação.

## US-004 — Issue #4

- [ ] T019 [US-004] Em `src/features/communication/custom-cards`, atender RF-013 (critério 1 de #4): Deve ser possível criar cartão com título e categoria. Verificar com o cenário correspondente no PR.
- [ ] T020 [US-004] Em `src/features/communication/custom-cards`, atender RF-014 (critério 2 de #4): A imagem deve ser opcional e poder vir de arquivo ou câmera quando suportado. Verificar com o cenário correspondente no PR.
- [ ] T021 [US-004] Em `src/features/communication/custom-cards`, atender RF-015 (critério 3 de #4): Deve ser possível editar e excluir cartões personalizados. Verificar com o cenário correspondente no PR.
- [ ] T022 [US-004] Em `src/features/communication/custom-cards`, atender RF-016 (critério 4 de #4): Cartões personalizados devem permanecer salvos localmente após fechar o aplicativo. Verificar com o cenário correspondente no PR.
- [ ] T023 [US-004] Adicionar testes de comportamento de RF-013, RF-014, RF-015, RF-016 em `tests/features/communication/custom-cards`; cobrir fluxo principal, ausência de dados e erros pertinentes descritos no spec, sem dados pessoais reais.
- [ ] T024 [US-004] Revisar RNF-001 a RNF-004 na interface/dados de #4, executar verificações aplicáveis e registrar evidências no PR; atualizar estas tasks somente após validação.

## US-005 — Issue #5

- [ ] T025 [US-005] Em `src/features/communication/favorites`, atender RF-017 (critério 1 de #5): Qualquer cartão deve poder ser marcado ou desmarcado como favorito. Verificar com o cenário correspondente no PR.
- [ ] T026 [US-005] Em `src/features/communication/favorites`, atender RF-018 (critério 2 de #5): Deve existir uma área de favoritos acessível diretamente no módulo. Verificar com o cenário correspondente no PR.
- [ ] T027 [US-005] Em `src/features/communication/favorites`, atender RF-019 (critério 3 de #5): A ordem dos favoritos deve ser persistida localmente. Verificar com o cenário correspondente no PR.
- [ ] T028 [US-005] Adicionar testes de comportamento de RF-017, RF-018, RF-019 em `tests/features/communication/favorites`; cobrir fluxo principal, ausência de dados e erros pertinentes descritos no spec, sem dados pessoais reais.
- [ ] T029 [US-005] Revisar RNF-001 a RNF-004 na interface/dados de #5, executar verificações aplicáveis e registrar evidências no PR; atualizar estas tasks somente após validação.
