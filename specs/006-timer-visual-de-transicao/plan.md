# Plano de implementação — Timer Visual de Transição

Spec: [spec.md](spec.md). Milestone #14; Issues #17, #18. Plano proposto, sujeito às questões em aberto.

## Stack

Inspeção em 2026-10-13: Expo57.0.28/RN0.86.3/React19.2.3, TypeScript strict,
Router, SQLite, Node24.21.0/npm11.19.0 e Jest/RNTL/SQLite real do Node existentes.
Sem nova dependência/permissão; builds somente remotos.

## Arquitetura atual

CAA, rotinas, perfil, apoio/contato e modo de baixa estimulação integrados na
main76bcfa8. Provider do timer deve preservar a sessão ao navegar e coexistir com
providers atuais, sem atualizar/copiar dados deles. Rota fina + tela em módulo
próprio, inicialmente acessível pelo quadro; painel #10 não pertence à branch.

## Estratégia

Implementar uma Issue por branch, a partir de main atualizada, seguindo RFs e critérios originais. Começar pelo menor fluxo verificável; separar lógica de estado, apresentação e acesso a capacidades do dispositivo apenas quando necessário. Resolver as questões bloqueantes da história antes de iniciar.

Não implementar a milestone inteira em uma branch. A inicialização técnica precisa de uma Issue vinculada ou inclusão explícita no escopo da primeira história, registrada no GitHub; esta documentação não autoriza criar produto adicional.

## Componentes envolvidos

Módulo proposto: `src/features/transition-timer/`.

- `src/features/transition-timer/visual-timer` — [US-017] Criar timer visual de transição.
- `src/features/transition-timer/progress-alerts` — [US-018] Configurar avisos progressivos do timer.

## Modelo de dados

