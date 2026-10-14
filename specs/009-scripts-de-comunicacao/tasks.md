# Tasks — Scripts de Comunicação

Milestone #17: [spec.md](spec.md) e [plan.md](plan.md). US023 verificada em2026-10-14; US024 e gate nativo pendentes.

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

- [ ] T006 [US-024] Em `src/features/communication-scripts/script-editor`, atender RF-004 (critério 1 de #24): Deve ser possível criar, editar, excluir e favoritar scripts. Verificar com o cenário correspondente no PR.
- [ ] T007 [US-024] Em `src/features/communication-scripts/script-editor`, atender RF-005 (critério 2 de #24): Os scripts personalizados devem ficar salvos localmente. Verificar com o cenário correspondente no PR.
- [ ] T008 [US-024] Em `src/features/communication-scripts/script-editor`, atender RF-006 (critério 3 de #24): O usuário deve poder usar um script no Text-to-Speech. Verificar com o cenário correspondente no PR.
- [ ] T009 [US-024] Adicionar testes de comportamento de RF-004, RF-005, RF-006 em `tests/features/communication-scripts/script-editor`; cobrir fluxo principal, ausência de dados e erros pertinentes descritos no spec, sem dados pessoais reais.
- [ ] T010 [US-024] Revisar RNF-001 a RNF-004 na interface/dados de #24, executar verificações aplicáveis e registrar evidências no PR; atualizar estas tasks somente após validação.

## Gate nativo separado

- [ ] T011 [US-023] No SHA integrado, verificar clipboard literal real/copiar com um toque/retornos offline/readers/foco/ampliação/insets/alvos/mode9/sem estímulos inesperados. Mocks/build não comprovam essas validações; instalação em aparelho continua requerendo autorização específica.
