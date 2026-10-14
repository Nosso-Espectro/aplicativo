# Implementation Plan: P0 — Comunicação Visual / CAA

## Manutenção SDK57 US095

Issue95/Ready/baseoriginmain3172bbd: Doctor online20/21 pede patches publicados2026-10-14, manifests31 iguais àmain; sem atribuir o bloqueio àfeature ou inventar falha nativa. Manutenção isolada na branch chore95, US031 limpa/push/checkpoint8931ead preservado. Somente expo57.0.29/asset57.0.20/constants57.0.22/linking57.0.13/notifications57.0.23/router57.0.27; SDK57/React19/RN0.86/Node24.21.0/npm11.19.0 mantidos, nenhuma dependência funcional nova.

Antes de editar versão: conferir registry/version-integrity/licença/changelogs/fontes primárias. Expo/router patches novos sem mudanças user-facing listadas; notifications23 corrige import crash no Expo GoAndroid, não prova causa de crashesSSH antigos. Instalar por lockfile ignore-scripts, sem lifecycle/buildlocal/auditfixforce, limitar transitive churn ao necessário e revisar diff. Notices integrais devem corresponder às versões/fontes instaladas, especialmente asset/notifications; manter copyright/licençasupstream. Revalidar timestamps iOSseconds/Androidms, getNextTriggerDateAsync msambos, DAILY Androiddaily/iOScalendar e exportsRouter; não simular prova nativa.

Jestserial completo/linttipos/Doctor21/21/56tooling/validadordiffcheck/review/CIleve reais antesintegração; tasks somente verificadas. Ambos nativos/artefatos/noticesassinatura/manifestlicençasrede/assistivo/offline no SHAintegrado continuam gates pendentes; acessoadminfresh ausente jáavisado12:40Z não repetirnemrecuperarsegredos/CIkey/wrappersondagem. Nenhumhost/jobs/phone/preview8093/tagrelease nesta manutenção. Apósmerge95, sincronizar rootFFpreservandopessoais e integrar originmain na31 somenteárvorelimpa, repetir checks31 antesPR/DoD. Nenhum código/pacote95 implementado neste refinamento.

### Execução US095 (2026-10-14)

Os seis patches diretos foram instalados com npm install/ci --ignore-scripts.
Lockfile mantém o mesmo conjunto de pacotes: seis transitivos exigidos pelos novos
parents também mudaram (metro-runtime, prebuild-config, ui, autolinking, core e
CLI). xcpretty/drawer-layout foram preservados nas versões anteriores porque
seus patches não são necessários. Sem lifecycle/build local ou pacote funcional novo.
Audit continua com 66 alertas (16 moderate, 49 high, 1 critical), sem fix automático.

Changelogs oficiais sdk-57 dos seis pacotes consultados: patches publicados em
2026-10-14; notifications registra backport para import crash Expo Go Android,
sem atribuir causa aos crashes SSH anteriores. Fontes instaladas reconferidas:
NotificationRecords.swift mantém evento iOS em segundos fracionários; serializer
Android usa getTime(ms); mapNotification não converte date. SchedulerModule.swift
e NotificationScheduler.kt retornam next-date em ms. DAILY Android serializa
daily/hour/minute e usa Calendar local; iOS usa UNCalendar/dateComponents/repeats.
Exports Router/useRouter/useFocusEffect continuam presentes; regressões Router
dependem também da suíte real, não apenas de inspeção de tipos.

Notices asset20/notifications23 atualizados, licenças integrais comparadas com npm;
expo-sdk-57.txt inclui o cohort e tooling conservadoramente, sem afirmar bundle
de tooling. Router/ui omitem LICENSE no npm; MIT declarado e texto completo da
licença raiz oficial sdk-57 confirmado igual ao expo/LICENSE, proveniência registrada.
Doctor após instalação passou 21/21 com DNS IPv4 somente por comando, sem bypass.
Suíte completa serial 828 testes/96 suítes PASS; tipos/lint sem warnings,
56 tooling/validador/diffcheck PASS. As duas expectativas antigas de versão em
audio/notification-capabilities foram corrigidas sem remover checks de capacidades;
suíte completa repetida e verde. Revisão do diff: manifest/lock/notices/testes/docs
somente, nenhuma configuração/permissão ou código funcional alterado. CI leve do
PR96 anexado; CI38609833005 SUCCESS 1min49s no head af8c04d, incluindo Doctor.
CI do último commit documental deve ser reconferido antes squash autorizado;
Android/iOS SKIPPED não são builds.

