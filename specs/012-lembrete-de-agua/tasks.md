# Tasks — Lembrete de Água

Milestone #20: [spec.md](spec.md) e [plan.md](plan.md). US029 implementada e verificada localmente em 2026-10-14; CI/revisão final de integração pendentes. US030 não Ready; gate T012 pendente.

Os módulos e diretórios de teste são propostos, sem extensão definida. Ajustar ao bootstrap real sem perder RF/Issue. Cada bloco pertence à branch da sua Issue; IDs T são locais à spec.

Executar somente depois da Definition of Ready. Não há marcação [P] nesta decomposição: arquivos/contratos ainda não existem e não é possível garantir independência. Uma task poderá ganhar [P] depois que a ausência de conflitos for demonstrada.

## US-029 — Issue #29

- [x] T001 [US-029] Modelo/draft intervalo inteiro30-720/default60/presets30,60,120/revisão/defaultOFF e persistência SQLite privada schema1/configuração/recibos/journal/FIFO/TX/readback/rollback/future-schema (RF-001).
- [x] T002 [US-029] Adapter local lazy expo-notifications existente: permissão só após confirmação humana, um intervalo repetitivo/primeiro aviso após intervalo inteiro, conteúdo genérico/silencioso solicitado/IDs namespace próprios/cancelamento específico/limites OS e sem handler global/push/rede (RF-002).
- [x] T003 [US-029] Coordenador/provider e UI/rota/Ferramentas: ativar/retomar confirmados, pausar/desativar cancelam próprios, persistência e native confirmados antes de sucesso, falhas/stale/duplicatas/tardio/unmount/journal/reabertura sem agenda auto/catch-up; draftsavecancel e faixa foreground só evento atual próprio (RF-003).
- [x] T004 [US-029] Verificar sem conta/backend/logsPII/histórico/consumo/diagnóstico; offline/48dp/escalável/mode9/retornos/erroretry e aviso sem horário silencioso30 antes de ativar (RF-004).
- [x] T005 [US-029] Testes reais modelo/SQLiteNode/coordenador/provider/Router e SDK falso: validação/defaultOFF/draft/permissão lenta-negada/IDs próprios/cancel-schedule falhos/tardios/stale/dup/unmount/rollback/reabertura/journal/future-schema/offline/foreground/mode9; regressões timer/CAA.
- [ ] T006 [US-029] Revisar RNF-001 a RNF-004/cleanprivacyoffline/diff e Jest serial/linttipos/Doctor56toolingvalidador/CI leve antes integração. Tasks só após comportamento.
- [ ] T012 [US-029] Gate nativo posterior no SHA integrado: SQLiteExpo/backups/offline e permissões/canais/delivery/cancel/foreground/background/reboot/force-stop/readers/foco/ampliação/insets/alvos. Mocks/build não comprovam; nenhum aparelho autorizado por refinamento.

## US-030 — Issue #30

- [ ] T007 [US-030] Em `src/features/hydration/quiet-hours`, atender RF-005 (critério 1 de #30): Deve ser possível definir início e fim do período silencioso. Verificar com o cenário correspondente no PR.
- [ ] T008 [US-030] Em `src/features/hydration/quiet-hours`, atender RF-006 (critério 2 de #30): Nenhuma notificação de hidratação deve ser emitida nesse intervalo. Verificar com o cenário correspondente no PR.
- [ ] T009 [US-030] Em `src/features/hydration/quiet-hours`, atender RF-007 (critério 3 de #30): A configuração deve persistir localmente. Verificar com o cenário correspondente no PR.
- [ ] T010 [US-030] Adicionar testes de comportamento de RF-005, RF-006, RF-007 em `tests/features/hydration/quiet-hours`; cobrir fluxo principal, ausência de dados e erros pertinentes descritos no spec, sem dados pessoais reais.
- [ ] T011 [US-030] Revisar RNF-001 a RNF-004 na interface/dados de #30, executar verificações aplicáveis e registrar evidências no PR; atualizar estas tasks somente após validação.
