#!/usr/bin/env sh
# Registra propostas reprovadas pelo validador.
#
# O AGENTS.md do handoff pede: "Log validation failures and regeneration
# attempts". Sem esse registro não há como saber se o agente está passando de
# primeira ou brigando com o contrato semana após semana — e é justamente esse
# padrão que indica que um limite está mal calibrado ou que a fonte mudou.
#
# O evento chega em JSON pelo stdin. Gravamos como está, com carimbo de tempo.
set -eu

LOG_DIR="${CLAUDE_PLUGIN_DATA:-${TMPDIR:-/tmp}}"
LOG_FILE="${LOG_DIR}/sprint-rejections.jsonl"

mkdir -p "$LOG_DIR"

PAYLOAD=$(cat)
printf '{"at":"%s","event":%s}\n' "$(date -u +%Y-%m-%dT%H:%M:%SZ)" "$PAYLOAD" >> "$LOG_FILE"
