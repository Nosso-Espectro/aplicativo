# Data Model — Comunicação Visual / CAA

Este é um modelo lógico derivado de US-001/#1 a US-005/#5 e das decisões em
[spec.md](spec.md). A proposta física alinhada ao plano usa SQLite via `expo-sqlite`, sem
ORM, e arquivos locais via `expo-file-system`; isso não altera os requisitos de produto.

## Entidades

### Cartão

Representa uma mensagem do quadro ou um cartão personalizado.

| Atributo lógico | Regra de produto | Rastreabilidade |
|---|---|---|
| Identidade | Deve distinguir o cartão para seleção, favoritos e referências da frase. Formato não definido. | RF-005, RF-015, RF-017 |
| Texto/título | Obrigatório para personalizados; não pode ficar vazio após remover espaços nas extremidades. Preservar o preenchimento e indicar erro até corrigir. | US-004/#4, RF-013, RF-015 |
| Categoria | Uma categoria existente é obrigatória para criar/editar personalizado. Cada cartão inicial pertence a uma categoria principal. | US-001/#1, US-004/#4, RF-002, RF-013 |
| Origem | Distingue conteúdo inicial de personalizado para permitir editar/excluir apenas personalizados conforme a Issue. Forma não definida. | US-001/#1, US-004/#4, RF-015 |
| Representação visual | Cartão inicial tem pictograma ou imagem; personalizado admite imagem opcional proveniente de arquivo ou câmera suportada. Conteúdo visual permanece local. | US-001/#1, US-004/#4, RF-003, RF-014, RNF-002 |

Cartões personalizados e imagens permanecem no dispositivo após fechar o aplicativo. Sem
imagem ou com câmera indisponível/negada, informar a situação e permitir salvar o cartão
sem imagem. Falha ao salvar preserva edição e não indica sucesso.

### Categoria

Agrupa cartões para navegação. As categorias iniciais aprovadas são **necessidades**,
**sentimentos** e **solicitações**. Cada cartão inicial pertence a uma categoria principal.
O backlog ainda deve aprovar o mapeamento das dez mensagens e o conjunto licenciado de
pictogramas. Não há requisito para o usuário criar categorias; nome, identidade e formato
permanecem decisões técnicas/documentais após refinamento do backlog.

### Frase em composição

Sequência ordenada de conteúdos de cartões selecionados pelo usuário.

- Adicionar mantém a ordem escolhida; remover item preserva a ordem dos restantes; limpar
  remove a composição toda (RF-005–RF-007).
- Navegar entre categorias ou ir para segundo plano não apaga a composição (RF-008).
- A seleção registra o conteúdo apresentado naquele momento: editar o cartão de origem não
  altera a frase aberta. Excluir o cartão remove sua entrada e mantém os restantes ordenados
  (decisões complementares em US-002/#2 e US-004/#4).
- Não há limite funcional predefinido de cartões por frase. Limites técnicos de recursos,
  se necessários, não devem ser apresentados como regra funcional sem aprovação no backlog.
- É estado apenas da sessão. Após encerramento do app e nova abertura, inicia vazia.
- Frase vazia não inicia TTS; informar que é preciso montar a frase.

Não persistir após encerrar o app. A representação física da cópia de conteúdo e a gestão de
referências são adiadas até a stack real ser inspecionada.

### Favoritos

Coleção ordenada de referências a cartões favoritos.

- Qualquer cartão pode ser marcado/desmarcado; adicionar novo favorito ao final.
- Desmarcar e favoritar de novo move para o final da ordem.
- A ordenação é persistida localmente entre sessões.
- Favoritos exibem o conteúdo atual do cartão editado.
- Excluir cartão personalizado também o remove dos favoritos.
- Falha ao gravar mantém a última ordem salva, informa falha de modo acessível e permite
  tentar novamente; sucesso só é comunicado depois da gravação.
- Estado vazio informa que ainda não há favoritos.

Rastreabilidade: US-005/#5, RF-017–RF-019, RF-015.

## Relações

```text
Categoria 1 ─── * Cartão
Frase      1 ─── * Entrada de cartão (snapshot da seleção, ordenado)
Favoritos  1 ─── * Referência a cartão (ordenada e persistida)
```

Cartão e Categoria têm identidade lógica para seleção e associação; a representação física
proposta é indicada abaixo. Uma frase mantém conteúdo selecionado em vez de depender de uma
atualização implícita do cartão de origem. Favoritos consultam a versão atual do cartão.

## Mapeamento físico proposto (Expo SQLite)

- `categories`: `id TEXT PRIMARY KEY`, `label TEXT NOT NULL`. As categorias iniciais são
  constantes locais; a Issue #1 deve aprovar o mapeamento antes de semear o catálogo.
- `cards`: `id TEXT PRIMARY KEY`, `origin TEXT NOT NULL` (`initial` ou `custom`),
  `title TEXT NOT NULL`, `category_id TEXT NOT NULL`, `image_uri TEXT NULL`, com chave
  estrangeira para categoria. IDs dos cartões iniciais são estáveis no catálogo; IDs de
  personalizados podem ser gerados por SQLite sem dependência UUID adicional.
- `favorites`: `card_id TEXT PRIMARY KEY` com chave estrangeira para `cards` e exclusão em
  cascata; `position INTEGER NOT NULL UNIQUE`. Alterar ordem grava em transação e recupera a
  ordem salva anterior em caso de falha.
- O catálogo inicial é incluído localmente e inserido/idempotentemente reconciliado por
  migrações de banco, garantindo primeira abertura sem rede. Cartões personalizados e favoritos
  persistem no banco privado do app; não há sincronização nem logs de conteúdo.
- Imagens selecionadas são copiadas para o diretório privado persistente do app; o banco guarda
  somente URI/caminho local, nunca base64 ou bytes. O picker não baixa ativos remotos e não
  solicita permissão de microfone. A edição/exclusão de imagem acompanha a edição/exclusão do
  cartão, dentro das regras aprovadas da história.
- Frase é mantida em memória pelo estado de sessão. Cada entrada guarda o snapshot textual
  selecionado e referência lógica do cartão; exclusão remove a entrada conforme RF-015.

Esse mapeamento é proposta de implementação, a confirmar pela Issue de bootstrap; mudanças
posteriores devem manter o mesmo comportamento, rastreabilidade e privacidade sem introduzir
regras de produto novas. SQLite padrão e sandbox do sistema são a proteção inicial prevista;
criptografia em nível de banco não está especificada e deve voltar ao backlog se a avaliação de
risco demonstrar necessidade.

## Dados e privacidade

Títulos, imagens e frases podem conter conteúdo pessoal. Permanecem locais, não são enviados
a serviço externo, não são incluídos em logs e usam dados sintéticos em testes. Não há conta,
perfil de usuário, sincronização ou dados remotos neste escopo.
