# US-011 — Plano pessoal de apoio

Use somente dados sintéticos; não registre conteúdo pessoal. Comunicação → Plano
de Apoio abre um plano inicialmente vazio. Preencher orientações livres, marcar
quaisquer sugestões originais e salvar explicitamente. Reabrir mantém escolhas e
texto. Cancelar não salva; limpar fontes individualmente mantém as outras.
Remover plano exige confirmação e preserva preferências/sensibilidades do perfil.

As informações do perfil são opcionais: escolher campos específicos lê somente
seus valores atuais não vazios. Plano guarda IDs, não copia texto do perfil.
Editar/remover informação no perfil e reabrir o plano reflete a mudança; desmarcar
durante leitura não exibe resultado obsoleto. Perfil indisponível produz erro
genérico com retry independente, mantendo orientações e edição do plano.

Falha ao abrir o plano bloqueia edição/gravação e permite retry/cancelar. Falha
ao gravar/remover mantém rascunho e plano confirmado; controles ficam indisponíveis
durante commit, sem mensagem de sucesso prematura. SQLite privado versão1,
transações/SQL parametrizado, sem rede, conta, logs pessoais ou permissões novas.
Prévia web comunica indisponibilidade do armazenamento nativo, sem dados simulados.

200 testes Jest/33 suítes aprovados, incluindo 27 específicos: modelo, SQLite
real do Node24, componentes e rotas. Lint/typecheck, Doctor21/21,49 tooling e
validador aprovados. Review estática
sem problema impeditivo identificado. Não foi validada interface visual em
aparelho, leitor de tela, foco/ampliação/teclado, offline SQLite Expo ou backups:
pendências T006 no gate, sem aprovação de release. Builds somente remotos no SHA
integrado; segurança do host #61 permanece pendente e instalação no celular não
é autorizada por mero sucesso de build.

Esta entrega não inclui cartão em tela cheia, painel de regulação, contato ou
WhatsApp (#12/#10/#13), nem afirma diagnóstico ou substituição de acompanhamento.