Ambos builds remotos/artefatos/notices/assinatura e fluxos nativos no novo SHA
integrado ficam PENDENTES; APK/aparelho c265d4f não validam estes patches.
Nenhum host/jobs/telefone/preview/tag/release operado pela manutenção.

## Plano vigente US097

Issue97 refina manutenção do CI leve após run38610475617 main2af9db2:
825PASS/3FAIL/96suítes, duas navegações excederam5000ms e houve falha subsequente.
PR96CI verde não oculta esse resultado. Workflow usa npm test -- --ci e Jest
sem limite explícito de workers; execução serial local passou828/96.
Contenção/instabilidade é hipótese, não ausência comprovada de bug funcional.

Mudar apenas passo Tests para npm test -- --ci --runInBand, mesma suíte e
asserts/timeouts sem retries/exclusões/supressões. Teste YAML protege esse comando,
lint/typecheck/Doctor e natureza manual dos nativos já protegida por tooling.
Não mudar jest.config/app/capacidades/versões/permissões nem reimplementar31.
Validar relacionados/fullserial/linttipos/Doctor21/21/56tooling/validadordiffreview
e CI latesthead antes squash; observar mainpush, investigar ainda falhando.
Não cancelar/retry/duplicar jobs. Sem host/nativejobs/buildlocal/phone/preview/tag.
Nativos/artefatos/assinatura/fluxos reais/audit continuam pendentes.

Branch chore97 nasce da main2af9db2 limpa após Ready/spec/tasks; US031
checkpoint868c384 PUSH permanece separada/semPR/DoD. Após97integrada,
mergeoriginmain na31 somente árvore limpa e repetir checks antes entrega.
Nenhum comando CI/teste novo implementado neste refinamento; tasks unchecked.

Execução97: workflow Tests alterado em uma linha; serial-ci.test.ts guarda
comando completo/lint/types/Doctor e propagação de falha, nenhuma exclusão ou
timeout aumentado.30relacionados3/829Jest97 serial/tiposlintsemwarnings/
Doctor21/21/56tooling/validadordiffcheck PASS. Revisão de diff/testes/gates:
nenhum código funcional/deps/permissão/config nativa/cancel-policy alterado.
CI latesthead/PR e mainpush posteriores ainda devem ser observados; T060
permanece pendente. Falha main95 não é apagada nem substituída por teste local.

## Organização vigente US088

Pedido humano por imagens substitui a posição escolhida em US085: CommunicationBoard na home abaixo de SentenceComposer/header; drawer contém apenas os atalhos existentes. Estado de abertura pertence à rota home para fechar antes de router.push; Home mantém lifecycle/foco/back/backdrop e não altera contratos de dados. Quadro embutido evita SafeArea duplicada. Testes passam a abrir menu para ferramentas e compor diretamente na principal. Prévia web via US087, desktop/mobile, sem instalar celular; T053 nativo pendente. Seções US085 abaixo são histórico da organização anterior.

## Prévia web US087

Reconciliar exports `createLocalImageStorage`/`isLocalImage` no arquivo `.web` que impede importar rotinas. Não importar filesystem nativo no navegador; cópia indisponível deve rejeitar como antes, sem fingir arquivo salvo. Manter contratos Android/iOS intactos, sem dependências. Foco web usa a ref DOM/Pressable por `focus()`, evitando `findNodeHandle` indisponível nesta plataforma; foco nativo continua via AccessibilityInfo. Testar exports e abrir a home real via Expo web, drawer/frase/atalhos e viewport desktop/mobile. Capacidades indisponíveis mantêm erros existentes; prévia não comprova gate nativo nem autoriza instalação. Organização visual das imagens corrigida separadamente pela Issue88.

## Home US085 vigente

