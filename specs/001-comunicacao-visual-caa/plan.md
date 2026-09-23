# Implementation Plan: P0 — Comunicação Visual / CAA

**Branch**: uma branch curta por Issue (`feat/us-xxx-slug`, `fix/...` ou `chore/...`); não há branch de milestone. **Date**: 2026-09-23. **Spec**: [spec.md](spec.md)

**Input**: Milestone #9, Issues funcionais #1–#5 e história técnica US-041/#41, com critérios e esclarecimentos registrados em [spec.md](spec.md). A stack abaixo é uma decisão de planejamento, não autorização para inicializar o aplicativo.

## Summary

Usar Expo como framework React Native para Android e iOS, TypeScript strict, Expo Router e geração nativa contínua (CNG). Armazenar cartões personalizados e favoritos em SQLite local; manter a frase somente em memória durante a sessão. Copiar imagens aceitas para o diretório privado de documentos do aplicativo e persistir apenas o caminho local. A fala será encapsulada por um pequeno módulo nativo Expo para filtrar vozes pt-BR locais, pois a API JavaScript de `expo-speech` não expõe de forma suficiente a necessidade de rede de cada voz Android.

O repositório não contém app, manifesto de dependências ou build móvel. Esta decisão define um plano reproduzível sem inicializar o app, instalar dependências ou implementar qualquer história. O bootstrap técnico está vinculado à [Issue #41](https://github.com/Nosso-Espectro/aplicativo/issues/41); sua execução depende da revisão de prontidão. Não há backend, conta, sincronização, banco remoto, telemetria, TTS remoto ou EAS.

## Stack

**Framework e runtime**: Expo SDK 57 estável, alinhado a React Native 0.86 e React 19.2.3; TypeScript strict; Hermes padrão. A documentação consultada lista SDK 58 como beta em 2026-09-23, então não será adotado até tornar-se estável e ser avaliado em uma tarefa de upgrade.

**Ambiente**: Node.js 24.21.0 LTS e npm 11.19.0 (bundled), fixados em `.nvmrc`/CI; usar `package-lock.json` e `npm ci`. Node 24 excede o mínimo 22.13.x publicado pelo Expo SDK 57; validar Expo Doctor e builds no bootstrap. Se houver incompatibilidade comprovada com a cadeia RN/Expo, fallback técnico Node 22.23.3 LTS com npm 10.9.9. `npx expo install` alinha módulos ao SDK.

**Plataformas mínimas planejadas**: Android 7 (API 24) ou posterior e iOS 16.4 ou posterior, mínimos listados pelo Expo SDK 57. A compatibilidade real deve ser confirmada no bootstrap; não ampliar nem reduzir o público suportado sem registrar impacto.

**Navegação**: Expo Router com rotas locais em `src/app/` e navegação nativa Stack. Evita uma segunda implementação de navegação e oferece retorno previsível entre quadro, favoritos e editor. Não configurar compartilhamento de rotas, analytics ou backend.

**Dependências de runtime**: `expo-sqlite` para cartões personalizados e ordem dos favoritos; `expo-image-picker` para selecionar imagem ou abrir câmera a pedido do usuário; `expo-file-system` para copiar imagens aceitas ao armazenamento privado persistente. Instalar cada módulo somente na Issue que o usar. Não adicionar ORM, AsyncStorage, biblioteca global de estado, cliente HTTP, conta ou ferramenta de sincronização.

**Text-to-Speech**: não adotar `expo-speech` como fronteira suficiente para a exigência offline, porque sua API pública não informa de modo confiável se cada voz Android exige rede. A Issue #3 deve criar `modules/tear-speech` com Expo Modules API e APIs nativas: Android seleciona somente voz pt-BR disponível com `isNetworkConnectionRequired == false`; iOS enumera vozes pt-BR instaladas por `AVSpeechSynthesisVoice`. A interface TS oferece apenas consulta de disponibilidade, leitura iniciada explicitamente e interrupção. Não baixar vozes nem recorrer à rede. Confirmar operação em modo avião em aparelhos reais; se as APIs do sistema não permitirem comprovar disponibilidade local, manter o fallback visual e registrar a limitação, sem alegar voz offline.

**Qualidade**: Jest com `jest-expo` e `@testing-library/react-native` para comportamento JS; TypeScript com `npx tsc --noEmit`; lint com `npx expo lint`/ESLint; `npx expo-doctor` para compatibilidade. Sem Prettier, E2E, Maestro, mocks globais ou outras ferramentas até haver necessidade demonstrada. Testes simulados não substituem builds/dispositivos Android e iOS para TTS, permissões, armazenamento e acessibilidade.

**Build e CI previstos**: `npm ci`, `npx expo lint`, `npx tsc --noEmit`, `npm test -- --ci`, `npx expo-doctor`, `npx expo run:android` e `npx expo run:ios`. O bootstrap configura GitHub Actions para os checks JavaScript e builds nativos disponíveis; iOS local requer macOS/Xcode. Atualizar `scripts/quality-gate.json` somente quando os comandos reais existirem. Não configurar build/publicação em serviço externo.

**Escopo**: cinco histórias de produto P0 (US-001/#1 a US-005/#5, 19 RFs e quatro RNFs) e a história técnica de bootstrap US-041/#41. O mapeamento das dez mensagens e a seleção/licença dos pictogramas ainda devem ser registrados no backlog #1 antes da implementação do quadro.

## Estratégia

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

Os caminhos são escolhas de planejamento agora aprovadas para guiar tasks; ainda não existem
no repositório. Não criar camadas transversais adicionais sem necessidade comprovada.

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

**Testes e DoD**: passa como plano, sem alegar app/testes já existentes. Automatizar regras de dados e interações; completar com validação nativa e revisão de acessibilidade, privacidade, segurança e design por história. A ausência atual de checks do app não é aprovação.

**Trunk-based e prontidão**: cada Issue recebe uma branch própria da `main` atualizada e PR para `main`. US-041/#41 passou pela revisão DoR em 2026-09-23 e consta em `ready_stories`; a inicialização exige main atualizada e árvore limpa. As histórias funcionais permanecem sem prontidão registrada. O conteúdo dos dez cartões/pictogramas bloqueia US-001, não as decisões da base técnica.

## Decisões arquiteturais

- **Expo SDK 57 estável em vez de React Native Community CLI**: React Native recomenda começar por um framework e aponta Expo; CNG reduz manutenção duplicada de projetos Android/iOS. CLI bare daria controle direto mas exigiria mais configuração nativa. Se a integração mínima de TTS não couber no Expo Modules API ou o bootstrap provar incompatibilidade, reavaliar CLI antes de inicializar, não durante uma Issue funcional.
- **SDK 57 em vez de 58 beta ou 56 estável**: SDK 57 era o stable mais recente na data desta pesquisa, emparelhado a RN 0.86; 58 era beta. SDK 56 é alternativa conservadora, porém anterior. Fixar pacotes compatíveis pelo SDK e lockfile; upgrades são mudanças deliberadas.
- **Expo Router em vez de navegação manual ou React Navigation direto**: o SDK integra Router e fornece Stack nativo com caminhos previsíveis; navegação manual duplicaria estado de back. Não adotar estrutura genérica de arquitetura fora da árvore de rotas e features abaixo.
- **SQLite em vez de armazenamento chave-valor**: cartões, categorias e ordem de favoritos têm relações, exclusões e gravações que se beneficiam de transações e restrições locais. A alternativa AsyncStorage adicionaria uma dependência separada e exigiria codificar essas relações no app. Sem ORM: SQL parametrizado e migrações SQLite simples.
- **Módulo nativo de fala em vez de `expo-speech`**: TTS nativo via `expo-speech` é menor, mas a API pública não permite filtrar de modo confiável vozes Android que precisam de rede. Uma pequena interface Expo Modules usa a informação nativa disponível e permite manter o requisito de privacidade/offline; custo: código Swift/Kotlin e testes físicos adicionais.
- **Jest/RNTL em vez de suíte E2E inicial**: cobre lógica e acessibilidade sem introduzir infraestrutura nativa frágil; capacidades de sistema serão verificadas em builds reais. Adotar E2E somente se a equipe demonstrar necessidade e ambiente reproduzível.

## Arquitetura atual

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

## Bootstrap de US-041/#41 (não executar nesta etapa)

1. Consultar US-041/#41 e confirmar sua Definition of Ready. Preservar alterações locais; iniciar somente com árvore limpa, em branch própria `chore/us-041-bootstrap-react-native` nascida da `main` atualizada.
2. Na branch própria, criar base pelo template TypeScript Expo SDK 57; fixar Node 24.21.0/npm 11.19.0 em `.nvmrc`/CI, guardar lockfile, habilitar TypeScript strict e Expo Router. Não escolher SDK beta. Se Expo Doctor/build demonstrar incompatibilidade de Node 24, registrar evidência e aplicar fallback definido Node 22.23.3/npm 10.9.9.
3. Adicionar apenas ferramentas de qualidade da base; adicionar `expo-sqlite`, `expo-image-picker` e `expo-file-system` nas respectivas Issues funcionais. Não instalar `expo-speech`; criar módulo nativo apenas na Issue #3. Remover permissão de microfone do picker.
4. Criar a árvore mínima acima, smoke test da inicialização, configuração Jest/ESLint/typecheck e GitHub Actions. Registrar comandos reais em [quickstart.md](quickstart.md) e preencher gates reais em `scripts/quality-gate.json`.
5. Compilar e abrir em Android e iOS; documentar limites do ambiente iOS/macOS, rodar checks, validar o bundle instalado em modo avião, e revisar permissões, rede, logs, acessibilidade, simplicidade e privacidade. Não implementar US-001–US-005 na branch de bootstrap.

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
