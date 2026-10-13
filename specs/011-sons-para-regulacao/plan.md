# Plano de implementação — Sons para Regulação

Spec: [spec.md](spec.md). Milestone #19; Issues #27, #28. Plano proposto, sujeito às questões em aberto.

## Stack

Inspeção em 2026-10-13: Expo57.0.28/RN0.86.3/React19.2.3, TypeScript strict,
Router e Node24.21.0/npm11.19.0, Jest/RNTL/checks leves existentes. Áudio de mídia
e slider agora instalados nas versões exatas expo-audio57.0.5 e
@react-native-community/slider5.2.0, conforme bundledNativeModules.json.
expo-asset57.0.19, já transitivo, declarado diretamente para autolinking do peer
nativo exigido pelo áudio; Doctor identificou a ausência e passou21/21 após essa
correção. Lockfile adiciona somente dois pacotes e a referência direta ao asset,
sem novas dependências runtime transitivas. FFmpeg já disponível
para gerar assets originais com DSP existente, não para compilar aplicativo.

## Arquitetura atual

Main46b0268 integra CAA/voz, rotinas, perfil/apoio/contato, modo de baixa estimulação
e timer visual. Reutilizar Native TTS existente, não reimplementar voz. Provider
restrito a um player de mídia/controle de escolhas, preservado entre rotas e
coordenação com SpeechControls, sem exposição do texto da frase. Rota/tela próprias
e acesso pelo quadro; painel #10 não pertence à branch. Falha da nova capacidade
não pode bloquear comunicação; criação tardia do engine e descarte/listeners
devem ser verificados nas interfaces das versões instaladas.

## Estratégia

Implementar uma Issue por branch, a partir de main atualizada, seguindo RFs e critérios originais. Começar pelo menor fluxo verificável; separar lógica de estado, apresentação e acesso a capacidades do dispositivo apenas quando necessário. Resolver as questões bloqueantes da história antes de iniciar.

Não implementar a milestone inteira em uma branch. A inicialização técnica precisa de uma Issue vinculada ou inclusão explícita no escopo da primeira história, registrada no GitHub; esta documentação não autoriza criar produto adicional.

## Componentes envolvidos

Módulo proposto: `src/features/regulation-sounds/`.

- `src/features/regulation-sounds/sound-player` — [US-027] Reproduzir sons de regulação.
- `src/features/regulation-sounds/sound-timer` — [US-028] Definir temporizador para sons.

## Modelo de dados

Catálogo fixo de quatro IDs e labels honestos de síntese, mapeados a quatro WAVs
empacotados. Escolhas voláteis: selectedSoundId inicialmente null, volume0.25 e
backgroundPlaybackfalse. Normalização estrita, sem coerção/diagnóstico ou valores
inferidos do perfil. Estado do player separado das escolhas e observado na API
nativa, não "playing" por intenção/chamada. Escolher/trocar/cancelar invalida
pedidos antigos, pausar disponível em carregamento/reprodução, erros recuperáveis
sem início tardio. Não implementar prazo/término #28 neste modelo.

## Persistência

Andamento inicial US-027: `sound-settings.ts` define quatro escolhas com labels
honestos e valida somente seleção/volume/opção, sem inventar status de reprodução.
Seis testes relacionados e suíte completa316 testes/49 suítes, lint/tipos verdes.
Quatro assets reais agora em `assets/regulation-sounds/`: PCM16 mono24kHz/23s,
seeds/filtros/checksums/licença e versão FFmpeg6.1.1 registrados no manifesto.
Gerador versionado recusa destino existente/symlink, publicação usa criação
exclusiva, sem sobrescrever arquivos pessoais. Validação somente leitura confere
integridade/formato/duração, sinais distintos, RMS/pico/DC/silêncio e fronteira.
Regeneração em diretório temporário produziu manifesto e hashes idênticos; sete
testes tooling exercitam integridade/ausência/duplicação/níveis e preservação.
Suíte tooling56 verde, lint/tipos e validador verdes. Escuta e loop imperceptível
não alegados; documentação de origem/limites no README junto aos arquivos.

