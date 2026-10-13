# Android Build Host

Issue #49: Ubuntu 24.04 x86_64 dedicado, 8 CPUs, 31 GiB RAM. GitHub Actions
continua coordenando checks/artefatos; somente a compilação Android usa SSH.
iOS permanece no runner macOS 26: Linux não fornece Xcode ou assinatura iOS.
Nenhum build é executado automaticamente na máquina de desenvolvimento.

## Provisionamento

Copiar `scripts/build/provision-android-host.sh`, `scripts/build/tear-android-ci`
e a chave **pública** dedicada para o servidor e executar como root:

```bash
bash provision-android-host.sh /caminho/chave.pub /caminho/tear-android-ci
```

Instala JDK 17, Node 24.21.0/npm 11.19.0 e Android SDK 36/build-tools 36.0.0/
NDK 27.1.12297006. Compilação pelo usuário `tear-build`, sem sudo ou Docker.
Não reinicia a máquina nem altera serviços existentes. Ferramentas em
`/opt/tear-build`, checkout/cache/artefatos em `/srv/tear-build`.

## Acesso

Segredos do repositório: `TEAR_BUILD_HOST`, `TEAR_BUILD_SSH_KEY` e
`TEAR_BUILD_KNOWN_HOSTS`. Chave dedicada ed25519, autenticação restrita a um
comando root-owned e sem túnel/PTY. A senha root serve somente ao provisionamento;
não é armazenada em arquivos do projeto nem nos segredos do GitHub.
Verificação de host obrigatória: nunca usar `StrictHostKeyChecking=no`.

O comando remoto aceita somente `build SHA` ou `artifact SHA`, com SHA completo.
Build valida ancestralidade na main do repositório fixo e serializa com flock.
O checkout é descartável e pode ser limpo, ao contrário dos worktrees de desenvolvimento.
Código compilado roda com as permissões do usuário de build; não colocar dados
pessoais ou credenciais adicionais nessa conta. Não usar runner self-hosted aberto
a PRs deste repositório público.

## Uso

```bash
gh workflow run mobile-quality.yml --repo Nosso-Espectro/aplicativo --ref main -f platform=android
```

Execução manual somente na main. PRs e pushes mantêm checks leves em runners GitHub.
APK é transferido por SSH e publicado como `tear-android-SHA`; gate remoto existente
continua verificando jobs e artefatos no SHA integrado. Não presume instalação,
funcionamento offline ou acessibilidade em aparelho a partir da compilação.

Revogar acesso: remover os três segredos e a chave pública em authorized_keys.
Trocar a chave em ambos os lados para rotação; nunca incluir chave privada no repo.
