# Tasks — Meditação e Zazen

Milestone #21: [spec.md](spec.md) e [plan.md](plan.md). US031 Ready pelo refinamento GitHub/spec; todas tasks pendentes, nenhum código/aceite implementado. US032 não Ready.

Os módulos e diretórios de teste são propostos, sem extensão definida. Ajustar ao bootstrap real sem perder RF/Issue. Cada bloco pertence à branch da sua Issue; IDs T são locais à spec.

Executar somente depois da Definition of Ready. Não há marcação [P] nesta decomposição: arquivos/contratos ainda não existem e não é possível garantir independência. Uma task poderá ganhar [P] depois que a ausência de conflitos for demonstrada.

## US-031 — Issue #31

- [ ] T001 [US-031] Modelo efêmero duração1-180inteiros/draft10/presets5,10,20,30/revisão/restante/baseline/pausarretomarencerrarnovo/fim único/clockinvalid-regressivo-overflow preservaconfirmado; RF-001 sem horários clínicos/DB/histórico.
- [ ] T002 [US-031] Provider/clockAppState/owner/stale-dup-dispose e UIrota /meditation/Ferramentas/minimal/restante/comandosessenciais/confirmarsair/hardwarebackfocado/gestos/blurunmountdescarta/reentradavazia/fallback/48dpescalávelmode9; RF-002 sem alterar Timer/CAA/Pomodoro/sons.
- [ ] T003 [US-031] Aviso final visual discreto configurado antes de iniciar/defaultOFF/polite sóoptin/semfaixaOFF/resultadoapenas tela/semreplay-auto-restart/sem áudio-vib-TTS-notificação-player-permissão; RF-003 sem promessa JSsuspenso/processomorto.
- [ ] T004 [US-031] Testes modelo/provider/Router para RF-001 a RF-003: duração/draft/avisoON-OFF/pausarretomar/fim único/clockbg-invalid-regressivo-overflow/stale-dup-unmount/saídas-retornos-fallback/mode9/offline/regressões Timer/Pomodoro/cronômetro/sons/CAA; fixtures sintéticas.
- [ ] T005 [US-031] Review RNF-001 a RNF-004/cleanprivacyoffline/UI; related/fullJestserial/linttipos/Doctor56toolingvalidadordiffcheck/CIleve antesintegração; tasks sócomportamento. Sem buildlocal/host/phone/preview8093.
- [ ] T011 [US-031] Gate real posterior SHA integrado: assistivo/leitores/foco/textoampliado/insets/alvos/backgestos/clockbackground-lock/AppState/offline; mocks/build/assinatura não aprovam nativo, nenhum aparelho autorizado por refinamento.

## US-032 — Issue #32

- [ ] T006 [US-032] Em `src/features/meditation/zazen-guide`, atender RF-004 (critério 1 de #32): O conteúdo deve explicar postura, respiração e início da prática de maneira introdutória. Verificar com o cenário correspondente no PR.
- [ ] T007 [US-032] Em `src/features/meditation/zazen-guide`, atender RF-005 (critério 2 de #32): O guia deve funcionar offline. Verificar com o cenário correspondente no PR.
- [ ] T008 [US-032] Em `src/features/meditation/zazen-guide`, atender RF-006 (critério 3 de #32): O conteúdo não deve apresentar a prática como tratamento médico ou psicológico. Verificar com o cenário correspondente no PR.
- [ ] T009 [US-032] Adicionar testes de comportamento de RF-004, RF-005, RF-006 em `tests/features/meditation/zazen-guide`; cobrir fluxo principal, ausência de dados e erros pertinentes descritos no spec, sem dados pessoais reais.
- [ ] T010 [US-032] Revisar RNF-001 a RNF-004 na interface/dados de #32, executar verificações aplicáveis e registrar evidências no PR; atualizar estas tasks somente após validação.
