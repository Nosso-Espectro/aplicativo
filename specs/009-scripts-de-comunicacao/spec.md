---
milestone: 17
priority: P1
tag: m009-scripts-de-comunicacao
status: draft
ready_stories: []
source_checked: 2026-09-23
---

# Scripts de Comunicação

Milestone GitHub: [P1 — Scripts de Comunicação](https://github.com/Nosso-Espectro/aplicativo/milestone/17) (número 17).

Estado consultado: aberta; todas as histórias abaixo estão abertas. Especificação em revisão, não implementação concluída.

## Contexto

Formular mensagens em determinadas situações sociais pode exigir esforço adicional.

Descrição original da milestone:

> Disponibilizar frases prontas para situações sociais que possam gerar dificuldade de comunicação. Exemplos incluem pedir ajuda, solicitar mais tempo para responder, explicar uma sobrecarga, encerrar uma conversa ou pedir esclarecimentos. O usuário poderá editar os textos e criar novos scripts personalizados.

## Objetivo

Disponibilizar frases por categoria, cópia rápida, personalização e leitura por voz.

## Público e necessidades

As personas e necessidades são as declaradas nas histórias abaixo. Não se inferem diagnóstico, indicação clínica ou capacidades individuais além do texto do backlog.

## Histórias de usuário

### US-023 — Consultar scripts de comunicação prontos

GitHub Issue: [#23](https://github.com/Nosso-Espectro/aplicativo/issues/23)

Como pessoa que encontra dificuldade para formular mensagens em algumas situações sociais, quero acessar frases prontas, para comunicar minhas necessidades com menos esforço.

#### Critérios de aceite

- [ ] Devem existir scripts iniciais para pedir ajuda, pedir mais tempo, pedir esclarecimento, encerrar conversa e informar sobrecarga.
- [ ] Os scripts devem ser organizados por categoria.
- [ ] O usuário deve conseguir copiar um script com um toque.

### US-024 — Criar e editar scripts personalizados

GitHub Issue: [#24](https://github.com/Nosso-Espectro/aplicativo/issues/24)

Como usuário, quero criar meus próprios scripts de comunicação, para adaptar as frases ao meu modo de falar e às situações que vivo.

#### Critérios de aceite

- [ ] Deve ser possível criar, editar, excluir e favoritar scripts.
- [ ] Os scripts personalizados devem ficar salvos localmente.
- [ ] O usuário deve poder usar um script no Text-to-Speech.

### Definition of Done original (comum às Issues #23, #24)

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

- **RF-001** — Devem existir scripts iniciais para pedir ajuda, pedir mais tempo, pedir esclarecimento, encerrar conversa e informar sobrecarga. (#23, critério 1.)
- **RF-002** — Os scripts devem ser organizados por categoria. (#23, critério 2.)
- **RF-003** — O usuário deve conseguir copiar um script com um toque. (#23, critério 3.)
- **RF-004** — Deve ser possível criar, editar, excluir e favoritar scripts. (#24, critério 1.)
- **RF-005** — Os scripts personalizados devem ficar salvos localmente. (#24, critério 2.)
- **RF-006** — O usuário deve poder usar um script no Text-to-Speech. (#24, critério 3.)

Os termos qualitativos do backlog foram preservados; limites ainda não definidos estão em “Questões em aberto”. RFs são locais a esta spec; use o caminho da spec junto ao ID ao referenciá-los.

## Requisitos não funcionais

- **RNF-001** — A interface deve ser utilizável em dispositivo móvel, com foco, contraste, alvos de toque e textos compreensíveis verificados nos fluxos da história. Fonte: DoD/observações de #23, #24.
- **RNF-002** — Nenhum dado sensível deve ser enviado a serviço externo sem necessidade e consentimento adequado; verificar as saídas de rede dos fluxos implementados. Fonte: DoD/observações de #23, #24.
- **RNF-003** — Os estados de erro e ausência de dados pertinentes devem ser tratados e verificados sem impedir o fluxo restante. Fonte: DoD/observações de #23, #24.
- **RNF-004** — Recursos de apoio não devem ser apresentados como diagnóstico, tratamento ou substituição de acompanhamento profissional; conferir textos e saídas. Fonte: DoD/observações de #23, #24.

Offline e persistência seguem os critérios específicos dos RFs; não se presume sincronização. Desempenho numérico e tempos máximos não foram definidos no backlog.

## Fora de escopo

Implementações de outras milestones, requisitos não rastreados e decisões funcionais listadas como pendentes. Nesta execução apenas documentação e ferramentas de engenharia; nenhuma funcionalidade é implementada.

## Dependências funcionais

- [P0 — Comunicação Visual / CAA](../001-comunicacao-visual-caa/spec.md): relação de uso/integração descrita nas histórias ou nas questões abaixo; não altera a prioridade original.

## Casos de erro

Catálogo vazio, falha na área de transferência, voz indisponível e falha de armazenamento (#23/#24).

São cenários derivados dos critérios e da DoD, não novas funcionalidades. As respostas ainda indefinidas devem ser acordadas antes da implementação correspondente.

## Questões em aberto

- Q-SCRIPT-01 — Definir textos/categorias iniciais e revisão editorial (#23), ordenação dos favoritos e destino da edição (#24).
- Q-SCRIPT-02 — A leitura de scripts depende do contrato de TTS de #3; definir erro quando voz estiver indisponível (#24).

Questões transversais: [auditoria do backlog](../../docs/backlog-audit.md). Uma história só está Ready quando suas ambiguidades bloqueantes forem resolvidas no GitHub e refletidas aqui.

## Rastreabilidade

| Requisito | Issue | História | Task principal |
| --- | --- | --- | --- |
| RF-001 | [#23](https://github.com/Nosso-Espectro/aplicativo/issues/23) | US-023 | T001 |
| RF-002 | [#23](https://github.com/Nosso-Espectro/aplicativo/issues/23) | US-023 | T002 |
| RF-003 | [#23](https://github.com/Nosso-Espectro/aplicativo/issues/23) | US-023 | T003 |
| RF-004 | [#24](https://github.com/Nosso-Espectro/aplicativo/issues/24) | US-024 | T006 |
| RF-005 | [#24](https://github.com/Nosso-Espectro/aplicativo/issues/24) | US-024 | T007 |
| RF-006 | [#24](https://github.com/Nosso-Espectro/aplicativo/issues/24) | US-024 | T008 |
| RNF-001 | #23, #24 | Todas acima | Revisão por história em tasks.md |
| RNF-002 | #23, #24 | Todas acima | Revisão por história em tasks.md |
| RNF-003 | #23, #24 | Todas acima | Revisão por história em tasks.md |
| RNF-004 | #23, #24 | Todas acima | Revisão por história em tasks.md |

As tasks de testes cobrem os RFs da respectiva história. Branches previstas, commits, PRs e tags seguem o [workflow](../../docs/development-workflow.md) e o [índice](../README.md); nenhum desses artefatos Git foi criado nesta preparação.
