---
milestone: 9
priority: P0
tag: m001-comunicacao-visual-caa
status: draft
ready_stories: ["US-041"]
source_checked: 2026-09-23
---

# Feature Specification: P0 — Comunicação Visual / CAA

Milestone GitHub: [P0 — Comunicação Visual / CAA](https://github.com/Nosso-Espectro/aplicativo/milestone/9) (número 9).

Estado consultado: aberta; todas as histórias abaixo estão abertas. Especificação em revisão, não implementação concluída.

**Feature Branch**: não se aplica uma branch à milestone; cada Issue terá sua branch curta.
**Created**: 2026-09-23
**Status**: Draft — US-041 revisada e pronta para início; histórias funcionais ainda sem prontidão registrada; `ready_stories: ["US-041"]`.
**Input**: especificar a milestone inteira como uma única feature, usando as Issues do GitHub,
preservando requisitos e deixando ambiguidades explícitas sem inventar comportamentos.
**Feature directory**: `specs/001-comunicacao-visual-caa` (feature existente reutilizada).
**Fonte consultada**: `gh api --paginate`, milestone #9 e Issues com `state=all`, em 2026-09-23.
Foram encontradas cinco Issues abertas, nenhuma fechada; PRs foram excluídos da consulta.

## Contexto

A fala pode não estar disponível nas situações descritas pelas histórias; é necessário expressar necessidades por cartões.

Descrição original da milestone (registro histórico; a menção a áudio próprio foi corrigida no GitHub na sincronização abaixo):

> Implementar uma ferramenta de Comunicação Aumentativa e Alternativa voltada principalmente a pessoas autistas não falantes, com fala limitada ou que perdem temporariamente a capacidade de falar em situações de sobrecarga. O usuário poderá selecionar cartões com pictogramas, imagens e textos para expressar necessidades, sentimentos e solicitações. Os cartões poderão formar frases e utilizar Text-to-Speech para reproduzi-las em voz alta. Deve ser possível criar cartões personalizados com imagem, texto e áudio. A funcionalidade deve operar offline.

## Clarifications

### Session 2026-09-23

**Decisão complementar — seleção dos pictogramas pelo agente (US-001/#1)**

- Q: Quem deve buscar e escolher os pictogramas? → A: O agente responsável pela US-001 deve buscar e selecionar no Flaticon o pictograma adequado para cada uma das dez mensagens iniciais. A seleção deve priorizar correspondência com o significado da mensagem, clareza, legibilidade, consistência visual e baixa estimulação. Registrar por mensagem o ícone escolhido, a justificativa, a URL de origem, o autor, a licença e a atribuição aplicável; preparar os recursos para uso local offline conforme a licença. A escolha dos ícones é responsabilidade do agente, não uma decisão que deva ser devolvida ao usuário para cada recurso. Se não encontrar uma opção adequada ou não conseguir verificar a licença, registrar a lacuna específica, sem presumir adequação ou permissão.

**Decisão complementar — origem dos pictogramas (US-001/#1)**

- Q: De onde devem vir os pictogramas? → A: Do [Flaticon](https://www.flaticon.com), conforme escolha explícita do usuário. Selecionar os ícones concretos, registrar suas páginas de origem, autores e licenças e cumprir as atribuições aplicáveis. Os recursos iniciais devem estar disponíveis localmente para preservar o uso offline desde a primeira abertura; não depender de consultas ao site durante o uso. A escolha da fonte não resolve o mapeamento das dez mensagens nem aprova automaticamente um conjunto específico.

**Decisão complementar — validação de cartões (US-004/#4)**

- Q: Quais regras validam título e categoria ao criar ou editar um cartão? → A: O título é obrigatório e não pode ficar vazio após remover espaços nas extremidades. É obrigatória a seleção de uma categoria existente. Em caso de erro, preservar o preenchimento, informar o campo a corrigir e não salvar até a correção. Regra aprovada pelo usuário; detalhamento de RF-013 e RF-015, registrado na Issue #4.

**Decisão complementar — limite de composição (US-002/#2)**

- Q: A composição deve ter um máximo de cartões por frase? → A: Sem limite funcional predefinido de cartões por frase, conforme decisão explícita do usuário. Detalhamento de RF-005 registrado na Issue #2; a revisão de prontidão continua necessária.

**Rodada 5 — decisões funcionais**

- Q: O que deve aparecer quando a área de favoritos estiver vazia ou o usuário pedir para ler uma frase vazia? → A: Em favoritos, informar que ainda não há cartões favoritos. Para frase vazia, não iniciar leitura e informar que é preciso montar uma frase.
- Q: Se falhar ao salvar a ordem dos favoritos, como deve responder o aplicativo? → A: Manter a ordem salva anteriormente, informar a falha de forma acessível e permitir tentar novamente.
- Q: Se o acesso à câmera for negado ou a imagem não puder ser obtida, como deve prosseguir a criação do cartão? → A: Informar o problema e permitir salvar o cartão sem imagem.
- Q: Qual idioma a voz local deve usar para ler as frases? → A: Português brasileiro (pt-BR); sem voz local compatível, informar a indisponibilidade e manter a frase visível.
- Q: Ao editar um cartão personalizado já incluído numa frase aberta ou nos favoritos, como devem aparecer essas referências? → A: A frase aberta mantém o conteúdo do cartão como estava quando foi selecionado; favoritos mostram o conteúdo editado.

**Rodada 4 — ambiguidades restantes dos critérios de aceite**

- Q: Em quais plataformas a leitura por voz local deve funcionar sem internet nesta entrega? → A: Android e iOS; verificar voz local offline nos dois sistemas.
- Q: Qual origem visual deve ser usada para os pictogramas dos cartões iniciais? → A: Usar pictogramas do Flaticon, com licença documentada; o agente deve selecionar os ícones específicos e registrar o conjunto no backlog para revisão da entrega.
- Q: Como a equipe deve verificar baixa carga cognitiva nos fluxos da feature? → A: Fazer revisão qualitativa documentada de consistência e previsibilidade; não criar novos critérios funcionais ou métricas de produto.
- Q: Um cartão inicial deve aparecer em uma única categoria ou pode aparecer em mais de uma? → A: Cada cartão pertence a uma categoria principal; o backlog registra o mapeamento das dez mensagens.
- Q: As categorias iniciais devem corresponder às três finalidades citadas na descrição da milestone — necessidades, sentimentos e solicitações? → A: Usar necessidades, sentimentos e solicitações como categorias iniciais; distribuir as dez mensagens entre elas após definir o mapeamento no backlog.

**Rodada 3 — critérios de aceite**

- Q: Qual tamanho mínimo de texto deve ser considerado legível nos cartões e nas mensagens de erro? → A: Seguir as orientações aplicáveis da WCAG 2.2 AA e permitir ampliação pelo sistema sem perda de conteúdo ou função.

- Q: Qual limite deve definir “poucos toques” para navegar do quadro inicial até um cartão? → A: Até dois toques depois de abrir o quadro.

- Q: Quais categorias e pictogramas devem compor o quadro inicial de comunicação? → A: Categorias iniciais: necessidades, sentimentos e solicitações, conforme a descrição da milestone. Cada mensagem pertence a uma categoria principal; o backlog registra o mapeamento das dez mensagens. O agente busca e seleciona o conjunto de pictogramas do Flaticon e documenta as escolhas e licenças no backlog para revisão da entrega.

- Q: Que dimensões mínimas devem ter os alvos de toque dos cartões e dos controles de reprodução e favoritos? → A: Aplicar o mínimo AA da WCAG 2.2 e registrar exceções justificadas para a interface móvel.

- Q: O que deve funcionar sem internet já na primeira abertura do aplicativo, se não houver uma voz instalada no dispositivo? → A: Quadro, frases, cartões personalizados e favoritos funcionam offline desde a primeira abertura. Sem voz local, a mensagem continua visível e uma orientação explica a indisponibilidade da leitura, sem bloquear o uso. A frase pode ser mostrada a outra pessoa para comunicação sem fala; esta resposta confirmou a decisão na rodada 3.

- Q: Ao fechar e reabrir o aplicativo, a frase que estava sendo montada deve ser recuperada ou apagada? → A: Manter a frase enquanto o app estiver aberto, inclusive em segundo plano; iniciar vazia após encerramento e nova abertura.

- Q: Como a leitura em voz alta deve ser acionada e interrompida para evitar sons inesperados durante a comunicação? → A: Selecionar cartões não produz fala. O botão de reprodução lê a frase; durante a leitura, permite interrompê-la.

- Q: Se ocorrer uma falha ao salvar um cartão personalizado, o aplicativo deve manter o conteúdo preenchido para permitir nova tentativa? → A: Manter o conteúdo na edição, informar a falha com mensagem acessível e permitir tentar novamente ou cancelar. Não indicar que foi salvo.

- Q: Os textos, imagens e frases de comunicação devem ficar exclusivamente no dispositivo, sem envio pelo aplicativo a serviços externos? → A: O aplicativo não envia esses conteúdos a serviços externos, nem os inclui em registros de erro. A leitura usa apenas voz local.

**Rodada 2 — critérios de aceite**

- Q: Ao excluir um cartão personalizado, o que deve acontecer se ele estiver em uma frase ainda aberta ou nos favoritos? → A: Remover o cartão dos favoritos e da frase aberta; manter os demais cartões da frase na mesma ordem.

- Q: Os cartões favoritos devem aparecer em que ordem? → A: Ordem em que foram favoritados, com novos favoritos no final. Desmarcar e marcar novamente coloca o cartão no final.

- Q: Nesta milestone, cartões personalizados devem permitir áudio gravado ou importado, além da leitura do texto pela voz do dispositivo? → A: Cartões personalizados têm texto e imagem opcional; a comunicação sonora usa somente Text-to-Speech. Áudio gravado/importado fica fora desta entrega.

Decisões aprovadas nestas rodadas, vinculada à milestone #9 e às US-001/#1 a US-005/#5.
Os detalhamentos foram sincronizados com as Issues #1–#5 e a milestone #9 por solicitação explícita do usuário. Os critérios originais das Issues foram preservados e complementados por esclarecimentos de aceite; estados, títulos, labels e vínculos foram verificados após a atualização. Essa sincronização não declara histórias Ready nem implementadas.

## Objetivo

Permitir acessar cartões essenciais, compor e reproduzir mensagens, personalizar cartões e recuperar favoritos.

## Público e necessidades

As personas e necessidades são as declaradas nas histórias abaixo. Não se inferem diagnóstico, indicação clínica ou capacidades individuais além do texto do backlog.

## User Scenarios & Testing *(mandatory)*

As cinco histórias mantêm a prioridade P0 registrada no GitHub. A ordem por US não cria
prioridade adicional. Os cenários abaixo derivam dos critérios originais; não os substituem.
Testar uma capacidade isoladamente não elimina suas dependências funcionais.

## Histórias de usuário

### US-001 — Exibir quadro básico de comunicação (Priority: P0)

GitHub Issue: [#1](https://github.com/Nosso-Espectro/aplicativo/issues/1)

Como pessoa autista não falante, com fala limitada ou em situação de sobrecarga, quero acessar rapidamente um quadro com cartões de comunicação essenciais, para expressar necessidades sem depender da fala.

#### Critérios de aceite

- Ao abrir o módulo, devo visualizar categorias e cartões essenciais sem necessidade de internet.
- Devem existir cartões iniciais para sim, não, ajuda, água, banheiro, fome, dor, silêncio, sair daqui e preciso de tempo.
- Cada cartão deve apresentar pictograma ou imagem, texto legível segundo as orientações aplicáveis da WCAG 2.2 AA e ampliação de texto do sistema sem perda de conteúdo ou função (Clarify, rodada 3), e área de toque ampla.
- O usuário deve conseguir navegar do quadro inicial até um cartão com até dois toques após abrir o quadro (Clarify, rodada 3).

**Why this priority**: prioridade P0 da Issue e da milestone; valor expresso na história original.

**Independent Test**: Abrir o quadro sem rede e verificar conteúdo e navegação, permitindo comunicar necessidades essenciais.

**Acceptance Scenarios**:

1. **Given** o dispositivo sem internet, **When** abrir o módulo, **Then** categorias e cartões essenciais estão disponíveis. (#1, critério 1.)
2. **Given** o quadro inicial, **When** consultar os cartões, **Then** estão presentes sim, não, ajuda, água, banheiro, fome, dor, silêncio, sair daqui e preciso de tempo. (#1, critério 2.)
3. **Given** um cartão inicial, **When** visualizá-lo e acioná-lo, **Then** ele apresenta pictograma ou imagem, texto conforme orientações aplicáveis da WCAG 2.2 AA com ampliação do sistema sem perda de conteúdo ou função, e área de toque ampla; tamanho mínimo de alvo AA da WCAG 2.2; exceções para a interface móvel exigem justificativa documentada (Clarify, rodada 3). (#1, critério 3.)
4. **Given** o quadro aberto, **When** navegar entre seus conteúdos, **Then** o cartão pode ser alcançado com até dois toques após abrir o quadro (Clarify, rodada 3). (#1, critério 4.)


### US-002 — Montar frases com cartões de comunicação (Priority: P0)

GitHub Issue: [#2](https://github.com/Nosso-Espectro/aplicativo/issues/2)

Como usuário de CAA, quero selecionar vários cartões em sequência, para montar uma mensagem mais completa antes de comunicá-la.

#### Critérios de aceite

- Os cartões selecionados devem aparecer em uma área de frase na ordem escolhida.
- Deve ser possível remover um cartão individual sem apagar toda a frase.
- Deve existir ação para limpar toda a frase.
- A frase montada deve permanecer disponível enquanto o usuário navega entre categorias.

**Why this priority**: prioridade P0 da Issue e da milestone; valor expresso na história original.

**Independent Test**: Selecionar cartões, remover um, limpar e trocar categorias, verificando a composição da mensagem.

**Acceptance Scenarios**:

1. **Given** cartões disponíveis, **When** selecioná-los em sequência, **Then** eles aparecem na área de frase na ordem escolhida, sem bloquear novas seleções por um máximo funcional predefinido de cartões. (#2, critério 1; decisão complementar sobre limite de composição.)
2. **Given** uma frase com vários cartões, **When** remover um cartão individual, **Then** os demais não são apagados. (#2, critério 2.)
3. **Given** uma frase montada, **When** acionar a limpeza da frase, **Then** toda a frase é limpa. (#2, critério 3.)
4. **Given** uma frase montada, **When** navegar entre categorias, **Then** a frase permanece disponível. (#2, critério 4.)


### US-003 — Reproduzir mensagens por Text-to-Speech (Priority: P0)

GitHub Issue: [#3](https://github.com/Nosso-Espectro/aplicativo/issues/3)

Como usuário com dificuldade de fala, quero que o aplicativo leia em voz alta a frase que montei, para me comunicar com pessoas ao meu redor.

#### Critérios de aceite

- Deve existir um botão claro para reproduzir a frase montada.
- A leitura deve utilizar o mecanismo de Text-to-Speech disponível no dispositivo, em português brasileiro (pt-BR). Se não houver voz local compatível, informar a indisponibilidade e manter a frase visível (Clarify, rodada 5).
- A ausência de voz instalada deve gerar orientação compreensível, sem travar o aplicativo.
- O recurso deve funcionar sem depender de um servidor remoto.

**Why this priority**: prioridade P0 da Issue e da milestone; valor expresso na história original.

**Independent Test**: Reproduzir uma frase com voz disponível e exercitar ausência de voz e de rede, verificando a comunicação sonora.

**Acceptance Scenarios**:

1. **Given** uma frase montada e voz disponível, **When** acionar o botão de reprodução, **Then** a frase é lida em voz alta. (#3, critério 1; Clarify: a seleção de cartões não inicia fala e o controle permite interromper a leitura em andamento.)
2. **Given** uma frase montada, **When** acionar sua leitura, **Then** é utilizado o mecanismo de Text-to-Speech do dispositivo. (#3, critério 2.)
3. **Given** ausência de voz instalada, **When** tentar reproduzir a frase, **Then** é apresentada orientação compreensível sem travar o aplicativo. (#3, critério 3.)
4. **Given** voz local disponível e ausência de rede, **When** reproduzir uma frase, **Then** a leitura funciona sem servidor remoto. (#3, critério 4.)


### US-004 — Criar e editar cartões personalizados (Priority: P0)

GitHub Issue: [#4](https://github.com/Nosso-Espectro/aplicativo/issues/4)

Como usuário de CAA, quero criar cartões próprios com texto e imagem, para adaptar o comunicador à minha rotina, pessoas e objetos importantes.

#### Critérios de aceite

- Deve ser possível criar cartão com título e categoria.
- A imagem deve ser opcional e poder vir de arquivo ou câmera quando suportado.
- Deve ser possível editar e excluir cartões personalizados.
- Cartões personalizados devem permanecer salvos localmente após fechar o aplicativo.

**Why this priority**: prioridade P0 da Issue e da milestone; valor expresso na história original.

**Independent Test**: Criar, editar, excluir e reabrir cartões locais, com e sem imagem, verificando a personalização.

**Acceptance Scenarios**:

1. **Given** a criação de cartão, **When** informar título não vazio após remover espaços nas extremidades e selecionar uma categoria existente, **Then** é possível criar o cartão. (#4, critério 1; decisão complementar de validação.)
2. **Given** a criação de cartão, **When** optar por não usar imagem ou por selecioná-la de arquivo ou câmera suportada, **Then** a imagem é opcional e as origens suportadas podem ser usadas. (#4, critério 2.)
3. **Given** um cartão personalizado existente, **When** editar ou excluir o cartão, **Then** a operação escolhida pode ser realizada; ao editar, a frase aberta mantém o conteúdo anterior e favoritos mostram o conteúdo editado; exclusão remove o cartão da frase e dos favoritos, preservando os demais itens na ordem (Clarify, rodadas 2 e 5). (#4, critério 3.)
4. **Given** um cartão personalizado salvo, **When** fechar e reabrir o aplicativo, **Then** o cartão permanece salvo localmente. (#4, critério 4.)
5. **Given** a criação ou edição de cartão com título vazio ou composto somente por espaços, ou categoria ausente/inexistente, **When** tentar salvar, **Then** o cartão não é salvo, o preenchimento é preservado e o campo a corrigir é indicado; após corrigir os campos, é possível salvar. (#4, RF-013/RF-015; decisão complementar de validação.)


### US-005 — Favoritar cartões de comunicação (Priority: P0)

GitHub Issue: [#5](https://github.com/Nosso-Espectro/aplicativo/issues/5)

Como usuário de CAA, quero marcar cartões frequentes como favoritos, para acessá-los mais rápido em situações de urgência ou sobrecarga.

#### Critérios de aceite

- Qualquer cartão deve poder ser marcado ou desmarcado como favorito.
- Deve existir uma área de favoritos acessível diretamente no módulo.
- A ordem dos favoritos deve ser persistida localmente.

**Why this priority**: prioridade P0 da Issue e da milestone; valor expresso na história original.

**Independent Test**: Marcar/desmarcar cartões, acessar favoritos e reabrir o módulo, verificando acesso e ordem persistida.

**Acceptance Scenarios**:

1. **Given** qualquer cartão, **When** marcar e desmarcar como favorito, **Then** a marcação acompanha a escolha do usuário. (#5, critério 1.)
2. **Given** o módulo aberto, **When** acessar favoritos, **Then** a área de favoritos está acessível diretamente no módulo. (#5, critério 2.)
3. **Given** favoritos em uma ordem estabelecida, **When** fechar e reabrir o aplicativo, **Then** essa ordem permanece salva localmente na sequência em que os cartões foram favoritados; um cartão favoritado novamente vai para o final (Clarify, rodada 2). (#5, critério 3.)


### Definition of Done original (comum às Issues #1, #2, #3, #4, #5)

- Critérios de aceite atendidos.
- Fluxo principal testado.
- Estados de erro e ausência de dados tratados.
- Interface utilizável em dispositivo móvel.
- Acessibilidade básica validada: foco, contraste, tamanho de toque e textos compreensíveis.
- Nenhum dado sensível é enviado para serviço externo sem necessidade e consentimento adequado.
- Documentação técnica mínima atualizada quando aplicável.

### Observações de produto originais (comuns às Issues)

Esta história deve priorizar autonomia, previsibilidade, baixa carga cognitiva e controle do usuário. Baixa carga cognitiva deve ser avaliada por revisão qualitativa documentada de consistência e previsibilidade, sem criar critério funcional ou métrica nova (Clarify, rodada 4). O aplicativo não deve apresentar recursos de apoio como diagnóstico, tratamento ou substituição de acompanhamento profissional.

### Edge Cases

- Ausência de voz instalada (#3): orientação compreensível, sem travamento, conforme RF-011.
  A frase continua visível e a indisponibilidade da leitura não bloqueia a comunicação visual,
  inclusive na primeira abertura sem internet (Clarifications, 2026-09-23).
- Troca de categoria durante composição (#2): preservar a frase, conforme RF-008.
- Segundo plano sem encerramento (#2): manter a frase ao retornar. Após encerramento
  pelo usuário ou sistema, iniciar com frase vazia; cartões personalizados e favoritos
  salvos continuam disponíveis (#4/#5). Decisão de Clarify de 2026-09-23.
- Imagem omitida (#4): criação permitida, conforme RF-014.
- Câmera negada ou imagem indisponível (#4): informar o problema e permitir salvar sem imagem (Clarify, rodada 5).
- Falha ao salvar favoritos (#5): manter ordem salva anteriormente, apresentar mensagem acessível e permitir nova tentativa (Clarify, rodada 5).
- Favoritos vazios (#5): informar que ainda não há cartões favoritos. Frase vazia (#2/#3): não iniciar leitura e informar que é preciso montar uma frase (Clarify, rodada 5).
- Leitura em andamento (#3): o usuário pode interrompê-la pelo controle de reprodução;
  selecionar cartões não aciona fala (Clarify, 2026-09-23).
- Falha ao salvar cartão personalizado (#4): manter texto e imagem escolhidos na edição,
  apresentar mensagem acessível e permitir nova tentativa ou cancelamento, sem indicar
  sucesso. A decisão não exige recuperar uma edição não salva após encerramento do app
  (Clarify, 2026-09-23).
- Exclusão de cartão personalizado usado em frase/favoritos (#2/#4/#5): remover o cartão
  da frase aberta e dos favoritos; preservar os demais itens da frase na mesma ordem
  (Clarify, rodada 2).

## Requirements *(mandatory)*

### Functional Requirements

Os IDs RF existentes são preservados para não romper o vínculo com plano e tasks.

## Requisitos funcionais

- **RF-001** — Ao abrir o módulo, devo visualizar categorias e cartões essenciais sem necessidade de internet. (#1, critério 1.)
- **RF-002** — Devem existir cartões iniciais para sim, não, ajuda, água, banheiro, fome, dor, silêncio, sair daqui e preciso de tempo. (#1, critério 2.) Categorias e pictogramas padrão devem ser definidos no backlog; os pictogramas devem vir do Flaticon, com origem e licença documentadas (Clarify, rodada 3 e decisão complementar do usuário). A busca e a seleção dos pictogramas adequados cabem ao agente, com registro das escolhas e licenças conforme a decisão complementar de US-001/#1.
- **RF-003** — Cada cartão deve apresentar pictograma ou imagem, texto legível segundo as orientações aplicáveis da WCAG 2.2 AA e ampliação de texto do sistema sem perda de conteúdo ou função (Clarify, rodada 3), e área de toque ampla. (#1, critério 3.)
- **RF-004** — O usuário deve conseguir navegar do quadro inicial até um cartão com até dois toques após abrir o quadro (Clarify, rodada 3). (#1, critério 4.)
- **RF-005** — Os cartões selecionados devem aparecer em uma área de frase na ordem escolhida. Não haverá limite funcional predefinido de cartões por frase. (#2, critério 1; decisão complementar explícita do usuário.)
- **RF-006** — Deve ser possível remover um cartão individual sem apagar toda a frase. (#2, critério 2.)
- **RF-007** — Deve existir ação para limpar toda a frase. (#2, critério 3.)
- **RF-008** — A frase montada deve permanecer disponível enquanto o usuário navega entre categorias. (#2, critério 4.)
- **RF-009** — Deve existir um botão claro para reproduzir a frase montada. (#3, critério 1.)
- **RF-010** — A leitura deve utilizar o mecanismo de Text-to-Speech disponível no dispositivo, em português brasileiro (pt-BR). Se não houver voz local compatível, informar a indisponibilidade e manter a frase visível (Clarify, rodada 5). (#3, critério 2.)
- **RF-011** — A ausência de voz instalada deve gerar orientação compreensível, sem travar o aplicativo. (#3, critério 3.)
- **RF-012** — O recurso deve funcionar sem depender de um servidor remoto. (#3, critério 4.)
- **RF-013** — Deve ser possível criar cartão com título e categoria. O título é obrigatório e não pode ficar vazio após remover espaços nas extremidades; a categoria deve ser obrigatoriamente selecionada entre as existentes. Aplicar a validação na criação e edição (RF-015). Em caso de erro, preservar o preenchimento, indicar o campo a corrigir e impedir o salvamento até a correção. (#4, critério 1; decisão complementar aprovada pelo usuário.)
- **RF-014** — A imagem deve ser opcional e poder vir de arquivo ou câmera quando suportado. (#4, critério 2.)
- **RF-015** — Deve ser possível editar e excluir cartões personalizados. (#4, critério 3.) Ao editar um cartão em uso, a frase aberta preserva o conteúdo existente quando selecionada e favoritos exibem a versão atualizada. Ao excluir, remover o cartão da frase aberta e dos favoritos, preservando os demais itens na ordem (Clarify, rodadas 2 e 5).
- **RF-016** — Cartões personalizados devem permanecer salvos localmente após fechar o aplicativo. (#4, critério 4.)
- **RF-017** — Qualquer cartão deve poder ser marcado ou desmarcado como favorito. (#5, critério 1.)
- **RF-018** — Deve existir uma área de favoritos acessível diretamente no módulo. (#5, critério 2.)
- **RF-019** — A ordem dos favoritos deve ser persistida localmente. (#5, critério 3.)

Detalhamento de RF-008 aprovado em Clarify (2026-09-23, US-002/#2): a composição
permanece durante a sessão, inclusive em segundo plano sem encerramento. Após encerramento
e nova abertura, a frase inicia vazia. Essa regra não altera a persistência local de cartões
personalizados (RF-016) ou favoritos (RF-019).

Detalhamento de RF-005 e RF-009 aprovado em Clarify (2026-09-23, US-002/#2 e
US-003/#3): selecionar cartões não aciona fala. A leitura da frase começa somente por
acionamento explícito do botão de reprodução. Durante a leitura, esse controle permite
interrompê-la. Não há leitura automática de cartões ao selecioná-los nesta feature.

Detalhamento de RF-015 aprovado em Clarify (2026-09-23, rodada 2, US-002/#2,
US-004/#4 e US-005/#5): excluir cartão personalizado remove-o da frase aberta e dos
favoritos, mantendo os demais itens da frase na ordem existente.

Detalhamento de RF-013, RF-015 e RF-016 aprovado em Clarify (2026-09-23, US-004/#4):
em caso de falha ao salvar, manter o conteúdo preenchido na edição, informar a falha com
mensagem acessível e oferecer nova tentativa ou cancelamento. Não apresentar confirmação
de sucesso quando a gravação falhar. Não se exige persistência de rascunhos entre sessões.

Detalhamento de RF-013 e RF-014 aprovado em Clarify (2026-09-23, rodada 2, US-004/#4):
cartões personalizados não incluem gravação ou importação de áudio nesta entrega.
A comunicação sonora utiliza somente a leitura por Text-to-Speech definida em US-003/#3.

Os termos qualitativos do backlog foram preservados; os limites ainda não definidos estão em “Questões em aberto”. O critério de alvos de toque foi definido na rodada 3 de Clarify. RFs são locais a esta spec; use o caminho da spec junto ao ID ao referenciá-los.

## Requisitos não funcionais

- **RNF-001** — A interface deve ser utilizável em dispositivo móvel, com foco, contraste, alvos de toque e textos compreensíveis verificados nos fluxos da história. Textos de cartões e mensagens de erro seguem orientações aplicáveis da WCAG 2.2 AA e permitem ampliação do sistema sem perda de conteúdo ou função (Clarify, rodada 3). Alvos de cartões e controles devem cumprir o mínimo AA aplicável da WCAG 2.2; exceções para a interface móvel exigem justificativa documentada (Clarify, rodada 3). Fonte: DoD/observações de #1, #2, #3, #4, #5.
- **RNF-002** — Nenhum dado sensível deve ser enviado a serviço externo sem necessidade e consentimento adequado; verificar as saídas de rede dos fluxos implementados. Fonte: DoD/observações de #1, #2, #3, #4, #5.
- **RNF-003** — Os estados de erro e ausência de dados pertinentes devem ser tratados e verificados sem impedir o fluxo restante. Fonte: DoD/observações de #1, #2, #3, #4, #5.
- **RNF-004** — Recursos de apoio não devem ser apresentados como diagnóstico, tratamento ou substituição de acompanhamento profissional; conferir textos e saídas. Fonte: DoD/observações de #1, #2, #3, #4, #5.

A obrigação offline aplica-se à feature inteira pela descrição da milestone #9, além dos
critérios específicos RF-001, RF-012, RF-016 e RF-019. Não se presume sincronização.
Conforme a decisão de Clarify de 2026-09-23, quadro, composição de frases, criação/edição de
cartões personalizados e favoritos devem funcionar sem internet desde a primeira abertura.
A ausência de voz local não bloqueia esses fluxos: a mensagem permanece visível e o usuário
recebe orientação compreensível sobre a indisponibilidade da leitura. Não é exigida leitura
em voz alta sem voz local instalada nem aquisição automática de voz. Esta decisão detalha
RF-001, RF-005–RF-019 sem substituir os critérios originais.

A [constituição 1.1.0](../../.specify/memory/constitution.md) complementa, sem reescrever,
a DoD e as observações originais: WCAG 2.2 AA quando aplicável, design neuroinclusivo,
baixa estimulação e carga cognitiva, previsibilidade, autonomia, controle do usuário,
privacidade por padrão, minimização e preferência por armazenamento local. A revisão deve
registrar evidências de acessibilidade, design, segurança, privacidade e testes. Não há
requisito nesta milestone para conta, telemetria, sincronização, backend ou IA.
Os limites clínicos das observações originais permanecem obrigatórios.

Detalhamento de RNF-002 e RF-012 aprovado em Clarify (2026-09-23, US-002/#2,
US-003/#3 e US-004/#4): textos, imagens e frases de comunicação ficam exclusivamente no
dispositivo. O aplicativo não envia esses conteúdos a serviços externos, inclusive para
suporte, nem os inclui em registros de erro. A leitura usa apenas voz local em português brasileiro (pt-BR), sem alternativa remota,
em Android e iOS. Essa restrição aplica-se também quando houver internet disponível
(Clarify, rodada 4). Os critérios
originais de privacidade acima são preservados como fonte; este detalhamento restringe o
comportamento desta feature conforme a decisão aprovada.

### Key Entities *(include if feature involves data)*

- **Cartão de comunicação** (#1/#4): texto/título, categoria e representação visual;
  imagem opcional para personalizados. Não inclui áudio gravado ou importado nesta entrega;
  a comunicação sonora usa somente Text-to-Speech (Clarify, rodada 2).
- **Categoria** (#1/#2/#4): agrupamento para navegação e associação dos cartões;
  categorias iniciais: necessidades, sentimentos e solicitações, conforme a descrição da milestone. Cada mensagem pertence a uma categoria principal; o backlog registra o mapeamento das dez mensagens e seleciona pictogramas do Flaticon com origem e licença documentadas (Clarify, rodadas 3 e 4).
- **Frase** (#2/#3): sequência de cartões na ordem escolhida, removível por item ou inteira,
  disponível entre categorias e passível de leitura. Permanece durante o uso e em segundo
  plano enquanto o aplicativo não for encerrado; após encerramento, a nova abertura inicia
  com frase vazia, sem recuperar a composição anterior (Clarify, 2026-09-23).
- **Favoritos** (#5): cartões marcados para acesso direto, com ordem persistida localmente pela sequência em que foram favoritados. Um cartão
  desmarcado e favoritado novamente vai para o final da sequência (Clarify, rodada 2).

## Success Criteria *(mandatory)*

### Measurable Outcomes

Os resultados são derivados dos critérios existentes, sem metas novas de tempo ou satisfação:

- **SC-001** (#1, RF-001/RF-002): sem internet, o usuário encontra as dez mensagens iniciais
  enumeradas no critério 2, além das categorias do quadro, já na primeira abertura.
  Nessa condição, composição de frases, cartões personalizados e favoritos também podem
  ser usados sem preparação online (decisão de Clarify; #1–#5).
- **SC-002** (#2, RF-005–RF-008): os quatro cenários de composição permitem manter a ordem,
  remover um cartão, limpar a frase e conservar a frase ao trocar categorias. Conforme
  Clarify de 2026-09-23, ir para segundo plano e retornar sem encerramento mantém a frase;
  encerrar e abrir novamente apresenta frase vazia, preservando cartões e favoritos salvos.
- **SC-003** (#3, RF-009–RF-012): o usuário ouve a frase sem servidor remoto quando há voz
  disponível; sem voz instalada, recebe orientação e o aplicativo não trava. A mensagem
  permanece visível e os fluxos visuais continuam disponíveis, inclusive na primeira abertura
  offline (decisão de Clarify, 2026-09-23). Selecionar cartões não produz fala; a leitura
  começa apenas pelo botão de reprodução e pode ser interrompida pelo mesmo controle.
  Apenas voz local pode ser usada, mesmo quando houver internet disponível. A voz deve ser
  compatível com português brasileiro (pt-BR); sem voz compatível, informar a indisponibilidade
  e manter a frase visível (Clarify, rodada 5). O aceite deve ser
  verificado em Android e iOS (Clarify, rodada 4); a orientação para voz ausente aplica-se
  em ambos os sistemas.
- **SC-004** (#4, RF-013–RF-016): o usuário cria cartão com título e categoria, usa imagem
  opcional, edita/exclui e recupera cartões salvos após fechar o aplicativo. Se o salvamento
  falhar, o conteúdo permanece na edição, há mensagem acessível e opções de tentar novamente
  ou cancelar, sem confirmação indevida de sucesso (Clarify, 2026-09-23).
- **SC-005** (#5, RF-017–RF-019): o usuário marca/desmarca qualquer cartão, acessa a área
  diretamente e recupera a ordem local ao reabrir; regra de ordenação depende de Clarify.
- **SC-006** (#1–#5, DoD/observações): os cinco fluxos têm evidências de acessibilidade,
  privacidade, autonomia, previsibilidade e baixa carga cognitiva; critérios qualitativos
  ainda não operacionalizados seguem revisão qualitativa documentada de consistência e previsibilidade (Q-CAA-02, Clarify, rodada 4). Os alvos de cartões e
  controles cumprem o mínimo AA aplicável da WCAG 2.2 ou registram justificativa documentada
  para exceção na interface móvel (Clarify, rodada 3). Para privacidade, verificar
  que textos, imagens e frases não são enviados a serviços externos e não aparecem em
  registros de erro, inclusive durante falhas de salvamento ou leitura (Clarify, 2026-09-23).

Esses resultados são metas de aceite, não evidência de implementação. A verificação integral
depende das decisões de Clarify; não há metas numéricas de desempenho no GitHub.

## Assumptions

Nenhum comportamento funcional ausente foi presumido. As condições dos cenários apenas
explicitam situações necessárias para testar os critérios fornecidos. A voz disponível é
pré-condição do cenário de leitura; sua ausência tem cenário próprio. O uso de câmera depende
do suporte indicado em #4. Conforme Clarify de 2026-09-23, a frase não é recuperada após
encerrar o aplicativo: a nova abertura inicia vazia. Ir para segundo plano, sem encerramento,
não limpa a frase. Encerramento pelo sistema também termina essa sessão de composição.
Desempenho numérico e tempos máximos não foram definidos no backlog.

## Fora de escopo

Gravação e importação de áudio em cartões personalizados estão fora desta entrega, conforme
a decisão de Clarify da rodada 2 (US-004/#4, milestone #9). A menção a áudio na descrição
original da milestone foi preservada como fonte histórica da divergência, já reconciliada
no GitHub; não autoriza implementação de áudio próprio.

Implementações de outras milestones, requisitos não rastreados e decisões funcionais listadas como pendentes. Nesta execução apenas documentação e ferramentas de engenharia; nenhuma funcionalidade é implementada.

## Dependências funcionais

Não há dependência entre milestones explicitamente exigida pelas histórias. Dentro da feature,
#2 utiliza cartões de #1; #3 utiliza a frase de #2 e a voz do dispositivo; #5 utiliza cartões
e inclui os personalizados de #4. A câmera em #4 depende de suporte do dispositivo.
O plano existente é preliminar e deve ser revisado após Clarify; esta especificação não
aprova escolhas técnicas ou marca tasks como prontas.

## Casos de erro

Sem voz instalada (#3), imagem não disponível/permissão negada (#4), catálogo/favoritos vazios e falha ao salvar (#4/#5). Preservar frase ao trocar categorias (#2).

São cenários derivados dos critérios e da DoD. Para falha ao salvar cartão personalizado
(#4), a resposta foi definida em Clarify: manter a edição, informar a falha de forma acessível
e permitir tentar novamente ou cancelar, sem indicar sucesso. As demais respostas ainda
indefinidas devem ser acordadas antes da implementação correspondente.

## Questões em aberto

Q-CAA-03 foi resolvida em várias rodadas e decisões complementares: ordenação de favoritos; efeitos de editar/excluir; plataformas e idioma da voz; câmera negada; falhas de persistência; favoritos e frases vazias. O limite de composição foi resolvido por decisão complementar: sem limite funcional predefinido de cartões por frase. A regra funcional de voz pt-BR já está definida em RF-010: usar voz local compatível; se ausente, informar e manter a frase visível. Confirmar o suporte efetivo nas versões de Android e iOS é uma investigação técnica para o plano, não uma decisão funcional em aberto. A validação de título/categoria foi aprovada pelo usuário e detalhada em RF-013/RF-015; não permanece como decisão funcional em aberto.

- **Q-CAA-01 — Resolvida em Clarify, rodada 2** (milestone #9, US-004/#4): áudio gravado/importado fica fora desta entrega; cartões personalizados têm texto e imagem opcional, com comunicação sonora somente por Text-to-Speech. Decisão refletida na descrição da milestone no GitHub e nos esclarecimentos da Issue #4, preservando seus critérios originais.
- **Q-CAA-02 — Resolvida em Clarify, rodadas 3–4** (US-001/#1 e DoD de #1–#5): categorias iniciais de necessidades, sentimentos e solicitações; cada mensagem pertence a uma única categoria principal; o backlog registra o mapeamento das dez mensagens e recebe a seleção de pictogramas do Flaticon feita pelo agente, com escolhas e licenças documentadas para revisão da entrega. “Poucos toques” significa até dois toques após abrir o quadro; texto segue orientações aplicáveis da WCAG 2.2 AA e ampliação do sistema; alvos de toque seguem mínimo AA com exceções móveis justificadas; baixa carga cognitiva tem revisão qualitativa documentada de consistência e previsibilidade. Refinamento concreto do backlog permanece necessário, mas não há decisão funcional ambígua nesta spec.
- **Q-CAA-03 — Resolvida: comportamentos e condições de uso** (US-002/#2, US-003/#3, US-004/#4, US-005/#5): Edição de cartão já selecionado: a frase aberta preserva o conteúdo da seleção; favoritos mostram a versão atualizada (Clarify, rodada 5). Composição sem limite funcional predefinido de cartões por frase foi aprovada pelo usuário. Título obrigatório e não vazio após remover espaços nas extremidades, categoria existente obrigatória e preservação do preenchimento com indicação do campo inválido foram aprovados pelo usuário; impedir salvamento até a correção, conforme RF-013/RF-015. A disponibilidade efetiva de voz pt-BR nas versões suportadas de Android e iOS deve ser investigada no plano técnico, respeitando o comportamento já aprovado em RF-010 para ausência de voz; não constitui nova decisão funcional. Ordenação de favoritos, efeitos de edição/exclusão, frase vazia após encerrar, uso offline desde primeira abertura, continuidade visual sem voz, Android e iOS, idioma pt-BR, leitura apenas por ação explícita, erros de câmera, falha ao salvar cartão personalizado/favoritos e estados vazios já foram resolvidos nesta spec.

As decisões funcionais acima estão registradas em Clarifications e nos requisitos correspondentes.
Permanecem pendentes a aprovação no backlog do mapeamento das dez mensagens e do conjunto
visual licenciado e a revisão de prontidão. Os refinamentos aprovados já foram sincronizados
com as Issues #1–#5 e a milestone #9. A pesquisa de suporte à voz local pt-BR pertence ao plano técnico.
A sincronização alterou somente os corpos das Issues #1–#5 e a descrição da milestone #9; naquela sincronização, nenhuma história havia sido registrada como Ready.

Questões transversais: [auditoria do backlog](../../docs/backlog-audit.md). Uma história só está Ready quando suas ambiguidades bloqueantes forem resolvidas no GitHub e refletidas aqui.

## Rastreabilidade

| Requisito | Issue | História | Task principal |
| --- | --- | --- | --- |
| RF-001 | [#1](https://github.com/Nosso-Espectro/aplicativo/issues/1) | US-001 | T013 |
| RF-002 | [#1](https://github.com/Nosso-Espectro/aplicativo/issues/1) | US-001 | T012 |
| RF-003 | [#1](https://github.com/Nosso-Espectro/aplicativo/issues/1) | US-001 | T013 |
| RF-004 | [#1](https://github.com/Nosso-Espectro/aplicativo/issues/1) | US-001 | T013 |
| RF-005 | [#2](https://github.com/Nosso-Espectro/aplicativo/issues/2) | US-002 | T017 |
| RF-006 | [#2](https://github.com/Nosso-Espectro/aplicativo/issues/2) | US-002 | T018 |
| RF-007 | [#2](https://github.com/Nosso-Espectro/aplicativo/issues/2) | US-002 | T018 |
| RF-008 | [#2](https://github.com/Nosso-Espectro/aplicativo/issues/2) | US-002 | T017 |
| RF-009 | [#3](https://github.com/Nosso-Espectro/aplicativo/issues/3) | US-003 | T023 |
| RF-010 | [#3](https://github.com/Nosso-Espectro/aplicativo/issues/3) | US-003 | T022 |
| RF-011 | [#3](https://github.com/Nosso-Espectro/aplicativo/issues/3) | US-003 | T023 |
| RF-012 | [#3](https://github.com/Nosso-Espectro/aplicativo/issues/3) | US-003 | T024 |
| RF-013 | [#4](https://github.com/Nosso-Espectro/aplicativo/issues/4) | US-004 | T026 |
| RF-014 | [#4](https://github.com/Nosso-Espectro/aplicativo/issues/4) | US-004 | T028 |
| RF-015 | [#4](https://github.com/Nosso-Espectro/aplicativo/issues/4) | US-004 | T030 |
| RF-016 | [#4](https://github.com/Nosso-Espectro/aplicativo/issues/4) | US-004 | T030 |
| RF-017 | [#5](https://github.com/Nosso-Espectro/aplicativo/issues/5) | US-005 | T034 |
| RF-018 | [#5](https://github.com/Nosso-Espectro/aplicativo/issues/5) | US-005 | T035 |
| RF-019 | [#5](https://github.com/Nosso-Espectro/aplicativo/issues/5) | US-005 | T034 |
| RNF-001 | #1, #2, #3, #4, #5 | Todas acima | Revisão por história em tasks.md |
| RNF-002 | #1, #2, #3, #4, #5 | Todas acima | Revisão por história em tasks.md |
| RNF-003 | #1, #2, #3, #4, #5 | Todas acima | Revisão por história em tasks.md |
| RNF-004 | #1, #2, #3, #4, #5 | Todas acima | Revisão por história em tasks.md |

As tasks de testes cobrem os RFs da respectiva história. Branches previstas, commits, PRs e tags seguem o [workflow](../../docs/development-workflow.md) e o [índice](../README.md); nenhum desses artefatos Git foi criado nesta preparação.

## Responsabilidade pela seleção visual

O agente responsável pela US-001 deve buscar e selecionar no Flaticon o pictograma adequado para cada uma das dez mensagens iniciais. A seleção deve priorizar correspondência com o significado da mensagem, clareza, legibilidade, consistência visual e baixa estimulação. Registrar por mensagem o ícone escolhido, a justificativa, a URL de origem, o autor, a licença e a atribuição aplicável; preparar os recursos para uso local offline conforme a licença. A escolha dos ícones é responsabilidade do agente, não uma decisão que deva ser devolvida ao usuário para cada recurso. Se não encontrar uma opção adequada ou não conseguir verificar a licença, registrar a lacuna específica, sem presumir adequação ou permissão.

A ausência dos arquivos selecionados é trabalho a executar na US-001, não uma ambiguidade sobre quem escolhe. A revisão da entrega verifica o conjunto escolhido; não se exige aprovação individual prévia de cada ícone. O mapeamento das mensagens entre categorias permanece uma pendência distinta.

## História técnica de bootstrap vinculada

### US-041 — Bootstrap React Native (Priority: P0)

GitHub Issue: [#41](https://github.com/Nosso-Espectro/aplicativo/issues/41)

Como equipe de desenvolvimento do TEAr, quero inicializar a base React Native para Android e iOS conforme o plano técnico definido, para implementar as histórias aprovadas com execução e qualidade verificáveis, sem backend na primeira versão.


#### Critérios de aceite

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


Pré-requisito técnico das US-001–US-005; esta história não adiciona funcionalidade ao produto. Stack e estrutura estão em [plan.md](plan.md); escopo e DoD em [bootstrap-tecnico.md](../../docs/bootstrap-tecnico.md) e na Issue #41. Sua decomposição e o estado de execução estão em [tasks.md](tasks.md), fases T001–T008; evidências e limitações em [quickstart.md](quickstart.md). Revisão de prontidão registrada em 2026-09-23 na Issue #41: história, dez critérios, vínculo, plano e tasks T001–T008 conferidos; somente US-041 incluída em `ready_stories`. Builds, compatibilidade e execução nas plataformas são critérios de entrega a verificar durante o bootstrap. Início da branch depende de main atualizada e árvore limpa.


#### Definition of Done original — Issue #41

- [ ] Critérios de aceite verificados com evidências, sem declarar validações não executadas.
- [ ] Testes pertinentes, lint, typecheck e build aprovados; compatibilidade conferida com expo-doctor.
- [ ] Abertura e operação da base instalada verificadas em Android/iOS, incluindo sem conexão; limitações de ambiente documentadas como pendências.
- [ ] Acessibilidade, privacidade, design e simplicidade revisados no escopo da base.
- [ ] Plano, quickstart, quality gate e rastreabilidade atualizados.
- [ ] PR vinculado à Issue contra main; uma branch curta de tarefa técnica, sem misturar histórias funcionais.

#### Observações de produto — Issue #41

Bootstrap técnico sem funcionalidades de produto. Pictogramas e mapeamento de mensagens pertencem à Issue #1; persistência, imagens e fala nativa serão implementadas nas respectivas Issues funcionais. Validações de plataforma indisponível permanecem pendentes.
