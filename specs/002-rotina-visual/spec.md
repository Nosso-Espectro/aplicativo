---
milestone: 10
priority: P0
tag: m002-rotina-visual
status: draft
ready_stories: []
source_checked: 2026-09-23
---

# Rotina Visual

Milestone GitHub: [P0 — Rotina Visual](https://github.com/Nosso-Espectro/aplicativo/milestone/10) (número 10).

Estado consultado: aberta; todas as histórias abaixo estão abertas. Especificação em revisão, não implementação concluída.

## Contexto

As histórias pedem previsibilidade para organizar e executar atividades em sequência.

Descrição original da milestone:

> Criar uma ferramenta para organização de rotinas através de cartões visuais e etapas sequenciais. O usuário poderá criar rotinas como manhã, ir para escola, trabalho ou hora de dormir, adicionando imagem, título e ordem das atividades. O aplicativo deverá destacar claramente o que está acontecendo agora, o que vem depois e permitir marcar etapas como concluídas.

## Objetivo

Permitir criar, reordenar e executar rotinas visuais com indicação de Agora e Depois.

## Público e necessidades

As personas e necessidades são as declaradas nas histórias abaixo. Não se inferem diagnóstico, indicação clínica ou capacidades individuais além do texto do backlog.

## Histórias de usuário

### US-006 — Criar uma rotina visual

GitHub Issue: [#6](https://github.com/Nosso-Espectro/aplicativo/issues/6)

Como pessoa que se beneficia de previsibilidade, quero criar uma rotina composta por etapas visuais, para saber o que preciso fazer e em qual ordem.

#### Critérios de aceite

- [ ] Deve ser possível criar uma rotina com nome.
- [ ] Cada etapa deve aceitar título e imagem opcional.
- [ ] O usuário deve poder adicionar, editar e remover etapas.
- [ ] A rotina deve ficar disponível offline após ser salva.

### US-007 — Reordenar etapas da rotina

GitHub Issue: [#7](https://github.com/Nosso-Espectro/aplicativo/issues/7)

Como usuário, quero reorganizar as etapas de uma rotina, para adaptar a sequência quando minha realidade mudar.

#### Critérios de aceite

- [ ] Deve ser possível alterar a ordem das etapas.
- [ ] A nova ordem deve ser persistida.
- [ ] A reordenação não deve apagar o status ou conteúdo das etapas.

### US-008 — Executar rotina com Agora e Depois

GitHub Issue: [#8](https://github.com/Nosso-Espectro/aplicativo/issues/8)

Como usuário, quero visualizar somente a etapa atual e a próxima etapa da rotina, para reduzir carga cognitiva e facilitar transições.

#### Critérios de aceite

- [ ] Durante a execução devem existir indicações claras de Agora e Depois.
- [ ] Ao concluir a etapa atual, a próxima deve assumir o estado de Agora.
- [ ] O usuário deve poder voltar para uma etapa anterior quando necessário.
- [ ] O progresso deve permanecer salvo caso o aplicativo seja fechado.

### Definition of Done original (comum às Issues #6, #7, #8)

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

- **RF-001** — Deve ser possível criar uma rotina com nome. (#6, critério 1.)
- **RF-002** — Cada etapa deve aceitar título e imagem opcional. (#6, critério 2.)
- **RF-003** — O usuário deve poder adicionar, editar e remover etapas. (#6, critério 3.)
- **RF-004** — A rotina deve ficar disponível offline após ser salva. (#6, critério 4.)
- **RF-005** — Deve ser possível alterar a ordem das etapas. (#7, critério 1.)
- **RF-006** — A nova ordem deve ser persistida. (#7, critério 2.)
- **RF-007** — A reordenação não deve apagar o status ou conteúdo das etapas. (#7, critério 3.)
- **RF-008** — Durante a execução devem existir indicações claras de Agora e Depois. (#8, critério 1.)
- **RF-009** — Ao concluir a etapa atual, a próxima deve assumir o estado de Agora. (#8, critério 2.)
- **RF-010** — O usuário deve poder voltar para uma etapa anterior quando necessário. (#8, critério 3.)
- **RF-011** — O progresso deve permanecer salvo caso o aplicativo seja fechado. (#8, critério 4.)

Os termos qualitativos do backlog foram preservados; limites ainda não definidos estão em “Questões em aberto”. RFs são locais a esta spec; use o caminho da spec junto ao ID ao referenciá-los.

## Requisitos não funcionais

- **RNF-001** — A interface deve ser utilizável em dispositivo móvel, com foco, contraste, alvos de toque e textos compreensíveis verificados nos fluxos da história. Fonte: DoD/observações de #6, #7, #8.
- **RNF-002** — Nenhum dado sensível deve ser enviado a serviço externo sem necessidade e consentimento adequado; verificar as saídas de rede dos fluxos implementados. Fonte: DoD/observações de #6, #7, #8.
- **RNF-003** — Os estados de erro e ausência de dados pertinentes devem ser tratados e verificados sem impedir o fluxo restante. Fonte: DoD/observações de #6, #7, #8.
- **RNF-004** — Recursos de apoio não devem ser apresentados como diagnóstico, tratamento ou substituição de acompanhamento profissional; conferir textos e saídas. Fonte: DoD/observações de #6, #7, #8.

Offline e persistência seguem os critérios específicos dos RFs; não se presume sincronização. Desempenho numérico e tempos máximos não foram definidos no backlog.

## Fora de escopo

Implementações de outras milestones, requisitos não rastreados e decisões funcionais listadas como pendentes. Nesta execução apenas documentação e ferramentas de engenharia; nenhuma funcionalidade é implementada.

## Dependências funcionais

Não há dependência entre milestones explicitamente exigida pelas histórias. A fundação técnica é tratada no plano.

## Casos de erro

Rotina vazia, imagem ausente, falha de persistência e etapa removida durante edição; preservar ordem/status (#6–#8).

São cenários derivados dos critérios e da DoD, não novas funcionalidades. As respostas ainda indefinidas devem ser acordadas antes da implementação correspondente.

## Questões em aberto

- Q-ROTINA-01 — Como representar rotina vazia, conclusão da última etapa, reinício e remoção da etapa atual (#6/#8)?
- Q-ROTINA-02 — Qual origem das imagens e limites de conteúdo? A reordenação deve ter alternativa acessível ao gesto; definir interação com produto (#6/#7).

Questões transversais: [auditoria do backlog](../../docs/backlog-audit.md). Uma história só está Ready quando suas ambiguidades bloqueantes forem resolvidas no GitHub e refletidas aqui.

## Rastreabilidade

| Requisito | Issue | História | Task principal |
| --- | --- | --- | --- |
| RF-001 | [#6](https://github.com/Nosso-Espectro/aplicativo/issues/6) | US-006 | T001 |
| RF-002 | [#6](https://github.com/Nosso-Espectro/aplicativo/issues/6) | US-006 | T002 |
| RF-003 | [#6](https://github.com/Nosso-Espectro/aplicativo/issues/6) | US-006 | T003 |
| RF-004 | [#6](https://github.com/Nosso-Espectro/aplicativo/issues/6) | US-006 | T004 |
| RF-005 | [#7](https://github.com/Nosso-Espectro/aplicativo/issues/7) | US-007 | T007 |
| RF-006 | [#7](https://github.com/Nosso-Espectro/aplicativo/issues/7) | US-007 | T008 |
| RF-007 | [#7](https://github.com/Nosso-Espectro/aplicativo/issues/7) | US-007 | T009 |
| RF-008 | [#8](https://github.com/Nosso-Espectro/aplicativo/issues/8) | US-008 | T012 |
| RF-009 | [#8](https://github.com/Nosso-Espectro/aplicativo/issues/8) | US-008 | T013 |
| RF-010 | [#8](https://github.com/Nosso-Espectro/aplicativo/issues/8) | US-008 | T014 |
| RF-011 | [#8](https://github.com/Nosso-Espectro/aplicativo/issues/8) | US-008 | T015 |
| RNF-001 | #6, #7, #8 | Todas acima | Revisão por história em tasks.md |
| RNF-002 | #6, #7, #8 | Todas acima | Revisão por história em tasks.md |
| RNF-003 | #6, #7, #8 | Todas acima | Revisão por história em tasks.md |
| RNF-004 | #6, #7, #8 | Todas acima | Revisão por história em tasks.md |

As tasks de testes cobrem os RFs da respectiva história. Branches previstas, commits, PRs e tags seguem o [workflow](../../docs/development-workflow.md) e o [índice](../README.md); nenhum desses artefatos Git foi criado nesta preparação.
