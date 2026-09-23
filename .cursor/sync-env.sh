#!/usr/bin/env bash
# Writes .env.local from Cloud Agent secrets. No-op when none are set.
set -euo pipefail

url="${VITE_SUPABASE_URL:-${SUPABASE_URL:-}}"
pub="${VITE_SUPABASE_PUBLISHABLE_KEY:-${SUPABASE_PUBLISHABLE_KEY:-}}"
service="${SUPABASE_SERVICE_ROLE_KEY:-}"

if [[ -z "$url" && -z "$pub" && -z "$service" ]]; then
  exit 0
fi

umask 077
cat > .env.local <<EOF
VITE_SUPABASE_URL=${url}
VITE_SUPABASE_PUBLISHABLE_KEY=${pub}
SUPABASE_URL=${SUPABASE_URL:-$url}
SUPABASE_PUBLISHABLE_KEY=${SUPABASE_PUBLISHABLE_KEY:-$pub}
SUPABASE_SERVICE_ROLE_KEY=${service}
EOF
