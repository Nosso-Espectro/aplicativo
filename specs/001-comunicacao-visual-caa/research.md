# Research — Comunicação Visual / CAA

Data: 2026-09-23. Escopo: registrar decisões e pesquisas técnicas do plano, sem inicializar a aplicação.
As decisões técnicas foram tomadas para orientar uma Issue de bootstrap; dependências não foram instaladas e o app não foi inicializado. As Issues e os critérios funcionais permanecem na [spec](spec.md).

## Estado real do repositório

- **Decisão**: não há implementação móvel, manifesto de dependências, projeto Android/iOS,
  build de app ou runner de testes para preservar.
- **Racional**: inspeção dos arquivos do repositório encontrou apenas documentação, specs,
  scripts Bash/Python e testes de tooling.
- **Alternativas consideradas**: adotar React Native Community CLI ou inferir stack de um
  diretório que não existe. A decisão de planejamento agora seleciona Expo SDK 57, TypeScript,
  Expo Router e SQLite local; a escolha é documentada abaixo e não inicializa código.
- **Resultado**: não há arquitetura existente a preservar. A arquitetura mínima proposta e
  suas justificativas constam de `plan.md` e estão vinculadas à US-041/#41; executar o
  bootstrap ainda exige DoR e branch técnica própria.

## Organização e fronteiras

  - **Decisão**: manter a arquitetura de produto limitada às cinco histórias de produto e seus critérios;
  separar responsabilidades somente quando o bootstrap e os fluxos implementados mostrarem
  uma necessidade real.
- **Racional**: a spec já determina os limites observáveis de quadro, composição, fala,
  cartões personalizados e favoritos. Camadas genéricas de repositório/serviço, infraestrutura
  de backend e abstrações de estado não são exigidas.
- **Alternativas consideradas**: criar arquitetura modular genérica antes do app existir,
  rejeitada como abstração prematura. A estrutura feature-oriented de `plan.md` separa somente
  rotas, cinco fluxos de produto, dados locais e o módulo nativo necessário à restrição de fala
  offline.

## Dados locais e ciclo de vida

- **Decisão**: preservar os cartões iniciais locais; salvar cartões personalizados/imagens e
  favoritos/ordem no dispositivo; manter frase apenas durante a sessão, inclusive em segundo
  plano, e iniciar vazia após encerramento/reabertura.
- **Racional**: segue RF-001, RF-005–RF-008, RF-013–RF-019 e decisões registradas na spec.
  O modelo lógico está em [data-model.md](data-model.md).
- **Alternativas consideradas**: persistir frases após encerrar ou sincronizar dados;
  rejeitadas porque não estão no requisito e ampliariam exposição/regras de recuperação.
- **Falha de gravação**: cartão mantém edição preenchida, informa falha e permite tentar
  novamente/cancelar; favoritos retêm a última ordem salva, informam falha e permitem retry.
  Nunca apresentar sucesso quando a gravação falha.

## Offline, privacidade e permissões

- **Decisão**: conteúdo inicial, composição, cartões próprios e favoritos são utilizáveis
  offline desde a primeira abertura. Textos, imagens e frases permanecem locais, não são
  enviados a serviços externos e não entram em logs de erro.
- **Racional**: exigência da milestone #9, RF-001/RF-012/RF-016/RF-019 e RNF-002.
- **Alternativas consideradas**: conta, telemetria, sincronização, backend, banco remoto,
  TTS por rede ou compartilhamento automático; todos rejeitados por não serem necessários
  e por contradizerem a privacidade aprovada.
- **Permissão de câmera**: solicitá-la somente quando o usuário optar por câmera; se negada
  ou indisponível, informar e permitir salvar sem imagem. A opção por arquivo continua conforme
  RF-014, via UI de sistema do `expo-image-picker`; manter desativado download de mídia remota
  e remover permissão de microfone, que o módulo adiciona por padrão no Android.

## Text-to-Speech local em pt-BR

- **Decisão**: atender Android e iOS com voz local pt-BR quando compatível e instalada.
  Verificar disponibilidade na execução e reproduzir sem rede; se ausente ou falhar, manter
  frase visível e anunciar indisponibilidade de modo acessível. Nunca recorrer a voz remota.
- **Racional**: as APIs do sistema expõem a disponibilidade de idioma/voz instalada; não
  garantem a presença universal de voz pt-BR em todos os aparelhos. Disponibilidade real é
  uma condição do dispositivo, não motivo para bloquear a comunicação visual.
- **Android**: a API oficial diferencia suporte exato a locale de aproximações por idioma
  ou país e expõe vozes disponíveis; uma voz pode exigir rede. Verificar locale pt-BR e
  condição offline antes de falar. Vozes/dados podem estar ausentes ou ser instalados depois;
  a disponibilidade deve ser reavaliada após retorno de fluxo do sistema.
