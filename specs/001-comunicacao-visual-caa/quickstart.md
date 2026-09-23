# Quickstart de Validação — Comunicação Visual / CAA

Este guia registra os comandos e cenários aprovados para executar depois do bootstrap técnico.
O app ainda não foi inicializado: os comandos abaixo são planejamento, não resultados já
executados nem evidência de aprovação.

## Estado atual e pré-requisitos

- Feature: [spec.md](spec.md), Issues #1–#5 e US-041/#41 da milestone #9.
- Comportamento: [contrato de interação](contracts/user-interaction.md).
- Modelo lógico: [data-model.md](data-model.md).
- Stack planejada: Expo SDK 57, Node.js 24.21.0/npm 11.19.0 (fallback Node 22.23.3/npm 10.9.9),
  `package-lock.json`, TypeScript e Expo Router.
- Antes de executar: revisar a DoR da Issue técnica US-041/#41 e iniciar sua branch própria,
  inicializar base e ferramentas aprovadas, e confirmar disponibilidade de Android SDK e de
  macOS/Xcode para iOS.
- Validação dos cenários requer development builds Android/iOS. Expo Go e bundle JS isolado
  não comprovam o módulo nativo de fala nem a operação do artefato instalado offline.

## Verificação documental executável agora

Na raiz do repositório:

```bash
git diff --check
```

Resultado esperado: nenhum whitespace inválido no diff. Esse check não executa nem valida o
aplicativo.

## Comandos planejados após bootstrap

Na raiz do app depois de a Issue de bootstrap criar o manifesto e scripts correspondentes:

```bash
npm ci
npx expo lint
npx tsc --noEmit
npm test -- --ci
npx expo-doctor
npx expo run:android
npx expo run:ios
```

Os comandos de build Android/iOS precisam dos toolchains nativos respectivos. Não executar
`npx expo prebuild --clean` sobre uma árvore com alterações não revisadas: CNG recria diretórios
nativos gerados. O quality gate deve chamar comandos configurados em `scripts/quality-gate.json`
somente depois de terem sido criados e validados no bootstrap.

## Cenários de aceitação após bootstrap

Executar cada cenário com os comandos oficiais acima e dados sintéticos. Registrar
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