Dependências/configuração, engine/controller e provider integrado à voz avaliados;
UI/slider, rota/acesso, opção confirmada de background e revisão de interface
ainda faltam. Nenhuma task concluída
pelo modelo/assets isolados, nenhum fluxo de reprodução alegado como entregue.

Assets locais essenciais, sem banco novo ou restauração de autoplay. Seleção,
volume e opção não persistidos nesta história; retomada de processo exige nova
escolha/início. Gerador versionado deve recusar sobrescrita de arquivos alheios,
registrar parâmetros/checksums/licença Apache2.0 e quatro sinais distintos. Validar
WAV/PCM, duração, RMS/picos/silêncio e loop; a qualidade percebida fica no gate.

## Fluxos principais

Sequência de capacidades: Reproduzir sons de regulação → Definir temporizador para sons.

Validar cada critério no seu fluxo e as integrações indicadas em spec.md; a sequência não impõe um único percurso de interface.

## Offline

Sons empacotados e player nativo, sem URLs de streaming, download obrigatório ou
serviço externo. Sem flag de segundo plano, pausar ao background e não retomar
sozinho. Flag opcional confirmada permite sessão nativa/background/lockscreen,
sem prometer força contra OS/force-stop. Metadados fixos/genéricos apenas. TTS
pausa ambiente e impede novo início enquanto fala; liberar coordenação após
conclusão/cancelamento/erro/unmount, sem auto-retomar o ambiente. Testar pedidos
cancelados/tardios e interrupções; SDK/lifecycle reais exigem gate nativo.

Recursos locais não devem depender de autenticação ou API. Capacidades externas explicitamente solicitadas devem informar indisponibilidade sem impedir os recursos locais; não confundir falta de backend próprio com ausência de qualquer serviço externo futuro.

## Acessibilidade

Aplicar RNF-001 e a Skill accessibility-neuroinclusive: rótulos e ordem de foco, leitor de tela, texto ampliado, contraste e alvos de toque. Verificar teclado quando suportado pelo dispositivo. Respeitar preferências de som/movimento e não ativar mídia inesperadamente. Critérios mensuráveis faltantes precisam de refinamento, não de aprovação automática.

## Privacidade e segurança

Aplicar RNF-002 e RNF-004. Usar dados sintéticos nos testes; evitar dados pessoais em logs. Controlar compartilhamento e permissões nas ações que realmente necessitam deles. Não adicionar telemetria, conta ou serviço externo por conveniência técnica.

## Estratégia de testes

- Derivar cenários de cada RF, preservando a relação Issue → RF → task → teste.
- Usar testes unitários para transformações de estado/dados; componentes para interação e acessibilidade; integração para persistência/capacidades nativas quando pertinentes.
- Exercitar os casos de erro do spec e regressões das dependências reais.
- Verificar em dispositivo/simulador os fluxos que dependem de voz, áudio, permissões ou notificações; mocks isolados não comprovam suporte nativo.
- Selecionar E2E para fluxos críticos quando a infraestrutura existir. Executar testes, lint, typecheck e checks leves; builds somente remotos no SHA integrado da main.

Unitários de escolhas/catálogo/volume/opção, validação real dos assets, controlador
com engine falso e cancelamento/lifecycle, componentes/rotas/slider/estados e
regressão TTS. Suíte completa, lint/tipos/Doctor,49 tooling e validador. Gate deve
validar escuta/loops/volume, offline, foco/silêncio/interrupções/desconexões,
background/lockscreen/serviço, TTS e leitores de tela/foco/ampliação em Android/iOS;
mocks/build não comprovam esses resultados nem segurança auditiva.

## Dependências técnicas

