#!/bin/bash

# 🧪 Script de Teste do Sistema de Login Discord
# Este script testa todos os endpoints críticos do sistema

set -e

BASE_URL="http://localhost:3000"
BOLD='\033[1m'
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Função para imprimir testes
print_test() {
    echo -e "${BOLD}🧪 $1${NC}"
}

print_pass() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_fail() {
    echo -e "${RED}❌ $1${NC}"
    exit 1
}

print_info() {
    echo -e "${YELLOW}ℹ️  $1${NC}"
}

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "   🔐 TESTE DO SISTEMA DE LOGIN DISCORD"
echo "═══════════════════════════════════════════════════════════"
echo ""

# Teste 1: Backend está rodando
print_test "Backend está rodando?"
if curl -s "$BASE_URL/" > /dev/null 2>&1; then
    print_pass "Backend respondendo em $BASE_URL"
else
    print_fail "Backend não está rodando. Execute: cd backend && npm start"
fi

# Teste 2: Página pública carrega
print_test "Página pública carrega?"
if curl -s "$BASE_URL/" | grep -q "Lithium"; then
    print_pass "Página pública (/index.html) carrega corretamente"
else
    print_fail "Página pública não contém conteúdo esperado"
fi

# Teste 3: Página de admin carrega
print_test "Página admin carrega?"
if curl -s "$BASE_URL/admin-panel.html" | grep -q "Admin"; then
    print_pass "Página admin (/admin-panel.html) carrega corretamente"
else
    print_fail "Página admin não contém conteúdo esperado"
fi

# Teste 4: Página de callback carrega
print_test "Página de callback carrega?"
if curl -s "$BASE_URL/auth-callback.html" | grep -q "Autenticando"; then
    print_pass "Página de callback (/auth-callback.html) carrega corretamente"
else
    print_fail "Página de callback não contém conteúdo esperado"
fi

# Teste 5: API de verificação de login (usuário não autenticado)
print_test "API de verificação de login (não autenticado)?"
RESPONSE=$(curl -s "$BASE_URL/api/logged-user")
if echo "$RESPONSE" | grep -q '"user":null'; then
    print_pass "API retorna user:null quando não autenticado"
    print_info "Resposta: $RESPONSE"
else
    print_fail "API de logged-user não retornou resposta esperada"
fi

# Teste 6: API de downloads (não autenticado)
print_test "API de downloads (não autenticado)?"
RESPONSE=$(curl -s "$BASE_URL/api/downloads")
if echo "$RESPONSE" | grep -q '\[\]'; then
    print_pass "API retorna array vazio para downloads"
    print_info "Resposta: $RESPONSE"
else
    print_fail "API de downloads não retornou resposta esperada"
fi

# Teste 7: POST em downloads sem autenticação (deve falhar)
print_test "POST em downloads sem autenticação (deve retornar 401)?"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE_URL/api/downloads" \
    -H "Content-Type: application/json" \
    -d '{"url":"test"}')
if [ "$HTTP_CODE" = "401" ]; then
    print_pass "POST sem autenticação corretamente bloqueado (HTTP $HTTP_CODE)"
else
    print_fail "POST deveria retornar 401, retornou $HTTP_CODE"
fi

# Teste 8: Rotas OAuth existem
print_test "Rotas OAuth estão disponíveis?"
if curl -s -I "$BASE_URL/auth/discord" | grep -q "302\|301\|200"; then
    print_pass "Rota /auth/discord respondendo"
else
    print_fail "Rota /auth/discord não respondendo"
fi

# Teste 9: CORS headers
print_test "CORS headers configurado?"
CORS_HEADER=$(curl -s -H "Origin: http://localhost:3000" \
    -H "Access-Control-Request-Method: POST" \
    -H "Access-Control-Request-Headers: Content-Type" \
    -X OPTIONS "$BASE_URL/api/downloads" \
    -v 2>&1 | grep -i "access-control-allow")
if [ -n "$CORS_HEADER" ]; then
    print_pass "CORS headers presentes"
    print_info "Headers: $(echo $CORS_HEADER | head -1)"
else
    print_info "CORS headers não detectados (pode estar OK dependendo da config)"
fi

# Teste 10: Static files servem
print_test "Arquivos estáticos (CSS, JS) servem?"
CSS_EXISTS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/css/styles.css")
JS_EXISTS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/js/app.js")
if [ "$CSS_EXISTS" = "200" ] && [ "$JS_EXISTS" = "200" ]; then
    print_pass "Arquivos estáticos servindo (CSS: $CSS_EXISTS, JS: $JS_EXISTS)"
else
    print_fail "Arquivos estáticos não encontrados (CSS: $CSS_EXISTS, JS: $JS_EXISTS)"
fi

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "   🎉 TODOS OS TESTES PASSARAM!"
echo "═══════════════════════════════════════════════════════════"
echo ""

echo -e "${BOLD}📋 Próximos Passos:${NC}"
echo ""
echo "1️⃣  ${BOLD}Teste Manual do Login:${NC}"
echo "   • Abra http://localhost:3000 no navegador"
echo "   • Clique em '🔓 Login' (canto superior direito)"
echo "   • Faça login com sua conta Discord"
echo "   • Verifique se sua foto/nome aparecem no header"
echo ""
echo "2️⃣  ${BOLD}Teste Admin Panel:${NC}"
echo "   • Após login, acesse http://localhost:3000/admin-panel.html"
echo "   • Adicione um novo download"
echo "   • Verifique se aparece na página pública"
echo ""
echo "3️⃣  ${BOLD}Documentação:${NC}"
echo "   • Leia LOGIN_FLOW.md para entender o fluxo completo"
echo "   • Leia README.md para instruções de setup"
echo ""
echo "4️⃣  ${BOLD}Deploy em Produção:${NC}"
echo "   • Quando pronto, execute: ./vercel-deploy.sh"
echo "   • Ou siga o guia em VERCEL_DEPLOY.md"
echo ""
