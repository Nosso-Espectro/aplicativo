# Tasks — Perfil de Comunicação

Milestone #13: [spec.md](spec.md) e [plan.md](plan.md). Progresso marcado somente após verificações; validações nativas/assistivas ainda pendentes no gate.

Os módulos e diretórios de teste são propostos, sem extensão definida. Ajustar ao bootstrap real sem perder RF/Issue. Cada bloco pertence à branch da sua Issue; IDs T são locais à spec.

Executar somente depois da Definition of Ready. Não há marcação [P] nesta decomposição: arquivos/contratos ainda não existem e não é possível garantir independência. Uma task poderá ganhar [P] depois que a ausência de conflitos for demonstrada.

## US-014 — Issue #14

- [x] T001 [US-014] Implementar RF-001 em `src/features/communication-profile/PreferencesScreen.tsx`: texto livre de comunicação/recebimento, campos opcionais, edição e salvamento explícitos testados.
- [x] T002 [US-014] Implementar RF-002: tri-state não informado/preciso/não preciso com radios acessíveis, distinção NULL/1/0 verificada em banco/componentes.
- [x] T003 [US-014] Implementar RF-003: editar/limpar campos, confirmar remoção integral e preservar estado em falha/cancelamento, com retry testado.
- [x] T004 [US-014] Implementar RF-004 em `preferences-database.ts`: SQLite privado local, UPSERT parametrizado e transação/fila; reabertura/rollback verificados no SQLite do Node, sem chamadas de rede.
- [x] T005 [US-014] Adicionar testes em `tests/features/communication-profile/`: cinco SQLite real e seis componentes, total 135 testes/24 suítes aprovado.
- [ ] T006 [US-014] Revisar RNF-001 a RNF-004 na interface/dados de #14, executar verificações aplicáveis e registrar evidências no PR; atualizar estas tasks somente após validação.

T006: revisão estática de rótulos, contraste, alvos 48dp, texto escalável, ausência
de mídia/transmissão/logs pessoais e controle explícito realizada. Leitor de tela,
foco/teclado/ampliação, reabertura offline e política de backup do sistema ainda
pendentes em aparelho. Não marcar como validados pelos mocks/SQLite do host.

## US-015 — Issue #15

- [x] T007 [US-015] RF-005: `SupportPreferencesScreen.tsx` e `preferences-database.ts` registram som/luz/toque/temperatura/outras, campos opcionais editáveis, salvamento explícito e remoção confirmada. Testes de componentes e reabertura SQLite real aprovados.
- [x] T008 [US-015] RF-006: campos de estratégias úteis/evitadas persistidos localmente; erro conserva rascunho/versão salva, cancelamento e retry testados, sem interferir nos dados da US-014.
- [x] T009 [US-015] RF-007: `readSupportForPlan(selected)` lê do SQLite somente campos explicitamente escolhidos e não vazios, seleção padrão vazia. Teste consumidor local verifica reabertura, edição e remoção sem snapshot antigo. A tela do plano permanece na #11 conforme refinamento do backlog.
- [x] T010 [US-015] Testes em `tests/features/communication-profile/`: normalização, seleção, SQL parametrizado, migração v1/v2, isolamento da remoção, rollback/retry, duplicatas e componentes aprovados; sem dados pessoais.
- [ ] T011 [US-015] Revisar RNF-001 a RNF-004 na interface/dados de #15, executar verificações aplicáveis e registrar evidências no PR; atualizar estas tasks somente após validação.

## US-016 — Issue #16

- [ ] T012 [US-016] Em `src/features/communication-profile/profile-summary`, atender RF-008 (critério 1 de #16): A visualização deve selecionar apenas informações marcadas pelo usuário para compartilhamento. Verificar com o cenário correspondente no PR.
- [ ] T013 [US-016] Em `src/features/communication-profile/profile-summary`, atender RF-009 (critério 2 de #16): O resumo deve ser legível em tela cheia. Verificar com o cenário correspondente no PR.
- [ ] T014 [US-016] Em `src/features/communication-profile/profile-summary`, atender RF-010 (critério 3 de #16): Nenhuma informação deve ser compartilhada automaticamente. Verificar com o cenário correspondente no PR.
- [ ] T015 [US-016] Adicionar testes de comportamento de RF-008, RF-009, RF-010 em `tests/features/communication-profile/profile-summary`; cobrir fluxo principal, ausência de dados e erros pertinentes descritos no spec, sem dados pessoais reais.
- [ ] T016 [US-016] Revisar RNF-001 a RNF-004 na interface/dados de #16, executar verificações aplicáveis e registrar evidências no PR; atualizar estas tasks somente após validação.
