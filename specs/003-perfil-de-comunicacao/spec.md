---
milestone: 13
priority: P0
tag: m003-perfil-de-comunicacao
status: draft
ready_stories: []
source_checked: 2026-09-23
---

# Perfil de Comunicação

Milestone GitHub: [P0 — Perfil de Comunicação](https://github.com/Nosso-Espectro/aplicativo/milestone/13) (número 13).

Estado consultado: aberta; todas as histórias abaixo estão abertas. Especificação em revisão, não implementação concluída.

## Contexto

Preferências de comunicação e suporte precisam ser registradas e apresentadas conforme a escolha da pessoa.

Descrição original da milestone:

> Criar um perfil pessoal contendo preferências relevantes para comunicação e suporte. O usuário poderá registrar como prefere receber instruções, formas de comunicação utilizadas, sensibilidades sensoriais, estratégias que ajudam durante sobrecargas e outras informações que considere importantes. Os dados devem permanecer armazenados localmente por padrão.

## Objetivo

Permitir editar o perfil, reutilizar estratégias no plano de apoio e apresentar somente informações selecionadas.

## Público e necessidades

As personas e necessidades são as declaradas nas histórias abaixo. Não se inferem diagnóstico, indicação clínica ou capacidades individuais além do texto do backlog.

## Histórias de usuário

### US-014 — Cadastrar preferências de comunicação

GitHub Issue: [#14](https://github.com/Nosso-Espectro/aplicativo/issues/14)

Como pessoa autista, quero registrar como prefiro me comunicar e receber informações, para facilitar interações em diferentes contextos.

#### Critérios de aceite

- [ ] O perfil deve permitir registrar formas preferidas de comunicação.
- [ ] Deve ser possível informar necessidade de tempo adicional para responder.
- [ ] Deve ser possível editar e remover informações.
- [ ] Os dados devem permanecer locais por padrão.

### US-015 — Registrar sensibilidades e estratégias de suporte

GitHub Issue: [#15](https://github.com/Nosso-Espectro/aplicativo/issues/15)

Como usuário, quero registrar sensibilidades e estratégias que me ajudam, para comunicar necessidades de suporte com clareza.

#### Critérios de aceite

- [ ] Deve ser possível registrar sensibilidades relacionadas a som, luz, toque, temperatura e outras.
- [ ] Deve ser possível registrar estratégias que ajudam e estratégias que devem ser evitadas.
- [ ] As informações devem poder ser reutilizadas no Plano de Apoio.

### US-016 — Visualizar resumo do perfil para terceiros

GitHub Issue: [#16](https://github.com/Nosso-Espectro/aplicativo/issues/16)

Como usuário, quero apresentar um resumo simples do meu perfil de comunicação, para explicar rapidamente minhas necessidades a outra pessoa.

#### Critérios de aceite

- [ ] A visualização deve selecionar apenas informações marcadas pelo usuário para compartilhamento.
- [ ] O resumo deve ser legível em tela cheia.
- [ ] Nenhuma informação deve ser compartilhada automaticamente.

### Definition of Done original (comum às Issues #14, #15, #16)

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

- **RF-001** — O perfil deve permitir registrar formas preferidas de comunicação. (#14, critério 1.)
- **RF-002** — Deve ser possível informar necessidade de tempo adicional para responder. (#14, critério 2.)
- **RF-003** — Deve ser possível editar e remover informações. (#14, critério 3.)
- **RF-004** — Os dados devem permanecer locais por padrão. (#14, critério 4.)
- **RF-005** — Deve ser possível registrar sensibilidades relacionadas a som, luz, toque, temperatura e outras. (#15, critério 1.)
- **RF-006** — Deve ser possível registrar estratégias que ajudam e estratégias que devem ser evitadas. (#15, critério 2.)
- **RF-007** — As informações devem poder ser reutilizadas no Plano de Apoio. (#15, critério 3.)
- **RF-008** — A visualização deve selecionar apenas informações marcadas pelo usuário para compartilhamento. (#16, critério 1.)
- **RF-009** — O resumo deve ser legível em tela cheia. (#16, critério 2.)
- **RF-010** — Nenhuma informação deve ser compartilhada automaticamente. (#16, critério 3.)

Os termos qualitativos do backlog foram preservados; limites ainda não definidos estão em “Questões em aberto”. RFs são locais a esta spec; use o caminho da spec junto ao ID ao referenciá-los.

## Requisitos não funcionais

- **RNF-001** — A interface deve ser utilizável em dispositivo móvel, com foco, contraste, alvos de toque e textos compreensíveis verificados nos fluxos da história. Fonte: DoD/observações de #14, #15, #16.
- **RNF-002** — Nenhum dado sensível deve ser enviado a serviço externo sem necessidade e consentimento adequado; verificar as saídas de rede dos fluxos implementados. Fonte: DoD/observações de #14, #15, #16.
- **RNF-003** — Os estados de erro e ausência de dados pertinentes devem ser tratados e verificados sem impedir o fluxo restante. Fonte: DoD/observações de #14, #15, #16.
- **RNF-004** — Recursos de apoio não devem ser apresentados como diagnóstico, tratamento ou substituição de acompanhamento profissional; conferir textos e saídas. Fonte: DoD/observações de #14, #15, #16.

Offline e persistência seguem os critérios específicos dos RFs; não se presume sincronização. Desempenho numérico e tempos máximos não foram definidos no backlog.

## Fora de escopo

Implementações de outras milestones, requisitos não rastreados e decisões funcionais listadas como pendentes. Nesta execução apenas documentação e ferramentas de engenharia; nenhuma funcionalidade é implementada.

## Dependências funcionais

- [P0 — Plano de Apoio / Crise](../004-plano-de-apoio-crise/spec.md): relação de uso/integração descrita nas histórias ou nas questões abaixo; não altera a prioridade original.

## Casos de erro

Campos ausentes, nenhuma informação selecionada e falha ao salvar; não incluir informações não autorizadas no resumo (#14–#16).

São cenários derivados dos critérios e da DoD, não novas funcionalidades. As respostas ainda indefinidas devem ser acordadas antes da implementação correspondente.

## Questões em aberto

- Q-PERFIL-01 — Reutilização no Plano de Apoio (#15) ocorre por cópia ou referência? Mudanças posteriores devem propagar? Alinhar com Q-APOIO-01.
- Q-PERFIL-02 — Quais campos e formas de apresentação/compartilhamento são permitidos em #16? Não presumir exportação ou envio.

Questões transversais: [auditoria do backlog](../../docs/backlog-audit.md). Uma história só está Ready quando suas ambiguidades bloqueantes forem resolvidas no GitHub e refletidas aqui.

## Rastreabilidade

| Requisito | Issue | História | Task principal |
| --- | --- | --- | --- |
| RF-001 | [#14](https://github.com/Nosso-Espectro/aplicativo/issues/14) | US-014 | T001 |
| RF-002 | [#14](https://github.com/Nosso-Espectro/aplicativo/issues/14) | US-014 | T002 |
| RF-003 | [#14](https://github.com/Nosso-Espectro/aplicativo/issues/14) | US-014 | T003 |
| RF-004 | [#14](https://github.com/Nosso-Espectro/aplicativo/issues/14) | US-014 | T004 |
| RF-005 | [#15](https://github.com/Nosso-Espectro/aplicativo/issues/15) | US-015 | T007 |
| RF-006 | [#15](https://github.com/Nosso-Espectro/aplicativo/issues/15) | US-015 | T008 |
| RF-007 | [#15](https://github.com/Nosso-Espectro/aplicativo/issues/15) | US-015 | T009 |
| RF-008 | [#16](https://github.com/Nosso-Espectro/aplicativo/issues/16) | US-016 | T012 |
| RF-009 | [#16](https://github.com/Nosso-Espectro/aplicativo/issues/16) | US-016 | T013 |
| RF-010 | [#16](https://github.com/Nosso-Espectro/aplicativo/issues/16) | US-016 | T014 |
| RNF-001 | #14, #15, #16 | Todas acima | Revisão por história em tasks.md |
| RNF-002 | #14, #15, #16 | Todas acima | Revisão por história em tasks.md |
| RNF-003 | #14, #15, #16 | Todas acima | Revisão por história em tasks.md |
| RNF-004 | #14, #15, #16 | Todas acima | Revisão por história em tasks.md |

As tasks de testes cobrem os RFs da respectiva história. Branches previstas, commits, PRs e tags seguem o [workflow](../../docs/development-workflow.md) e o [índice](../README.md); nenhum desses artefatos Git foi criado nesta preparação.
