# US-041 — Bootstrap React Native

Estado: publicada como [Issue #41](https://github.com/Nosso-Espectro/aplicativo/issues/41), aberta, na milestone #9 (P0).
O registro no backlog não representa execução ou conclusão do bootstrap.

## Vínculo no GitHub

Repositório: `Nosso-Espectro/aplicativo`. Milestone: **P0 — Comunicação Visual / CAA**, número 9.
Dependência técnica das Issues #1–#5. Labels: `chore`, `P0`, `mvp`.
Branch futura: `chore/us-041-bootstrap-react-native`; nenhuma branch foi criada nesta sincronização.

Vínculo incluído na spec e no índice da milestone existente. A decomposição em tasks T001–T008 inclui esta história técnica como pré-requisito, sem renumerar histórias funcionais.

## História

Como equipe de desenvolvimento do TEAr, quero definir e inicializar uma base React Native
reproduzível para Android e iOS, para implementar as histórias aprovadas com comandos de
execução e qualidade verificáveis, sem backend na primeira versão.

## Problema

Não há código de aplicação, manifesto de dependências, estrutura de código ou build.
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
