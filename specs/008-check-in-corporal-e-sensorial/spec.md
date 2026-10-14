---
milestone: 16
priority: P1
tag: m008-check-in-corporal-e-sensorial
status: draft
ready_stories: ["US-021", "US-022"]
source_checked: 2026-10-14
---

# Check-in Corporal e Sensorial

Milestone GitHub: [P1 — Check-in Corporal e Sensorial](https://github.com/Nosso-Espectro/aplicativo/milestone/16) (número 16).

Estado consultado em2026-10-14: #21 integrada pelo PR78/fechada; #22 aprovada e Ready, ainda sem implementação. Gates nativos pendentes; nenhuma release pronta.

## Contexto

As histórias pedem perguntas objetivas sobre corpo e ambiente para apoiar a percepção de necessidades.

Descrição original da milestone:

> Implementar um check-in simples para ajudar o usuário a identificar necessidades físicas e sensoriais. Em vez de depender apenas da identificação de emoções, o aplicativo poderá perguntar sobre fome, sede, dor, cansaço, ruído, iluminação, temperatura, necessidade de isolamento e outros fatores. O objetivo é favorecer autopercepção e identificação de possíveis fontes de desconforto.

## Objetivo

Oferecer check-in opcional por pergunta e resumo das respostas, sem conclusão clínica.

## Público e necessidades

As personas e necessidades são as declaradas nas histórias abaixo. Não se inferem diagnóstico, indicação clínica ou capacidades individuais além do texto do backlog.

## Histórias de usuário

### US-021 — Realizar check-in corporal e sensorial guiado

GitHub Issue: [#21](https://github.com/Nosso-Espectro/aplicativo/issues/21)

Como pessoa que pode ter dificuldade em identificar a origem do desconforto, quero responder perguntas objetivas sobre meu corpo e ambiente, para perceber possíveis necessidades.

#### Critérios de aceite

- [ ] O check-in deve abordar itens como sede, fome, dor, cansaço, ruído, luz, temperatura e necessidade de ficar sozinho.
- [ ] As respostas devem utilizar controles simples e objetivos.
- [ ] O usuário deve poder pular perguntas.
- [ ] O aplicativo não deve apresentar o resultado como diagnóstico.

### US-022 — Exibir resumo do check-in

GitHub Issue: [#22](https://github.com/Nosso-Espectro/aplicativo/issues/22)

Como usuário, quero visualizar um resumo das respostas do check-in, para decidir quais ações de autocuidado ou regulação fazem sentido para mim.

#### Critérios de aceite

- [ ] O resumo deve mostrar apenas as respostas fornecidas.
- [ ] Sugestões devem ser apresentadas como possibilidades, não como prescrição clínica.
- [ ] O usuário deve poder acessar diretamente ferramentas relacionadas, como água, regulação ou contato de apoio.

### Definition of Done original (comum às Issues #21, #22)

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

- **RF-001** — O check-in deve abordar itens como sede, fome, dor, cansaço, ruído, luz, temperatura e necessidade de ficar sozinho. (#21, critério 1.)
- **RF-002** — As respostas devem utilizar controles simples e objetivos. (#21, critério 2.)
- **RF-003** — O usuário deve poder pular perguntas. (#21, critério 3.)
- **RF-004** — O aplicativo não deve apresentar o resultado como diagnóstico. (#21, critério 4.)
- **RF-005** — O resumo deve mostrar apenas as respostas fornecidas. (#22, critério 1.)
- **RF-006** — Sugestões devem ser apresentadas como possibilidades, não como prescrição clínica. (#22, critério 2.)
- **RF-007** — O usuário deve poder acessar diretamente ferramentas relacionadas, como água, regulação ou contato de apoio. (#22, critério 3.)

Os termos qualitativos do backlog foram preservados; limites ainda não definidos estão em “Questões em aberto”. RFs são locais a esta spec; use o caminho da spec junto ao ID ao referenciá-los.

## Requisitos não funcionais

- **RNF-001** — A interface deve ser utilizável em dispositivo móvel, com foco, contraste, alvos de toque e textos compreensíveis verificados nos fluxos da história. Fonte: DoD/observações de #21, #22.
- **RNF-002** — Nenhum dado sensível deve ser enviado a serviço externo sem necessidade e consentimento adequado; verificar as saídas de rede dos fluxos implementados. Fonte: DoD/observações de #21, #22.
- **RNF-003** — Os estados de erro e ausência de dados pertinentes devem ser tratados e verificados sem impedir o fluxo restante. Fonte: DoD/observações de #21, #22.
- **RNF-004** — Recursos de apoio não devem ser apresentados como diagnóstico, tratamento ou substituição de acompanhamento profissional; conferir textos e saídas. Fonte: DoD/observações de #21, #22.

Offline e persistência seguem os critérios específicos dos RFs; não se presume sincronização. Desempenho numérico e tempos máximos não foram definidos no backlog.

## Fora de escopo

Histórico, banco de respostas, IA, backend, sincronização, novas permissões, voz/envio/ações automáticas, lembretes P2 e interpretação clínica. #21 entregou perguntas; #22 estende o mesmo fluxo com resumo/atalhos aprovados abaixo.

## Refinamento aprovado de US-021 (2026-10-14)

Aprovação humana: [registro em #21](https://github.com/Nosso-Espectro/aplicativo/issues/21#issuecomment-6163890493). Critérios originais preservados.

- Oito perguntas locais: sede, fome, dor, cansaço, incômodo com ruído, incômodo com luz, temperatura e vontade de ficar sozinho.
- Sete perguntas usam Sim/Não/Não sei; temperatura usa Frio/Confortável/Calor/Não sei. Nenhuma opção inicialmente selecionada.
- Uma pergunta por tela, seleção reversível, continuar explicitamente ou pular. Voltar preserva a resposta na sessão; pular remove eventual resposta anterior, sem inferir resposta.
- Respostas somente em memória durante o check-in. #21 isolada descartava ao finalizar; #22 agora estende explicitamente a sessão até sair do resumo. Sair/desmontar continua descartando; nova entrada começa vazia. Sem diagnóstico ou prescrição.
- Entrada pelo quadro, rota própria, retorno ao quadro mesmo por entrada direta. Alvos de pelo menos 48dp, texto escalável, sem áudio/animação inesperada; modo de baixa estimulação preservado.
- Uso útil sem rede, sem DB/API/permissões novas e sem respostas em parâmetros de navegação, logs ou telemetria.

## Refinamento aprovado de US-022 (2026-10-14)

Aprovação e delegação de próximas decisões funcionais: [registro em #22](https://github.com/Nosso-Espectro/aplicativo/issues/22#issuecomment-6164360679). Critérios originais preservados.

- Finalizar perguntas mostra resumo literal dos itens respondidos na ordem das perguntas. Sim/Não/Não sei e a escala de temperatura são apresentados sem inferência, diagnóstico ou classificação. Perguntas puladas ausentes, resumo vazio com mensagem neutra.
- Respostas somente em memória até sair do resumo. Voltar ao quadro, abrir ferramenta, back/blur/unmount descarta. Nova entrada vazia. Nenhum histórico, DB ou respostas em params/logs/rede.
- Possibilidades opcionais neutras: “Você pode abrir o painel de regulação” e “Você pode revisar seu contato de confiança”. Disponíveis independentemente das respostas, sem prescrição, execução ou estímulo automático.
- Atalhos explícitos às rotas existentes de regulação/contato; Água abre apenas cartão CAA local existente para exibição, sem adicionar à frase/voz/envio/lembrete automático. Ausência do cartão oferece fallback neutro e retorno ao quadro.
- SafeArea/ScrollView/texto escalável/alvos48dp/mode9, sem novas dependências ou permissões. Testes nativos/assistivos continuam gate separado.

## Dependências funcionais

- [P0 — Regulação Sensorial](../005-regulacao-sensorial/spec.md): relação de uso/integração descrita nas histórias ou nas questões abaixo; não altera a prioridade original.
- [P0 — Plano de Apoio / Crise](../004-plano-de-apoio-crise/spec.md): relação de uso/integração descrita nas histórias ou nas questões abaixo; não altera a prioridade original.
- [P0 — Comunicação Visual / CAA](../001-comunicacao-visual-caa/spec.md): relação de uso/integração descrita nas histórias ou nas questões abaixo; não altera a prioridade original.
- [P2 — Lembrete de Água](../012-lembrete-de-agua/spec.md): relação de uso/integração descrita nas histórias ou nas questões abaixo; não altera a prioridade original.

## Casos de erro

Perguntas puladas e resumo sem respostas (#21/#22); não preencher respostas por inferência.

São cenários derivados dos critérios e da DoD, não novas funcionalidades. As respostas ainda indefinidas devem ser acordadas antes da implementação correspondente.

## Questões em aberto

- Q-CHECK-01 — Resolvida: escalas de #21 e possibilidades neutras de #22 aprovadas acima. Não inferir diagnóstico.
- Q-CHECK-02 — Resolvida: Água é exibição do cartão CAA local, não lembretes P2.
- Q-CHECK-03 — Resolvida para #21/#22: memória somente até sair do check-in/resumo; histórico P3 não autorizado.

Questões transversais: [auditoria do backlog](../../docs/backlog-audit.md). Uma história só está Ready quando suas ambiguidades bloqueantes forem resolvidas no GitHub e refletidas aqui.

## Rastreabilidade

| Requisito | Issue | História | Task principal |
| --- | --- | --- | --- |
| RF-001 | [#21](https://github.com/Nosso-Espectro/aplicativo/issues/21) | US-021 | T001 |
| RF-002 | [#21](https://github.com/Nosso-Espectro/aplicativo/issues/21) | US-021 | T002 |
| RF-003 | [#21](https://github.com/Nosso-Espectro/aplicativo/issues/21) | US-021 | T003 |
| RF-004 | [#21](https://github.com/Nosso-Espectro/aplicativo/issues/21) | US-021 | T004 |
| RF-005 | [#22](https://github.com/Nosso-Espectro/aplicativo/issues/22) | US-022 | T007 |
| RF-006 | [#22](https://github.com/Nosso-Espectro/aplicativo/issues/22) | US-022 | T008 |
| RF-007 | [#22](https://github.com/Nosso-Espectro/aplicativo/issues/22) | US-022 | T009 |
| RNF-001 | #21, #22 | Todas acima | Revisão por história em tasks.md |
| RNF-002 | #21, #22 | Todas acima | Revisão por história em tasks.md |
| RNF-003 | #21, #22 | Todas acima | Revisão por história em tasks.md |
| RNF-004 | #21, #22 | Todas acima | Revisão por história em tasks.md |

As tasks de testes cobrem os RFs da respectiva história. Branches previstas, commits, PRs e tags seguem o [workflow](../../docs/development-workflow.md) e o [índice](../README.md); nenhum desses artefatos Git foi criado nesta preparação.