- **iOS**: a API oficial lista as vozes presentes e seus locales. A documentação pública
  consultada não expõe uma propriedade equivalente que garanta que uma voz não exija rede;
  validar reprodução em modo avião em dispositivos reais. Vozes aprimoradas podem depender
  de download e ser removidas pelo usuário.
- **Alternativas consideradas**: síntese em nuvem (rejeitada por privacidade/offline), baixar
  voz automaticamente (não aprovado e exige fluxo extra), prometer voz em todos os dispositivos
  (sem suporte documental). A falta de voz usa a alternativa visual aprovada.
- **Validação requerida**: verificar em dispositivos Android e iOS representativos, com e sem
  pt-BR instalado, sem rede, após instalar/remover voz e durante falha/interrupção da síntese.
  Emulador isolado não comprova catálogo de vozes disponível em aparelho real.

Fontes primárias:

- [Android TextToSpeech API](https://developer.android.com/reference/android/speech/tts/TextToSpeech)
- [Android Voice API](https://developer.android.com/reference/android/speech/tts/Voice)
- [Android TextToSpeech.Engine](https://developer.android.com/reference/android/speech/tts/TextToSpeech.Engine)
- [Apple AVSpeechSynthesisVoice](https://developer.apple.com/documentation/avfaudio/avspeechsynthesisvoice)
- [Apple speechVoices()](https://developer.apple.com/documentation/avfaudio/avspeechsynthesisvoice/speechvoices())
- [Apple voice language](https://developer.apple.com/documentation/avfaudio/avspeechsynthesisvoice/language)
- [Apple: alterar voz e idioma](https://support.apple.com/pt-br/111798)

## Acessibilidade e interação

- **Decisão**: seguir WCAG 2.2 AA quando aplicável; permitir ampliação do texto sem perda
  de conteúdo/função; cumprir o mínimo AA aplicável a alvos de toque ou justificar exceção
  de interface móvel; revisar foco, leitor de tela, nomes acessíveis, contraste e linguagem.
- **Racional**: constituição, RNF-001 e skill neuroinclusiva. Revisão qualitativa registra
  consistência e previsibilidade para baixa carga cognitiva sem inventar nova métrica.
- **Comportamento sensorial**: seleção não inicia áudio; reprodução exige ação explícita e
  pode ser interrompida. Estados vazios e mensagens de erro informam o necessário sem bloquear
  caminhos locais. A composição permanece visível mesmo sem voz.
- **Alternativas consideradas**: avisos sonoros automáticos, fala em cada toque ou depender
  de um único canal sensorial; rejeitadas por controle do usuário e previsibilidade.

## Estratégia de qualidade

- **Decisão**: usar Jest, `jest-expo` e `@testing-library/react-native` para testes de
  comportamento JS; `npx expo lint` (ESLint), `npx tsc --noEmit` e `npx expo-doctor` para
  qualidade estática/compatibilidade. Os comandos ainda não podem ser executados até o
  bootstrap. Builds e validações nativas serão feitos em Android e iOS reais/simulados;
  revisão assistiva manual complementa automação.
- **Cobertura orientadora**: ordem/snapshot de frase, edição/exclusão e referências favoritas;
  validação de cartões; persistência em reinício para cartões/favoritos; primeiro uso sem rede;
  falhas de gravação; câmera negada/imagem omitida; favoritos e frase vazios; fala explícita,
  interrupção, indisponibilidade de pt-BR e reprodução offline Android/iOS.
- **Privacidade**: dados sintéticos; verificar ausência de conteúdo em rede/logs. Usar revisão
  manual assistiva em aparelho real quando disponível.
- **Alternativas consideradas**: instalar runner ou bibliotecas apenas para fazer o plano
  parecer validável, rejeitada. O quality gate atual contém `null` e continuará bloqueando
  release até receber comandos reais no bootstrap.

## Pendências de produto e de execução

- Aprovar no GitHub o mapeamento das dez mensagens para as três categorias e o conjunto
  licenciado de pictogramas do Flaticon antes de declarar US-001/#1 Ready.
- Concluído: descrição da milestone #9 reconciliada e esclarecimentos de limite de frase,
  validação de título/categoria e demais refinamentos registrados nas Issues #1–#5. Essa
  sincronização não declara histórias Ready nem implementadas.
- US-041/#41 (bootstrap técnico) está publicada e aberta na milestone #9. Consultar sua
  Definition of Ready e iniciar apenas em branch técnica própria; a publicação não autoriza
  nem representa a execução do bootstrap. O plano fixa Node 24.21.0/npm 11.19.0, com
  fallback Node 22.23.3/npm 10.9.9 se houver incompatibilidade comprovada.
- Validar posteriormente o suporte local de voz pt-BR em aparelhos reais; APIs e catálogo de
  vozes variam por dispositivo e não podem ser certificados apenas em testes simulados.

[Issue técnica de bootstrap](../../docs/bootstrap-tecnico.md) registra o vínculo no backlog.
Não é preciso inicializar a stack para escolhê-la no plano; inicializá-la exige a revisão de
prontidão da US-041/#41.
Pictogramas e mapeamento das mensagens bloqueiam o conteúdo da #1, não essa pesquisa.

## Stack React Native e versões

- **Decisão**: Expo SDK 57 stable, React Native 0.86, React 19.2.3, TypeScript strict e
  Hermes. Fixar Node.js 24.21.0 LTS/npm 11.19.0 (bundled) em `.nvmrc`/CI com
  `package-lock.json`. Node 24 excede o mínimo Expo 22.13.x; validar Expo Doctor/build no
  bootstrap. Fallback reproduzível em caso de incompatibilidade: Node 22.23.3/npm 10.9.9.
  Na data da pesquisa, SDK 58 está em beta; versões do Expo SDK alinham as versões RN/React.
- **Racional**: React Native recomenda um framework para novos apps e indica Expo; o SDK 57
  é a versão estável mais recente consultada e a compatibilidade dos módulos pode ser mantida
  com `npx expo install`. Os mínimos publicados pelo SDK 57 são Android 7/API 24 e iOS 16.4.
- **Alternativas consideradas**: React Native Community CLI ofereceria controle nativo
  direto, mas exige compor e manter mais configuração Android/iOS sem necessidade comprovada;
  SDK 58 beta não atende a preferência por base estável; SDK 56 é alternativa de recuo se uma
  incompatibilidade do SDK 57 for descoberta no bootstrap.
- **Alternativa Node**: Node 22.23.3 LTS atende diretamente ao mínimo Expo; Node 24.21.0 é a
  linha LTS corrente e tem manutenção mais longa. Usar o fallback somente se a cadeia SDK57/
  RN0.86 falhar de modo reproduzível nos checks do bootstrap.
- **Fontes**: [matriz de versões Expo](https://docs.expo.dev/versions/latest/),
  [lançamento do SDK 57](https://expo.dev/changelog/sdk-57),
  [recomendação do React Native](https://reactnative.dev/docs/next/environment-setup),
  [TypeScript no React Native](https://reactnative.dev/docs/typescript),
  [Node 24.21.0/npm 11.19.0](https://nodejs.org/en/download/archive/v24.21.0),
  [Node 22.23.3/npm 10.9.9](https://nodejs.org/en/download/archive/v22.23.3).

## Navegação, armazenamento e recursos nativos

- **Decisão — navegação**: Expo Router com Stack nativo, rotas somente para as telas da CAA.
  Não adicionar navegação manual paralela nem recursos de deep-link compartilhável.
- **Alternativas**: React Navigation direto é válido mas repete instalação/configuração que
  o template Expo atual já oferece; navegação manual deixaria o histórico de retorno sob código
  próprio e seria menos previsível.
- **Decisão — persistência**: `expo-sqlite` sem ORM para cartões personalizados e favoritos
  ordenados; dados iniciais permanecem como catálogo/recursos locais no bundle; frase fica em
  estado de sessão. `expo-sqlite` persiste entre reaberturas e suporta transações. Imagens
  selecionadas devem ser copiadas por `expo-file-system` para o sandbox privado e referenciadas
  por URI/path local no dado do cartão.
- **Alternativas**: AsyncStorage chave-valor é menor para preferências simples, mas exige
  serializar relações e atualizações consistentes entre cartões/favoritos; SQLite já resolve
  esse modelo sem acrescentar ORM. Não armazenar imagem como base64/BLOB.
- **Decisão — imagem**: usar `expo-image-picker` com UI de sistema, permissão de câmera somente
  a pedido, download remoto de assets do iCloud desativado e `microphonePermission: false`.
  Arquivo não disponível localmente resulta em aviso e fluxo sem imagem, como a spec permite.
- **Fontes**: [Expo Router](https://docs.expo.dev/router/introduction/),
  [CNG/Prebuild](https://docs.expo.dev/workflow/continuous-native-generation/),
  [SQLite](https://docs.expo.dev/versions/latest/sdk/sqlite/),
  [Image Picker e permissões](https://docs.expo.dev/versions/latest/sdk/imagepicker/),
  [FileSystem](https://docs.expo.dev/versions/latest/sdk/filesystem/).

## Ferramentas de qualidade e fluxo nativo

- **Decisão**: Jest + `jest-expo` + React Native Testing Library; TypeScript `strict` com
  `tsc --noEmit`; ESLint via `npx expo lint`; `npx expo-doctor`; comandos locais
  `npx expo run:android` e `npx expo run:ios`. GitHub Actions executará `npm ci`, testes,
  lint, typecheck e verificação Expo; builds Android/iOS e checks de acessibilidade dependem
  de SDKs/runners reais. Configurar quality gate após bootstrap e manter nulos os gates até
  existirem comandos executáveis.
- **Alternativas**: Prettier, E2E Maestro/Detox, EAS e cloud build foram deixados de fora
  para reduzir dependências e serviços; reavaliar somente com necessidade concreta. Expo Go
  não é o ambiente final para módulos nativos personalizados; usar development build local.
- **Fontes**: [Jest com Expo](https://docs.expo.dev/develop/unit-testing/),
  [development builds](https://docs.expo.dev/develop/development-builds/introduction/),
  [acessibilidade React Native](https://reactnative.dev/docs/accessibility),
  [testes GitHub Actions para Node.js](https://docs.github.com/en/actions/tutorials/build-and-test-code/nodejs).

## Text-to-Speech local: decisão de integração

- **Decisão**: não incluir `expo-speech`; encapsular APIs nativas num Expo Module local
  `modules/tear-speech`. Em Android, consultar `Voice.isNetworkConnectionRequired`, aceitar
  somente voice pt-BR presente/local e chamar `TextToSpeech.speak` explicitamente; em iOS,
  usar voz pt-BR disponível via `AVSpeechSynthesisVoice` e `AVSpeechSynthesizer`. Expor ao JS
  apenas disponibilidade, falar e parar. Sem pausa, downloads, instalação automática ou TTS
  remoto.
- **Racional**: a API documentada de Expo Speech lista vozes e fala, mas não expõe o campo
  Android que identifica dependência de rede. O requisito de privacidade/ofline torna essa
  distinção necessária; um módulo nativo pequeno evita pacote de terceiros e falha segura
  continua sendo a frase visível com orientação acessível.
- **Alternativas**: `expo-speech` é a solução menor e serve se uma revisão técnica no bootstrap
  provar como impedir qualquer voz que dependa de rede; atualmente não há sinal suficiente na
  API JS. Síntese remota e download automático foram rejeitados por privacidade, offline e
  ausência de consentimento/requisito.
- **Risco/validação**: iOS não oferece campo equivalente público de rede por voz. A lista de
  vozes instalada será respeitada, nunca solicitar download, e leitura será validada em modo
  avião em aparelhos reais. Se não for possível garantir comportamento local, não reproduzir.
- **Fontes**: [Expo Speech](https://docs.expo.dev/versions/latest/sdk/speech/),
  [Android Voice](https://developer.android.com/reference/android/speech/tts/Voice),
  [Android TextToSpeech](https://developer.android.com/reference/android/speech/tts/TextToSpeech),
  [Apple AVSpeechSynthesisVoice](https://developer.apple.com/documentation/avfaudio/avspeechsynthesisvoice),
  [Apple AVSpeechSynthesizer](https://developer.apple.com/documentation/avfaudio/avspeechsynthesizer).

## Fonte aprovada dos pictogramas

- **Decisão de produto**: usar [Flaticon](https://www.flaticon.com) como fonte dos pictogramas.
- **Seleção pendente**: ícones específicos e mapeamento das dez mensagens. Documentar URL, autor, licença e atribuições aplicáveis por recurso.
- **Offline**: distribuir os recursos iniciais localmente, conforme as permissões dos recursos selecionados, sem dependência do site durante o uso. Não foi escolhido plano de assinatura nem feita compra/download nesta decisão.

## Seleção visual atribuída ao agente

O agente responsável pela US-001 deve buscar e selecionar no Flaticon o pictograma adequado para cada uma das dez mensagens iniciais. A seleção deve priorizar correspondência com o significado da mensagem, clareza, legibilidade, consistência visual e baixa estimulação. Registrar por mensagem o ícone escolhido, a justificativa, a URL de origem, o autor, a licença e a atribuição aplicável; preparar os recursos para uso local offline conforme a licença. A escolha dos ícones é responsabilidade do agente, não uma decisão que deva ser devolvida ao usuário para cada recurso. Se não encontrar uma opção adequada ou não conseguir verificar a licença, registrar a lacuna específica, sem presumir adequação ou permissão.

Registrar a seleção na Issue #1 para revisão da entrega, sem exigir que o usuário escolha previamente cada ícone. A seleção ainda precisa ser executada; esta decisão não representa download ou implementação.
