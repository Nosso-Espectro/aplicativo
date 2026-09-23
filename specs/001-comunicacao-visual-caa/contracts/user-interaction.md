# Contrato de Interação — Comunicação Visual / CAA

Contrato de comportamento observável para a interface. Complementa os critérios originais
em [spec.md](../spec.md); não escolhe layout, stack ou componentes.

## Quadro e cartões — US-001/#1

- Abrir o quadro sem rede apresenta categorias e cartões essenciais desde a primeira abertura.
- Os dez textos iniciais são os estabelecidos na spec. Categoria principal e pictograma
  usados em cada um dependem do mapeamento e do conjunto visual aprovados no backlog.
- Alcançar um cartão a partir do quadro inicial exige no máximo dois toques após abrir o
  quadro.
- Cartão apresenta imagem/pictograma e texto. Texto pode ser ampliado pelo sistema sem perda
  de conteúdo ou função; alvo de toque segue o mínimo AA aplicável, com exceções móveis
  justificadas.

## Composição e fala — US-002/#2 e US-003/#3

- Selecionar cartão acrescenta seu conteúdo à frase em ordem e permanece silencioso.
- Remover cartão retira somente aquele item; limpar remove toda a frase.
- Trocar categoria ou suspender o app sem encerrá-lo preserva a composição.
- Encerrar e abrir de novo inicia frase vazia. Cartões e favoritos permanecem salvos.
- Editar cartão não altera uma frase já aberta. Excluir o cartão remove sua entrada da frase
  e preserva ordem dos restantes.
- Frase vazia não inicia voz; informar que é preciso montar a mensagem.
- Reprodução inicia somente por ação explícita do botão e pode ser interrompida pelo usuário.
- Usar voz local pt-BR quando disponível; no Android e iOS, verificar locale compatível e
  reprodução sem rede. Se não houver voz compatível ou a síntese falhar, manter a mensagem
  visível e informar a indisponibilidade. Não recorrer à rede.

## Cartões personalizados — US-004/#4

- Criar/editar exige título não vazio após remover espaços externos e seleção de categoria
  existente. Erro identifica campo, preserva preenchimento e impede salvar até correção.
- Imagem é opcional; arquivo ou câmera quando suportado.
- Se câmera for negada ou imagem não puder ser obtida, explicar e permitir salvar sem imagem.
- Salvar persiste cartão no dispositivo. Falha preserva edição, informa erro e oferece retry
  ou cancelamento; nunca anuncia sucesso indevido.
- Editar atualiza conteúdo exibido nos favoritos; excluir remove dos favoritos e da frase
  aberta, preservando os outros itens.
- Não há áudio gravado/importado em cartões nesta entrega.

## Favoritos — US-005/#5

- Qualquer cartão pode ser marcado ou desmarcado.
- Novo favorito entra ao fim da lista; desmarcar e marcar novamente também o move ao final.
- A ordem é recuperada depois de encerrar e abrir o app.
- Favoritos vazios informam que nenhum cartão foi marcado.
- Falha ao salvar ordem conserva a última ordem salva, explica a falha de modo acessível e
  oferece nova tentativa.

## Regras transversais

- Os fluxos essenciais funcionam sem internet e desde a primeira abertura.
- Texto, imagem e frase ficam no dispositivo; não enviar a serviço externo ou registrar em
  logs de erro.
- Foco, contraste, nomes acessíveis, leitor de tela, ampliação de texto e alvos de toque são
  verificados de acordo com as capacidades da plataforma e WCAG 2.2 AA quando aplicável.
- Baixa carga cognitiva tem revisão qualitativa registrada de consistência e previsibilidade.
- Erros e estados vazios não bloqueiam a comunicação local restante.
