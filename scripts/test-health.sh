#!/usr/bin/env bash
# Test 1: System health check
BASE_URL="${BASE_URL:-http://localhost:3000}"
fail() { echo "FAIL: $1"; exit 1; }

echo "== TEST HEALTH ($BASE_URL) =="
code=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/health")
[ "$code" = "200" ] || fail "GET /health expected 200, got $code"
echo "PASS: GET /health -> 200"

body=$(curl -s "$BASE_URL/health")
echo "$body" | grep -q '"status":"OK"' || fail "status is not OK: $body"
echo "PASS: status = OK"

echo "$body" | grep -q '"db":"connected"' || fail "db not connected: $body"
echo "PASS: db = connected"

echo "HEALTH TEST PASSED"