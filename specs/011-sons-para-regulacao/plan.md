# Plano de implementação — Sons para Regulação

Spec: [spec.md](spec.md). Milestone #19; Issues #27, #28. Plano proposto, sujeito às questões em aberto.

## Stack

Inspeção em 2026-10-13: Expo57.0.28/RN0.86.3/React19.2.3, TypeScript strict,
Router e Node24.21.0/npm11.19.0, Jest/RNTL/checks leves existentes. Áudio de mídia
e slider ainda não instalados. bundledNativeModules.json recomenda expo-audio
~57.0.5 e @react-native-community/slider5.2.0; avaliar/installar versões fixadas,
lockfile/licenças/audit e preservar avisos antes de entrega. FFmpeg já disponível
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

Instalação/revisão das dependências, engine/provider, UI/slider, opção confirmada
de background e coordenação/regressão TTS ainda faltam. Nenhuma task concluída
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
manifest/plist/permissões efetivas, não assumir defaults do pacote. Sessão de
áudio configurada segundo flag confirmada, não mudar ajustes globais. Instalar
somente dependências justificadas e preservar licenças na distribuição; nenhuma
dependência nova foi instalada nesta etapa; assets de síntese já gerados e
verificados, mas ainda sem player/empacotamento nativo validado.

## Riscos

Arquivo indisponível, falha de reprodução e interrupção do áudio; cancelamento do timer separado do player (#27/#28).

US-027 Ready após refinamento e confirmação de capacidades da stack; implementação
e escuta nativa ainda faltam. Q-SOM-02 de término #28 não resolvida; não antecipar
timer ou liberar milestone. Auditoria #51 e segurança do host #61 continuam
pendentes, não autorizam instalação no celular. Ver [auditoria](../../docs/backlog-audit.md).

## Decisões arquiteturais

- Diretriz confirmada: React Native; MVP sem backend.
- US-027: TypeScript, assets locais procedurais declarados, engine/slider SDK recomendados, escolhas voláteis e coordenação mínima com TTS existente.
- Pendente: instalação/revisão de dependências/lifecycle e implementação do player/UI/TTS; escuta nativa dos assets e política própria de término #28.
- Proibido tratar este plano como aprovação de requisitos ausentes. Decisões funcionais voltam ao GitHub e decisões técnicas serão registradas neste plano quando fundamentadas.