US-018 Ready após refinamento na Issue18: boolenabled inicialmente false,
IDsminutos10/5/2 selecionados inicialmente[], opção avisos do sistema false;
validação estrita/cópia/deduplicação/ordem e marcosfuturos<duração. Sessão local
precisa identidade e registro mínimo de marcos/IDs próprios para reconciliar sem
duplicata; preferências retidas, sem histórico de atividades. Evoluir SQLite do
timer com migração preservando sessão atualv1,fila/transação/rollback/schemafuturo,
ações obsoletas/retry sem sucesso prematuro; não escrever por tick. Foreground
visual; notificações locais voluntárias/confirmadas/permission somente por ação
humana. Pausa/cancel/conclusão/desativação cancela somenteIDs próprios, resume
reagendafuturos. Sistema rege som/vibração/canais/silencioso/DND, sem áudio/haptics
próprios ou alterar configuração global/canais personalizados/alarmes exatos.
Sem notificação opcional nenhuma permissão/pedido; timer e CAA preservados em
falha/negação. Metadados genéricos, sem push/backend/rede/dados pessoais.
expo-notifications57.0.22 agora fixada no lock; três entradas npm novas
(notifications,application57.0.3,badgin1.2.3), sem churn das entradas anteriores.
Instalação sem scripts; metadata libc preservada após primeira execução por
runtime incorreto, install novamente no Node24.21.0/npm11.19.0 confirmado.
Audit antes/depois mantém66 apontamentos/mesmos pacotes afetados (16moderate,
49high,1critical), #51 continua aberta. MIT Expo nos pacotes; badgin omiteLICENSE
no npm e no gitHead/tag, texto upstream identificado por blobSHA documentado em
notices, distribuído junto às licenças anteriores. Não é auditoria completa.
Plugin nativo local-only remove serviçoFirebase eInitProvider/auto-init/analytics
Android e entitlementAPNs iOS após mods SDK; mantém backgroundaudio e WhatsApp.
POST_NOTIFICATIONS/VIBRATE (antes bloqueado)/RECEIVE_BOOT_COMPLETED são capacidades
da fila local voluntária, não solicitação runtime/início de avisos. Bloquear
SCHEDULE_EXACT_ALARM/USE_EXACT_ALARM/ACCESS_NOTIFICATION_POLICY/microfone.
Esclarecimento técnico na [origem](https://github.com/Nosso-Espectro/aplicativo/issues/18#issuecomment-6158406778):
SDK interno usa inexato Android12+ sem privilégio e pode usar exact em Android
antigo; não pedir privilégio/alterar OS/prometer entrega pontual. FirebaseMessaging
é dependência nativa da biblioteca, mas não usar APIs de token/tópicos/push;
entitlement/serviço/auto-init removidos não substituem gate de manifesto mesclado/
ausência real de rede/licenças nativas finais. Engine/UI/reconcile ainda pendentes.
Introspecção avalia mods em memória sem prebuild/compilação/projetos gerados.
Referência primária:
[SDK Notifications](https://docs.expo.dev/versions/v57.0.0/sdk/notifications/).
Testar modelo/tempo/identidade/reconciliação/persistência/UI/mocks de capacidades;
gate nativo deve validar relógio/background/cancelamento/entrega/permissões/som/
vibração/assistivo/offline, sem promessa após force-stop/reboot/restrições.

Persistência US018 preparada em timer-schema.ts/progress-alert-database.ts:
mesmo arquivo tear-transition-timer.db, schema2 transacional preserva sessão v1
running/paused sem redefinir duração/deadline/restante. Contador inteiro de sessão
e revisão persistidos, preferências bool/IDs, marcos registrados e IDs próprios
de notificações pendentes; nenhum histórico de atividade. Pausar/retomar mantém
identidade e marcos, iniciar incrementa identidade e limpa marcos da sessão
anterior. Cancelar não perde IDs nativos pendentes: forget somente após confirmação
de cancelamento pelo motor, nunca presumir remoção por apagar timer/preferência.
Reservar intenção antes do RPC cria ID próprio com sessão/marco/revisão, valida
consentimento/futuro/seleção e impede reserva duplicada ou com IDs da sessão velha.
Revisões esperadas impedem alterações obsoletas; fila/transação/readback/rollback
publica só após commit. markDelivered registra decisão do controller e não é
prova de entrega pelo OS; consumo/reconciliação real ainda a implementar/testar.
openTimerDatabase mantém read/act e formato TimerSession antigos para módulos
existentes; quarto argumento opcional expectedSessionNumber deve ser usado pelo
novo coordenador para recusar alvo de outra identidade mesmo com valores iguais.
openProgressAlertDatabase expõe snapshot/read/savePreferences/reserve/forget/
markDelivered. Dois stores usam transações exclusivas do mesmo arquivo e filas
locais; conflito/SQLITE_BUSY deve ser tratado com retry, não presumir FIFO global
entre conexões. Futuro schema recusado, metadata ausente não recria identidade.
Provider/tela/motor nativos ainda não usam essas APIs; nenhuma task de aceitação
concluída por persistência isolada. SQLite real do Node não comprova SQLite Expo
nem cancelamento/avisos no dispositivo.

Adaptador local expo-progress-alert-engine.ts preparado e testado isoladamente:
factory tardia, sem chamada nativa/prompt ao construir; permission só consulta e
requestPermission é comando separado para confirmação humana. iOS interpreta
AUTHORIZED/PROVISIONAL/EPHEMERAL do OS e soundfalse se allowsSound não é true;
Android26+ consulta canal estável, cria apenas na solicitação explícita se ausente
e não reescreve som/vibração existentes ou ignora canal bloqueado. Canal padrão
de importância normal/privado sem bypassDND/badge/lights, som/vibração sujeitos ao
OS e à confirmação prévia. Android24/25 não finge ter canais: usa notificação
local comum respeitando OS. Sem tokenpush/haptics/player/handler global ou
redirecionamento. Estado de entrega continua responsabilidade nativa, não promessa.
Protocolo OwnedProgressNotification valida/copia ID próprio sessão/marco/revisão
e tempo; readSnapshot também o utiliza. schedule aceita só intenção já registrada
pelo coordenador, recusa passado/sem permissão e verifica ID retornado/estado
agendado ou presente. inspect filtra IDs exatos da lista registrada e não lê SDK
quando vazio; não expõe payloads de outros módulos. cancel cancela/dismiss somente
ID próprio e verifica ausência antes de sucesso, preservando ledger em falha.
Fila assíncrona serial não ultrapassa RPC pendente; retry explícito após rejeição.
dispose limpa listeners/descarta callbacks antigos; cancela schedule que termina
depois do dispose, mas não remove alarmes confirmados que precisam sobreviver em
background. onReceived usa ownership atual/unsubscribe idempotente/guard ativo.
Adapter não persiste prefs, não infere consentimento e não decide consumo visual:
coordenador deve validar snapshot/revision/identidade antes e após cada chamada,
manter IDs em efeito incerto e conciliar queries/clock/pause/cancel/restart.
Dezoito testes falsos do SDK mais regressões; suíte443/65 aprovada, lint/tipos,
Doctor21/21,56tooling/validador. Não comprova RPCs tardios/foco/som/vibração/
lockscreen/entrega real, manifest final ou ausência de rede. Coordenador/provider/
UI ainda faltam e todas tasks US018 continuam pendentes. Sem aviso/aparelho/build
real. Falha recente SSH do build anterior US012 é acompanhada pelo monitor,
não autoriza build local nem mudança de backend nesta implementação.

US-017: sessão inicialmente null, depois running/paused/finished, duração e
restante em milissegundos e término absoluto quando running; validação estrita
de duração1s–24h e estados coerentes. Relógio recebido pelos cálculos para testes,
APIs Date.now/agendamento existentes, sem acumular ticks atrasados. UI numérica
arredonda para cima até concluir, barra mostra proporção restante e sem animação.
Pausa/retomada/cancelamento dependem do estado atual confirmado; término passado
é concluído ao atualizar. Não adicionar marcos ou preferências de avisos #18.

## Persistência

US-017 implementa modelo, provider global, tela/rota real e acesso pelo quadro.
Barra estável sem interpolação e contador em partes quebráveis/scaláveis, com
estado independente de cor e liveRegion none nos valores por segundo. Campos
numéricos sem duração sugerida, controles48dp e confirmação de cancelamento.
Estado conhecido somente após leitura, erro preserva sessão/draft e retry reabre
o timer salvo, sem repetir automaticamente uma ação destrutiva. A pessoa pode
repetir explicitamente a ação após recuperar a leitura.

SQLite privado separado tear-transition-timer.db v1 para somente a sessão atual,
fila de operações, transação/readback/rollback e versão futura recusada. Escritas
ao iniciar/pausar/retomar/cancelar, não a cada tick. Estado confirmado só após
commit, erros genéricos/retry preservando sessão/draft e bloqueando duplicatas.

Transições calculadas dentro da transação usando a sessão atual e comparando o
snapshot esperado do comando; alvo stale é recusado sem sobrescrever/cancelar
outra sessão. Consentimento de cancelamento da tela aponta ao snapshot confirmado
e deixa de valer quando a sessão muda. Início novo só quando ausente/concluído.
Prazo expirado é representado como concluído ao ler/atualizar; não há escrita por
tick. A leitura recuperável não reconfirma um cancelamento antigo.
Restauração desconhecida não oferece iniciar outro timer que sobrescreva sessão;
falha não bloqueia comunicação nem afirma ausência de dados. Recuperar término
absoluto ao reabrir; não criar histórico nem prometer alarmes em background.

## Fluxos principais

Sequência de capacidades: Criar timer visual de transição → Configurar avisos progressivos do timer.

Validar cada critério no seu fluxo e as integrações indicadas em spec.md; a sequência não impõe um único percurso de interface.

## Offline

Sessão/duração permanecem locais e sem rede. Provider usa relógio no foreground e
recalcula ao AppState active, não exige setInterval executando em background.
Ao reabrir, running usa deadline; paused retém restante. Ajustes no relógio do
sistema afetam o instante absoluto; limitar restante à duração/snapshot e nunca
mostrar valores negativos. Sem notificação/som/vibração nessa história.

Recursos locais não devem depender de autenticação ou API. Capacidades externas explicitamente solicitadas devem informar indisponibilidade sem impedir os recursos locais; não confundir falta de backend próprio com ausência de qualquer serviço externo futuro.

## Acessibilidade

Revisão local: #202124/#FFFFFF 16.10:1, #303438/#FFFFFF 12.54:1,
#16634D/#FFFFFF 7.18:1 e #72777D/#FFFFFF 4.52:1. Trilha/barra24dp estáveis e largura
proporcional, campos/contador/ações quebráveis com limites responsivos. O grupo
numérico tem nome completo em português; progressbar expõe min/max/restante/texto,
sem anúncio explícito a cada segundo. Isso não comprova comportamento TalkBack/
VoiceOver, foco, ampliação/teclado/insets/áreas de toque reais, que ficam no gate.

Aplicar RNF-001 e a Skill accessibility-neuroinclusive: rótulos e ordem de foco, leitor de tela, texto ampliado, contraste e alvos de toque. Verificar teclado quando suportado pelo dispositivo. Respeitar preferências de som/movimento e não ativar mídia inesperadamente. Critérios mensuráveis faltantes precisam de refinamento, não de aprovação automática.

## Privacidade e segurança

Aplicar RNF-002 e RNF-004. Usar dados sintéticos nos testes; evitar dados pessoais em logs. Controlar compartilhamento e permissões nas ações que realmente necessitam deles. Não adicionar telemetria, conta ou serviço externo por conveniência técnica.

## Estratégia de testes

Evidência em 2026-10-13:35 testes de US-017 em quatro suítes e310 testes/48 suítes
completos, lint/tipos,Doctor21/21,49 tooling e validador aprovados. SQL real do Node
em arquivos com close/reopen, rollback de start/pause/resume/cancel e commit,
versão futura/corrupção/alvo stale recusados, isolamento de modo/plano. Componentes
com relógio controlado verificam foreground após pausa dos ticks em background,
remount e sessão pausada, recuperação sem ação automática, draft/confirmado/
duplicatas/cancelamento e rotas reais preservando modo/Stack. [AppState RN0.86](https://reactnative.dev/docs/0.86/appstate)
foi a referência primária; nenhum teste alegado em telefone/OS reais.

- Derivar cenários de cada RF, preservando a relação Issue → RF → task → teste.
- Usar testes unitários para transformações de estado/dados; componentes para interação e acessibilidade; integração para persistência/capacidades nativas quando pertinentes.
- Exercitar os casos de erro do spec e regressões das dependências reais.
- Verificar em dispositivo/simulador os fluxos que dependem de voz, áudio, permissões ou notificações; mocks isolados não comprovam suporte nativo.
- Selecionar E2E para fluxos críticos quando a infraestrutura existir. Executar testes, lint, typecheck e checks leves; builds somente remotos no SHA integrado da main.

Jest serial para duração/relógio/ações/representação, componentes com tempo
controlado e AppState, SQLite real do Node com reabertura/rollback e navegação.
Lint/tipos/Doctor,49 tooling e validador. Gate deve verificar SQLite Expo/offline
após reinício, relógio/background/bloqueio reais, leitores de tela/foco/ampliação,
alvos e insets; mocks/build não comprovam esses fluxos nem habilitam release.

## Dependências técnicas

APIs existentes de relógio/agendamento/RN/AppState, Router, SQLite e controles
nativos. Nenhum framework de timer/áudio, dependência, permissão ou serviço novo.
Stack/controle de baixa estimulação preservados; não interferir com voz voluntária.

## Riscos

Duração inválida, marco fora da duração e interrupção de sessão; comportamento de retomada depende de Q-TIMER-01.

US-017 Ready após refinamento vivo e confirmação da stack; Q-TIMER-01/02 para #18
continuam abertas e a milestone não está pronta. Sem prometer serviço ou alarme
fora do app. Segurança do host #61 e auditoria #51 seguem pendentes; não autorizam
instalação no aparelho por inferência. Ver [auditoria](../../docs/backlog-audit.md).

## Decisões arquiteturais

- Diretriz confirmada: React Native; MVP sem backend.
- US-017: TypeScript, módulo pequeno por capacidade, estado confirmado/SQLite separado, relógio injetável nos cálculos; provider/tela/rota alinhados aos padrões atuais.
- Pendente: política de avisos/som/vibração de #18; não antecipar nesta branch.
- Proibido tratar este plano como aprovação de requisitos ausentes. Decisões funcionais voltam ao GitHub e decisões técnicas serão registradas neste plano quando fundamentadas.

## Progresso parcial US-018: reconciliação

progress-alert-reconciliation.ts calcula cancelamentos, intenções futuras e
consumo de marcos passados/presentes sem efeitos nativos. Um marco consumido
impede repetição, mas não prova entrega pelo OS: o nome legado delivered do
snapshot/tabela representa este registro mínimo de decisão. consumeElapsed
registra marcos alcançados inclusive em pausa/reabertura/conclusão, sem emitir
rajadas; consumeOwned exige ID registrado da identidade atual, inclusive quando
observado antes do deadline após alteração do relógio. Não apaga ownership.
Rollback/readback/revisões/identidade antiga e reabertura continuam protegidos.

progress-alert-coordinator.ts coordena este store e o adaptador por fila própria:
persistir intenção antes de schedule, query antes de retry, cancelar/dismiss e
confirmar ausência antes de forget/desabilitação. Restaurar visual-only não
carrega SDK; opção confirmada consulta permissão sem solicitar, e confirmação
humana permanece necessária para requestSystemPermission e habilitação nova.
Perda de permissão cancela apenas IDs próprios e informa erro, mantendo escolhas
locais. Falhas/RPC incerto preservam intents/estado para retry explícito, sem
ultrapassar chamada pendente. Revisões são relidas antes/depois dos RPCs; schedule
que se torna obsoleto é cancelado, sem aplicar a ação a uma sessão nova. dispose
impede publicação/forget posteriores e delega cleanup de schedule tardio ao motor.

25 testes novos de cálculo e integração com SQLite real do Node/engine falso;
468 testes/66 suítes completos, lint/tipos sem warnings, Doctor21/21,56 tooling
e validador verdes. Nenhum aparelho, notificação, som ou build real executado.
Provider/AppState/ticks/aviso visual/tela/retorno/confirmar permissão por UI e
conexão às ações do timer ainda faltam; todas as tasks US-018 seguem pendentes.
O futuro provider deve usar snapshot/revisão atual no retry após cancelamentos
parciais, sem declarar a preferência antiga desativada antes de confirmação.
Integração de ações deve passar expectedSessionNumber ao timer; este coordenador
ainda não executa essas ações nem assina callbacks onReceived automaticamente.
Gate nativo continua necessário para SQLite Expo, notificações, permissões,
relógio/foreground/background/lockscreen/cancelamento/som/vibração e assistivo.

### Identidade integrada às ações do timer

readVersioned/actVersioned retornam sessão e identidade dentro da mesma
transação; read/act legados continuam disponíveis. TransitionTimerProvider agora
restaura/retém ambos e usa actVersioned em todas as ações, sem depender do motor
de notificações para iniciar/pausar/retomar/cancelar. A confirmação de cancelamento
captura também a identidade; recusa outro timer mesmo com duração/deadline iguais.
Nenhuma atualização otimista ou permissão/capacidade nativa nova. Fixtures de
componentes/navegação foram adaptadas explicitamente ao contrato versionado,
sem fallback silencioso para stores que não o implementam. SQLite real do Node
verifica reabertura/rollback/identidade nova e metadata inválida; componentes
verificam que a confirmação antiga não cancela a nova sessão.

progress-visual-crossing.ts calcula somente um cruzamento corrente de marco,
com identidade/deadline/preferências iguais entre amostras foreground. Não emite
na primeira amostra, pausa/retomada, background/restauração, mudança de escolhas,
marco consumido, conclusão ou múltiplos marcos após uma parada longa. Compara
delta do relógio civil e monotônico: tolerância técnica de1 segundo (cadência do
timer), não promessa de precisão nativa; saltos divergentes não geram aviso.
O modelo ainda não está conectado ao provider de avisos nem publica mensagens.
Persistir decisão antes de apresentar, consumir vencidos sem replay e nunca
escrever por tick permanecem responsabilidades da próxima integração.

13 testes novos; suíte481/67,56tooling,lint/tipos sem warnings,Doctor21/21 e
validador verdes. Provider próprio de avisos/callbacks/AppState/retry, apresentação
visual e UI de preferências/consentimento ainda faltam. Todas tasksUS018 pendentes,
sem PR/merge/Issue fechada/build/aparelho/notificação real por este avanço.

### Provider e callbacks US-018

ProgressAlertsProvider agora envolve o Stack dentro de TransitionTimerProvider.
Inicializa armazenamento depois da restauração do timer para não disputar a
migração inicial; promessa compartilhada e owner ativo evitam duplicação no
replay StrictMode. Cada owner possui coordenador/subscription/intervalo e cleanup,
sem reiniciar o motor ao simplesmente atualizar a leitura do timer. AppState e
mudanças confirmadas de sessão/fase acionam reconciliação; pedido pendente não
bloqueia ações do timer. Preferences/read/snapshot/error/busy/retry/save/pedido
de permissão são expostos por contexto próprio; SDK permanece lazy, sem prompt
ao abrir ou restaurar visual-only. Nenhum write em tick comum.

sampleVisual no coordenador confirma revisão e persistência antes de retornar
um marco para apresentação; saída de foreground, fila/commit lento ou amostra
obsoleta não publicam evento atrasado. O provider guarda identidade/deadline do
aviso e não o reutiliza numa sessão nova ou retomada. Ainda não há componente
para mostrar esse estado ou tela de preferências. Retorno de background consome
passados sem replay; erro de commit mantém dados e retry não recupera aviso antigo.

O coordenador agora assina onReceived quando a capacidade realmente é criada,
com getter de ownership atual, coalescência de callbacks pendentes por ID e
guards de dispose. Callback consumido só pode virar estado visual num cruzamento
foreground atual, depois de commit e com identidade/deadline corretos; não basta
observar que o pedido existe. Receipts atrasados/background/duplicados não
autorizam apresentação. Observadores não propagam exceções para o evento nativo.
Cleanup remove subscription e invalida callbacks; owned intents ainda seguem
ledger/cancelamento confirmado. RPC nativo continua serial/sem ultrapassagem,
não equivale a garantia de pontualidade, entrega ou efeito tardio em aparelho.

Sete testes integrados novos com providers reais/SQLite do Node/motor falso:
StrictMode, sem SDK no visual-only, commit antes do estado visual, ticks sem
write, clock jump, background/retorno, consent separado, unsubscribe, timer
utilizável com schedule pendente/cleanup obsoleto, rollback/retry sem replay e
callbacks duplicados/desmontados. Bootstrap passou a aguardar efeitos assíncronos
com act, sem suprimir avisos do React. UI e verificações nativas/assistivas ainda
pendentes; nenhuma task US-018 concluída por essa integração interna.

## Entrega local US-018

ProgressAlertSettings integrado ao ScrollView real do timer: editor voluntário,
Switch enabled, checkboxes10/5/2, opção do sistema com explicação/confirmar/cancelar
antes do pedido nativo. Draft só é descartado após salvar confirmado ou cancelar;
negação conserva escolhas visuais, falha/retry mantém estado e não mostra sucesso.
Cancelar durante pedido de permissão invalida resposta tardia sem salvar/autoplay;
durante salvar explícito, duplicatas e cancelamento do draft ficam bloqueados até
resultado. Desabilitar todos confirma cancelamento próprio antes de sinalizar
desativação e conserva marcos para próximas sessões, sem apagar o timer.

ProgressAlertNotice no Stack exibe marco foreground persistido em faixa neutra,
texto18 escalável/LiveRegion polite e fechar48dp, sem animação/som/haptic nem
floating card. Modal nativo fullscreen continua acima do Stack, sem novos
controles globais por cima dele; foco/anúncio assistivo nessa situação é gate
nativo, não verificação alegada. Modo9/back/painel/timer permanecem inalterados.

Nove testes UI integrados novos com SQL real do Node/engine falso: defaultoff/
offline/salvar/cancelar, consent independente/negação, erro/retry/draft,
desabilitação falha/confirmada mantendo escolhas e sessão, resposta tardia após
cancelar, aviso escalável/fechar sem gravação e duplicatas/sucesso prematuro.
85 testes US-018 em cinco suítes,497 testes/67 suítes completos,56 tooling,
lint/tipos sem warnings,Doctor21/21,validador/diffcheck verdes. T006–T009 locais
verificadas; T010 permanece no gate. Revisão não encontrou regressão local
impeditiva; não equivale a host seguro, notificação nativa validada, assistivo,
build aprovado ou milestone/release concluída. O host SSH ainda não permite
verificação administrativa dos processos/lock: build nativo deve aguardar isso,
sem duplicar jobs ou instalar APK sem consentimento específico.
