#!/bin/bash

# 🚀 Script de Deploy para Vercel
# Este script automatiza o processo de deploy do projeto para Vercel

set -e

BOLD='\033[1m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

print_header() {
    echo ""
    echo -e "${BOLD}════════════════════════════════════════════════════${NC}"
    echo -e "${BOLD}  $1${NC}"
    echo -e "${BOLD}════════════════════════════════════════════════════${NC}"
    echo ""
}

print_step() {
    echo -e "${BLUE}→${NC} ${BOLD}$1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
    exit 1
}

# Função para pedir confirmação
confirm() {
    local prompt="$1"
    local response
    read -p "$(echo -e ${BOLD}$prompt${NC}) (s/n): " response
    [[ "$response" == "s" || "$response" == "S" || "$response" == "yes" || "$response" == "Y" ]]
}

print_header "🚀 DEPLOY PARA VERCEL"

# Step 1: Verificar se está em um repositório git
print_step "Verificando se está em um repositório Git..."
if [ ! -d ".git" ]; then
    print_error "Este não é um repositório Git. Não é possível fazer deploy."
fi
print_success "Repositório Git detectado"

# Step 2: Verificar Vercel CLI
print_step "Verificando Vercel CLI..."
if ! command -v vercel &> /dev/null; then
    print_warning "Vercel CLI não instalado"
    print_step "Instalando Vercel CLI globalmente..."
    npm install -g vercel || print_error "Falha ao instalar Vercel CLI"
    print_success "Vercel CLI instalado"
else
    VERCEL_VERSION=$(vercel --version)
    print_success "Vercel CLI encontrado: $VERCEL_VERSION"
fi

# Step 3: Verificar se há mudanças não commitadas
print_step "Verificando status do Git..."
if ! git diff-index --quiet HEAD --; then
    print_warning "Existem mudanças não commitadas"
    if confirm "Deseja fazer commit agora?"; then
        read -p "Digite a mensagem do commit: " commit_msg
        git add -A
        git commit -m "$commit_msg" || print_error "Falha ao fazer commit"
        print_success "Commit realizado"
    else
        print_error "Por favor, faça commit das mudanças antes de fazer deploy"
    fi
fi

# Step 4: Push para GitHub
print_step "Verificando branch remota..."
if ! git ls-remote --heads origin $(git rev-parse --abbrev-ref HEAD) | grep -q .; then
    print_warning "Branch não foi feito push para GitHub"
    if confirm "Deseja fazer push agora?"; then
        git push -u origin $(git rev-parse --abbrev-ref HEAD)
        print_success "Push realizado"
    fi
else
    print_success "Branch atualizada no GitHub"
fi

# Step 5: Verificar variáveis de ambiente
print_step "Verificando variáveis de ambiente no .env..."
if [ ! -f "backend/.env" ]; then
    print_error "Arquivo backend/.env não encontrado"
fi

REQUIRED_VARS=(
    "DISCORD_CLIENT_ID"
    "DISCORD_CLIENT_SECRET"
    "DISCORD_CALLBACK_URL"
    "GITHUB_TOKEN"
    "GITHUB_OWNER"
    "GITHUB_REPO"
    "SESSION_SECRET"
)

missing_vars=()
for var in "${REQUIRED_VARS[@]}"; do
    if ! grep -q "^$var=" backend/.env; then
        missing_vars+=("$var")
    fi
done

if [ ${#missing_vars[@]} -gt 0 ]; then
    print_error "Variáveis de ambiente faltando: ${missing_vars[*]}"
fi
print_success "Todas as variáveis de ambiente estão configuradas"

# Step 6: Deploy de produção
print_step "Preparando para deploy..."
echo ""
echo -e "${BOLD}Informações do Deploy:${NC}"
echo "  • Repositório: $(git remote get-url origin)"
echo "  • Branch: $(git rev-parse --abbrev-ref HEAD)"
echo "  • Commit: $(git rev-parse --short HEAD)"
echo ""

if confirm "Tem certeza que deseja fazer deploy em PRODUÇÃO?"; then
    print_step "Iniciando deploy..."
    echo ""
    
    # Deploy produção
    vercel --prod --token "$VERCEL_TOKEN" 2>&1 || {
        print_warning "Deploy via CLI falhou. Tente fazer login manualmente."
        print_step "Execute: vercel --prod"
        exit 1
    }
    
    print_success "Deploy concluído com sucesso! 🎉"
else
    print_warning "Deploy cancelado"
    exit 1
fi

# Step 7: Instruções finais
echo ""
print_header "✅ PRÓXIMAS ETAPAS"
echo ""
echo -e "${BOLD}1. Verificar Deploy${NC}"
echo "   • Acesse a URL do seu projeto Vercel"
echo "   • Teste o botão de login Discord"
echo "   • Verifique se o admin panel funciona"
echo ""
echo -e "${BOLD}2. Validar Discord OAuth${NC}"
echo "   • Vá para Discord Developer Portal"
echo "   • Certifique-se que DISCORD_CALLBACK_URL em produção está correto"
echo "   • O URL deve ser: https://seu-projeto.vercel.app/auth/discord/callback"
echo ""
echo -e "${BOLD}3. Monitorar Logs${NC}"
echo "   • No painel Vercel, abra Deployments"
echo "   • Clique em 'Functions' para ver logs em tempo real"
echo ""
echo -e "${BOLD}4. Usar o Site${NC}"
echo "   • Compartilhe o link com usuários"
echo "   • Use o admin panel para gerenciar downloads"
echo ""
