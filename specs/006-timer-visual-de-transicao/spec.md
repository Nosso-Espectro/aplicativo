---
milestone: 14
priority: P1
tag: m006-timer-visual-de-transicao
status: draft
ready_stories: []
source_checked: 2026-09-23
---

# Timer Visual de Transição

Milestone GitHub: [P1 — Timer Visual de Transição](https://github.com/Nosso-Espectro/aplicativo/milestone/14) (número 14).

Estado consultado: aberta; todas as histórias abaixo estão abertas. Especificação em revisão, não implementação concluída.

## Contexto

Mudanças abruptas entre atividades motivam a necessidade de visualizar o tempo restante e antecipar o fim.

Descrição original da milestone:

> Implementar um temporizador visual para facilitar mudanças entre atividades. Além da contagem numérica, o aplicativo deverá representar visualmente o tempo restante e permitir avisos progressivos, como 10, 5 e 2 minutos antes do término. Poderá ser utilizado para estudos, jogos, banho, preparação para sair de casa e outras transições.

## Objetivo

Permitir controlar um timer visual e seus avisos progressivos.

## Público e necessidades

As personas e necessidades são as declaradas nas histórias abaixo. Não se inferem diagnóstico, indicação clínica ou capacidades individuais além do texto do backlog.

## Histórias de usuário

### US-017 — Criar timer visual de transição

GitHub Issue: [#17](https://github.com/Nosso-Espectro/aplicativo/issues/17)

Como usuário com dificuldade em transições, quero visualizar o tempo restante de uma atividade, para me preparar gradualmente para a mudança.

#### Critérios de aceite

- [ ] Deve ser possível definir a duração do timer.
- [ ] O tempo restante deve ter representação visual além dos números.
- [ ] O timer deve permitir iniciar, pausar, retomar e cancelar.

### US-018 — Configurar avisos progressivos do timer

GitHub Issue: [#18](https://github.com/Nosso-Espectro/aplicativo/issues/18)

Como usuário, quero receber avisos antes do fim de uma atividade, para evitar uma transição abrupta.

#### Critérios de aceite

- [ ] O usuário deve poder ativar avisos em marcos como 10, 5 e 2 minutos.
- [ ] Os avisos devem respeitar configurações de som e vibração do usuário.
- [ ] Deve ser possível desabilitar todos os avisos.

### Definition of Done original (comum às Issues #17, #18)

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

- **RF-001** — Deve ser possível definir a duração do timer. (#17, critério 1.)
- **RF-002** — O tempo restante deve ter representação visual além dos números. (#17, critério 2.)
- **RF-003** — O timer deve permitir iniciar, pausar, retomar e cancelar. (#17, critério 3.)
- **RF-004** — O usuário deve poder ativar avisos em marcos como 10, 5 e 2 minutos. (#18, critério 1.)
- **RF-005** — Os avisos devem respeitar configurações de som e vibração do usuário. (#18, critério 2.)
- **RF-006** — Deve ser possível desabilitar todos os avisos. (#18, critério 3.)

Os termos qualitativos do backlog foram preservados; limites ainda não definidos estão em “Questões em aberto”. RFs são locais a esta spec; use o caminho da spec junto ao ID ao referenciá-los.

## Requisitos não funcionais

- **RNF-001** — A interface deve ser utilizável em dispositivo móvel, com foco, contraste, alvos de toque e textos compreensíveis verificados nos fluxos da história. Fonte: DoD/observações de #17, #18.
- **RNF-002** — Nenhum dado sensível deve ser enviado a serviço externo sem necessidade e consentimento adequado; verificar as saídas de rede dos fluxos implementados. Fonte: DoD/observações de #17, #18.
- **RNF-003** — Os estados de erro e ausência de dados pertinentes devem ser tratados e verificados sem impedir o fluxo restante. Fonte: DoD/observações de #17, #18.
- **RNF-004** — Recursos de apoio não devem ser apresentados como diagnóstico, tratamento ou substituição de acompanhamento profissional; conferir textos e saídas. Fonte: DoD/observações de #17, #18.

Offline e persistência seguem os critérios específicos dos RFs; não se presume sincronização. Desempenho numérico e tempos máximos não foram definidos no backlog.

## Fora de escopo

Implementações de outras milestones, requisitos não rastreados e decisões funcionais listadas como pendentes. Nesta execução apenas documentação e ferramentas de engenharia; nenhuma funcionalidade é implementada.

## Dependências funcionais

Não há dependência entre milestones explicitamente exigida pelas histórias. A fundação técnica é tratada no plano.

## Casos de erro

Duração inválida, marco fora da duração e interrupção de sessão; comportamento de retomada depende de Q-TIMER-01.

São cenários derivados dos critérios e da DoD, não novas funcionalidades. As respostas ainda indefinidas devem ser acordadas antes da implementação correspondente.

## Questões em aberto

- Q-TIMER-01 — Como o timer funciona com app em segundo plano, dispositivo bloqueado ou processo encerrado (#17/#18)?
- Q-TIMER-02 — Quais durações são válidas e como tratar marcos maiores que a duração? Onde são configurados som/vibração (#18)?

Questões transversais: [auditoria do backlog](../../docs/backlog-audit.md). Uma história só está Ready quando suas ambiguidades bloqueantes forem resolvidas no GitHub e refletidas aqui.

## Rastreabilidade

| Requisito | Issue | História | Task principal |
| --- | --- | --- | --- |
| RF-001 | [#17](https://github.com/Nosso-Espectro/aplicativo/issues/17) | US-017 | T001 |
| RF-002 | [#17](https://github.com/Nosso-Espectro/aplicativo/issues/17) | US-017 | T002 |
| RF-003 | [#17](https://github.com/Nosso-Espectro/aplicativo/issues/17) | US-017 | T003 |
| RF-004 | [#18](https://github.com/Nosso-Espectro/aplicativo/issues/18) | US-018 | T006 |
| RF-005 | [#18](https://github.com/Nosso-Espectro/aplicativo/issues/18) | US-018 | T007 |
| RF-006 | [#18](https://github.com/Nosso-Espectro/aplicativo/issues/18) | US-018 | T008 |
| RNF-001 | #17, #18 | Todas acima | Revisão por história em tasks.md |
| RNF-002 | #17, #18 | Todas acima | Revisão por história em tasks.md |
| RNF-003 | #17, #18 | Todas acima | Revisão por história em tasks.md |
| RNF-004 | #17, #18 | Todas acima | Revisão por história em tasks.md |

As tasks de testes cobrem os RFs da respectiva história. Branches previstas, commits, PRs e tags seguem o [workflow](../../docs/development-workflow.md) e o [índice](../README.md); nenhum desses artefatos Git foi criado nesta preparação.
