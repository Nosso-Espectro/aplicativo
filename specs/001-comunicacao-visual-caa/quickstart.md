# Quickstart de Validação — Comunicação Visual / CAA

Este guia distingue a base implementada na US-041/#41 das funcionalidades futuras #1–#5.
A base mostra somente o título TEAr. Builds e abertura instalada em Android/iOS ainda não
foram validados; os resultados reais e as limitações estão abaixo.

## Estado atual e pré-requisitos

- Feature: [spec.md](spec.md), Issues #1–#5 e US-041/#41 da milestone #9.
- Comportamento: [contrato de interação](contracts/user-interaction.md).
- Modelo lógico: [data-model.md](data-model.md).
- Stack instalada: Expo 57.0.24, RN 0.86.3, React 19.2.3, Node.js 24.21.0/npm 11.19.0,
  `package-lock.json`, TypeScript 6.0.3 strict, Expo Router 57.0.22 e Hermes.
- Branch existente: `chore/us-041-bootstrap-react-native`; DoR da #41 conferida via gh.
  Não recriar a base ao retomar. Verificar tasks e evidências; nenhuma história funcional
  foi implementada. O fallback Node 22.23.3/npm 10.9.9 não foi necessário.

## Instalação e checks da base

Na raiz, com nvm disponível:

```bash
nvm install
nvm use
node --version
npm --version
export EXPO_NO_TELEMETRY=1
npm ci
npx expo lint
npm run lint
npx tsc --noEmit
npm test -- --ci
npx expo-doctor
python3 scripts/validate-workflow.py
python3 -m unittest discover -s tests/tooling -v
git diff --check
```

As versões esperadas são Node `v24.21.0` e npm `11.19.0`. A variável desativa telemetria da
CLI Expo; não existe telemetria implementada no aplicativo. `npm run lint` também cobre testes
e configurações. O teste em `tests/tooling/app-start.test.tsx` abre a rota `/` com o layout real
usando Expo Router/RNTL e verifica o título acessível. Testes das histórias irão para
`tests/features/communication/`, hoje vazio.

## Desenvolvimento e builds locais

Para desenvolver com Metro e toolchain/dispositivo disponíveis:

```bash
npm start
npm run android
npm run ios
```

Android: JDK 17, Android SDK com platform-tools, API 36, build-tools 36.0.0,
NDK 27.1.12297006 e emulador/dispositivo. Configurar `JAVA_HOME`, `ANDROID_HOME` e `PATH`.
API 36 é o SDK de compilação; o mínimo de execução configurado é API 24/Android 7.
iOS: macOS, Xcode/Command Line Tools e CocoaPods compatíveis com Expo SDK 57, runtime de
simulador iOS 16.4+ ou dispositivo com assinatura de desenvolvimento. Sem EAS ou publicação.

```bash
npm run build:android
# Em macOS, com simulador selecionado/disponível:
npm run build:ios
```

O build Android usa CNG e `./gradlew assembleRelease`; produz
`android/app/build/outputs/apk/release/app-release.apk` com bundle embutido e chave de debug
do template, apenas para teste local. Não é artefato pronto para publicação.
O build iOS usa configuração Release e `--no-bundler`, compilando/instalando no simulador;
para um aparelho conectado, usar `npm run build:ios -- --device` e configurar assinatura.
`npm run build` exige ambos os comandos, em macOS com os dois toolchains, no quality gate.

Projetos nativos são gerados e ignorados pelo Git. Não executar
`npx expo prebuild --clean` sobre uma árvore com alterações não revisadas: CNG recria diretórios
nativos gerados. O workflow `mobile-quality.yml` configura os checks JS e o build Android;
nenhum job remoto foi executado nesta entrega local.

## Verificação offline da base instalada — pendente

1. Gerar o build Release acima; instalar o APK com
   `adb install android/app/build/outputs/apk/release/app-release.apk`, ou usar o app Release
   instalado pelo comando iOS. Usar instalação limpa em dispositivo de teste.
2. Encerrar Metro, desligar Wi-Fi/dados (modo avião em aparelho físico) e abrir o app
   pela primeira vez. Confirmar título TEAr sem login, download ou pedido de permissão.
3. Encerrar e reabrir ainda sem rede. Registrar plataforma/versão, dispositivo,
   comando/artefato, resultado e eventuais erros; verificar rede e logs com conteúdo sintético.
4. Conferir leitura do título com TalkBack/VoiceOver e texto ampliado sem corte.

Expo Go/servidor Metro, mocks Jest, prebuild e exportação de bundles não comprovam abertura
offline de aplicativo instalado. Não há persistência ou funções de CAA para testar na #41.

## Evidências da US-041 — 2026-09-23

Ambiente: Linux x86_64, sem Java, Android SDK/adb, Xcode ou CocoaPods disponíveis.
Node oficial foi usado em `/tmp/node-v24.21.0-linux-x64/bin`, colocado no início de `PATH`,
com npm 11.19.0 e `EXPO_NO_TELEMETRY=1`. Não confundir com o Node 22.23.2/npm 10.9.8
original do ambiente. Esse caminho temporário não é requisito do projeto.

