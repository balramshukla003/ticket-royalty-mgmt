#!/bin/bash
# ============================================================
# BookLeaf API — curl test file
# Run: bash API_TESTS.sh
# Set TOKEN_AUTHOR and TOKEN_ADMIN after the login calls.
# ============================================================

BASE="http://localhost:5000/api/v1"

echo ""
echo "=============================="
echo "  HEALTH CHECK"
echo "=============================="
curl -s "$BASE/../health" | python -m json.tool 2>/dev/null || curl -s "$BASE/../health"

echo ""
echo "=============================="
echo "  AUTH — Login as Admin"
echo "=============================="
curl -s -X POST "$BASE/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@bookleaf.com","password":"123456"}'

echo ""
echo "=============================="
echo "  AUTH — Login as Author (Priya Sharma)"
echo "=============================="
curl -s -X POST "$BASE/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"priya.sharma@email.com","password":"123456"}'

echo ""
echo "=============================="
echo "  AUTH — Wrong password (expect 401)"
echo "=============================="
curl -s -X POST "$BASE/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@bookleaf.com","password":"wrongpass"}'

echo ""
echo "=============================="
echo "  AUTH — Validation error (expect 422)"
echo "=============================="
curl -s -X POST "$BASE/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"not-an-email","password":""}'

# ── Set these after running the login calls above ──────────
# Copy the token values from the login responses and set them here,
# then re-run the script or run individual curl commands below.

TOKEN_AUTHOR="PASTE_AUTHOR_TOKEN_HERE"
TOKEN_ADMIN="PASTE_ADMIN_TOKEN_HERE"

echo ""
echo "=============================="
echo "  AUTH — GET /me (Author)"
echo "=============================="
curl -s "$BASE/auth/me" \
  -H "Authorization: Bearer $TOKEN_AUTHOR"

echo ""
echo "=============================="
echo "  AUTH — GET /me (Admin)"
echo "=============================="
curl -s "$BASE/auth/me" \
  -H "Authorization: Bearer $TOKEN_ADMIN"

echo ""
echo "=============================="
echo "  BOOKS — Get my books (Author)"
echo "=============================="
curl -s "$BASE/books" \
  -H "Authorization: Bearer $TOKEN_AUTHOR"

echo ""
echo "=============================="
echo "  BOOKS — Get book by id (Author)"
echo "=============================="
curl -s "$BASE/books/1" \
  -H "Authorization: Bearer $TOKEN_AUTHOR"

echo ""
echo "=============================="
echo "  BOOKS — Dropdown (Author)"
echo "=============================="
curl -s "$BASE/books/dropdown" \
  -H "Authorization: Bearer $TOKEN_AUTHOR"

echo ""
echo "=============================="
echo "  BOOKS — Admin cannot access author books (expect 403)"
echo "=============================="
curl -s "$BASE/books" \
  -H "Authorization: Bearer $TOKEN_ADMIN"

echo ""
echo "=============================="
echo "  TICKETS — Create ticket (Author)"
echo "=============================="
curl -s -X POST "$BASE/tickets" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN_AUTHOR" \
  -d '{"bookId":1,"subject":"My royalty payment is delayed","description":"I have not received my Q2 royalty payment yet. It has been more than 45 days since the quarter ended. My bank details are linked. Please check the status immediately."}'

echo ""
echo "=============================="
echo "  TICKETS — List my tickets (Author)"
echo "=============================="
curl -s "$BASE/tickets" \
  -H "Authorization: Bearer $TOKEN_AUTHOR"

echo ""
echo "=============================="
echo "  TICKETS — Get ticket by id (Author)"
echo "=============================="
curl -s "$BASE/tickets/1" \
  -H "Authorization: Bearer $TOKEN_AUTHOR"

echo ""
echo "=============================="
echo "  TICKETS — Author reply"
echo "=============================="
curl -s -X POST "$BASE/tickets/1/reply" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN_AUTHOR" \
  -d '{"body":"Thank you for the update. I will wait for the transfer."}'

echo ""
echo "=============================="
echo "  ADMIN — Get all tickets"
echo "=============================="
curl -s "$BASE/admin/tickets" \
  -H "Authorization: Bearer $TOKEN_ADMIN"

