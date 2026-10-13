# US-014 — Preferências de Comunicação

Use somente dados sintéticos nos testes e não registre conteúdo pessoal.

Comunicação → Perfil de comunicação: estado inicial vazio e tempo não informado.
Preencher textos livres e escolher preciso/não preciso/não informado; salvar e
reabrir mantém distinção. Limpar um campo e salvar remove essa informação.
Remoção integral exige confirmação; cancelar mantém dados. Falha de gravação
conserva formulário e versão salva, permite salvar novamente/cancelar, sem detalhe
interno. Durante commit, controles ficam indisponíveis e não há sucesso antecipado.

135 testes Jest/24 suítes passaram: cinco SQL reais via Node24 e seis componentes
novos. Lint/typecheck e 47 testes tooling aprovados; teste no host não comprova Expo
em aparelho. Texto escalável, controles 48dp, radios com estado e erros acessíveis
revisados estaticamente. Sem novas dependências/permissões, rede, logs pessoais,
exportação ou compartilhamento; nenhuma inferência clínica. SQLite privado próprio.

Pendências T006: persistência offline nativa, leitor de tela/foco/teclado/ampliação
e backups do sistema. Prévia web informa armazenamento nativo indisponível, sem
persistência simulada. Builds remotos e atualização do Samsung preservando dados
somente após integração/artefato. Nenhum build local ou release aprovado.

## US-015 — Sensibilidades e estratégias

Perfil de comunicação → Sensibilidades e estratégias. Preencher somente os campos
escolhidos (som, luz, toque, temperatura, outras, estratégias úteis/evitadas),
salvar explicitamente e reabrir. Cancelar não grava; limpar um campo e salvar
remove essa informação. Remover todas exige confirmação e mantém a comunicação
da US-014. Falha conserva preenchimento e versão salva, oferecendo retry sem
exibir detalhes internos; gravação pendente bloqueia ações duplicadas.

SQLite versão2 migra a tabela de comunicação intacta e adiciona tabela própria
de suporte; testes reais no Node verificam migração v1, reabertura, UPSERT,
isolamento, rollback e leitura do contrato `readSupportForPlan(selected)`.
O contrato retorna somente valores atuais escolhidos explicitamente (padrão
nenhum), sem snapshot antigo após editar/remover; seu consumidor visual será #11.
Testes de componentes verificam campos/rótulos, estados vazio/erro/salvando,
edição/remoção/cancelamento/retry e navegação sem gravação implícita.

Revisão estática: textos escaláveis, formulário em scroll com teclado, alvos
mínimos 48dp, rótulos acessíveis e cabeçalhos, sem áudio/animação automáticos,
permissões/dependências novas, rede ou logs de conteúdo. T011 continua pendente
para SQLite Expo offline, TalkBack/VoiceOver, foco/ampliação/teclado e política
de backups em dispositivo. Mocks/SQLite do host não equivalem a essas validações.

Evidência em 2026-10-13: 151 testes Jest/26 suítes, lint/typecheck, Doctor21/21,
47 testes de tooling e validador de workflow aprovados na branch US-015.

## US-016 — Resumo voluntário do perfil

Perfil de comunicação → Resumo do perfil: inicialmente nenhum campo marcado.
Marcar os campos desejados, salvar seleção e só então apresentar. Salvar não
abre o resumo automaticamente; cancelar não grava o rascunho. Desmarcar tudo e
salvar limpa apenas a seleção, preservando preferências e estratégias. Resumo
em rota própria de tela cheia, rolável e com fechar/voltar, apresenta somente
informações escolhidas, atuais e preenchidas. Tempo adicional não preciso é
informação explícita; não informado é omitido. Editar/remover dados no perfil e
reabrir o resumo reflete a mudança, sem snapshot antigo nem campo não autorizado.

Erro de gravação mantém rascunho e escolhas confirmadas, permitindo retry/cancelar.
Enquanto grava, não permite duplicatas ou apresentação; nenhuma mensagem de sucesso
antes do commit. Erro de leitura do resumo apresenta somente feedback genérico e
retry, sem conteúdo antigo/parcial. Banco versão3 migra v1/v2 preservando os dados,
armazena somente IDs na seleção, lê resumo em transação e recusa schema futuro.
Testes SQL reais no Node, componentes e rotas cobrem esses cenários e a navegação
sem salvar automaticamente o formulário do perfil. Nenhuma exportação/envio/rede.

Evidência em 2026-10-13: 173 testes Jest/29 suítes aprovados, lint/typecheck,
Doctor21/21, 49 testes de tooling e validador de workflow. Review do diff sem
regressão impeditiva identificada; os limites nativos abaixo não foram simulados
como evidência de aprovação.

Pendências T016: revisão assistiva nativa/foco, texto ampliado em dispositivo,
reabertura offline do SQLite Expo e backups. Sem autorização de release. Builds
somente remotos no SHA integrado; gerar APK no servidor não comprova integridade
do host (#61). Instalação no celular aguarda a decisão explícita sobre essa pendência.
