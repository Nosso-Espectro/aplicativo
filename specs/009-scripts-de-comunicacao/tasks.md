# Tasks — Scripts de Comunicação

Milestone #17: [spec.md](spec.md) e [plan.md](plan.md). US023/US024 verificadas em2026-10-14; gates nativos pendentes.

Os módulos e diretórios de teste são propostos, sem extensão definida. Ajustar ao bootstrap real sem perder RF/Issue. Cada bloco pertence à branch da sua Issue; IDs T são locais à spec.

Executar somente depois da Definition of Ready. Não há marcação [P] nesta decomposição: arquivos/contratos ainda não existem e não é possível garantir independência. Uma task poderá ganhar [P] depois que a ausência de conflitos for demonstrada.

## US-023 — Issue #23

Ready após recomendação funcional documentada sob delegação humana. Cinco textos/categorias definidos emspec; confirmar API/version/licença SDK57 e runtime real antescódigo. Clipboard somente por toque explícito; sem read/clear/autocopy/voz/envio/histórico. Sem implementar24 nesta branch.

- [x] T001 [US-023] RF-001: `script-catalog.ts` empacota os cinco textos originais/categorias dos critérios, com IDs estáveis/únicos, sem diagnóstico ou inferência.
- [x] T002 [US-023] RF-002: `ScriptCatalogScreen.tsx` mostra categoria de cada item e filtros explícitos/Todos; ordenação/conteúdo preservados, vazio neutro, rota/quadro reais.
- [x] T003 [US-023] RF-003: um toque copia texto literal viaSDK57/plainText, sucesso só após APItrue, false/rejeição/SDK indisponível sem sucesso prematuro. FIFO entre telas/refbusydup/ownerfocus/dispose/retorno livre/retry humano. TEAr não lê/apaga/observa clipboard anterior; limites nativos do SDK documentados no plano.
- [x] T004 [US-023] Testes de RF-001 a RF-003: catálogo/filtro/vazio/sem mutação; adaptador literal/false/rejeição/retry/FIFO/não leitura/eventos; ExpoRouter real/quadro/categorias/cópia única/pending/dup/errors/stale/unmount/back/reentrada/modo9/params ignorados/offline. NoticeMIT exato distribuído testado.13testesnovos,17relacionados/4.
- [x] T005 [US-023] RNF001-004 revisadas: SafeArea/ScrollView/escalável/48dp/headers/selected/feedbackpolite/contraste/sem estímulosautomáticos; nenhumbanco/rede/clipboardreadclear ou voz/envio/permissão solicitada. expo-clipboard57.0.2fixoMIT/notices; manifestprovider nãoexportado/observador de tipos nativo documentados, não atestar ausência/integridade por mocks.585Jest/78suítes,lint/tipossemwarnings/Doctor21/21/56tooling/validador/diffcheck verdes; sem regressão impeditiva conhecida. T011nativo/assistivo pendente.

## US-024 — Issue #24

Refinamento recomendado documentado sob delegação funcional vigente: scripts pessoais locais/cópia inicial independente/categoria cinco+Outros/draftsavecancel/removeconfirmado/favoritos iniciais e pessoais/filtroordemestável. Modelo/SQLite privado/provider/rotas/TTS confirmado/guardsons/stop/indisponível/testesreais e revisão antes marcar tasks. Sem inicial mutável/DB de outro módulo/autoplay/voz de drafts/rede/history/permissão nova.

- [x] T006 [US-024] RF-004: ScriptEditor/Detail/Provider/rotas reais permitem criar/editar/cancelar/cópia inicial independente/excluir alvo confirmado/favoritos iniciais+pessoais/filtro/ordem. Texto obrigatório/category5+Outros, draft/revisão capturada/no resurrect/busydup/commit antes UI/falha mantém confirmado e draft.
- [x] T007 [US-024] RF-005: SQLite privado schema1/FIFO/TX/readback/rollback/IDs/revisões safe/favoritos fonteID com revisão até desmarcados/ABA/stale/future-schema/corrupção/órfãos/tabela ausente recusados/reaberturaoffline/isolamento. Criação ID exato, snapshot publicado só apóscommit/owner ativo.
- [x] T008 [US-024] RF-006: SpeechControls/localSpeech/guardsons existentes só no detalhe focado/confirmado, ação humana/stop/saída; sem leitura de drafts/autoplay. Ausência/falha mantém texto+cópia, prioridade pausa sons antes voz e não retoma automaticamente; query tardia descartada após saída. Nativo real continua T012.
- [x] T009 [US-024] 24testesnovos (modelo3,DB9,fluxos/provider12) com SQLiteNode real/ExpoRouter real: CRUD/cópia/cancel/validação/fav/reopen/ordem/isolamento/pendingdup/rollbackretry/stale/remove/futurecorruptoverflow/StrictMode/exactID/unmount/retornos/mode9/voz explícita-prioridade-stop-indisponível-latequery. Fronteiras SDK/voz/engine simuladas explicitamente, não testes de aparelho.
- [x] T010 [US-024] RNF001-004/review: 609Jest/81suítes,57relacionados/8,lint/tipossemwarnings/Doctor21/21/56tooling/validador/diffcheck verdes; sem regressão impeditiva conhecida. SafeArea/Scroll/KeyboardAvoiding/escalável/48dp/headers/checkboxradio/contraste/polite/errosgenéricos/foco em texto inválido. DB privado/sem redes/logs de textos/params sóIDs/nenhuma dep-perm nova/sem estímulo inesperado. SDKclipboard limites/documentos/notices preservados. GatesT011/T012nativeSQLiteExpo/vozreal/backups/readers/foco/ampliação/insets/alvos pendentes, não release pronta.

## Gate nativo separado

- [ ] T011 [US-023] No SHA integrado, verificar clipboard literal real/copiar com um toque/retornos offline/readers/foco/ampliação/insets/alvos/mode9/sem estímulos inesperados. Mocks/build não comprovam essas validações; instalação em aparelho continua requerendo autorização específica.
- [ ] T012 [US-024] No SHA integrado, verificar SQLiteExpo/reaberturaoffline/backups/favoritos/isolamento, vozlocalptBR/prioridadesons/stop/ownership/foco/readers/ampliação/insets/alvos/modo9 em aparelho/simulador. Build/mocks/SQLiteNode não comprovam; instalação exige autorização específica.
