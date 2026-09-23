---
milestone: 11
priority: P0
tag: m005-regulacao-sensorial
status: draft
ready_stories: []
source_checked: 2026-09-23
---

# Regulação Sensorial

Milestone GitHub: [P0 — Regulação Sensorial](https://github.com/Nosso-Espectro/aplicativo/milestone/11) (número 11).

Estado consultado: aberta; todas as histórias abaixo estão abertas. Especificação em revisão, não implementação concluída.

## Contexto

Navegação extensa e estímulos não essenciais dificultam o acesso às ferramentas nas situações descritas nas Issues.

Descrição original da milestone:

> Criar uma área de acesso rápido para situações de sobrecarga sensorial. Deve oferecer uma interface reduzida, com poucos elementos visuais, acesso a sons reguladores, temporizador e atalhos para comunicação e contato de apoio. A interface deve permitir ativar um modo de baixa estimulação, reduzindo animações, contraste excessivo e informações desnecessárias.

## Objetivo

Oferecer modo de baixa estimulação e painel de acesso rápido.

## Público e necessidades

As personas e necessidades são as declaradas nas histórias abaixo. Não se inferem diagnóstico, indicação clínica ou capacidades individuais além do texto do backlog.

## Histórias de usuário

### US-009 — Ativar modo de baixa estimulação

GitHub Issue: [#9](https://github.com/Nosso-Espectro/aplicativo/issues/9)

Como pessoa em sobrecarga sensorial, quero ativar uma interface visual simplificada, para reduzir estímulos desnecessários enquanto uso o aplicativo.

#### Critérios de aceite

- [ ] O modo deve reduzir animações e elementos não essenciais.
- [ ] A interface deve manter contraste suficiente e legibilidade.
- [ ] O usuário deve conseguir ativar e desativar o modo rapidamente.
- [ ] A preferência deve persistir entre sessões.

### US-010 — Acessar painel rápido de regulação

GitHub Issue: [#10](https://github.com/Nosso-Espectro/aplicativo/issues/10)

Como pessoa em sobrecarga, quero acessar em poucos toques ferramentas de regulação, para não precisar navegar por várias telas.

#### Critérios de aceite

- [ ] O painel deve oferecer atalhos para comunicação, sons, temporizador e contato de apoio.
- [ ] O painel deve ser acessível a partir da tela inicial.
- [ ] Os controles devem possuir alvos de toque amplos e textos objetivos.

### Definition of Done original (comum às Issues #9, #10)

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

- **RF-001** — O modo deve reduzir animações e elementos não essenciais. (#9, critério 1.)
- **RF-002** — A interface deve manter contraste suficiente e legibilidade. (#9, critério 2.)
- **RF-003** — O usuário deve conseguir ativar e desativar o modo rapidamente. (#9, critério 3.)
- **RF-004** — A preferência deve persistir entre sessões. (#9, critério 4.)
- **RF-005** — O painel deve oferecer atalhos para comunicação, sons, temporizador e contato de apoio. (#10, critério 1.)
- **RF-006** — O painel deve ser acessível a partir da tela inicial. (#10, critério 2.)
- **RF-007** — Os controles devem possuir alvos de toque amplos e textos objetivos. (#10, critério 3.)

Os termos qualitativos do backlog foram preservados; limites ainda não definidos estão em “Questões em aberto”. RFs são locais a esta spec; use o caminho da spec junto ao ID ao referenciá-los.

## Requisitos não funcionais

- **RNF-001** — A interface deve ser utilizável em dispositivo móvel, com foco, contraste, alvos de toque e textos compreensíveis verificados nos fluxos da história. Fonte: DoD/observações de #9, #10.
- **RNF-002** — Nenhum dado sensível deve ser enviado a serviço externo sem necessidade e consentimento adequado; verificar as saídas de rede dos fluxos implementados. Fonte: DoD/observações de #9, #10.
- **RNF-003** — Os estados de erro e ausência de dados pertinentes devem ser tratados e verificados sem impedir o fluxo restante. Fonte: DoD/observações de #9, #10.
- **RNF-004** — Recursos de apoio não devem ser apresentados como diagnóstico, tratamento ou substituição de acompanhamento profissional; conferir textos e saídas. Fonte: DoD/observações de #9, #10.

Offline e persistência seguem os critérios específicos dos RFs; não se presume sincronização. Desempenho numérico e tempos máximos não foram definidos no backlog.

## Fora de escopo

Implementações de outras milestones, requisitos não rastreados e decisões funcionais listadas como pendentes. Nesta execução apenas documentação e ferramentas de engenharia; nenhuma funcionalidade é implementada.

## Dependências funcionais

- [P0 — Comunicação Visual / CAA](../001-comunicacao-visual-caa/spec.md): relação de uso/integração descrita nas histórias ou nas questões abaixo; não altera a prioridade original.
- [P0 — Plano de Apoio / Crise](../004-plano-de-apoio-crise/spec.md): relação de uso/integração descrita nas histórias ou nas questões abaixo; não altera a prioridade original.
- [P1 — Timer Visual de Transição](../006-timer-visual-de-transicao/spec.md): relação de uso/integração descrita nas histórias ou nas questões abaixo; não altera a prioridade original.
- [P1 — Sons para Regulação](../011-sons-para-regulacao/spec.md): relação de uso/integração descrita nas histórias ou nas questões abaixo; não altera a prioridade original.

## Casos de erro

Destinos de atalhos indisponíveis e preferência não salva (#9/#10); comportamento dos destinos P1 bloqueado por Q-REG-01.

São cenários derivados dos critérios e da DoD, não novas funcionalidades. As respostas ainda indefinidas devem ser acordadas antes da implementação correspondente.

## Questões em aberto

- Q-REG-01 — #10 (P0) exige atalhos para sons (#27, P1) e timer (#17, P1). Produto precisa definir entrega desses destinos no MVP ou revisar o backlog; não ocultar, simular ou antecipar recursos silenciosamente.
- Q-REG-02 — Definir limite mensurável de “poucos toques”, elementos removíveis e alcance do modo de baixa estimulação (#9/#10).
- Q-REG-03 — Painel #10 e acesso direto do cartão #12 têm dependência de integração recíproca. Nenhuma milestone pode ser declarada concluída sem validar ambos os fluxos.

Questões transversais: [auditoria do backlog](../../docs/backlog-audit.md). Uma história só está Ready quando suas ambiguidades bloqueantes forem resolvidas no GitHub e refletidas aqui.

## Rastreabilidade

| Requisito | Issue | História | Task principal |
| --- | --- | --- | --- |
| RF-001 | [#9](https://github.com/Nosso-Espectro/aplicativo/issues/9) | US-009 | T001 |
| RF-002 | [#9](https://github.com/Nosso-Espectro/aplicativo/issues/9) | US-009 | T002 |
| RF-003 | [#9](https://github.com/Nosso-Espectro/aplicativo/issues/9) | US-009 | T003 |
| RF-004 | [#9](https://github.com/Nosso-Espectro/aplicativo/issues/9) | US-009 | T004 |
| RF-005 | [#10](https://github.com/Nosso-Espectro/aplicativo/issues/10) | US-010 | T007 |
| RF-006 | [#10](https://github.com/Nosso-Espectro/aplicativo/issues/10) | US-010 | T008 |
| RF-007 | [#10](https://github.com/Nosso-Espectro/aplicativo/issues/10) | US-010 | T009 |
| RNF-001 | #9, #10 | Todas acima | Revisão por história em tasks.md |
| RNF-002 | #9, #10 | Todas acima | Revisão por história em tasks.md |
| RNF-003 | #9, #10 | Todas acima | Revisão por história em tasks.md |
| RNF-004 | #9, #10 | Todas acima | Revisão por história em tasks.md |

As tasks de testes cobrem os RFs da respectiva história. Branches previstas, commits, PRs e tags seguem o [workflow](../../docs/development-workflow.md) e o [índice](../README.md); nenhum desses artefatos Git foi criado nesta preparação.
