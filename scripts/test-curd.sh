#!/usr/bin/env bash
# Test 2: CRUD flow (Create -> Read -> Update -> Delete -> verify 404)
BASE_URL="${BASE_URL:-http://localhost:3000}"
PID="CRUD$(date +%s)"
fail() { echo "FAIL: $1"; curl -s -X DELETE "$BASE_URL/products/$PID" > /dev/null; exit 1; }
H="Content-Type: application/json"

echo "== TEST CRUD ($BASE_URL) pid=$PID =="

code=$(curl -s -o /tmp/create.json -w "%{http_code}" -X POST "$BASE_URL/products" -H "$H" \
  -d "{\"pid\":\"$PID\",\"pname\":\"Laptop\",\"price\":1500,\"quantity\":10}")
[ "$code" = "201" ] || fail "POST expected 201, got $code"
grep -q "\"pid\":\"$PID\"" /tmp/create.json || fail "POST response missing pid"
echo "PASS: CREATE -> 201"

body=$(curl -s "$BASE_URL/products/$PID")
echo "$body" | grep -q '"pname":"Laptop"' || fail "READ wrong pname: $body"
echo "$body" | grep -q '"price":1500' || fail "READ wrong price: $body"
echo "PASS: READ one -> data correct"

curl -s "$BASE_URL/products" | grep -q "\"pid\":\"$PID\"" || fail "READ all does not contain $PID"
echo "PASS: READ all -> contains product"

code=$(curl -s -o /dev/null -w "%{http_code}" -X PUT "$BASE_URL/products/$PID" -H "$H" -d '{"price":99,"quantity":3}')
[ "$code" = "200" ] || fail "PUT expected 200, got $code"
body=$(curl -s "$BASE_URL/products/$PID")
echo "$body" | grep -q '"price":99' || fail "UPDATE price not applied: $body"
echo "$body" | grep -q '"quantity":3' || fail "UPDATE quantity not applied: $body"
echo "PASS: UPDATE -> price=99, quantity=3"

code=$(curl -s -o /dev/null -w "%{http_code}" -X DELETE "$BASE_URL/products/$PID")
[ "$code" = "200" ] || fail "DELETE expected 200, got $code"
echo "PASS: DELETE -> 200"

code=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/products/$PID")
[ "$code" = "404" ] || { echo "FAIL: after delete expected 404, got $code"; exit 1; }
echo "PASS: GET after delete -> 404"

echo "CRUD TEST PASSED"