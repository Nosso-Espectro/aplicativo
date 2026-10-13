# US-006 — Verificação de Rotinas

Use dados sintéticos, sem coletar imagens/títulos pessoais.

## Fluxos

- Comunicação → Rotinas → Nova rotina; salvar nome válido sem etapas e reabrir.
- Adicionar duas etapas, preencher títulos, escolher imagem local opcional;
  editar título/imagem, confirmar remoção de uma etapa e salvar.
- Reabrir o módulo/app e confirmar conteúdo e ordem persistidos, inclusive sem rede.
- Nome/título vazio deve indicar o campo, manter formulário e impedir salvar.
- Cancelar picker ou negar câmera mantém preenchimento e permite salvar sem imagem.
- Falha de gravação mantém edição e última versão confirmada, permite retry/cancelar.
- Conferir leitor de tela, foco, teclado, texto ampliado, alvos de 48dp e ausência
  de som/animação ou acesso inesperado à câmera.

## Limites

US-006 não inclui reordenação, execução, progresso ou exclusão de rotinas completas.
Imagens locais privadas não são compartilhadas. Banco/diretório próprios de rotinas
não alteram cartões, favoritos ou a frase da sessão. Texto cresce sem limite
artificial e a lista é rolável. Campos e controles possuem rótulos de etapa.
A prévia web informa armazenamento nativo indisponível, sem persistência falsa.

SQLite real do Node 24 verifica gravação/reabertura/rollback/identificadores, não o
módulo Expo em aparelho. Picker e FileSystem simulados não comprovam permissões.
Build remoto e atualização via USB com `adb install -r` são posteriores ao merge;
instalação não substitui testes offline e assistivos. Nenhum build local.

## Evidências Locais — 2026-10-13

101 testes Jest/19 suítes, lint sem avisos, typecheck, 47 testes de tooling,
validador estrutural e diff check aprovados. Novos cenários: quatro SQLite reais,
cinco armazenamento de imagens, seis componentes/provider e isolamento do namespace
de imagens em comunicação. O primeiro teste a frio atingiu timeout ao competir
com lint; reexecução serial focada e suíte completa passaram sem aumentar timeout
ou desabilitar testes. Verificação assistiva e binário offline continuam pendentes.
Expo Doctor: 21/21 checks aprovados. Sem novas dependências nem permissões.

## US-007 — Reordenação

No editor, usar subir/descer para trocar duas etapas; limites da lista ficam
desabilitados e a posição é anunciada por texto. Salvar, reabrir e conferir a nova
ordem, IDs, título/imagem e status. Cancelar deve conservar a versão salva.
Simular falha após as escritas, confirmar rollback e edição intacta, depois retry.
Banco v1 migra para v2 com status pendente sem perda de dados; uma versão futura
é recusada sem rebaixamento. Status existente é preservado por ID, não pelo índice
nem por valor obsoleto do formulário. Não há controle de conclusão/Agora-Depois.

111 testes Jest/20 suítes aprovados: dez novos (três lógica de ordem, três editor,
quatro SQLite real). Lint/typecheck e 47 testes tooling aprovados. Rótulos, limites,
alvos de toque, texto escalável e fluxo sem gestos obrigatórios revisados
estaticamente. T011 mantém revisão assistiva/foco e reabertura offline nativa
pendentes; nenhuma alteração global de acessibilidade/rede do aparelho necessária
para instalar o APK. Build remoto e atualização preservando dados após integração.
Expo Doctor 21/21, validador estrutural e diff check aprovados. Revisão do diff
não identificou regressão bloqueante; nenhum build local executado.

## US-008 — Agora e Depois

Executar uma rotina com três etapas: somente primeira e segunda aparecem; concluir
deve gravar antes de avançar. Fechar/abrir mantém progresso; voltar reabre anterior
e seguintes. Fim informa conclusão e não reinicia automaticamente; reinício
depende de confirmação. Rotina vazia oferece edição, ausente informa erro.
Após editar/remover/reordenar, a ordem/status dos IDs salvos determina Agora/Depois.
Falha preserva último progresso confirmado, sem detalhes pessoais, e permite retry.

124 testes Jest/22 suítes aprovados, incluindo reabertura/rollback de SQLite real,
ações obsoletas/duplicadas, conclusão/retorno/reinício e recuperação de erros.
Testes de componentes aguardam a chamada de gravação antes de verificar remoção
do texto anterior, evitando a corrida de atualização do renderer observada na
primeira execução. Nenhum teste desabilitado ou timeout aumentado.
Persistência offline nativa, voz/imagens reais e revisão assistiva permanecem
pendentes; instalação não equivale a validação completa. Sem novo schema,
dependência, permissão, servidor ou build local.
Lint/typecheck, Expo Doctor 21/21, 47 testes tooling, validador e diff check aprovados.
Revisão do diff incluiu cancelamento da intenção de reinício após falha e confirmação
de manter a rotina concluída; comportamento coberto por teste específico.
