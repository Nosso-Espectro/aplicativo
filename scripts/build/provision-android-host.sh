#!/usr/bin/env bash
set -euo pipefail

[[ $(id -u) == 0 ]] || { printf 'Provisioning requires root.\n' >&2; exit 77; }
key_file=${1:?Provide the CI public key file}
wrapper=${2:?Provide the forced-command script file}
[[ -f "$key_file" && -f "$wrapper" ]] || exit 66
grep -Eq '^ssh-ed25519 [A-Za-z0-9+/=]+( .*)?$' "$key_file" || exit 65
export DEBIAN_FRONTEND=noninteractive
apt-get update
apt-get install -y ca-certificates curl unzip zip git openjdk-17-jdk-headless build-essential ninja-build python3
if ! id tear-build >/dev/null 2>&1; then
  useradd --create-home --shell /bin/bash tear-build
fi
install -d -m 755 /opt/tear-build
install -d -o tear-build -g tear-build -m 700 /srv/tear-build /srv/tear-build/cache /srv/tear-build/artifacts /srv/tear-build/home
chown root:root /home/tear-build
chmod 755 /home/tear-build
install -d -o root -g root -m 700 /home/tear-build/.ssh
install -o root -g root -m 755 "$wrapper" /usr/local/bin/tear-android-ci
printf 'restrict,command="/usr/local/bin/tear-android-ci" %s\n' "$(cat "$key_file")" > /home/tear-build/.ssh/authorized_keys
chown root:root /home/tear-build/.ssh/authorized_keys
chmod 600 /home/tear-build/.ssh/authorized_keys
# The root-owned SSH directory prevents build scripts from replacing authorization.
chmod 755 /home/tear-build/.ssh
chmod 644 /home/tear-build/.ssh/authorized_keys

node_version=24.21.0
if [[ ! -x /opt/tear-build/node/bin/node ]]; then
  temporary=$(mktemp -d)
  trap 'rm -rf "$temporary"' EXIT
  curl -fsSL "https://nodejs.org/dist/v${node_version}/node-v${node_version}-linux-x64.tar.xz" -o "$temporary/node.tar.xz"
  curl -fsSL "https://nodejs.org/dist/v${node_version}/SHASUMS256.txt" -o "$temporary/SHASUMS256.txt"
  expected=$(awk '$2 == "node-v24.21.0-linux-x64.tar.xz" {print $1}' "$temporary/SHASUMS256.txt")
  [[ ${#expected} == 64 ]] || exit 65
  printf '%s  %s\n' "$expected" "$temporary/node.tar.xz" | sha256sum -c -
  install -d /opt/tear-build/node
  tar -xJf "$temporary/node.tar.xz" -C /opt/tear-build/node --strip-components=1
fi
sdk=/opt/tear-build/android-sdk
install -d -o tear-build -g tear-build "$sdk"
if [[ ! -x "$sdk/cmdline-tools/latest/bin/sdkmanager" ]]; then
  temporary_sdk=$(mktemp -d)
  curl -fsSL https://dl.google.com/android/repository/commandlinetools-linux-12266719_latest.zip -o "$temporary_sdk/tools.zip"
  unzip -q "$temporary_sdk/tools.zip" -d "$temporary_sdk"
  install -d "$sdk/cmdline-tools"
  mv "$temporary_sdk/cmdline-tools" "$sdk/cmdline-tools/latest"
  rm -rf "$temporary_sdk"
fi
chown -R tear-build:tear-build "$sdk"
runuser -u tear-build -- env HOME=/srv/tear-build/home JAVA_TOOL_OPTIONS=-Duser.home=/srv/tear-build/home ANDROID_USER_HOME=/srv/tear-build/home/.android JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64 ANDROID_HOME="$sdk" ANDROID_SDK_ROOT="$sdk" bash -c '
  cd "$HOME"
  mkdir -p "$HOME/.android/cache"
  printf "y\n%.0s" {1..100} | "$ANDROID_HOME/cmdline-tools/latest/bin/sdkmanager" --licenses >/dev/null
  "$ANDROID_HOME/cmdline-tools/latest/bin/sdkmanager" "platform-tools" "platforms;android-36" "build-tools;36.0.0" "ndk;27.1.12297006"
'
runuser -u tear-build -- /opt/tear-build/node/bin/node --version
java -version
printf 'Android build host provisioned; no runner, root build or Docker membership.\n'