Planejar expo-audio e slider recomendados pelo SDK como engine/controle existentes,
sem player nativo artesanal/framework de mídia. [Audio SDK57](https://docs.expo.dev/versions/v57.0.0/sdk/audio/)
e [Slider](https://docs.expo.dev/versions/v57.0.0/sdk/slider/) são fontes primárias.
Plugin de playback: capacidade audio iOS e foreground media playback Android;
gravação/microfone explícitos desabilitados, sem requests de recording. Rever
manifest/plist/permissões efetivas, não assumir defaults do pacote. Introspecção
real `expo config --type introspect --json` avaliou mods somente em memória,
sem criar projetos nativos ou compilar. Quatro testes verificam serviço
AudioControlsService não exportado/mediaPlayback, FOREGROUND_SERVICE e
FOREGROUND_SERVICE_MEDIA_PLAYBACK/MODIFY_AUDIO_SETTINGS, RECORD_AUDIO removido,
nenhum serviço de gravação ou permissão POST_NOTIFICATIONS/foreground microphone,
audio iOS sem NSMicrophoneUsageDescription; backup Android continua false.
Isso não substitui revisão do manifesto mesclado final no APK.

Sessão de áudio futura configurada segundo flag confirmada, não ajustes globais.
Fontes/types instaladas confirmam `createAudioPlayer`, status event/listener,
setAudioModeAsync e controle de mídia. `AudioPlayer` herda `release()` de
SharedObject; Android sharedObjectDidRelease e iOS sharedObjectWillRelease limpam
recursos, listener tem `remove()` próprio. Existe também método player.remove(),
mas não confundir remoção do registro com descarte do shared object. Controller
e testes do lifecycle isolado agora implementados; preservar criação tardia.

`expo-sound-engine.ts` mapeia quatro WAVs estaticamente, carrega expo-audio por
require tardio somente na factory chamada por Play (import de tipo apagado).
Não habilita downloadFirst nem keepAudioSessionActive; loop nativo, status real
reduzido a booleans sem texto de erro privado, volume somente do player.
Modo configurado conforme opção, recording/backgroundRecording false,
doNotMix para foco/controles, metadados fixos Som contínuo/TEAr sem artwork.
Cleanup remove listener, pausa, limpa controles e libera SharedObject em finally
mesmo em falhas intermediárias; idempotente. Oito testes do adapter com SDK falso,
incluindo import tardio e quatro IDs de assets distintos, não validam áudio real.

`sound-controller.ts` mantém seleção/ganho/opção voláteis, estado observado e
pedidos com geração/slot. Play não aparenta sucesso pelo comando: aguarda
loaded/playing sem buffering, bloqueia duplicatas, pausa/troca/foreground/speech
invalidam pedidos antigos; player de factory tardia é descartado sem tocar.
Native error/falha genérica preservam escolhas, player liberado, retry explícito.
Watchdog técnico30s de carregamento cancela/rejeita sucesso tardio; limpa no
estado observado ou cancelamento. Pausa usa estado observado e sinal stopping
enquanto o native ainda relata reprodução, sem afirmar pausa antecipadamente.
Mudança de background com engine pausa antes, configura serialmente e confirma
opção só após sucesso; falha preserva escolha anterior. Nenhuma confirmação UI
foi implementada por esse método, depende do futuro fluxo voluntário.

Lease de voz bloqueia play e pausa imediatamente; ready aguarda mudanças nativas
de sessão anteriores, sem aguardar factory pendente já cancelada. Limite técnico
3s de ready em RPC sem resposta libera tentativa de voz e descarta ambiente em
erro, sem liberar reprodução antiga. release idempotente cancela deadline,
cancelamento/unmount limpa waits; nunca retoma ambiente automaticamente. Essas
APIs agora ligadas a SpeechControls pelo provider global, sem reimplementar TTS:
lease antes de ready, token ativo/cancelado verificado novamente após await,
antes de disponibilidade/fala. Conclusão/indisponível/erro/stop confirmado liberam;
stop que falha com fala viva mantém lease até a promise de leitura terminar,
inclusive após unmount. Cancelar antes da fala libera ready e não inicia tarde.
Foco/interação de sessão nativa e efeito de RPC muito tardio precisam do
gate real; mocks não comprovam prioridade de áudio em aparelho.

22 testes do controller e oito do adapter (36 com seis do modelo) exercitam
cancelamento/duplicatas/estado observado/buffering/erros/gain0/background/leases,
limites/readiness/lifecycle. Provider/adapter agora conectados ao RootLayout,
mas a tela/rota de sons ainda ausentes; nenhum som emitido ou critério de fluxo
marcado entregue nessa implementação.

RegulationSoundsProvider cria controller no efeito e descarta no cleanup,
seguro para replay StrictMode; assinatura de snapshots e AppState são removidas,
trocar subview não recria player. Voz permanece utilizável sem provider ou antes
da montagem, sem inicializar áudio de mídia só para ler. Child SpeechControls
mantém request/cancel/finished e padrões originais; native local-speech intacto.
Onze testes integrados com engine/TTS falsos: StrictMode, ordem pausa→voz,
leases/bloqueio/sem autoresume, indisponível/query-error/speech-error, falha de
stop vivo/montado e desmontado, cancelamento antes de ready, factory falhando,
AppState/background e cleanup de voice-control sem descartar player global.
Teste de consulta de voz pendente existente agora aguarda ready em microtask
antes de cancelar, preservando o cenário de consulta efetivamente pendente.

Licenças MIT expo-audio/expo-asset preservadas dos pacotes fixados; slider omite
LICENSE no npm, texto obtido de LICENSE.md no tag v5.2.0 upstream,
commit a7c1169f292763efb43b3089cd7b513a9db94d8b. Artefatos Android/iOS concatenam
todos docs/third-party-notices/*.txt, preservando libphonenumber e novos avisos.
Teste confere textos e inclusão em ambas distribuições. Licenças transitivas
nativas/empacotamento final continuam parte da revisão remota, não garantidas
apenas pelos textos npm. Audit antes/depois: mesmos66 apontamentos (16moderate,
49high,1critical), nenhum advisory novo; #51 permanece aberta, sem audit fix force.
Oito testes relacionados/configuração/avisos, suíte321/50, tooling56, lint/tipos,
Doctor21/21 e validador verdes nessa etapa anterior. Após controller/adapter:
suíte351/52, tooling56, lint/tipos sem warnings, Doctor21/21 verdes. Assets,
capacidades/controller/adapter e provider/TTS preparados; após integração,
suíte362/53, tooling56, lint/tipos, Doctor21/21 verdes. Tela de sons/slider/rota e
empacotamento nativo ainda não validados.

## Riscos

Arquivo indisponível, falha de reprodução e interrupção do áudio; cancelamento do timer separado do player (#27/#28).

US-027 Ready após refinamento e confirmação de capacidades da stack; implementação
e escuta nativa ainda faltam. Q-SOM-02 de término #28 não resolvida; não antecipar
timer ou liberar milestone. Auditoria #51 e segurança do host #61 continuam
pendentes, não autorizam instalação no celular. Ver [auditoria](../../docs/backlog-audit.md).

## Decisões arquiteturais

- Diretriz confirmada: React Native; MVP sem backend.
- US-027: TypeScript, assets locais procedurais declarados, engine/slider SDK recomendados, escolhas voláteis e coordenação mínima com TTS existente.
- Pendente: UI/rotas/slider/confirmação de background e revisão de interface; validação nativa de permissões/escuta/background/TTS/lifecycle e política própria de término #28.
- Proibido tratar este plano como aprovação de requisitos ausentes. Decisões funcionais voltam ao GitHub e decisões técnicas serão registradas neste plano quando fundamentadas.