Issue85 Ready em 2026-10-14 por pedido humano: quadro existente no drawer lateral esquerdo, frase no header e atalhos na home. Modal nativo sem animação/dependência nova, largura limitada ao viewport, SafeArea, fundo oculto aos leitores e foco de abertura/retorno; fechar antes de navegar ao editor. Reutilizar CommunicationBoard e SentenceComposer sem alterar bancos, snapshots, ordem, favoritos ou TTS. Testar abertura/fechamento/back/categorias/composição/atalhos/modo9/erros e regressões. Drawer não dispara fala. Gates reais de leitores/foco/insets/offline permanecem pendentes; nenhuma instalação autorizada por esta mudança.

**Branch**: uma branch curta por Issue (`feat/us-xxx-slug`, `fix/...` ou `chore/...`); não há branch de milestone. **Date**: 2026-09-23. **Spec**: [spec.md](spec.md)

**Input**: Milestone #9, Issues funcionais #1–#5 e história técnica US-041/#41. US-041 integrada pelo PR #42; implementação atual restrita à US-001/#1, Ready conforme backlog consultado em 2026-10-13.

## Summary

Usar Expo como framework React Native para Android e iOS, TypeScript strict, Expo Router e geração nativa contínua (CNG). Armazenar cartões personalizados e favoritos em SQLite local; manter a frase somente em memória durante a sessão. Copiar imagens aceitas para o diretório privado de documentos do aplicativo e persistir apenas o caminho local. A fala será encapsulada por um pequeno módulo nativo Expo para filtrar vozes pt-BR locais, pois a API JavaScript de `expo-speech` não expõe de forma suficiente a necessidade de rede de cada voz Android.

