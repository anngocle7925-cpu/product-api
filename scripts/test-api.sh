#!/usr/bin/env bash
set -e
BASE_URL="${BASE_URL:-http://localhost:3000}"
PID="CI$(date +%s)"

check() {
  local name="$1" expected="$2" actual="$3"
  if [ "$expected" = "$actual" ]; then
    echo "PASS: $name ($actual)"
  else
    echo "FAIL: $name (expected $expected, got $actual)"
    exit 1
  fi
}

code=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/health")
check "GET /health" 200 "$code"

code=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE_URL/products" \
  -H "Content-Type: application/json" \
  -d "{\"pid\":\"$PID\",\"pname\":\"CI Item\",\"price\":10,\"quantity\":5}")
check "POST /products" 201 "$code"

code=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/products")
check "GET /products" 200 "$code"

code=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/products/$PID")
check "GET /products/:pid" 200 "$code"

code=$(curl -s -o /dev/null -w "%{http_code}" -X PUT "$BASE_URL/products/$PID" \
  -H "Content-Type: application/json" -d '{"price":99}')
check "PUT /products/:pid" 200 "$code"

code=$(curl -s -o /dev/null -w "%{http_code}" -X DELETE "$BASE_URL/products/$PID")
check "DELETE /products/:pid" 200 "$code"

code=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/products/$PID")
check "GET deleted product" 404 "$code"

echo "ALL TESTS PASSED"