| Verificação executada | Resultado e limite |
|---|---|
| `npm ci` | Passou; 1053 pacotes instalados. Auditoria informou 13 vulnerabilidades moderadas; revisão abaixo vinculada. |
| `npx expo lint` e `npm run lint` | Passaram, sem erros. |
| `npx tsc --noEmit` | Passou com `strict: true`, incluindo o teste. |
| `npm test -- --ci` | Passou: 1 suíte/1 teste de inicialização pelo Router. Usa simulação nativa. |
| `npx expo-doctor --verbose` | Passou: 21/21 checks após ajustes finais, com acesso de rede autorizado. A tentativa confinada ao sandbox falhou ao obter o JSON do subprocesso Expo; não foi contada como sucesso. |
| `npx expo prebuild --no-install --platform all --template ./node_modules/expo/template.tgz` | Passou para Android/iOS; Hermes configurado, iOS deployment target 16.4. Geração de arquivos apenas. |
| `npx expo export --platform all --max-workers 2` | Passou; bundles Hermes `.hbc` para Android e iOS em `dist/`. Não compila nem abre app nativo. |
| `npm run build:android` | Falhou antes da compilação: `JAVA_HOME is not set` e comando `java` ausente. SDK/adb também indisponíveis. |
| `npm run build:ios` | Não compilou: CLI informa que iOS exige macOS. |
| `python3 scripts/validate-workflow.py` | Passou: estrutura, links e rastreabilidade local. |
| `python3 -m unittest discover -s tests/tooling -v` | Passou: 40 testes do tooling existente. |
| Abertura instalada, modo avião, TalkBack/VoiceOver | Não executados em nenhuma plataforma. Permanecem pendentes. |
| CI remoto | Configurado, não executado; não houve push ou PR. |

A [revisão de dependências, permissões, privacidade e acessibilidade](../../docs/bootstrap-tecnico.md)
registra os alertas e o escopo da evidência estática. T007 segue pendente; T008 tem revisão
local preparada, mas falta registro no PR e validação nativa. A Issue #41 permanece aberta.

## Cenários futuros das Issues #1–#5

Executar somente após implementar as histórias correspondentes, com dados sintéticos. Registrar
plataforma/versão, rede, presença de voz e resultado. Para imagens e fala, testar em aparelhos
reais além dos mocks; não declarar voz local por resultado de simulador isolado.

| Cenário | Preparação e ação | Resultado esperado |
|---|---|---|
| Primeira abertura offline | Instalar versão limpa, ativar modo avião, abrir o quadro. | Categorias/cartões essenciais disponíveis; dez mensagens iniciais; alvo acessível em até dois toques após abrir. |
| Frase e navegação | Selecionar cartões em ordem, trocar categoria, remover um, limpar; enviar app ao segundo plano e retornar. | Ordem preservada; remoção individual; limpeza total; retorno preserva frase. |
| Encerramento da sessão | Com frase composta, encerrar app e abrir novamente. | Frase vazia; cartões personalizados e favoritos persistidos. |
| Sem voz pt-BR | Em Android e iOS sem voz local compatível, tentar reprodução. | Frase continua visível; aviso acessível; sem travamento ou solicitação de TTS remoto. |
| Voz pt-BR offline | Em dispositivo com voz local compatível, modo avião, iniciar e interromper reprodução. | Frase lida sem rede, apenas após toque explícito; interrupção pelo usuário funciona. |
| Cartão personalizado | Criar/editar título e categoria válidos com imagem e sem imagem; reiniciar app. | Validação aceita somente título/categoria válidos; cartão persiste localmente. |
| Validação de campos | Tentar salvar título vazio/só espaços e categoria ausente/inexistente. | Não salva; preserva preenchimento; indica campo a corrigir. |
| Falha de gravação | Simular falha ao salvar cartão e falha ao persistir ordem de favoritos. | Edição do cartão preservada; favoritos mantêm última ordem salva; erro acessível, nova tentativa disponível e nenhum sucesso falso. |
| Câmera indisponível | Negar permissão ou simular câmera indisponível. | Informar a condição e permitir salvar cartão sem imagem. |
| Favoritos e estados vazios | Marcar/desmarcar vários cartões, fechar/abrir; abrir favoritos vazios e tentar ler frase vazia. | Ordem por sequência recuperada; vazio explicado; frase vazia não fala e orienta a compor. |
| Editar/excluir em uso | Selecionar cartão na frase e favorito; editar, depois excluir. | Frase preserva snapshot; favorito mostra conteúdo atualizado; exclusão remove referência e preserva ordem dos demais. |
| Privacidade e acessibilidade | Inspecionar rede/logs durante fluxos; usar leitor de tela, ampliar texto e revisar foco/contraste/alvos. | Sem texto/imagem/frase em rede/log; conteúdo e função permanecem com ampliação; resultados e limitações acessíveis registrados. |

## Evidências obrigatórias antes de concluir Issue

Registrar comandos e resultados reais de testes, lint, typecheck quando aplicável e build;
separar resultados simulados dos testes nativos. Não marcar gate verde quando a ferramenta
estiver ausente. Revisões de acessibilidade, privacidade e design incluem evidências ou
limitações concretas no PR. O aplicativo não está validado por este documento.