Na inspeção inicial não havia aplicativo. A [Issue #41](https://github.com/Nosso-Espectro/aplicativo/issues/41) passou pela revisão de prontidão e agora possui base local na branch `chore/us-041-bootstrap-react-native`: manifesto/lockfile, rota neutra, ferramentas de qualidade e diretórios funcionais vazios. As evidências e pendências constam do [quickstart](quickstart.md) e de [bootstrap-tecnico.md](../../docs/bootstrap-tecnico.md). Não há backend, conta, sincronização, banco remoto, telemetria do aplicativo, TTS remoto ou EAS; a Issue permanece aberta.

## Stack

**Framework e runtime**: Expo SDK 57 (`expo` 57.0.28), React Native 0.86.3 e React 19.2.3; TypeScript 6.0.3 strict; Hermes padrão confirmado nos projetos gerados por CNG e nos bundles `.hbc` exportados. Expo Router 57.0.26. Os cinco patches Expo/Jest foram alinhados com Expo Doctor antes da integração da US-001; SDK 58 permanece fora do escopo.

**Ambiente**: Node.js 24.21.0 LTS e npm 11.19.0 (bundled), fixados em `.nvmrc`/CI; usar `package-lock.json` e `npm ci`. Node 24 excede o mínimo 22.13.x publicado pelo Expo SDK 57; validar Expo Doctor e builds no bootstrap. Se houver incompatibilidade comprovada com a cadeia RN/Expo, fallback técnico Node 22.23.3 LTS com npm 10.9.9. `npx expo install` alinha módulos ao SDK.

**Plataformas mínimas configuradas**: Android 7/API 24 (catálogo Gradle de RN consumido pelo Expo) e iOS 16.4 (`app.json`, Podfile/projeto CNG). Confirmar execução nesses mínimos continua pendente. Não ampliar nem reduzir o público suportado sem registrar impacto.

**Navegação**: Expo Router com rotas locais em `src/app/` e navegação nativa Stack. Evita uma segunda implementação de navegação e oferece retorno previsível entre quadro, favoritos e editor. Não configurar compartilhamento de rotas, analytics ou backend.

**Dependências de runtime**: `expo-sqlite` para cartões personalizados e ordem dos favoritos; `expo-image-picker` para selecionar imagem ou abrir câmera a pedido do usuário; `expo-file-system` para copiar imagens aceitas ao armazenamento privado persistente. Instalar cada módulo somente na Issue que o usar. Não adicionar ORM, AsyncStorage, biblioteca global de estado, cliente HTTP, conta ou ferramenta de sincronização.

**Text-to-Speech**: não adotar `expo-speech` como fronteira suficiente para a exigência offline, porque sua API pública não informa de modo confiável se cada voz Android exige rede. A Issue #3 deve criar `modules/tear-speech` com Expo Modules API e APIs nativas: Android seleciona somente voz pt-BR disponível com `isNetworkConnectionRequired == false`; iOS enumera vozes pt-BR instaladas por `AVSpeechSynthesisVoice`. A interface TS oferece apenas consulta de disponibilidade, leitura iniciada explicitamente e interrupção. Não baixar vozes nem recorrer à rede. Confirmar operação em modo avião em aparelhos reais; se as APIs do sistema não permitirem comprovar disponibilidade local, manter o fallback visual e registrar a limitação, sem alegar voz offline.

US-003: módulo local reconhecido pelo autolinking Android/Apple, sem dependência
de runtime adicional. Android também exclui vozes com feature notInstalled e
limita espera pela inicialização do serviço a 10 segundos. O cliente divide
mensagens segundo o limite nativo, preservando conteúdo/Unicode e interrompendo
as partes restantes em cancelamento. iOS enumera vozes disponíveis pt-BR e usa
AVSpeechSynthesizer; cancelamento do sistema encerra a sequência. No navegador
ou sem módulo instalado, disponibilidade falsa preserva a comunicação visual.
Sem fallback SpeechSynthesis web, download de voz ou envio de conteúdo.

Referências técnicas: [Expo Modules](https://docs.expo.dev/modules/get-started/),
[vozes Android embarcadas](https://developer.android.com/reference/android/speech/tts/TextToSpeech.Engine),
[vozes Apple disponíveis](https://developer.apple.com/documentation/avfaudio/avspeechsynthesisvoice/speechvoices()),
[síntese Apple no dispositivo](https://developer.apple.com/documentation/avfoundation/speech-synthesis).

**Qualidade**: Jest com `jest-expo` e `@testing-library/react-native` para comportamento JS; TypeScript com `npx tsc --noEmit`; lint com `npx expo lint`/ESLint; `npx expo-doctor` para compatibilidade. Sem Prettier, E2E, Maestro, mocks globais ou outras ferramentas até haver necessidade demonstrada. Testes simulados não substituem builds/dispositivos Android e iOS para TTS, permissões, armazenamento e acessibilidade.

**Build e CI configurados**: `npm ci`, `npm run lint` (`expo lint .`), `npx tsc --noEmit`, `npm test -- --ci` e `npx expo-doctor`. `npm run build:android` usa CNG/Gradle `assembleRelease`; `npm run build:ios` usa `expo run:ios --configuration Release --no-bundler`. O script `build` exige ambos, e é o comando do quality gate. GitHub Actions configura checks JavaScript e build Android; execução remota pendente. iOS exige macOS/Xcode. Builds locais de teste, sem EAS/publicação; comandos e limitações em [quickstart.md](quickstart.md).

**Escopo**: cinco histórias de produto P0 (US-001/#1 a US-005/#5, 19 RFs e quatro RNFs) e bootstrap US-041/#41. O mapeamento da #1 está aprovado: necessidades (água, banheiro, fome), sentimentos (dor), solicitações (sim, não, ajuda, silêncio, sair daqui, preciso de tempo). Seleção/licença de pictogramas Flaticon é trabalho do agente, sem aprovação individual prévia.

**Incremento US-001**: catálogo estático local, filtro de categoria e exibição do cartão
em modal, com retorno à categoria anterior e sem som. Não requer dependências novas
nem armazenamento. Grade de uma coluna em largura inferior a 340 ou escala de fonte
a partir de 1,5; rolagem e texto sem limite de linhas. Falta de dados informa ausência
de cartões. Imagem ausente mantém o texto utilizável, mas não satisfaz RF-003:
os assets licenciados permanecem obrigatórios para concluir a Issue.

## Estratégia

US-052/#52: identidade visual explicitamente solicitada e imagem aprovada pelo
usuário em 2026-10-13. PNG RGB quadrado local em `assets/branding/tear-icon.png`,
ícone Android/iOS, favicon web e config plugin expo-splash-screen
alinhado ao SDK 57. Sem timer, animação ou áudio; ocultação padrão do Expo Router
quando a primeira tela está pronta. O quadro mantém marca textual escalável e a
imagem decorativa não duplica o anúncio do leitor. Máscaras nativas e abertura a
frio precisam ser verificadas no APK Release, não somente em Expo Go/web.

Entregar uma Issue por branch, preservando `main` integrável. A Issue de bootstrap cria apenas
a base vazia e ferramentas; as Issues #1–#5 implementam incrementos por história seguindo
seus critérios de aceite. Inicializar e validar fluxos offline antes de expandir a feature.
Não marcar história Ready enquanto faltarem aprovações de conteúdo da Issue correspondente.

## Componentes envolvidos

| Área | Caminho planejado | Responsabilidade/Issue |
| --- | --- | --- |
| Rotas | `src/app/` | Telas Expo Router enxutas e navegação previsível |
| Quadro e cartões iniciais | `src/features/communication/board/` | US-001/#1; catálogo local aprovado e apresentação acessível |
| Frase | `src/features/communication/sentence/` | US-002/#2; estado apenas de sessão e snapshot dos cartões |
| Integração de fala | `src/features/communication/speech/`, `modules/tear-speech/` | US-003/#3; ponte nativa pt-BR local com speak/stop |
| Cartões próprios | `src/features/communication/custom-cards/` | US-004/#4; validação e edição com imagem opcional |
| Favoritos | `src/features/communication/favorites/` | US-005/#5; marcação e ordem persistida |
| Persistência | `src/features/communication/storage/` | Adaptador SQLite e migrações usados por #4/#5 |
| Recursos | `assets/communication/pictograms/` | Ícones licenciados localmente, após aprovação #1 |
| Testes | `tests/features/communication/` | Jest/RNTL, separados por história |

No bootstrap existem `src/app/_layout.tsx`, `src/app/index.tsx` (apenas título TEAr),
`tests/tooling/app-start.test.tsx` e os diretórios vazios de comunicação e fala.
Os demais caminhos da tabela são destino das Issues funcionais. Não criar camadas transversais
adicionais sem necessidade comprovada.

## Modelo de dados

Usar as entidades e regras lógicas em [data-model.md](data-model.md). A proposta de tabela
SQLite contém categorias, cartões iniciais/personalizados e uma coleção ordenada de favoritos;
frase e snapshots permanecem em memória. A imagem é um caminho local no sandbox. IDs estáveis
para conteúdo inicial e IDs gerados pelo próprio SQLite para cartões personalizados evitam
dependência adicional. Detalhes e regras de aceite não alteram a fonte GitHub.

## Persistência

`expo-sqlite` mantém categorias/cartões próprios/favoritos entre reinícios. Alterações que
atualizam cartão e referências relacionadas usam transação; falhas mantêm o último estado
confirmado e nunca indicam falso sucesso. O usuário mantém acesso por arquivo/câmera via
picker nativo; recursos aceitos são copiados para diretório privado com `expo-file-system`.
Frase não vai ao banco e é descartada em encerramento/reabertura, conforme RF-008.

## Fluxos principais

- Quadro → categoria → cartão (até dois toques após abrir); seleção acrescenta snapshot à frase
  sem falar.
- Frase → remover item/limpar/navegar; manter durante segundo plano; iniciar vazia após novo
  lançamento. Botão explícito executa fala e botão/controle correspondente interrompe.
- Cartão próprio → validar título/categoria → opcionalmente obter imagem → gravar localmente;
  tratar falha com edição preservada e opção de tentar novamente/cancelar.
- Favoritar/desfavoritar → mostrar ordem aprovada; persistir e recuperar ordem localmente;
  falha preserva última ordem salva e estados vazios orientam sem bloquear fluxo útil.

## Offline

Recursos iniciais licenciados são empacotados no aplicativo; telas e dados não dependem de
servidor. Banco e imagens ficam no sandbox. Picker não baixa da rede assets remotos. TTS só
seleciona voz compatível disponível localmente; validar instalação limpa e uso offline em
Android/iOS, incluindo ausência/indisponibilidade de voz. Nunca recorrer a backend, telemetria,
sincronização ou fala remota. Fluxos de falha preservam alternativa visual e dados já salvos.

## Acessibilidade

Aplicar WCAG 2.2 AA quando aplicável às capacidades nativas. Confirmar ampliação de texto sem
perda, contraste, foco/ordem, semântica e nomes acessíveis, leitores TalkBack/VoiceOver e alvos
de toque; justificar exceções pertinentes. Revisão manual por história registra dispositivo,
configuração assistiva, resultado e limitação. Revisar baixa carga cognitiva qualitativamente
quanto a consistência e previsibilidade. Não automatizar fala, animação ou estímulos.

## Privacidade e segurança

Sem backend, conta, cliente de rede, telemetria ou serviço externo. Não registrar texto,
imagem, frase nem voz nos logs; usar conteúdo sintético em testes; validar SQL com parâmetros.
Solicitar câmera apenas após escolha do usuário; omitir permissão de microfone e não solicitar
acesso amplo à biblioteca sem necessidade da API. SQLite e imagens usam o sandbox privado do
app. Sem criptografia própria de banco nesta entrega; reconsiderar somente diante de requisito
ou análise de ameaça que justifique a complexidade e a gestão de chaves.

## Estratégia de testes

Jest/`jest-expo`/React Native Testing Library cobrem regras lógicas, ações observáveis,
validação, snapshots, estados vazios e falhas de persistência com dependências nativas
simuladas quando apropriado. A validação nativa complementa a suíte: builds em Android e iOS,
uso offline instalado, persistência após reiniciar, picker/permissões, TTS pt-BR e interrupção,
TalkBack/VoiceOver, ampliação e contraste. Dados sintéticos apenas; registrar limitações reais.
Testes não podem declarar cobertura de requisitos nativos apenas com mocks.

## Dependências técnicas

Base: `expo`, Expo Router, TypeScript, ESLint/Expo, Jest, `jest-expo` e React Native Testing
Library. Módulos adicionados na Issue correspondente: `expo-sqlite` (#4/#5), `expo-image-picker`
e `expo-file-system` (#4), módulo local `modules/tear-speech` (#3). Instalar com `npx expo
install` e confirmar versões com Expo Doctor. Nenhuma dependência de backend, AsyncStorage,
ORM, estado global, Prettier, E2E ou EAS está aprovada neste plano.

## Constitution Check

**Fonte do produto**: passa; os critérios permanecem nas Issues #1–#5 e sua rastreabilidade consta da spec. Decisões técnicas deste plano não adicionam comportamento ao produto.

**Acessibilidade e neuroinclusão**: passa com execução obrigatória de RNF-001 e revisão manual em Android/iOS com TalkBack e VoiceOver, ampliação de texto, foco/ordem, nomes acessíveis, contraste e alvos de toque. Registrar evidências por fluxo; não declarar conformidade total a partir de testes automatizados parciais. Navegação e respostas devem permanecer previsíveis e sem áudio automático.

**Autonomia e privacidade**: passa com permissões contextuais, imagens armazenadas no sandbox, nenhum dado de comunicação em logs/rede e TTS restrito a vozes locais. Configurar `expo-image-picker` sem permissão de microfone (`microphonePermission: false`); pedir câmera somente quando escolhida. A seleção de arquivo deve usar a interface de sistema e não solicitar acesso amplo preventivamente.

**Offline e persistência**: passa; assets essenciais ficam no bundle, dados próprios no sandbox local, frase apenas na sessão e nenhuma função depende de conexão. Validar primeiro uso e fluxos após reinício com rede desligada. SQLite padrão e sandbox do sistema são a proteção local inicial; criptografia em nível de banco não foi exigida pela spec e não será adicionada sem análise de risco/requisito explícito.

**Simplicidade e dependências**: passa; Expo SDK alinhado, um banco local sem ORM, navegação oferecida pelo framework e um módulo nativo pequeno apenas pela lacuna comprovada de TTS offline. Instalar módulos nas Issues correspondentes, evitando adiantar dependências futuras no bootstrap.

**Testes e DoD**: a base tem smoke test de rota pelo Router/Jest/RNTL e checks JS; os resultados estão no quickstart. A DoD da #41 continua pendente de builds/abertura nativa, validação offline/assistiva e revisão no PR. Automatizar regras de dados e interações somente nas histórias correspondentes.

**Trunk-based e prontidão**: cada Issue recebe uma branch própria da `main` atualizada e PR para `main`. US-041/#41 passou pela revisão DoR em 2026-09-23 e consta em `ready_stories`; a inicialização exige main atualizada e árvore limpa. As histórias funcionais permanecem sem prontidão registrada. O conteúdo dos dez cartões/pictogramas bloqueia US-001, não as decisões da base técnica.

## Decisões arquiteturais

- **Expo SDK 57 estável em vez de React Native Community CLI**: React Native recomenda começar por um framework e aponta Expo; CNG reduz manutenção duplicada de projetos Android/iOS. CLI bare daria controle direto mas exigiria mais configuração nativa. Se a integração mínima de TTS não couber no Expo Modules API ou o bootstrap provar incompatibilidade, reavaliar CLI antes de inicializar, não durante uma Issue funcional.
- **SDK 57 em vez de 58 beta ou 56 estável**: SDK 57 era o stable mais recente na data desta pesquisa, emparelhado a RN 0.86; 58 era beta. SDK 56 é alternativa conservadora, porém anterior. Fixar pacotes compatíveis pelo SDK e lockfile; upgrades são mudanças deliberadas.
- **Expo Router em vez de navegação manual ou React Navigation direto**: o SDK integra Router e fornece Stack nativo com caminhos previsíveis; navegação manual duplicaria estado de back. Não adotar estrutura genérica de arquitetura fora da árvore de rotas e features abaixo.
- **SQLite em vez de armazenamento chave-valor**: cartões, categorias e ordem de favoritos têm relações, exclusões e gravações que se beneficiam de transações e restrições locais. A alternativa AsyncStorage adicionaria uma dependência separada e exigiria codificar essas relações no app. Sem ORM: SQL parametrizado e migrações SQLite simples.
- **Módulo nativo de fala em vez de `expo-speech`**: TTS nativo via `expo-speech` é menor, mas a API pública não permite filtrar de modo confiável vozes Android que precisam de rede. Uma pequena interface Expo Modules usa a informação nativa disponível e permite manter o requisito de privacidade/offline; custo: código Swift/Kotlin e testes físicos adicionais.
- **Jest/RNTL em vez de suíte E2E inicial**: cobre lógica e acessibilidade sem introduzir infraestrutura nativa frágil; capacidades de sistema serão verificadas em builds reais. Adotar E2E somente se a equipe demonstrar necessidade e ambiente reproduzível.

## Arquitetura atual

A base possui duas rotas (`_layout.tsx` e `index.tsx`), teste de inicialização,
configurações de qualidade e os diretórios vazios definidos na #41. Não há camadas de
domínio, armazenamento ou fala implementadas.

### Estrutura de destino da feature

```text
app.json                        # configuração Expo, permissões mínimas
package.json / package-lock.json # main: expo-router/entry
tsconfig.json                   # modo strict
eslint.config.js
jest.config.js
src/
├── app/                        # apenas rotas; não guardar lógica de produto aqui
│   ├── _layout.tsx
│   ├── index.tsx               # quadro
│   ├── favorites.tsx
│   └── custom-card/
│       ├── new.tsx
│       └── [id].tsx
└── features/communication/
    ├── board/                  # cartões/categorias iniciais e fluxo do quadro
    ├── sentence/               # composição volátil e snapshot dos cartões
    ├── speech/                 # integração JS com módulo nativo
    ├── custom-cards/           # criação, validação, edição e exclusão
    ├── favorites/              # ordem e estado vazio
    └── storage/                # esquema, migrações e operações SQLite locais
assets/communication/pictograms/ # recursos locais licenciados, após revisão da Issue #1
modules/tear-speech/            # módulo Expo Kotlin/Swift e interface TypeScript, Issue #3
tests/features/communication/   # testes Jest/RNTL organizados por história
.github/workflows/mobile-quality.yml
```

Rotas finas delegam a fluxos/componentes nas features; não criar camadas genéricas de serviço, repositório ou estado até uma repetição concreta justificá-las. Assets de pictogramas e seu arquivo de atribuições serão determinados na Issue #1. `android/` e `ios/` são artefatos gerados pelo CNG e não devem ser editados manualmente; configuração nativa persistente fica em `app.json`/config plugins e código nativo próprio em `modules/`.

## Bootstrap de US-041/#41

1. Consultar US-041/#41 e confirmar sua Definition of Ready. Preservar alterações locais; iniciar somente com árvore limpa, em branch própria `chore/us-041-bootstrap-react-native` nascida da `main` atualizada.
2. Na branch própria, criar base pelo template TypeScript Expo SDK 57; fixar Node 24.21.0/npm 11.19.0 em `.nvmrc`/CI, guardar lockfile, habilitar TypeScript strict e Expo Router. Não escolher SDK beta. Se Expo Doctor/build demonstrar incompatibilidade de Node 24, registrar evidência e aplicar fallback definido Node 22.23.3/npm 10.9.9.
3. Adicionar apenas ferramentas de qualidade da base; adicionar `expo-sqlite`, `expo-image-picker` e `expo-file-system` nas respectivas Issues funcionais. Não instalar `expo-speech`; criar módulo nativo apenas na Issue #3. Remover permissão de microfone do picker.
4. Criar a árvore mínima acima, smoke test da inicialização, configuração Jest/ESLint/typecheck e GitHub Actions. Registrar comandos reais em [quickstart.md](quickstart.md) e preencher gates reais em `scripts/quality-gate.json`.
5. Compilar e abrir em Android e iOS; documentar limites do ambiente iOS/macOS, rodar checks, validar o bundle instalado em modo avião, e revisar permissões, rede, logs, acessibilidade, simplicidade e privacidade. Não implementar US-001–US-005 na branch de bootstrap.

O bootstrap preservou Node 24.21.0/npm 11.19.0; não houve evidência para acionar fallback.
`react-dom` 19.2.3 satisfaz peers de tooling/Router sem habilitar web. Reanimated 4.5.1 e
Worklets 0.10.1 atendem à cadeia de peers do Router nas versões do template SDK 57;
não implementam animações de produto. ESLint 9.39.5/config Expo 57.0.2, Jest 29.7.0,
jest-expo 57.0.5 e RNTL 13.3.3 formam a suíte inicial, com renderizador React 19.2.3.
As dependências transitivas e alertas da auditoria estão em
[bootstrap-tecnico.md](../../docs/bootstrap-tecnico.md); não foram aplicados overrides ou
upgrades incompatíveis para ocultar os alertas. Android/iOS gerados por CNG ficam ignorados.

## Riscos

- Vozes pt-BR variam conforme fabricante, versão e instalação. O caminho visual continua completo sem TTS; o suporte offline precisa ser provado em aparelhos Android/iOS reais antes de concluir #3.
- API de síntese iOS não oferece o mesmo campo de requisito de rede que Android. A implementação só usará vozes que constem como instaladas e validará modo avião; incapacidade de comprovar localidade resulta no fallback visual.
- Versões mínimas do SDK são decisões técnicas provisórias ratificadas neste plano; reavaliar no bootstrap se backlog ou alcance de dispositivos-alvo trouxer evidência diferente.
- Imagens de iCloud não descarregadas e arquivos temporários podem não estar disponíveis offline/permanentemente; manter download remoto desabilitado, copiar para sandbox e permitir concluir sem imagem quando não estiver local.
- Pictogramas e seu mapeamento ainda dependem de registro/revisão no backlog #1. Não incluir recurso sem origem e licença verificáveis.
- SQLite padrão não cifra dados por conta própria. A proteção inicial é o sandbox privado e a não transmissão; criptografia adicional demanda decisão explícita e solução de chave segura, não uma dependência implícita.

## References

- [Expo SDK 57 e matriz de plataformas](https://docs.expo.dev/versions/latest/), [Expo SDK 57 release](https://expo.dev/changelog/sdk-57) — versions consulted 2026-09-23.
- [React Native recomenda framework para app novo](https://reactnative.dev/docs/next/environment-setup).
- [Expo Router](https://docs.expo.dev/router/introduction/), [CNG](https://docs.expo.dev/workflow/continuous-native-generation/).
- [Expo SQLite](https://docs.expo.dev/versions/latest/sdk/sqlite/), [Image Picker](https://docs.expo.dev/versions/latest/sdk/imagepicker/), [FileSystem](https://docs.expo.dev/versions/latest/sdk/filesystem/).
- [Expo Speech](https://docs.expo.dev/versions/latest/sdk/speech/), [Android TextToSpeech/Voice](https://developer.android.com/reference/android/speech/tts/Voice), [Apple speech voices](https://developer.apple.com/documentation/avfaudio/avspeechsynthesisvoice).
- [Expo tests com Jest](https://docs.expo.dev/develop/unit-testing/), [React Native accessibility](https://reactnative.dev/docs/accessibility), [WCAG 2.2](https://www.w3.org/TR/WCAG22/).