echo ""
echo "=============================="
echo "  ADMIN — Filter by CRITICAL priority"
echo "=============================="
curl -s "$BASE/admin/tickets?priority=CRITICAL" \
  -H "Authorization: Bearer $TOKEN_ADMIN"

echo ""
echo "=============================="
echo "  ADMIN — Filter by OPEN status"
echo "=============================="
curl -s "$BASE/admin/tickets?status=OPEN" \
  -H "Authorization: Bearer $TOKEN_ADMIN"

echo ""
echo "=============================="
echo "  ADMIN — Get ticket detail (with notes)"
echo "=============================="
curl -s "$BASE/admin/tickets/2" \
  -H "Authorization: Bearer $TOKEN_ADMIN"

echo ""
echo "=============================="
echo "  ADMIN — Generate AI draft"
echo "=============================="
curl -s -X POST "$BASE/admin/tickets/2/draft" \
  -H "Authorization: Bearer $TOKEN_ADMIN"

echo ""
echo "=============================="
echo "  ADMIN — Reply to ticket"
echo "=============================="
curl -s -X POST "$BASE/admin/tickets/2/reply" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN_ADMIN" \
  -d '{"body":"Hi Rohit, we have escalated this ISBN issue to our production team. You will receive an update within 48 hours.","wasAiDrafted":false}'

echo ""
echo "=============================="
echo "  ADMIN — Update status to IN_PROGRESS"
echo "=============================="
curl -s -X PATCH "$BASE/admin/tickets/3/status" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN_ADMIN" \
  -d '{"status":"IN_PROGRESS"}'

echo ""
echo "=============================="
echo "  ADMIN — Override category"
echo "=============================="
curl -s -X PATCH "$BASE/admin/tickets/4/category" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN_ADMIN" \
  -d '{"category":"DISTRIBUTION_AVAILABILITY"}'

echo ""
echo "=============================="
echo "  ADMIN — Override priority"
echo "=============================="
curl -s -X PATCH "$BASE/admin/tickets/4/priority" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN_ADMIN" \
  -d '{"priority":"HIGH"}'

echo ""
echo "=============================="
echo "  ADMIN — Assign ticket to self"
echo "=============================="
curl -s -X PATCH "$BASE/admin/tickets/3/assign" \
  -H "Authorization: Bearer $TOKEN_ADMIN"

echo ""
echo "=============================="
echo "  ADMIN — Add internal note"
echo "=============================="
curl -s -X POST "$BASE/admin/tickets/3/notes" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN_ADMIN" \
  -d '{"body":"Checked with warehouse. Print batch BK006-Oct had a quality issue. Arranging reprint."}'

echo ""
echo "=============================="
echo "  NOTIFICATIONS — Get all (Author)"
echo "=============================="
curl -s "$BASE/notifications" \
  -H "Authorization: Bearer $TOKEN_AUTHOR"

echo ""
echo "=============================="
echo "  NOTIFICATIONS — Unread count (Admin)"
echo "=============================="
curl -s "$BASE/notifications/unread-count" \
  -H "Authorization: Bearer $TOKEN_ADMIN"

echo ""
echo "=============================="
echo "  NOTIFICATIONS — Mark one read"
echo "=============================="
curl -s -X PATCH "$BASE/notifications/3/read" \
  -H "Authorization: Bearer $TOKEN_AUTHOR"

echo ""
echo "=============================="
echo "  NOTIFICATIONS — Mark all read (Admin)"
echo "=============================="
curl -s -X PATCH "$BASE/notifications/read-all" \
  -H "Authorization: Bearer $TOKEN_ADMIN"

echo ""
echo "=============================="
echo "  SECURITY — Author accessing admin route (expect 403)"
echo "=============================="
curl -s "$BASE/admin/tickets" \
  -H "Authorization: Bearer $TOKEN_AUTHOR"

echo ""
echo "=============================="
echo "  SECURITY — No token (expect 401)"
echo "=============================="
curl -s "$BASE/books"

echo ""
echo "All tests complete."
