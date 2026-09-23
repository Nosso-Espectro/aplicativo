---
milestone: 9
priority: P0
tag: m001-comunicacao-visual-caa
status: draft
ready_stories: []
source_checked: 2026-09-23
---

# Comunicação Visual / CAA

Milestone GitHub: [P0 — Comunicação Visual / CAA](https://github.com/Nosso-Espectro/aplicativo/milestone/9) (número 9).

Estado consultado: aberta; todas as histórias abaixo estão abertas. Especificação em revisão, não implementação concluída.

## Contexto

A fala pode não estar disponível nas situações descritas pelas histórias; é necessário expressar necessidades por cartões.

Descrição original da milestone:

> Implementar uma ferramenta de Comunicação Aumentativa e Alternativa voltada principalmente a pessoas autistas não falantes, com fala limitada ou que perdem temporariamente a capacidade de falar em situações de sobrecarga. O usuário poderá selecionar cartões com pictogramas, imagens e textos para expressar necessidades, sentimentos e solicitações. Os cartões poderão formar frases e utilizar Text-to-Speech para reproduzi-las em voz alta. Deve ser possível criar cartões personalizados com imagem, texto e áudio. A funcionalidade deve operar offline.

## Objetivo

Permitir acessar cartões essenciais, compor e reproduzir mensagens, personalizar cartões e recuperar favoritos.

## Público e necessidades

As personas e necessidades são as declaradas nas histórias abaixo. Não se inferem diagnóstico, indicação clínica ou capacidades individuais além do texto do backlog.

## Histórias de usuário

### US-001 — Exibir quadro básico de comunicação

GitHub Issue: [#1](https://github.com/Nosso-Espectro/aplicativo/issues/1)

Como pessoa autista não falante, com fala limitada ou em situação de sobrecarga, quero acessar rapidamente um quadro com cartões de comunicação essenciais, para expressar necessidades sem depender da fala.

#### Critérios de aceite

- [ ] Ao abrir o módulo, devo visualizar categorias e cartões essenciais sem necessidade de internet.
- [ ] Devem existir cartões iniciais para sim, não, ajuda, água, banheiro, fome, dor, silêncio, sair daqui e preciso de tempo.
- [ ] Cada cartão deve apresentar pictograma ou imagem, texto legível e área de toque ampla.
- [ ] O usuário deve conseguir navegar pelo quadro com poucos toques.

### US-002 — Montar frases com cartões de comunicação

GitHub Issue: [#2](https://github.com/Nosso-Espectro/aplicativo/issues/2)

Como usuário de CAA, quero selecionar vários cartões em sequência, para montar uma mensagem mais completa antes de comunicá-la.

#### Critérios de aceite

- [ ] Os cartões selecionados devem aparecer em uma área de frase na ordem escolhida.
- [ ] Deve ser possível remover um cartão individual sem apagar toda a frase.
- [ ] Deve existir ação para limpar toda a frase.
- [ ] A frase montada deve permanecer disponível enquanto o usuário navega entre categorias.

### US-003 — Reproduzir mensagens por Text-to-Speech

GitHub Issue: [#3](https://github.com/Nosso-Espectro/aplicativo/issues/3)

Como usuário com dificuldade de fala, quero que o aplicativo leia em voz alta a frase que montei, para me comunicar com pessoas ao meu redor.

#### Critérios de aceite

- [ ] Deve existir um botão claro para reproduzir a frase montada.
- [ ] A leitura deve utilizar o mecanismo de Text-to-Speech disponível no dispositivo.
- [ ] A ausência de voz instalada deve gerar orientação compreensível, sem travar o aplicativo.
- [ ] O recurso deve funcionar sem depender de um servidor remoto.

### US-004 — Criar e editar cartões personalizados

GitHub Issue: [#4](https://github.com/Nosso-Espectro/aplicativo/issues/4)

Como usuário de CAA, quero criar cartões próprios com texto e imagem, para adaptar o comunicador à minha rotina, pessoas e objetos importantes.

#### Critérios de aceite

- [ ] Deve ser possível criar cartão com título e categoria.
- [ ] A imagem deve ser opcional e poder vir de arquivo ou câmera quando suportado.
- [ ] Deve ser possível editar e excluir cartões personalizados.
- [ ] Cartões personalizados devem permanecer salvos localmente após fechar o aplicativo.

### US-005 — Favoritar cartões de comunicação

GitHub Issue: [#5](https://github.com/Nosso-Espectro/aplicativo/issues/5)

Como usuário de CAA, quero marcar cartões frequentes como favoritos, para acessá-los mais rápido em situações de urgência ou sobrecarga.

#### Critérios de aceite

- [ ] Qualquer cartão deve poder ser marcado ou desmarcado como favorito.
- [ ] Deve existir uma área de favoritos acessível diretamente no módulo.
- [ ] A ordem dos favoritos deve ser persistida localmente.

### Definition of Done original (comum às Issues #1, #2, #3, #4, #5)

- [ ] Critérios de aceite atendidos.
- [ ] Fluxo principal testado.
- [ ] Estados de erro e ausência de dados tratados.
- [ ] Interface utilizável em dispositivo móvel.
- [ ] Acessibilidade básica validada: foco, contraste, tamanho de toque e textos compreensíveis.
- [ ] Nenhum dado sensível é enviado para serviço externo sem necessidade e consentimento adequado.
- [ ] Documentação técnica mínima atualizada quando aplicável.

### Observações de produto originais (comuns às Issues)

Esta história deve priorizar autonomia, previsibilidade, baixa carga cognitiva e controle do usuário. O aplicativo não deve apresentar recursos de apoio como diagnóstico, tratamento ou substituição de acompanhamento profissional.

## Requisitos funcionais

- **RF-001** — Ao abrir o módulo, devo visualizar categorias e cartões essenciais sem necessidade de internet. (#1, critério 1.)
- **RF-002** — Devem existir cartões iniciais para sim, não, ajuda, água, banheiro, fome, dor, silêncio, sair daqui e preciso de tempo. (#1, critério 2.)
- **RF-003** — Cada cartão deve apresentar pictograma ou imagem, texto legível e área de toque ampla. (#1, critério 3.)
- **RF-004** — O usuário deve conseguir navegar pelo quadro com poucos toques. (#1, critério 4.)
- **RF-005** — Os cartões selecionados devem aparecer em uma área de frase na ordem escolhida. (#2, critério 1.)
- **RF-006** — Deve ser possível remover um cartão individual sem apagar toda a frase. (#2, critério 2.)
- **RF-007** — Deve existir ação para limpar toda a frase. (#2, critério 3.)
- **RF-008** — A frase montada deve permanecer disponível enquanto o usuário navega entre categorias. (#2, critério 4.)
- **RF-009** — Deve existir um botão claro para reproduzir a frase montada. (#3, critério 1.)
- **RF-010** — A leitura deve utilizar o mecanismo de Text-to-Speech disponível no dispositivo. (#3, critério 2.)
- **RF-011** — A ausência de voz instalada deve gerar orientação compreensível, sem travar o aplicativo. (#3, critério 3.)
- **RF-012** — O recurso deve funcionar sem depender de um servidor remoto. (#3, critério 4.)
- **RF-013** — Deve ser possível criar cartão com título e categoria. (#4, critério 1.)
- **RF-014** — A imagem deve ser opcional e poder vir de arquivo ou câmera quando suportado. (#4, critério 2.)
- **RF-015** — Deve ser possível editar e excluir cartões personalizados. (#4, critério 3.)
- **RF-016** — Cartões personalizados devem permanecer salvos localmente após fechar o aplicativo. (#4, critério 4.)
- **RF-017** — Qualquer cartão deve poder ser marcado ou desmarcado como favorito. (#5, critério 1.)
- **RF-018** — Deve existir uma área de favoritos acessível diretamente no módulo. (#5, critério 2.)
- **RF-019** — A ordem dos favoritos deve ser persistida localmente. (#5, critério 3.)

Os termos qualitativos do backlog foram preservados; limites ainda não definidos estão em “Questões em aberto”. RFs são locais a esta spec; use o caminho da spec junto ao ID ao referenciá-los.

## Requisitos não funcionais

- **RNF-001** — A interface deve ser utilizável em dispositivo móvel, com foco, contraste, alvos de toque e textos compreensíveis verificados nos fluxos da história. Fonte: DoD/observações de #1, #2, #3, #4, #5.
- **RNF-002** — Nenhum dado sensível deve ser enviado a serviço externo sem necessidade e consentimento adequado; verificar as saídas de rede dos fluxos implementados. Fonte: DoD/observações de #1, #2, #3, #4, #5.
- **RNF-003** — Os estados de erro e ausência de dados pertinentes devem ser tratados e verificados sem impedir o fluxo restante. Fonte: DoD/observações de #1, #2, #3, #4, #5.
- **RNF-004** — Recursos de apoio não devem ser apresentados como diagnóstico, tratamento ou substituição de acompanhamento profissional; conferir textos e saídas. Fonte: DoD/observações de #1, #2, #3, #4, #5.

Offline e persistência seguem os critérios específicos dos RFs; não se presume sincronização. Desempenho numérico e tempos máximos não foram definidos no backlog.

## Fora de escopo

Implementações de outras milestones, requisitos não rastreados e decisões funcionais listadas como pendentes. Nesta execução apenas documentação e ferramentas de engenharia; nenhuma funcionalidade é implementada.

## Dependências funcionais

Não há dependência entre milestones explicitamente exigida pelas histórias. A fundação técnica é tratada no plano.

## Casos de erro

Sem voz instalada (#3), imagem não disponível/permissão negada (#4), catálogo/favoritos vazios e falha ao salvar (#4/#5). Preservar frase ao trocar categorias (#2).

São cenários derivados dos critérios e da DoD, não novas funcionalidades. As respostas ainda indefinidas devem ser acordadas antes da implementação correspondente.

## Questões em aberto

- Q-CAA-01 — A milestone inclui áudio em cartões personalizados, mas #4 só especifica texto e imagem. Definir critérios e Issue responsável antes de incluir gravação/importação de áudio.
- Q-CAA-02 — Quais categorias, pictogramas licenciados e limites observáveis para “poucos toques” e “área de toque ampla” em #1? Não escolher conteúdo protegido sem autorização.
- Q-CAA-03 — Qual ordenação dos favoritos (#5), comportamento de referências ao excluir um cartão (#4/#2) e quais plataformas/vozes offline serão suportadas (#3)?

Questões transversais: [auditoria do backlog](../../docs/backlog-audit.md). Uma história só está Ready quando suas ambiguidades bloqueantes forem resolvidas no GitHub e refletidas aqui.

## Rastreabilidade

| Requisito | Issue | História | Task principal |
| --- | --- | --- | --- |
| RF-001 | [#1](https://github.com/Nosso-Espectro/aplicativo/issues/1) | US-001 | T001 |
| RF-002 | [#1](https://github.com/Nosso-Espectro/aplicativo/issues/1) | US-001 | T002 |
| RF-003 | [#1](https://github.com/Nosso-Espectro/aplicativo/issues/1) | US-001 | T003 |
| RF-004 | [#1](https://github.com/Nosso-Espectro/aplicativo/issues/1) | US-001 | T004 |
| RF-005 | [#2](https://github.com/Nosso-Espectro/aplicativo/issues/2) | US-002 | T007 |
| RF-006 | [#2](https://github.com/Nosso-Espectro/aplicativo/issues/2) | US-002 | T008 |
| RF-007 | [#2](https://github.com/Nosso-Espectro/aplicativo/issues/2) | US-002 | T009 |
| RF-008 | [#2](https://github.com/Nosso-Espectro/aplicativo/issues/2) | US-002 | T010 |
| RF-009 | [#3](https://github.com/Nosso-Espectro/aplicativo/issues/3) | US-003 | T013 |
| RF-010 | [#3](https://github.com/Nosso-Espectro/aplicativo/issues/3) | US-003 | T014 |
| RF-011 | [#3](https://github.com/Nosso-Espectro/aplicativo/issues/3) | US-003 | T015 |
| RF-012 | [#3](https://github.com/Nosso-Espectro/aplicativo/issues/3) | US-003 | T016 |
| RF-013 | [#4](https://github.com/Nosso-Espectro/aplicativo/issues/4) | US-004 | T019 |
| RF-014 | [#4](https://github.com/Nosso-Espectro/aplicativo/issues/4) | US-004 | T020 |
| RF-015 | [#4](https://github.com/Nosso-Espectro/aplicativo/issues/4) | US-004 | T021 |
| RF-016 | [#4](https://github.com/Nosso-Espectro/aplicativo/issues/4) | US-004 | T022 |
| RF-017 | [#5](https://github.com/Nosso-Espectro/aplicativo/issues/5) | US-005 | T025 |
| RF-018 | [#5](https://github.com/Nosso-Espectro/aplicativo/issues/5) | US-005 | T026 |
| RF-019 | [#5](https://github.com/Nosso-Espectro/aplicativo/issues/5) | US-005 | T027 |
| RNF-001 | #1, #2, #3, #4, #5 | Todas acima | Revisão por história em tasks.md |
| RNF-002 | #1, #2, #3, #4, #5 | Todas acima | Revisão por história em tasks.md |
| RNF-003 | #1, #2, #3, #4, #5 | Todas acima | Revisão por história em tasks.md |
| RNF-004 | #1, #2, #3, #4, #5 | Todas acima | Revisão por história em tasks.md |

As tasks de testes cobrem os RFs da respectiva história. Branches previstas, commits, PRs e tags seguem o [workflow](../../docs/development-workflow.md) e o [índice](../README.md); nenhum desses artefatos Git foi criado nesta preparação.
