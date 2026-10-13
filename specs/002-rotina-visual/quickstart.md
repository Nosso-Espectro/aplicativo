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
