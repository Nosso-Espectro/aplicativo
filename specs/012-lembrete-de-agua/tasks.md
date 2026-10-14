# Tasks — Lembrete de Água

Milestone #20: [spec.md](spec.md) e [plan.md](plan.md). US029 integrada PR93. US030 implementada na branch própria; T007-T010 verificadas localmente, T011 aguarda checks finais/CI e integração; gates reais T012/T013 pendentes.

Os módulos e diretórios de teste são propostos, sem extensão definida. Ajustar ao bootstrap real sem perder RF/Issue. Cada bloco pertence à branch da sua Issue; IDs T são locais à spec.

Executar somente depois da Definition of Ready. Não há marcação [P] nesta decomposição: arquivos/contratos ainda não existem e não é possível garantir independência. Uma task poderá ganhar [P] depois que a ausência de conflitos for demonstrada.

## US-029 — Issue #29

- [x] T001 [US-029] Modelo/draft intervalo inteiro30-720/default60/presets30,60,120/revisão/defaultOFF e persistência SQLite privada schema1/configuração/recibos/journal/FIFO/TX/readback/rollback/future-schema (RF-001).
- [x] T002 [US-029] Adapter local lazy expo-notifications existente: permissão só após confirmação humana, um intervalo repetitivo/primeiro aviso após intervalo inteiro, conteúdo genérico/silencioso solicitado/IDs namespace próprios/cancelamento específico/limites OS e sem handler global/push/rede (RF-002).
- [x] T003 [US-029] Coordenador/provider e UI/rota/Ferramentas: ativar/retomar confirmados, pausar/desativar cancelam próprios, persistência e native confirmados antes de sucesso, falhas/stale/duplicatas/tardio/unmount/journal/reabertura sem agenda auto/catch-up; draftsavecancel e faixa foreground só evento atual próprio (RF-003).
- [x] T004 [US-029] Verificar sem conta/backend/logsPII/histórico/consumo/diagnóstico; offline/48dp/escalável/mode9/retornos/erroretry e aviso sem horário silencioso30 antes de ativar (RF-004).
- [x] T005 [US-029] Testes reais modelo/SQLiteNode/coordenador/provider/Router e SDK falso: validação/defaultOFF/draft/permissão lenta-negada/IDs próprios/cancel-schedule falhos/tardios/stale/dup/unmount/rollback/reabertura/journal/future-schema/offline/foreground/mode9; regressões timer/CAA.
- [x] T006 [US-029] Revisar RNF-001 a RNF-004/cleanprivacyoffline/diff e Jest serial/linttipos/Doctor56toolingvalidador/CI leve antes integração. Tasks só após comportamento.
- [ ] T012 [US-029] Gate nativo posterior no SHA integrado: SQLiteExpo/backups/offline e permissões/canais/delivery/cancel/foreground/background/reboot/force-stop/readers/foco/ampliação/insets/alvos. Mocks/build não comprovam; nenhum aparelho autorizado por refinamento.

## US-030 — Issue #30

- [x] T007 [US-030] Modelo/janela diária civil0-1439/HH:MM/defaultnull/startinclusivo/endexclusivo/meia-noite/start=endinválido, draftsavecancel e UI48dp/escalável/mode9/edição inativa/revisão; atender RF-005 sem impor horário.
- [x] T008 [US-030] Plano de slots DAILY nativos fora do silêncio/circular-gaps/primeiro apósintervalo completo/nextdateconfirmado/limite produto48total/noslotsinativo/foregfiltrado; lote journal/native+DBconfirm/ownedIDslegados/latecompensação/cancelerro/ownerdupstale/restoresemagendaauto/fuso-clock-divergente pausa; atender RF-006 sem fingir JSsuspenso/controleOS.
- [x] T009 [US-030] Persistência privada de janela/plano/recibos/lote com migração schema1 preservando29, FIFO/TX/CAS/readback/rollback/future-schema/isolamento/reabertura/offline; atender RF-007.
- [x] T010 [US-030] Tests modelo/boundaries/slots/gaps/clockerror, SQLiteNode real migração/rollback/journal/batchtakeover, SDKfake fiel Androiddaily/iOScalendar/nextms/capacidade/falhas parciais/late/cancel/IDsforeign, controller/provider/Router/draft/meia-noite/fuso/foreg/permission/mode9/retornos e regressões29/Timer/CAA.
- [ ] T011 [US-030] Revisar RNF-001 a RNF-004/cleanprivacyoffline/diff; Jest serial completo/linttipos/Doctor56toolingvalidador/CI leve antes integração. Sem deps/permissão/handler global/rede/host/aparelho/build local/atualizarprévia. Tasks só após validação.
- [ ] T013 [US-030] Gate real posterior SHA integrado: não emissão/entrega no silêncio/meia-noite/DST/timezone/clock/Doze/reboot/force-stop/capacidade/cancel/leitores/foco/ampliação/insets/alvos/SQLiteExpo/offline/backups. Mocks/plano/build/assinatura não aprovam critério nativo; nenhum telefone autorizado por delegação funcional.
