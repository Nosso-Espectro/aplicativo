# Tasks — Foco / Pomodoro Flexível

## US-082 — Issue #82

Ready após refino sob delegação funcional e alinhamento spec/plan; implementação82 validada localmente, PR/CI/merge ainda pendentes. #25/#26 integradas, T011/T012/T018 nativos ainda pendentes.

- [x] T013 [US-082] RF-007: validar foco/pausa1-180min inteiros/default25/5, preservar presets; draft/apply/cancel sem início automático.
- [x] T014 [US-082] RF-008: capturar cópia dos dois tempos na sessão, preservar próxima fase humana/pausa/clock/owner/revisão; recusar edição/início antigo durante sessão.
- [x] T015 [US-082] RF-009: UI Personalizado/campos/aplicar/cancelar/erro, editar apenas sem sessão, escolha efêmera/reentrada25/5/retornos/mode9/alvos48dp/texto ampliável; sem DB/deps/permissões/estímulos/rede novos.
- [x] T016 [US-082] Testes modelo/provider/Router limites/erro/draft/apply/cancel/captura/guards/stale/clock/AppState/saídas/reentrada/mode9/regressões25-26/Timer/CAA.
- [x] T017 [US-082] Review RNF-001 a RNF-004/UIprivacyofflineclean/diff, related/fullserial/linttiposDoctor56toolingvalidador/CI últimohead antesintegração; tasks só comportamento comprovado. PR101 anexado; CI38624474209 SUCCESS1min45s head03724f79785dcf576782b752e3e91a6e3ac0ea99, 25novos/248relacionados20/901Jest102/linttipossemwarnings/Doctor21/21/56tooling/validadordiffreview PASS. Conferir novo head documental verde antes squash; nativos SKIPPED não são builds/T018 continua pendente.
- [ ] T018 [US-082] Gate posterior real no SHA integrado: leitores/teclado/foco/reflow/insets/alvos/clockbg/offline/back; mocks/CIleve não aprovam binário e não autorizam aparelho.

Evidência local82: 25 novos (12modelo/13Router),248relacionados20/901Jest102 completos PASS; limites/cópias/fases humanas/pausa/erro/choiceRevision/foco/retornos/reentrada/mode9 verificados, fetch rejeitado sem chamadas. Revisão corrigiu preset já selecionado que invalidava controles sem render: teste de regressão verde. Matcher de texto exato corrigido mantendo seis cenários inválidos. Tipos/lint/Doctor21/21/56tooling/validador/diff e CI são registrados no plano; novo head documental precisa CI antes merge. Testes JS não validam T018.

Milestone #18: [spec.md](spec.md) e [plan.md](plan.md). US025 entregue pelo PR83 em 2026-10-14. US026 implementada e validada localmente; PR/CI/merge devem confirmar entrega. Gates nativos T011/T012 pendentes.

Os módulos e diretórios de teste são propostos, sem extensão definida. Ajustar ao bootstrap real sem perder RF/Issue. Cada bloco pertence à branch da sua Issue; IDs T são locais à spec.

Executar somente depois da Definition of Ready. Não há marcação [P] nesta decomposição: arquivos/contratos ainda não existem e não é possível garantir independência. Uma task poderá ganhar [P] depois que a ausência de conflitos for demonstrada.

## US-025 — Issue #25

- [x] T001 [US-025] Modelo puro em `src/features/focus/`: presets 25/5 e 50/10 (RF-001), estado/fase/restante/prazo, seleção antes da sessão e comandos com identidade capturada.
- [x] T002 [US-025] Provider local somente memória e iniciar/pausar/retomar/encerrar (RF-002); prazo/relógio injetável, AppState/reconciliação sem catch-up, recusa de eventos antigos/duplicados, relógio inválido/regressivo com recuperação humana e cleanup.
- [x] T003 [US-025] UI e rotas próprias/quadro/fallback: aviso visual/polite e próxima fase somente por comando humano (RF-003), confirmação de saída ativa, reentrada vazia, modo9/48dp/escalável, sem som/vibração/notificação ou alterar timer existente.
- [x] T004 [US-025] Testes modelo/provider/Expo Router: presets, pausa/retomada, fim foco/pausa, próxima fase manual, background/atraso/relógio regressivo, comandos antigos/duplicados, confirmar/manter saída, desmontagem/reentrada e modo9; regressões timer/avisos existentes.
- [x] T005 [US-025] Revisar RNF-001 a RNF-004, privacidade/offline/clean-code e diff; Jest serial/lint/tipos/Doctor/tooling/validador antes PR e CI leve antes integração. Atualizar tasks somente após comportamento verificado, sem alegar gate nativo por mocks.

Evidência local US025: 20 testes novos (12 modelo + 8 fluxo/provider); 145 relacionados/11 suítes incluindo timer/avisos; 629 Jest/83 suítes completos, lint/tipos sem warnings, Doctor21/21,56tooling,validador/diffcheck verdes. Sem nova dependência/permissão/DB/rede/voz/notificação. Revisão sem regressão impeditiva conhecida; limites nativos em T011 não comprovados por estes testes.

- [ ] T011 [US-025] Gate nativo posterior no SHA integrado: relógio/background/processo morto/offline, TalkBack/VoiceOver/foco/ampliação/insets/alvos/contraste e saída real. Build remoto não substitui estes testes; nenhuma instalação autorizada por refinamento.

## US-026 — Issue #26

- [x] T006 [US-026] Modelo em `src/features/focus/`: zero e decorrido por diferença do relógio + acumulado, inteiro seguro e clock regressivo/falho preservando confirmado (RF-004).
- [x] T007 [US-026] Provider separado efêmero/AppState/owner/revisões e iniciar/pausar/retomar/finalizar/novo sem zerar na retomada (RF-005); background e cleanup sem publicação antiga.
- [x] T008 [US-026] UI/rota `/focus/free`/entrada/retornos/fallback/mode9/48dp/escalável, confirmação de saída ativa, reentrada vazia e finalizado local sem meta/histórico/pontuação ou penalização (RF-006).
- [x] T009 [US-026] Testes modelo/provider/Expo Router: zero/decorrido/acumulado/pausa/retomada/finalizar/novo, interrupção curta, background/clockerror/overflow, stale/duplicatas, saída/manter/desmontagem/reentrada e regressões Pomodoro/timer.
- [x] T010 [US-026] Revisar RNF-001 a RNF-004, privacidade/offline/clean-code/diff; Jest serial/lint/tipos/Doctor/tooling/validador/CI leve. Tasks só após comportamento; não comprovar native com mocks.
- [ ] T012 [US-026] Gate nativo posterior no SHA integrado: relógio/background/processo morto/offline, back/gestos e readers/foco/ampliação/insets/alvos/contraste; nenhum aparelho autorizado por refinamento.

Evidência local US026 após integração da main326afa5: 23 testes novos (12 modelo + 11 fluxo/provider), 172 relacionados/13 suítes, 658 Jest/86 suítes completos; lint/tipos sem warnings, Doctor21/21,56tooling,validador/diffcheck verdes. Revisão de RNF-001 a RNF-004: alvos48dp/texto escalável/sem anúncio por segundo, estado e erros explícitos, nenhuma DB/rede/dependência/permissão/voz/som/notificação ou histórico novo; timer/avisos e CAA preservados. Testes usam relógio/AppState/recursos nativos simulados, não comprovam T012. PR91 CI leve38566901022 SUCCESS1m31s no head35b7197; nativos SKIPPED, não builds. Esta atualização documental também exige CI antes de integrar.
