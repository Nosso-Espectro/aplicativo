#!/usr/bin/env bash
set -euo pipefail

[[ $(id -u) == 0 ]] || { printf 'JDK installation requires root.\n' >&2; exit 77; }
version=21.0.12.1+1
checksum=ce79869e1307ed8ee1e2baa86a412b1eb5b75d10a01006d788a6f968bcfaee94
target="/opt/tear-build/jdk-$version"
[[ ! -e "$target" ]] || { printf 'JDK destination already exists; refusing to overwrite.\n' >&2; exit 73; }
temporary=$(mktemp -d)
trap 'rm -rf "$temporary"' EXIT
curl --fail --location --silent --show-error --retry 2 --connect-timeout 20 --max-time 300 \
  https://github.com/adoptium/temurin21-binaries/releases/download/jdk-21.0.12.1%2B1/OpenJDK21U-jdk_x64_linux_hotspot_21.0.12.1_1.tar.gz \
  -o "$temporary/jdk.tar.gz"
printf '%s  %s\n' "$checksum" "$temporary/jdk.tar.gz" | sha256sum -c -
mkdir "$temporary/jdk"
tar -xzf "$temporary/jdk.tar.gz" -C "$temporary/jdk" --strip-components=1
"$temporary/jdk/bin/java" -version
install -d -m 755 /opt/tear-build
mv "$temporary/jdk" "$target"
chown -R root:root "$target"
chmod -R go-w "$target"
printf 'Verified build-only JDK installed at %s\n' "$target"
