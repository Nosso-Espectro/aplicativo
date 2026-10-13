---
milestone: 12
priority: P0
tag: m004-plano-de-apoio-crise
status: draft
ready_stories: ["US-011", "US-013"]
source_checked: 2026-10-13
---

# Plano de Apoio / Crise

Milestone GitHub: [P0 — Plano de Apoio / Crise](https://github.com/Nosso-Espectro/aplicativo/milestone/12) (número 12).

Milestone aberta. US-011 integrada pelo PR #67; #13 refinada e Ready. #12 depende do painel #10 ainda não implementado, sem simular/fechar esse critério. Builds e validações nativas/assistivas permanecem no gate; milestone não concluída.

## Contexto

Em situações descritas como crise, shutdown ou sobrecarga, pode ser difícil explicar como receber apoio.

Descrição original da milestone:

> Permitir que o usuário configure previamente como outras pessoas devem ajudá-lo durante uma crise, shutdown ou situação de sobrecarga. O plano poderá conter instruções como não toque em mim, fale devagar, preciso de silêncio ou dê-me tempo para responder. Também deverá disponibilizar acesso rápido a um contato de confiança e opção para compartilhar essas informações.

## Objetivo

Disponibilizar orientações previamente escolhidas, um cartão legível e acionamento controlado de um contato.

## Público e necessidades

As personas e necessidades são as declaradas nas histórias abaixo. Não se inferem diagnóstico, indicação clínica ou capacidades individuais além do texto do backlog.

## Histórias de usuário

### US-011 — Cadastrar plano pessoal de apoio

GitHub Issue: [#11](https://github.com/Nosso-Espectro/aplicativo/issues/11)

Como pessoa autista, quero registrar previamente como prefiro ser ajudada em momentos de crise, shutdown ou sobrecarga, para que outras pessoas saibam como agir.

#### Critérios de aceite

- [ ] O usuário deve poder cadastrar orientações livres e selecionar orientações sugeridas.
- [ ] Devem existir exemplos como não me toque, fale pouco, preciso de silêncio e dê-me tempo para responder.
- [ ] O plano deve poder ser editado a qualquer momento.
- [ ] O conteúdo deve ficar salvo localmente por padrão.

### US-012 — Exibir cartão de apoio em tela cheia

GitHub Issue: [#12](https://github.com/Nosso-Espectro/aplicativo/issues/12)

Como usuário em dificuldade de comunicação, quero mostrar meu plano de apoio em uma tela simples e legível, para que outra pessoa consiga entendê-lo rapidamente.

#### Critérios de aceite

- [ ] Deve existir uma visualização em tela cheia.
- [ ] A visualização deve priorizar texto grande e alto contraste.
- [ ] Deve haver acesso direto a partir do painel de regulação.

### US-013 — Acionar contato de confiança pelo WhatsApp

GitHub Issue: [#13](https://github.com/Nosso-Espectro/aplicativo/issues/13)

Como usuário que precisa de suporte, quero abrir uma mensagem pré-definida para um contato de confiança, para pedir ajuda rapidamente.

#### Critérios de aceite

- [ ] O usuário deve poder cadastrar um contato e uma mensagem padrão.
- [ ] Ao acionar o recurso, o aplicativo deve abrir o WhatsApp ou mecanismo compatível com a mensagem preenchida.
- [ ] O envio final deve permanecer sob controle do usuário.
- [ ] Se o WhatsApp não estiver disponível, o aplicativo deve informar isso sem falhar.

### Definition of Done original (comum às Issues #11, #12, #13)

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

- **RF-001** — O usuário deve poder cadastrar orientações livres e selecionar orientações sugeridas. (#11, critério 1.)
- **RF-002** — Devem existir exemplos como não me toque, fale pouco, preciso de silêncio e dê-me tempo para responder. (#11, critério 2.)
- **RF-003** — O plano deve poder ser editado a qualquer momento. (#11, critério 3.)
- **RF-004** — O conteúdo deve ficar salvo localmente por padrão. (#11, critério 4.)
- **RF-005** — Deve existir uma visualização em tela cheia. (#12, critério 1.)
- **RF-006** — A visualização deve priorizar texto grande e alto contraste. (#12, critério 2.)
- **RF-007** — Deve haver acesso direto a partir do painel de regulação. (#12, critério 3.)
- **RF-008** — O usuário deve poder cadastrar um contato e uma mensagem padrão. (#13, critério 1.)
- **RF-009** — Ao acionar o recurso, o aplicativo deve abrir o WhatsApp ou mecanismo compatível com a mensagem preenchida. (#13, critério 2.)
- **RF-010** — O envio final deve permanecer sob controle do usuário. (#13, critério 3.)
- **RF-011** — Se o WhatsApp não estiver disponível, o aplicativo deve informar isso sem falhar. (#13, critério 4.)

Os termos qualitativos do backlog foram preservados; limites ainda não definidos estão em “Questões em aberto”. RFs são locais a esta spec; use o caminho da spec junto ao ID ao referenciá-los.

## Requisitos não funcionais

- **RNF-001** — A interface deve ser utilizável em dispositivo móvel, com foco, contraste, alvos de toque e textos compreensíveis verificados nos fluxos da história. Fonte: DoD/observações de #11, #12, #13.
- **RNF-002** — Nenhum dado sensível deve ser enviado a serviço externo sem necessidade e consentimento adequado; verificar as saídas de rede dos fluxos implementados. Fonte: DoD/observações de #11, #12, #13.
- **RNF-003** — Os estados de erro e ausência de dados pertinentes devem ser tratados e verificados sem impedir o fluxo restante. Fonte: DoD/observações de #11, #12, #13.
- **RNF-004** — Recursos de apoio não devem ser apresentados como diagnóstico, tratamento ou substituição de acompanhamento profissional; conferir textos e saídas. Fonte: DoD/observações de #11, #12, #13.

Offline e persistência seguem os critérios específicos dos RFs; não se presume sincronização. Desempenho numérico e tempos máximos não foram definidos no backlog.

## Fora de escopo

US-011 entregou somente o editor local do plano e referências voluntárias ao perfil. US-013 implementará contato/mensagem locais e handoff voluntário ao WhatsApp; não compartilhará plano/perfil ou enviará mensagens automaticamente. Cartão/painel pertencem a #12/#10; sem exportação adicional, diagnóstico, IA ou backend.

## Dependências funcionais

- [P0 — Perfil de Comunicação](../003-perfil-de-comunicacao/spec.md): relação de uso/integração descrita nas histórias ou nas questões abaixo; não altera a prioridade original.
- [P0 — Regulação Sensorial](../005-regulacao-sensorial/spec.md): relação de uso/integração descrita nas histórias ou nas questões abaixo; não altera a prioridade original.

## Casos de erro

US-011: plano vazio, falha de abertura/salvamento e referência a campo removido do perfil. Vazio é válido; falha preserva versão confirmada/rascunho com feedback genérico e retry/cancelar, sem sucesso antes do commit. Referências exibem apenas dados atuais escolhidos e preenchidos, sem snapshot. Contato inválido e WhatsApp ausente pertencem a #13 (Q-APOIO-03).

São cenários derivados dos critérios e da DoD, não novas funcionalidades. As respostas ainda indefinidas devem ser acordadas antes da implementação correspondente.

## Questões em aberto

- Q-APOIO-01 — Resolvida nas #15/#11: referências aos sete IDs estáveis de sensibilidades/estratégias explicitamente escolhidos no editor, seleção inicial vazia; ler valores atuais ao reabrir, sem cópia antiga, alteração do perfil, envio ou dependência circular. Campo removido/vazio é omitido.
- Q-APOIO-02 — A milestone menciona compartilhar o plano, mas #12 cobre exibição e #13 mensagem ao contato. Falta definir formato/destino do compartilhamento e sua Issue.
- Q-APOIO-03 — Resolvida na #13: contato local com nome opcional, telefone internacional explícito e mensagem livre obrigatórios para configuração válida; numeração validada por biblioteca de domínio, sem inferir país/conta existente. Link oficial preenchido/handoff ao WhatsApp somente após revisão de destino/mensagem e comando explícito; envio final no app externo. Indisponibilidade/falha informada, sem fallback ou envio automático, leitura de agenda ou permissão de contatos. Salvar/cancelar/editar e remover confirmado apenas este módulo, falha conserva draft/confirmado com retry.
- Q-APOIO-04 — #12 depende do painel #10 para acesso direto; #10 depende do plano/contato. Implementar editores antes e validar os atalhos em conjunto, sem fundir branches.

US-011 refinada na [Issue #11](https://github.com/Nosso-Espectro/aplicativo/issues/11#issuecomment-6153657288)
sob delegação do usuário: um plano pessoal local, inicialmente vazio, orientações
livres opcionais e checkboxes das quatro sugestões originais (Não me toque;
Fale pouco; Preciso de silêncio; Dê-me tempo para responder), sem marcação padrão.
Salvar/cancelar explícitos; editar/limpar escolhas e texto, remoção integral
confirmada apenas do plano, erros/duplicatas tratados sem apagar o perfil.
Acesso ao editor pelo quadro. Q-APOIO-02/03/04 não bloqueiam esse editor local e
permanecem para suas histórias; não substituir os critérios originais de #12/#13.

Sequência registrada nas [#12](https://github.com/Nosso-Espectro/aplicativo/issues/12#issuecomment-6154041373)
e [#10](https://github.com/Nosso-Espectro/aplicativo/issues/10#issuecomment-6154041858):
após US-011, executar a história independente US-013, dentro da mesma milestone.
US-012 permanece aberta até acesso direto pelo painel real, sem simular o critério,
alterar P0 ou declarar milestone concluída. Refinamento da [US-013](https://github.com/Nosso-Espectro/aplicativo/issues/13#issuecomment-6154059964)
sob delegação humana define retenção até edição/remoção voluntária, revisão antes
de sair do TEAr e indisponibilidade sem perda de configuração. Q-APOIO-02/04
continuam abertas nos fluxos restantes.

Questões transversais: [auditoria do backlog](../../docs/backlog-audit.md). Uma história só está Ready quando suas ambiguidades bloqueantes forem resolvidas no GitHub e refletidas aqui.

## Rastreabilidade

| Requisito | Issue | História | Task principal |
| --- | --- | --- | --- |
| RF-001 | [#11](https://github.com/Nosso-Espectro/aplicativo/issues/11) | US-011 | T001 |
| RF-002 | [#11](https://github.com/Nosso-Espectro/aplicativo/issues/11) | US-011 | T002 |
| RF-003 | [#11](https://github.com/Nosso-Espectro/aplicativo/issues/11) | US-011 | T003 |
| RF-004 | [#11](https://github.com/Nosso-Espectro/aplicativo/issues/11) | US-011 | T004 |
| RF-005 | [#12](https://github.com/Nosso-Espectro/aplicativo/issues/12) | US-012 | T007 |
| RF-006 | [#12](https://github.com/Nosso-Espectro/aplicativo/issues/12) | US-012 | T008 |
| RF-007 | [#12](https://github.com/Nosso-Espectro/aplicativo/issues/12) | US-012 | T009 |
| RF-008 | [#13](https://github.com/Nosso-Espectro/aplicativo/issues/13) | US-013 | T012 |
| RF-009 | [#13](https://github.com/Nosso-Espectro/aplicativo/issues/13) | US-013 | T013 |
| RF-010 | [#13](https://github.com/Nosso-Espectro/aplicativo/issues/13) | US-013 | T014 |
| RF-011 | [#13](https://github.com/Nosso-Espectro/aplicativo/issues/13) | US-013 | T015 |
| RNF-001 | #11, #12, #13 | Todas acima | Revisão por história em tasks.md |
| RNF-002 | #11, #12, #13 | Todas acima | Revisão por história em tasks.md |
| RNF-003 | #11, #12, #13 | Todas acima | Revisão por história em tasks.md |
| RNF-004 | #11, #12, #13 | Todas acima | Revisão por história em tasks.md |

As tasks de testes cobrem os RFs da respectiva história. Branches previstas, commits, PRs e tags seguem o [workflow](../../docs/development-workflow.md) e o [índice](../README.md); nenhum desses artefatos Git foi criado nesta preparação.
