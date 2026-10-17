#!/bin/bash
# Test Aikido Zen firewall blocking common attacks
BASE="http://127.0.0.1:4100"

echo "=== Aikido Zen Firewall Test Suite ==="
echo ""

echo "1. Normal request (should pass):"
curl -s "$BASE/search?q=hello" | python3 -m json.tool 2>/dev/null || curl -s "$BASE/search?q=hello"
echo ""

echo "2. SQL injection (should be blocked by Zen):"
curl -s -w "\nHTTP %{http_code}\n" "$BASE/search?q=1%20OR%201%3D1%20--"
echo ""

echo "3. Path traversal (should be blocked by Zen):"
curl -s -w "\nHTTP %{http_code}\n" -X POST "$BASE/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"../../etc/passwd","password":"test"}'
echo ""

echo "4. XSS attempt (should be blocked by Zen):"
curl -s -w "\nHTTP %{http_code}\n" "$BASE/search?q=%3Cscript%3Ealert(1)%3C/script%3E"
echo ""

echo "5. Shell injection (should be blocked by Zen):"
curl -s -w "\nHTTP %{http_code}\n" "$BASE/search?q=%3B%20cat%20/etc/passwd"
echo ""

echo "=== Done ==="
