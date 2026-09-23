---
milestone: 20
priority: P2
tag: m012-lembrete-de-agua
status: draft
ready_stories: []
source_checked: 2026-09-23
---

# Lembrete de Água

Milestone GitHub: [P2 — Lembrete de Água](https://github.com/Nosso-Espectro/aplicativo/milestone/20) (número 20).

Estado consultado: aberta; todas as histórias abaixo estão abertas. Especificação em revisão, não implementação concluída.

## Contexto

O usuário quer receber lembretes de água nos horários que escolhe, com períodos sem interrupção.

Descrição original da milestone:

> Permitir que o usuário configure lembretes locais para hidratação. O intervalo entre notificações poderá ser personalizado e os lembretes deverão funcionar sem necessidade de conta ou conexão com servidor.

## Objetivo

Configurar notificações locais e horários silenciosos, sem conta.

## Público e necessidades

As personas e necessidades são as declaradas nas histórias abaixo. Não se inferem diagnóstico, indicação clínica ou capacidades individuais além do texto do backlog.

## Histórias de usuário

### US-029 — Configurar lembretes de hidratação

GitHub Issue: [#29](https://github.com/Nosso-Espectro/aplicativo/issues/29)

Como usuário que pode esquecer necessidades básicas durante períodos de foco, quero configurar lembretes de água, para receber avisos em intervalos definidos por mim.

#### Critérios de aceite

- [ ] O usuário deve poder definir intervalo ou horários.
- [ ] As notificações devem ser locais.
- [ ] Deve ser possível ativar, pausar e desativar lembretes.
- [ ] O recurso não deve exigir criação de conta.

### US-030 — Configurar horário silencioso para hidratação

GitHub Issue: [#30](https://github.com/Nosso-Espectro/aplicativo/issues/30)

Como usuário, quero definir períodos em que não desejo receber lembretes, para evitar interrupções durante sono, trabalho ou situações sensíveis.

#### Critérios de aceite

- [ ] Deve ser possível definir início e fim do período silencioso.
- [ ] Nenhuma notificação de hidratação deve ser emitida nesse intervalo.
- [ ] A configuração deve persistir localmente.

### Definition of Done original (comum às Issues #29, #30)

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

- **RF-001** — O usuário deve poder definir intervalo ou horários. (#29, critério 1.)
- **RF-002** — As notificações devem ser locais. (#29, critério 2.)
- **RF-003** — Deve ser possível ativar, pausar e desativar lembretes. (#29, critério 3.)
- **RF-004** — O recurso não deve exigir criação de conta. (#29, critério 4.)
- **RF-005** — Deve ser possível definir início e fim do período silencioso. (#30, critério 1.)
- **RF-006** — Nenhuma notificação de hidratação deve ser emitida nesse intervalo. (#30, critério 2.)
- **RF-007** — A configuração deve persistir localmente. (#30, critério 3.)

Os termos qualitativos do backlog foram preservados; limites ainda não definidos estão em “Questões em aberto”. RFs são locais a esta spec; use o caminho da spec junto ao ID ao referenciá-los.

## Requisitos não funcionais

- **RNF-001** — A interface deve ser utilizável em dispositivo móvel, com foco, contraste, alvos de toque e textos compreensíveis verificados nos fluxos da história. Fonte: DoD/observações de #29, #30.
- **RNF-002** — Nenhum dado sensível deve ser enviado a serviço externo sem necessidade e consentimento adequado; verificar as saídas de rede dos fluxos implementados. Fonte: DoD/observações de #29, #30.
- **RNF-003** — Os estados de erro e ausência de dados pertinentes devem ser tratados e verificados sem impedir o fluxo restante. Fonte: DoD/observações de #29, #30.
- **RNF-004** — Recursos de apoio não devem ser apresentados como diagnóstico, tratamento ou substituição de acompanhamento profissional; conferir textos e saídas. Fonte: DoD/observações de #29, #30.

Offline e persistência seguem os critérios específicos dos RFs; não se presume sincronização. Desempenho numérico e tempos máximos não foram definidos no backlog.

## Fora de escopo

Implementações de outras milestones, requisitos não rastreados e decisões funcionais listadas como pendentes. Nesta execução apenas documentação e ferramentas de engenharia; nenhuma funcionalidade é implementada.

## Dependências funcionais

Não há dependência entre milestones explicitamente exigida pelas histórias. A fundação técnica é tratada no plano.

## Casos de erro

Permissão de notificação negada, horários inválidos e reagendamento interrompido (#29/#30); esclarecer política em Q-AGUA-01.

São cenários derivados dos critérios e da DoD, não novas funcionalidades. As respostas ainda indefinidas devem ser acordadas antes da implementação correspondente.

## Questões em aberto

- Q-AGUA-01 — Como tratar intervalo versus horários, fuso, horário silencioso atravessando meia-noite e reinício do dispositivo (#29/#30)?
- Q-AGUA-02 — Definir experiência para permissão negada e limites de agendamento do sistema operacional, sem prometer entrega exata (#29).

Questões transversais: [auditoria do backlog](../../docs/backlog-audit.md). Uma história só está Ready quando suas ambiguidades bloqueantes forem resolvidas no GitHub e refletidas aqui.

## Rastreabilidade

| Requisito | Issue | História | Task principal |
| --- | --- | --- | --- |
| RF-001 | [#29](https://github.com/Nosso-Espectro/aplicativo/issues/29) | US-029 | T001 |
| RF-002 | [#29](https://github.com/Nosso-Espectro/aplicativo/issues/29) | US-029 | T002 |
| RF-003 | [#29](https://github.com/Nosso-Espectro/aplicativo/issues/29) | US-029 | T003 |
| RF-004 | [#29](https://github.com/Nosso-Espectro/aplicativo/issues/29) | US-029 | T004 |
| RF-005 | [#30](https://github.com/Nosso-Espectro/aplicativo/issues/30) | US-030 | T007 |
| RF-006 | [#30](https://github.com/Nosso-Espectro/aplicativo/issues/30) | US-030 | T008 |
| RF-007 | [#30](https://github.com/Nosso-Espectro/aplicativo/issues/30) | US-030 | T009 |
| RNF-001 | #29, #30 | Todas acima | Revisão por história em tasks.md |
| RNF-002 | #29, #30 | Todas acima | Revisão por história em tasks.md |
| RNF-003 | #29, #30 | Todas acima | Revisão por história em tasks.md |
| RNF-004 | #29, #30 | Todas acima | Revisão por história em tasks.md |

As tasks de testes cobrem os RFs da respectiva história. Branches previstas, commits, PRs e tags seguem o [workflow](../../docs/development-workflow.md) e o [índice](../README.md); nenhum desses artefatos Git foi criado nesta preparação.
