# Plano de implementação — Check-in Corporal e Sensorial

Spec: [spec.md](spec.md). Milestone #16; Issues #21, #22. Plano proposto, sujeito às questões em aberto.

## Stack

Inspeção em 2026-10-14: Expo SDK57, React Native0.86.3, React19.2.3, TypeScript strict, Expo Router, Jest/RNTL. Node24.21.0/npm11.19.0. Primeira versão sem backend; sem dependência nova para #21.

## Arquitetura atual

Quadro em `src/app/index.tsx`, navegação por Expo Router e preferência de baixa estimulação via `LowStimulationProvider`. Usar padrões reais de SafeAreaView/ScrollView, ícones MaterialIcons e controles acessíveis. Não acoplar check-in ao banco de tarefas ou perfil.

## Estratégia

Implementar uma Issue por branch, a partir de main atualizada, seguindo RFs e critérios originais. Começar pelo menor fluxo verificável; separar lógica de estado, apresentação e acesso a capacidades do dispositivo apenas quando necessário. Resolver as questões bloqueantes da história antes de iniciar.

Não implementar a milestone inteira em uma branch. A inicialização técnica precisa de uma Issue vinculada ou inclusão explícita no escopo da primeira história, registrada no GitHub; esta documentação não autoriza criar produto adicional.

## Componentes envolvidos

Módulo de #21: `src/features/sensory-check-in/`.

- `src/features/sensory-check-in/CheckInForm.tsx` e `check-in-model.ts` — [US-021] Realizar check-in corporal e sensorial guiado, rota `src/app/check-in/`.
- `src/features/sensory-check-in/check-in-summary` — [US-022] Exibir resumo do check-in.

## Modelo de dados

Respostas opcionais por item do check-in; resumo derivado apenas das respostas presentes. Histórico persistente não é pressuposto desta milestone.

`CheckInState` com índice, respostas opcionais por ID tipado e indicador de encerramento. Reducer valida escala por item, rejeita eventos de pergunta anterior/duplicados. US022 estende finalização: conserva respostas para resumo literal derivado na mesma tela, somente até reset/saída/blur/unmount. Sem migração/banco/provider global. `check-in-summary.ts` deriva linhas somente de respostas válidas, preservando ordem e sem inferência.

## Persistência

Estado local de componente/reducer; nenhuma resposta padrão. Não persistir/transmitir. Finalizar mostra resumo (extensão US022); sair/abrir ferramenta/back/blur/unmount descarta, nova entrada vazia. Voltar nas perguntas revisa; pular apaga resposta do item. Sem Histórico P3.

## Fluxos principais

Quadro → check-in → selecionar/continuar ou pular/revisar → resumo literal e possibilidades neutras → quadro ou ferramenta escolhida. Sair antes do fim também descarta. Scroll volta ao topo sem animação ao mudar pergunta/resumo. US022 rota Água `/check-in/water` reutiliza CommunicationBoard com somente cartão local Água, sem compositor/onSelectCard; faltando cartão mostra estado vazio/retorno. Regulação e contato usam rotas próprias já entregues. Nenhuma resposta em params.

Validar cada critério no seu fluxo e as integrações indicadas em spec.md; a sequência não impõe um único percurso de interface.

## Offline

Check-in/resumo/Água operam sem rede e armazenamento de respostas; reentrada vazia. Abrir contato apenas revisa configuração local; envio externo continua ação humana separada no módulo existente.

Recursos locais não devem depender de autenticação ou API. Capacidades externas explicitamente solicitadas devem informar indisponibilidade sem impedir os recursos locais; não confundir falta de backend próprio com ausência de qualquer serviço externo futuro.

## Acessibilidade

Aplicar RNF-001 e a Skill accessibility-neuroinclusive: rótulos e ordem de foco, leitor de tela, texto ampliado, contraste e alvos de toque. Verificar teclado quando suportado pelo dispositivo. Respeitar preferências de som/movimento e não ativar mídia inesperadamente. Critérios mensuráveis faltantes precisam de refinamento, não de aprovação automática.

## Privacidade e segurança

Aplicar RNF-002 e RNF-004. Usar dados sintéticos nos testes; evitar dados pessoais em logs. Controlar compartilhamento e permissões nas ações que realmente necessitam deles. Não adicionar telemetria, conta ou serviço externo por conveniência técnica.

## Estratégia de testes

- Derivar cenários de cada RF, preservando a relação Issue → RF → task → teste.
- Usar testes unitários para transformações de estado/dados; componentes para interação e acessibilidade; integração para persistência/capacidades nativas quando pertinentes.
- Exercitar os casos de erro do spec e regressões das dependências reais.
- Verificar em dispositivo/simulador os fluxos que dependem de voz, áudio, permissões ou notificações; mocks isolados não comprovam suporte nativo.
- Testar todas as oito perguntas, seleções/escalas, pular inclusive resposta anterior, retorno/revisão, fim sem resposta, encerramento/reentrada vazia, rota direta/fallback e modo9 com Expo Router real. Validar entradas inválidas no reducer sem inferência.
- Executar Jest serial, lint, tipos, Doctor e checks leves. Builds exclusivamente remotos/manuais no SHA integrado; testes assistivos/aparelho são gate separado, não aprovação por mocks.

Jest/RNTL e Expo Router testing library existentes. Sem build local e sem operar celular na implementação. Evidência de testes simulados não habilita release.

## Dependências técnicas

Base implementada, sem bibliotecas novas ou uso de temporizador/áudio. #21 não depende das integrações de #22.

## Riscos

Perguntas puladas e resumo sem respostas (#21/#22); não preencher respostas por inferência.

US021 entregue e US022 Ready após aprovação explícita. Leitor de tela/foco, texto ampliado/insets/alvos e abertura offline reais permanecem gates nativos T012/T013; testes RNTL não comprovam conformidade total ou release. Ver [auditoria](../../docs/backlog-audit.md).

## Decisões arquiteturais

- Diretriz confirmada: React Native; MVP sem backend.
- Módulo isolado em TypeScript/reducer e estado local de componente, sem provider global ou acesso a DB de outro módulo.
- US021: rota `/check-in`, estado efêmero local, oito perguntas fixas revisadas na Issue, sem sugestão/diagnóstico/DB. Navegação mantém animação da preferência existente (none em modo9).
- Proibido tratar este plano como aprovação de requisitos ausentes. Decisões funcionais voltam ao GitHub e decisões técnicas serão registradas neste plano quando fundamentadas.
