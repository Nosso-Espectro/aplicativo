# Tasks — Meditação e Zazen

Milestone #21: [spec.md](spec.md) e [plan.md](plan.md). US031 integrada PR99/main24646a0, T001-T005 verificadas/CI main verde; T011 nativo pendente. US032 implementada no PR100; T006-T010 verificadas, integração aguarda último head verde, T012 nativo pendente.

Os módulos e diretórios de teste são propostos, sem extensão definida. Ajustar ao bootstrap real sem perder RF/Issue. Cada bloco pertence à branch da sua Issue; IDs T são locais à spec.

Executar somente depois da Definition of Ready. Não há marcação [P] nesta decomposição: arquivos/contratos ainda não existem e não é possível garantir independência. Uma task poderá ganhar [P] depois que a ausência de conflitos for demonstrada.

## US-031 — Issue #31

- [x] T001 [US-031] Modelo efêmero duração1-180inteiros/draft10/presets5,10,20,30/revisão/restante/baseline/pausarretomarencerrarnovo/fim único/clockinvalid-regressivo-overflow preservaconfirmado; RF-001 sem horários clínicos/DB/histórico.
- [x] T002 [US-031] Provider/clockAppState/owner/stale-dup-dispose e UIrota /meditation/Ferramentas/minimal/restante/comandosessenciais/confirmarsair/hardwarebackfocado/gestos/blurunmountdescarta/reentradavazia/fallback/48dpescalávelmode9; RF-002 sem alterar Timer/CAA/Pomodoro/sons.
- [x] T003 [US-031] Aviso final visual discreto configurado antes de iniciar/defaultOFF/polite sóoptin/semfaixaOFF/resultadoapenas tela/semreplay-auto-restart/sem áudio-vib-TTS-notificação-player-permissão; RF-003 sem promessa JSsuspenso/processomorto.
- [x] T004 [US-031] Testes modelo/provider/Router para RF-001 a RF-003: duração/draft/avisoON-OFF/pausarretomar/fim único/clockbg-invalid-regressivo-overflow/stale-dup-unmount/saídas-retornos-fallback/mode9/offline/regressões Timer/Pomodoro/cronômetro/sons/CAA; fixtures sintéticas.
- [x] T005 [US-031] Review RNF-001 a RNF-004/cleanprivacyoffline/UI; related/fullJestserial/linttipos/Doctor56toolingvalidadordiffcheck/CIleve antesintegração; tasks sócomportamento. Sem buildlocal/host/phone/preview8093. Evidência:28novos/204relacionados17/857Jest99/linttipossemwarnings/Doctor21/21/56toolingvalidadordiffreview PASS; PR99 anexado, CI38614583004SUCCESS2min4s no head2865b65. Antes squash reconferir último commit documental verde; Android/iOS SKIPPED não são builds. T011 nativo separado permanece pendente.
- [ ] T011 [US-031] Gate real posterior SHA integrado: assistivo/leitores/foco/textoampliado/insets/alvos/backgestos/clockbackground-lock/AppState/offline; mocks/build/assinatura não aprovam nativo, nenhum aparelho autorizado por refinamento.

## US-032 — Issue #32

- [x] T006 [US-032] RF-004: zazen-guide.ts texto editorial ORIGINAL pt-BR/revisão/3seções postura-respiração-iníciofim/limites/créditos bibliográficos; documento de proveniência e revisão de fontes/direitos sem copiar materiais restritos. Evidência: conteúdo estático/proveniência original e testes de seções/revisão/fontes aprovados.
- [x] T007 [US-032] RF-005: recurso estático local/validação íntegra/cópias imutáveis/sem rede ou loader falso; ZazenGuideScreen/rota /meditation/zazen/Ferramentas/backfallback/focado/mode9/escalável48dp, erro neutro+voltar para ausência/corrupção. Evidência: Router real/render offline/fetch-Linking rejeitados sem chamadas/backfocado-stale/draft CAA e modo9 preservados; não aprova offline em binário.
- [x] T008 [US-032] RF-006: explicitar opcional/não tratamento/não substitui acompanhamento profissional, sem benefício/diagnóstico/postura forçada/meta/ritmo respiratório/ritual obrigatório; nenhum timer31 iniciado implicitamente ou mídia/permissão/deps nova. Evidência: revisão editorial e testes do texto/retorno à configuração vazia31 aprovados.
- [x] T009 [US-032] Tests modelo/conteúdo/Router/offline/revisão/créditos/ausente-malformado-getters-sparse/clones/backfocado-stale/retornos/mode9/CAA e regressões31, sem API falsa/PII/exclusões/timeoutraise. Evidência:19novos12modelo7Router/223relacionados19/876Jest101 PASS; fixtures corrigidas com Router real/factorynames, sem suprimir cenários, mesmas assertions/timeouts.
- [x] T010 [US-032] RNF-001 a RNF-004/cleanprivacyoffline/UIreview, related/fullserial/linttiposDoctor56toolingvalidadordiffcheck/CI últimohead antesintegração, tasks só comportamento comprovado; sem hostphonebuildlocal/preview8093/tagrelease. Evidência: 19 novos/223 relacionados19/876Jest101, lint/tipos sem warnings, Doctor21/21, 56tooling/validador/diff/review PASS. PR100 anexado; CI38620299198 SUCCESS no head7f6e63f8e26c07e0c42b5d5b8c138ad016217950. Conferir novo head documental verde antes squash; Android/iOS SKIPPED não são builds. T012 permanece pendente.
- [ ] T012 [US-032] Gate posterior real SHA integrado: leitores/foco/ampliação/reflow/insets/alvos/backgestos/guia offline em binário; mocks/build/assinatura não aprovam nativo e não autorizam aparelho.
