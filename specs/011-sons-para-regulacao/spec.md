---
milestone: 19
priority: P1
tag: m011-sons-para-regulacao
status: draft
ready_stories: ["US-027", "US-028"]
source_checked: 2026-10-14
---

# Sons para Regulação

Milestone GitHub: [P1 — Sons para Regulação](https://github.com/Nosso-Espectro/aplicativo/milestone/19) (número 19).

US-027 entregue pelo PR71. US-028 implementada e validada localmente, aguardando PR/CI/integração. Gates nativos pendentes, nenhuma milestone/release pronta.

## Refinamento US-028

Recomendação registrada na [Issue28](https://github.com/Nosso-Espectro/aplicativo/issues/28#issuecomment-6168837850) sob delegação funcional humana; critérios originais preservados.

- Duração inteira de 1 a 180 minutos, draft inicial15, presets5/15/30/60 e controle numérico acessível. Draft não inicia áudio nem arma prazo; Aplicar temporizador é explícito e requer som selecionado/player carregado confirmado, sem operação pendente.
- Prazo corrido desde aplicar, sem soma de ticks; pausa manual/interrupção/TTS não estende prazo nem retoma áudio. Expiração invalida intent/pedidos antigos e pausa apenas o player vinculado; sucesso somente após status nativo confirmar parada. Falha genérica e retry humano, sem alerta sonoro/vibração/notificação.
- Cancelar remove somente prazo/callbacks, sem pause/play/configure/ganho. Troca de som, erro que destrói player e dispose invalidam prazo anterior. Revisão/identidade impedem callback antigo de parar som novo; reaplicar explícito e sem duplicatas.
- Timer somente com segundo plano desativado nesta versão. Preferência ligada exige desligamento voluntário antes de aplicar, sem mudança silenciosa. Prazo ativo impede habilitar background até cancelamento. Ao sair do foreground, pausa pelo controle existente; prazo segue corrido e reconcilia ao retorno sem auto-retomar. Não prometer parada exata com JS suspenso/processo morto: áudio temporizado não continua em background. Reprodução contínua em background de #27 permanece sem timer.
- Relógio inválido/regressivo/overflow invalida timer e solicita pausa segura, preservando escolha/draft/erro recuperável. Memória efêmera; sem DB/histórico/rede/logs/deps/permissões ou ajustes globais novos. Timer visual/Pomodoro/CAA e prioridade de voz preservados.
- Gate real posterior inclui parada/pausa/escuta/background/lock/processo morto/offline e recursos assistivos Android/iOS. Mocks/build não comprovam gate; nenhum aparelho autorizado por refinamento.

## Contexto

As histórias pedem controle sobre sons contínuos usados para concentração ou regulação.

Descrição original da milestone:

> Disponibilizar reprodução contínua de sons que possam auxiliar concentração ou regulação sensorial, como ruído branco, ruído marrom, chuva e oceano. Deve ser possível reproduzir os sons em segundo plano e combiná-los com temporizadores. Sempre que possível, a reprodução deverá funcionar offline.

## Objetivo

Permitir selecionar sons, controlar reprodução e volume e definir quando parar.

## Público e necessidades

As personas e necessidades são as declaradas nas histórias abaixo. Não se inferem diagnóstico, indicação clínica ou capacidades individuais além do texto do backlog.

## Histórias de usuário

### US-027 — Reproduzir sons de regulação

GitHub Issue: [#27](https://github.com/Nosso-Espectro/aplicativo/issues/27)

Como usuário, quero reproduzir sons contínuos como ruído branco, ruído marrom, chuva e oceano, para apoiar concentração ou regulação sensorial.

#### Critérios de aceite

- [ ] Deve haver ao menos quatro opções iniciais de som.
- [ ] O usuário deve poder iniciar, pausar e ajustar volume.
- [ ] Os sons essenciais devem funcionar offline.

### US-028 — Definir temporizador para sons

GitHub Issue: [#28](https://github.com/Nosso-Espectro/aplicativo/issues/28)

Como usuário, quero definir por quanto tempo um som será reproduzido, para não precisar interrompê-lo manualmente.

#### Critérios de aceite

- [ ] Deve ser possível definir uma duração.
- [ ] Ao final, a reprodução deve ser encerrada de forma previsível.
- [ ] O usuário deve poder cancelar o temporizador sem interromper imediatamente o áudio, se desejar.

### Definition of Done original (comum às Issues #27, #28)

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

- **RF-001** — Deve haver ao menos quatro opções iniciais de som. (#27, critério 1.)
- **RF-002** — O usuário deve poder iniciar, pausar e ajustar volume. (#27, critério 2.)
- **RF-003** — Os sons essenciais devem funcionar offline. (#27, critério 3.)
- **RF-004** — Deve ser possível definir uma duração. (#28, critério 1.)
- **RF-005** — Ao final, a reprodução deve ser encerrada de forma previsível. (#28, critério 2.)
- **RF-006** — O usuário deve poder cancelar o temporizador sem interromper imediatamente o áudio, se desejar. (#28, critério 3.)

Os termos qualitativos do backlog foram preservados; limites ainda não definidos estão em “Questões em aberto”. RFs são locais a esta spec; use o caminho da spec junto ao ID ao referenciá-los.

## Requisitos não funcionais

- **RNF-001** — A interface deve ser utilizável em dispositivo móvel, com foco, contraste, alvos de toque e textos compreensíveis verificados nos fluxos da história. Fonte: DoD/observações de #27, #28.
- **RNF-002** — Nenhum dado sensível deve ser enviado a serviço externo sem necessidade e consentimento adequado; verificar as saídas de rede dos fluxos implementados. Fonte: DoD/observações de #27, #28.
- **RNF-003** — Os estados de erro e ausência de dados pertinentes devem ser tratados e verificados sem impedir o fluxo restante. Fonte: DoD/observações de #27, #28.
- **RNF-004** — Recursos de apoio não devem ser apresentados como diagnóstico, tratamento ou substituição de acompanhamento profissional; conferir textos e saídas. Fonte: DoD/observações de #27, #28.

Offline e persistência seguem os critérios específicos dos RFs; não se presume sincronização. Desempenho numérico e tempos máximos não foram definidos no backlog.

## Fora de escopo

US-027 não implementa temporizador de sons #28, painel #10/cartão #12 ou navegação inferior. Sem gravação/microfone, histórico, streaming, backend, IA, diagnóstico, sincronização ou autoplay após processo encerrado. Não alterar ajustes globais de volume/DND/segurança do aparelho.

## Dependências funcionais

US-027 entrega o destino real de sons necessário ao painel #10. Contato #13,
modo #9 e timer visual #17 já estão integrados; não simulam nem entregam o painel.
Prioridade da voz CAA #3 exige coordenação restrita com o TTS local existente,
sem copiar frases/perfil/contato para metadados de mídia. Sequência dos destinos
registrada na [origem](https://github.com/Nosso-Espectro/aplicativo/issues/10#issuecomment-6155218484), sem alterar prioridades.

## Casos de erro

Arquivo indisponível, falha de reprodução e interrupção do áudio; cancelamento do timer separado do player (#27/#28).

São cenários derivados dos critérios e da DoD, não novas funcionalidades. As respostas ainda indefinidas devem ser acordadas antes da implementação correspondente.

## Questões em aberto

- Q-SOM-03 — Resolvida para #28 pelo refinamento acima: duração/prazo corrido, cancelamento independente, identidade/revisão e limite foreground sem scheduler novo. Término durante suspensão não é prometido; extensão com parada nativa em background requer backlog/refinamento próprio antes de ampliar o escopo.

- Q-SOM-01 — Resolvida para #27: atribuir reprodução contínua em segundo plano Android/iOS a esta história, após início explícito. Opção inicialmente desativada; ativação exige confirmação de que pode continuar com tela bloqueada e no modo silencioso. Cancelar confirmação mantém desligado. Sem opção, respeitar silêncio/pausar ao background sem retomar automaticamente ao foreground. Dentro dela, capacidade nativa/controles de mídia e política de foco/interrupção do sistema, sem impor continuidade ou prometer sobreviver a force-stop/reboot. Metadados genéricos fixos Som contínuo/TEAr, sem dados pessoais/artwork remoto; pausa explícita não se desfaz automaticamente.
- Q-SOM-02 — Resolvida para #27: quatro sinais WAV locais distintos, originais/procedurais via DSP versionado do FFmpeg, Ruído branco/Ruído marrom/Chuva sintetizada/Oceano sintetizado. Registrar parâmetros/origem/checksums e Apache2.0 do projeto; não alegar gravação real ou usar voz/amostras de terceiros. Um som por vez, loop nativo, seleção vazia e volume local25% inicialmente; slider0–100 permite zero sem retomar. Selecionar/trocar pausa anterior e não toca novo. Não restaurar sessão para autoplay. TTS tem prioridade: pausar ambiente antes de falar, não retomar ao fim e impedir início enquanto leitura própria ativa, liberando coordenação em conclusão/cancelamento/erro/unmount. Término/timer #28 ainda precisa de refinamento próprio.

Refinamento original e complemento de controle sob delegação explícita do usuário:
[origem](https://github.com/Nosso-Espectro/aplicativo/issues/27#issuecomment-6156132540)
e [opção de segundo plano](https://github.com/Nosso-Espectro/aplicativo/issues/27#issuecomment-6156348889).
Preservar os três critérios originais. Estado de reprodução vem do engine, não de
uma chamada de método; pedidos antigos/cancelados não iniciam áudio tardiamente.
Falhas/arquivo ausente têm feedback genérico/retry explícito/sem duplicatas,
escolhas preservadas e comunicação utilizável. Inicializar capacidade de áudio
somente sob ação da pessoa, conter falhas no módulo. Volume inicial não é garantia
de segurança auditiva nem indicação clínica. Alvos48dp/texto escalável/estado não
só por cor, modo #9 preservado. Nenhuma task concluída pelo refinamento.

Questões transversais: [auditoria do backlog](../../docs/backlog-audit.md). Uma história só está Ready quando suas ambiguidades bloqueantes forem resolvidas no GitHub e refletidas aqui.

## Rastreabilidade

| Requisito | Issue | História | Task principal |
| --- | --- | --- | --- |
| RF-001 | [#27](https://github.com/Nosso-Espectro/aplicativo/issues/27) | US-027 | T001 |
| RF-002 | [#27](https://github.com/Nosso-Espectro/aplicativo/issues/27) | US-027 | T002 |
| RF-003 | [#27](https://github.com/Nosso-Espectro/aplicativo/issues/27) | US-027 | T003 |
| RF-004 | [#28](https://github.com/Nosso-Espectro/aplicativo/issues/28) | US-028 | T006 |
| RF-005 | [#28](https://github.com/Nosso-Espectro/aplicativo/issues/28) | US-028 | T007 |
| RF-006 | [#28](https://github.com/Nosso-Espectro/aplicativo/issues/28) | US-028 | T008 |
| RNF-001 | #27, #28 | Todas acima | Revisão por história em tasks.md |
| RNF-002 | #27, #28 | Todas acima | Revisão por história em tasks.md |
| RNF-003 | #27, #28 | Todas acima | Revisão por história em tasks.md |
| RNF-004 | #27, #28 | Todas acima | Revisão por história em tasks.md |

As tasks de testes cobrem os RFs da respectiva história. Branches previstas, commits, PRs e tags seguem o [workflow](../../docs/development-workflow.md) e o [índice](../README.md); nenhum desses artefatos Git foi criado nesta preparação.
