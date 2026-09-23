# US-041 — Bootstrap React Native

Estado: publicada como [Issue #41](https://github.com/Nosso-Espectro/aplicativo/issues/41), aberta, na milestone #9 (P0).
Bootstrap local implementado parcialmente: base e checks JavaScript disponíveis; a Issue
não está concluída. Builds, abertura instalada e revisão no PR permanecem pendentes.

## Vínculo no GitHub

Repositório: `Nosso-Espectro/aplicativo`. Milestone: **P0 — Comunicação Visual / CAA**, número 9.
Dependência técnica das Issues #1–#5. Labels: `chore`, `P0`, `mvp`.
Branch de trabalho: `chore/us-041-bootstrap-react-native`, existente ao retomar a implementação.

Vínculo incluído na spec e no índice da milestone existente. A decomposição em tasks T001–T008 inclui esta história técnica como pré-requisito, sem renumerar histórias funcionais.

## História

Como equipe de desenvolvimento do TEAr, quero definir e inicializar uma base React Native
reproduzível para Android e iOS, para implementar as histórias aprovadas com comandos de
execução e qualidade verificáveis, sem backend na primeira versão.

## Problema

Na inspeção inicial não havia código de aplicação, manifesto de dependências, estrutura de código ou build.
O plano técnico da feature já seleciona Expo SDK 57, TypeScript strict, Expo Router,
armazenamento SQLite local, ferramentas de qualidade e estrutura mínima. A proposta desta
Issue é materializar somente a base e reconciliar comandos/caminhos; não implementar qualquer
história de produto. A Issue #41 está publicada e vinculada.

## Decisões técnicas a usar

- Expo SDK 57 estável (React Native 0.86, React 19.2.3) com TypeScript strict e Hermes.
- Node.js 24.21.0 LTS/npm 11.19.0 e `package-lock.json`; fallback Node 22.23.3 LTS/npm 10.9.9
  somente se incompatibilidade com SDK 57 for demonstrada. O mínimo Expo é Node 22.13.x;
  usar `npx expo install` para módulos compatíveis com o SDK. Android 7/API 24+ e iOS 16.4+.
- Expo Router/Stack; CNG para configuração nativa, sem editar manualmente `android/` ou
  `ios/`. Builds locais; não adotar EAS ou serviço de publicação.
- TypeScript, ESLint/`npx expo lint`, `tsc --noEmit`, Jest + `jest-expo` + React Native
  Testing Library, `npx expo-doctor` e GitHub Actions. Builds nativos Android/iOS e revisões
  assistivas seguem o que o ambiente da equipe consegue comprovar.
- A estrutura e matriz de dependências por história estão em
  [`specs/001-comunicacao-visual-caa/plan.md`](../specs/001-comunicacao-visual-caa/plan.md).
  Bootstrap não instala ainda `expo-sqlite`, `expo-image-picker` ou `expo-file-system`; cada módulo chega com sua Issue funcional. A fala usará módulo
  Expo nativo próprio na #3, não um serviço ou voz remota.

## Critérios de aceite registrados

- [ ] Registrar no plano linguagem, versões e fluxo de desenvolvimento React Native escolhidos,
  com justificativa, alternativas consideradas e fontes oficiais; confirmar a versão patch
  Node/npm e harmonizar lockfile com Expo SDK 57.
- [ ] Confirmar Android 7/API 24+ e iOS 16.4+ e documentar requisitos de ambiente para cada
  plataforma. Informar limitações do ambiente de desenvolvimento disponível.
- [ ] Criar a árvore mínima registrada no plano (`src/app`, `src/features/communication`,
  `tests/features/communication`, config Expo/TypeScript/ESLint/Jest e workflow CI); preservar
  documentação e tooling existentes.
- [ ] Inicializar a base aprovada em sua própria branch de Issue, incluindo manifesto e
  lockfile, sem implementar quadro, frases, TTS, editor ou favoritos.
- [ ] Demonstrar abertura da base em Android e iOS, com instruções reproduzíveis e evidências
  por plataforma. Falta de ambiente de uma plataforma deve ficar registrada como validação
  pendente, nunca como aprovação.
- [ ] Definir e executar comandos reais de testes pertinentes, lint, typecheck quando aplicável
  e build; atualizar o guia de desenvolvimento e a configuração do quality gate.
- [ ] Incluir teste mínimo relevante de inicialização da base e documentar como os testes
  das histórias serão organizados, sem implementar testes das funcionalidades futuras.
- [ ] Registrar a estratégia de persistência local e de integração com voz local pt-BR e
  seleção de imagens em alinhamento com `plan.md`, justificando módulos por história. Não
  instalar `expo-sqlite`, `expo-image-picker`, `expo-file-system` ou implementar fala nativa
  durante o bootstrap; implementar esses comportamentos nas respectivas Issues.
- [ ] A base não exige conta, backend, telemetria nem transmissão de conteúdo de comunicação.
  Documentar como validar abertura offline da versão instalada, distinguindo-a do servidor
  de desenvolvimento.
- [ ] Reconciliar plano, quickstart e tasks com os caminhos e comandos escolhidos. A aprovação
  técnica dos caminhos permite decompor tasks antes de sua implementação; sua execução depende
  da conclusão dos pré-requisitos correspondentes.

## Fora de escopo

Implementar as Issues #1–#5; escolher pictogramas ou distribuir as dez mensagens entre
categorias; criar backend, sincronização, conta ou IA; publicar app; realizar release de milestone.

## Dependências e separação de bloqueios

A Issue #41 já existe no backlog. Seu escopo passou pela revisão de prontidão em 2026-09-23, registrada na Issue e na spec. O início depende de main atualizada e árvore limpa. As decisões técnicas constam do plano e não exigiram uma stack
previamente inicializada.
O conjunto de pictogramas e o mapeamento das mensagens são pendências de conteúdo da #1.
Eles bloqueiam a entrega do quadro e seus fluxos dependentes, mas não a definição da base técnica.

As regras de voz pt-BR, composição sem limite funcional predefinido e validação de título/categoria
já foram esclarecidas e sincronizadas com o GitHub. Investigar o suporte real da plataforma
deve respeitar essas regras, sem reabri-las como decisões funcionais.

## Definition of Done

Critérios verificados, evidências de qualidade por plataforma, documentação atualizada e PR
vinculado à Issue contra main. Revisar acessibilidade, privacidade e simplicidade da base.
Nenhuma task funcional é marcada como concluída por ter apenas o bootstrap disponível.

## Plano técnico sincronizado

Consultar [plan.md](../specs/001-comunicacao-visual-caa/plan.md) e a Issue publicada para a stack e a estrutura completas. Expo SDK 57, TypeScript strict, Expo Router/CNG, npm/lockfile e ferramentas de qualidade foram registrados no GitHub; módulos funcionais serão adicionados nas Issues correspondentes.

## Execução local da US-041 — 2026-09-23

Issue #41 consultada via `gh issue view 41 --repo Nosso-Espectro/aplicativo`: aberta,
na milestone #9; prontidão previamente registrada. `check-issue.sh 41` confirmou Ready.
Foram preservados a branch existente e o trabalho já realizado. Nenhuma Issue foi fechada,
nenhum push/merge/tag foi executado e nenhum PR foi publicado.

As checklists da feature continuam como artefatos de revisão de requisitos, sem alterações:

| Checklist | Total | Marcados | Pendentes |
|---|---:|---:|---:|
| `requirements.md` | 16 | 10 | 6 |
| `quality.md` | 25 | 0 | 25 |

O usuário autorizou prosseguir com itens das funcionalidades futuras e validações posteriores
pendentes. Mapeamento/pictogramas (#1), regras de frases (#2), voz (#3), persistência/imagens
(#4/#5) não são pré-requisitos de implementação da base neutra. Para a #41 foram conferidos
vínculo/DoR, stack, lockfile, comandos reais, privacidade e semântica da tela inicial.
Essa revisão não certifica os requisitos funcionais nem marca as checklists como aprovadas.

### Base materializada e dependências

- Expo 57.0.24, RN 0.86.3, React 19.2.3, Router 57.0.22, TypeScript 6.0.3 strict.
  Hermes confirmado em `android/gradle.properties` e `ios/Podfile.properties.json`
  gerados por CNG; exportação produziu bundles `.hbc` em ambas as plataformas.
- Node 24.21.0/npm 11.19.0 fixados em `.nvmrc`, manifesto e configuração do CI;
  instalados para esta sessão em `/tmp`. Nenhuma incompatibilidade comprovada justificou fallback.
- ESLint 9.39.5/config Expo 57.0.2, Jest 29.7.0/jest-expo 57.0.5,
  RNTL 13.3.3 e react-test-renderer 19.2.3. Um teste abre a rota inicial real pelo Router,
  verifica seu caminho e o título com papel acessível de cabeçalho.
- `expo-constants`, `expo-linking`, safe-area-context e screens atendem ao Router.
  Reanimated 4.5.1/Worklets 0.10.1 satisfazem sua cadeia de peers nas versões do template
  SDK 57; o aplicativo não define animações. Worklets é dependência de runtime.
  `react-dom` 19.2.3 é peer de tooling/Router, fixado junto ao React; web não está habilitada.
  A tentativa sem essas versões explícitas produziu conflitos de peers ao resolver versões
  mais recentes incompatíveis. O lockfile atual instala sem `--force`/`--legacy-peer-deps`.
- Não foram adicionados diretamente SQLite, picker, filesystem, speech, cliente HTTP,
  autenticação ou analytics. **`expo-file-system` existe transitivamente no SDK `expo`**,
  assim como outros módulos internos; não foi importado nem implementado como recurso do app.
  Remover esse pacote transitivo quebraria a composição do SDK aprovado.
- A árvore funcional e `modules/tear-speech` contêm somente `.gitkeep`.
  SQLite em #4/#5, imagens/picker em #4 e integração de fala em #3 seguem o plano existente.

`app.json` declara apenas Android/iOS e identificador técnico `org.nossoespectro.tear`
nas duas plataformas, evitando prompts no CNG/CI; não registra app em loja ou serviço.
O mínimo Android 7/API 24 vem do catálogo `react-native/gradle/libs.versions.toml`
consumido pelo plugin Expo. iOS 16.4 está explícito no app.json e no projeto gerado.
Compilação Android: API 36, build-tools 36.0.0, NDK 27.1.12297006 e JDK 17.
Execução real nesses mínimos continua pendente; iOS requer macOS/Xcode/CocoaPods.

### Revisão de privacidade, permissões e acessibilidade

A revisão de `src/app/`, teste, manifesto e configuração encontrou somente uma tela estática
com título TEAr e Stack local. Não há dados de usuário, coleta, persistência, chamadas HTTP,
logs de conteúdo, login, SDK de analytics, som ou afirmação diagnóstica na implementação.
Não foi realizada captura de tráfego do app instalado: essa evidência continua pendente.

O AndroidManifest gerado contém `INTERNET` para a infraestrutura de desenvolvimento Expo/Metro;
a presença da permissão não demonstra transmissão. `blockedPermissions` remove armazenamento
externo, sobreposição e vibração herdados do template. Backup Android está desativado.
Não foi configurada permissão de câmera ou microfone. Info.plist gerado não inclui descrições
de acesso a câmera/microfone/fotos; mantém suporte à rede local para desenvolvimento.
Os metadados gerados de Expo Updates estão desativados, sem URL de atualização remota.
O manifesto final mesclado/APK e o comportamento em execução ainda precisam de revisão nativa.

`EXPO_NO_TELEMETRY=1` foi usado nas verificações Expo e está no CI/instruções locais.
Instalação npm e Doctor consultam registros de pacotes/metadados de ferramentas;
isso não implementa serviço remoto no aplicativo nem usa conteúdo de comunicação.

A tela tem um único título legível, sem decisões, controles ou estímulos automáticos.
O teste encontra “TEAr” por papel `header`; `Text` preserva a ampliação padrão, sem truncamento
ou altura fixa. As cores são `#111827` sobre `#FFFFFF`. São evidências de implementação,
não certificação WCAG: TalkBack, VoiceOver, ampliação em tela real, barras do sistema e
apresentação visual em Android/iOS seguem pendentes. Não existem alvos interativos para medir
na base. Esses resultados deverão acompanhar o PR quando sua publicação for autorizada.

### Auditoria e limitações de dependências

`npm audit --json` retornou 13 ocorrências moderadas, zero altas/críticas. São cadeias
transitivas de dois avisos; a auditoria **não passou**. Não foram aplicados `audit fix --force`,
supressões ou overrides de versões para produzir aprovação artificial.

| Origem | Exposição observada e decisão |
|---|---|
| [decode-uri-component — GHSA-vcc3-ghjq-m6fr](https://github.com/advisories/GHSA-vcc3-ghjq-m6fr) | Router → query-string 7.1.3 → decode-uri-component 0.2.2. Entrada URI malformada pode consumir CPU; o Router processa URLs. Correção publicada em 0.5.0 é ESM, enquanto query-string 7 usa `require` e exige `^0.2.2`; substituir só o decoder não preserva o contrato. Requer correção compatível na cadeia do Router antes de aprovação de segurança. |
| [uuid — GHSA-w5hq-g745-h8pq](https://github.com/advisories/GHSA-w5hq-g745-h8pq) | Configuração Expo → xcode 3.0.1 → uuid 7.0.3. Aviso afeta v3/v5/v6 com buffer fornecido; o código inspecionado de xcode usa `uuid.v4()` sem buffer. Não foi encontrada essa chamada vulnerável no caminho inspecionado; o alerta permanece e não equivale a auditoria aprovada. |

O npm sugere rebaixar Expo para 46.0.21 e Router para 5.1.11 como correções automáticas:
isso contraria o SDK 57 fixado. A [versão corrigida do decoder](https://github.com/SamVerschueren/decode-uri-component/releases/tag/v0.5.0)
e seu [manifesto ESM](https://github.com/SamVerschueren/decode-uri-component/blob/v0.5.0/package.json)
foram consultados; não há correção compatível indicada pelo relatório para a árvore atual.
Registrar esse achado na revisão da #41 antes da integração; não houve escrita no GitHub.

`npm ci` também informa deprecações no tooling (incluindo ESLint 9 do template) e não executa
o postinstall opcional de `unrs-resolver` sem aprovação de scripts do npm 11. Lint, tipos,
teste e exportação passaram nessas condições; nenhum script adicional foi liberado por conveniência.

### Estado das tasks e validações

T001–T006 possuem evidência local em [quickstart.md](../specs/001-comunicacao-visual-caa/quickstart.md).
O workflow está configurado; não foi executado no GitHub. T007 permanece pendente:
Android falhou por ausência de Java (também faltam SDK/adb), e iOS não compila neste Linux.
Nenhuma plataforma foi aberta, testada offline ou aprovada por geração de arquivos/bundles.
T008 tem revisão estática e documentação realizadas, mas permanece aberta pelo registro no PR,
pelas verificações nativas e pela pendência de segurança acima. A DoD da Issue não está atendida.
