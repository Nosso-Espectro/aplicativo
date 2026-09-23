# Auditoria do backlog e decisões pendentes

Consulta via gh em 2026-09-23. Repositório `Nosso-Espectro/aplicativo`, trunk `main`, squash permitido. Estado inicial local: somente README e LICENSE; README já modificado na tarefa anterior e preservado. Sem app, manifestos de dependências, CI, testes de produto ou Spec Kit instalado.

## Inventário

- 16 milestones abertas (números GitHub 9 a 24).
- 40 Issues abertas (#1 a #40); 40 histórias US-001 a US-040.
- P0: 5 milestones / 16 Issues. P1: 6 / 12. P2: 3 / 6. P3: 2 / 6.
- Nenhuma Issue sem milestone, nenhum número de Issue/US duplicado e nenhuma milestone vazia na consulta.
- 16 specs, cada uma com plan e tasks. Critérios originais preservados; propostas técnicas não são decisões de produto.

## Inconsistências e ambiguidades

| Tema | Evidência | Encaminhamento sem alterar o GitHub |
| --- | --- | --- |
| Atalhos P0 dependem de P1 | #10 exige sons e timer; #17/#27 são P1 | Q-REG-01 bloqueia entrega integral P0; produto precisa definir o recorte ou revisar backlog. |
| Integração recíproca | #10 acessa apoio; #12 exige acesso pelo painel | Implementar bases em branches separadas e validar integração antes de concluir ambas. |
| Perfil reutilizado no plano | #15 e #11 | Definir cópia versus referência e atualização; perfil antes do consumo no plano. |
| Cartão com áudio próprio | Milestone #9 menciona áudio; #4 só texto/imagem | Definir história/aceites antes de implementar gravação/importação. |
| Compartilhamento do plano | Milestone #12; #12/#13 não definem exportação do plano | Esclarecer formato, destino e Issue. |
| Modelos prontos | Milestone #15 fala em tarefas comuns; #20 só modelo criado pelo usuário | Esclarecer catálogo inicial e conteúdo. |
| Água no check-in | #22 versus CAA #1 / hidratação #29 P2 | Definir destino; não antecipar P2 por inferência. |
| Intervalos de foco personalizados | Milestone #18; #25 exige presets | Falta critério/Issue para personalização. |
| Sons em segundo plano | Milestone #19; #27/#28 sem critérios específicos | Definir plataformas, interrupções e cobertura por história. |
| Podcasts | #33/#34 | Fonte, licenças, atualização, rede/cache e retenção indefinidos. |
| IA futura | #35–#37 P3 | Processamento, provedor, credenciais, consentimento e destino de salvamento indefinidos; fora do MVP. |
| Histórico | #38–#40 | Não há contrato de coleta/retenção dos módulos anteriores; não iniciar telemetria silenciosa. |
| Critérios qualitativos | “poucos toques”, “amplos”, “rapidamente”, “discreto” | Refinar limites/cenários observáveis com produto antes de declarar aceite. |
| Bootstrap técnico | Não há Issue de fundação nem código | Vincular inicialização/qualidade a uma Issue autorizada ou explicitar escopo técnico da primeira história no GitHub. |
| Plataformas e capacidades | Sem versões mínimas, linguagem, ferramentas ou bibliotecas | Decidir tecnicamente com evidências ao iniciar; não presumir Expo, SQLite ou backend. |
| Referências anteriores do README | Visão conceitual anterior ao backlog detalhado | Specs e GitHub prevalecem; README aponta ao índice, sem transformar exemplos em novos requisitos. |

Detalhes e perguntas por história estão em “Questões em aberto” de cada spec. As lacunas bloqueiam as histórias correspondentes, não impedem a preparação documental. Nenhuma Issue foi declarada Ready automaticamente.

## Ordem recomendada

P0: CAA → rotina → perfil → plano de apoio → regulação. P1: timer → divisor → check-in → scripts → foco → sons. P2: água → meditação → podcasts. P3: IA → histórico. Em IA, implementar limites #37 antes dos fluxos #35/#36.

A ordem é de implementação sugerida; integrações cíclicas e dependências P0/P1 impedem prometer conclusão sequencial de milestones sem refinamento. Prioridades e números GitHub permanecem intactos. Consulte [índice e branches previstas](../specs/README.md).

## Estado das ferramentas

`gh` 2.45.0 disponível e autenticado para leitura; `--slurp` não é suportado nesta instalação. Os helpers usam paginação e decodificam cada página, sem truncar silenciosamente. Python 3, Bash e Git são ferramentas de engenharia, não a stack do app.

Os scripts de release recusam a ausência de testes/lint/build, evidência manual ou PR integrado. Nenhuma tag foi criada e nenhum comando remoto de escrita foi executado.

## Validação da preparação

- 16 specs / 40 histórias / 215 tasks conferidas com o backlog vivo, incluindo histórias, critérios, DoD, observações e prioridades.
- 10 Skills aprovadas pelo validador da Skill skill-creator; link de descoberta conferido.
- 32 testes dos helpers aprovados, com Git mutável e gates de release simulados: nenhuma branch/tag real foi criada nos testes.
- Helpers de consulta de Issue e milestone executados contra o GitHub, somente leitura; esquema GraphQL dos PRs de conclusão conferido.
- Shell verificado individualmente com bash -n; Markdown estrutural e links locais verificados pelo validador do repositório.
- Não há suíte/build do aplicativo. A configuração de release permanece bloqueada até haver comandos reais e evidências da entrega.
