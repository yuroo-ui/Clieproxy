#!/bin/bash

###############################################################################
# CPA System + CLI Proxy API - Automated Setup Script
# Author: Kania
# Date: 2026-04-17
# Version: 1.0.0
#
# This script will:
# 1. Install Git, Docker, PostgreSQL, Node.js
# 2. Clone & setup CLI Proxy API
# 3. Deploy CPA System with Prisma database
# 4. Configure everything for production
#
# Usage: sudo ./setup-cpa-cliproxy.sh
###############################################################################

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
VPS_IP=""
CPA_USER="cpa_user"
CPA_PASS="cpa_password_$(openssl rand -hex 8)"
DB_NAME="cpa_db"
DB_USER="cpa_db_user"
DB_PASS="db_password_$(openssl rand -hex 8)"
JWT_SECRET="jwt_secret_$(openssl rand -hex 32)"
PROXY_SECRET="proxy_secret_$(openssl rand -hex 16)"

# Function to print colored messages
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to get user input
get_input() {
    local prompt="$1"
    local default="$2"
    local response

    if [ -n "$default" ]; then
        echo -n "${prompt} [$default]: "
        read response
        [ -z "$response" ] && response="$default"
    else
        echo -n "$prompt: "
        read response
    fi
    echo "$response"
}

# Check if running as root
check_root() {
    if [ "$EUID" -ne 0 ]; then
        log_error "Please run as root (sudo ./setup-cpa-cliproxy.sh)"
        exit 1
    fi
}

# Step 1: Update system & install dependencies
install_dependencies() {
    log_info "📦 Updating system and installing dependencies..."
    
    apt update
    apt install -y git curl wget nano htop telnet openssl
    
    log_success "✅ Dependencies installed"
}

# Step 2: Install Docker
install_docker() {
    log_info "🐳 Installing Docker..."
    
    bash <(curl -fsSL https://get.docker.com)
    systemctl start docker
    systemctl enable docker
    
    # Add current user to docker group (if not root)
    if [ "$EUID" -ne 0 ]; then
        usermod -aG docker $USER
    fi
    
    log_success "✅ Docker installed"
}

# Step 3: Install PostgreSQL
install_postgresql() {
    log_info "🗄️  Installing PostgreSQL..."
    
    apt install -y postgresql postgresql-contrib
    
    systemctl start postgresql
    systemctl enable postgresql
    
    # Create database and user
    log_info "Creating database and user..."
    sudo -u postgres psql <<EOF
CREATE DATABASE $DB_NAME;
CREATE USER $DB_USER WITH PASSWORD '$DB_PASS';
GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;
\q
EOF
    
    log_success "✅ PostgreSQL installed and configured"
}

# Step 4: Install Node.js
install_nodejs() {
    log_info "📦 Installing Node.js 18..."
    
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
    apt install -y nodejs
    
    log_success "✅ Node.js installed"
    log_info "Node.js version: $(node --version)"
    log_info "NPM version: $(npm --version)"
}

# Step 5: Clone & setup CLI Proxy API
setup_cliproxy() {
    log_info "🔗 Cloning CLI Proxy API..."
    
    cd /root
    git clone https://github.com/router-for-me/CLIProxyAPI.git
    cd CLIProxyAPI
    
    # Copy and edit config
    cp config.example.yml config.yaml
    
    log_info "Configuring CLI Proxy API..."
    
    # Backup original config
    cp config.yaml config.yaml.backup
    
    # Use sed to replace allow-remote and secret-key
    sed -i 's/allow-remote: .*/allow-remote: true/' config.yaml
    sed -i "s/secret-key: .*/secret-key: '$PROXY_SECRET'/" config.yaml
    
    log_success "✅ CLI Proxy API configured"
    log_info "Proxy Dashboard will be available at: http://<VPS-IP>:8317/management.html"
    log_info "Login password: $PROXY_SECRET"
}

# Step 6: Deploy CPA System
setup_cpa_system() {
    log_info "🚀 Deploying CPA System..."
    
    cd /root
    mkdir -p cpa-system
    cd cpa-system
    
    # Copy from workspace if available
    if [ -d "/root/.openclaw/workspace/cpa-system" ]; then
        cp -r /root/.openclaw/workspace/cpa-system/* ./
        log_success "✅ CPA System files copied from workspace"
    else
        log_warning "CPA System files not found in workspace!"
        log_info "Please manually copy files to /root/cpa-system/"
        return 1
    fi
    
    # Install dependencies
    log_info "Installing npm dependencies..."
    npm install
    
    log_success "✅ CPA System deployed"
}

# Step 7: Setup CPA Database & Environment
setup_cpa_database() {
    log_info "⚙️  Configuring CPA System database..."
    
    cd /root/cpa-system
    
    # Create .env file
    cat > .env << EOF
DATABASE_URL="postgresql://${DB_USER}:${DB_PASS}@localhost:5432/${DB_NAME}?schema=public"
JWT_SECRET="${JWT_SECRET}"
PORT=3000
PROXY_SECRET="${PROXY_SECRET}"
EOF
    
    # Initialize Prisma
    npm install -g prisma
    prisma init
    
    # Merge schema
    if [ -f "prisma/schema.prisma" ]; then
        log_info "Merging CPA schema with existing schema..."
        # Append CPA schema to existing schema
        tail -n +1 /root/cpa-system/schema.prisma >> prisma/schema.prisma
    else
        log_info "Creating new Prisma schema..."
        cp schema.prisma prisma/schema.prisma
    fi
    
    # Run migration
    log_info "Running database migration..."
    prisma migrate dev --name cpa_system
    
    # Seed pricing data
    log_info "Seeding LLM pricing data..."
    node scripts/seed-cpa-pricing.js
    
    log_success "✅ CPA System database configured"
}

# Step 8: Setup PM2 for production
setup_pm2() {
    log_info "🔧 Installing PM2 for production..."
    
    npm install -g pm2
    
    # Start CPA System
    cd /root/cpa-system
    pm2 start server.js --name cpa-system
    
    # Save PM2 config
    pm2 save
    pm2 startup
    
    log_success "✅ PM2 configured"
    log_info "CPA System will start automatically on boot"
}

# Step 9: Display summary
display_summary() {
    echo ""
    echo "====================================================================="
    echo "🎉 SETUP COMPLETE!"
    echo "====================================================================="
    echo ""
    echo "📊 Access URLs:"
    echo "   • CLI Proxy Dashboard:  http://<YOUR-VPS-IP>:8317/management.html"
    echo "   • CPA System API:       http://<YOUR-VPS-IP>:3000"
    echo "   • CPA System Admin:     http://<YOUR-VPS-IP>:3000/admin"
    echo ""
    echo "🔑 Credentials:"
    echo "   • CLI Proxy Password:   $PROXY_SECRET"
    echo "   • CPA System API Key:   (Generate in CLI Proxy dashboard)"
    echo ""
    echo "📁 Files Location:"
    echo "   • CLI Proxy:            /root/CLIProxyAPI/"
    echo "   • CPA System:           /root/cpa-system/"
    echo "   • Database:             PostgreSQL (cpa_db)"
    echo ""
    echo "📡 API Endpoints:"
    echo "   • GET  /api/cpa/wallet              - Check balance"
    echo "   • PUT  /api/cpa/wallet/deposit      - Add funds"
    echo "   • POST /api/cpa/calculate           - Estimate cost"
    echo "   • POST /api/cpa/charge              - Charge usage"
    echo "   • GET  /api/cpa/pricing             - View prices"
    echo "   • GET  /api/admin/cpa/users         - All users (admin)"
    echo "   • GET  /api/admin/cpa/reports       - Revenue reports"
    echo ""
    echo "💾 Database Info:"
    echo "   • Database:  $DB_NAME"
    echo "   • User:      $DB_USER"
    echo "   • Password:  $DB_PASS"
    echo ""
    echo "🔧 Management Commands:"
    echo "   • PM2 Status:       pm2 status"
    echo "   • CPA Logs:         pm2 logs cpa-system"
    echo "   • CLI Proxy Logs:   tail -f /root/CLIProxyAPI/logs/main.log"
    echo "   • Restart CPA:      pm2 restart cpa-system"
    echo "   • Stop CPA:         pm2 stop cpa-system"
    echo ""
    echo "📝 Next Steps:"
    echo "   1. Open http://<YOUR-VPS-IP>:8317/management.html"
    echo "   2. Login with password: $PROXY_SECRET"
    echo "   3. Add LLM API keys in 'AI Providers' tab"
    echo "   4. Configure CPA System routes"
    echo "   5. Test API endpoints"
    echo ""
    echo "====================================================================="
    echo "⚠️  SECURITY NOTE:"
    echo "   • Save these credentials safely!"
    echo "   • Change default passwords in production!"
    echo "   • Configure firewall (ufw) for ports 8317, 3000"
    echo "====================================================================="
    echo ""
}

# Main execution
main() {
    echo ""
    echo "====================================================================="
    echo "🚀 CPA System + CLI Proxy API - Automated Setup"
    echo "====================================================================="
    echo ""
    
    # Check root
    check_root
    
    # Ask for confirmation
    log_info "This script will install and configure:"
    log_info "  1. Git, Docker, PostgreSQL, Node.js"
    log_info "  2. CLI Proxy API"
    log_info "  3. CPA System"
    echo ""
    read -p "Continue? [y/N]: " confirm
    if [[ ! "$confirm" =~ ^[Yy]$ ]]; then
        log_info "Setup cancelled"
        exit 0
    fi
    
    # Run setup steps
    install_dependencies
    install_docker
    install_postgresql
    install_nodejs
    setup_cliproxy
    setup_cpa_system
    setup_cpa_database
    setup_pm2
    
    # Display summary
    display_summary
    
    log_success "✅ Setup completed successfully!"
    log_info "You can now:"
    log_info "  • Access CLI Proxy dashboard at :8317/management.html"
    log_info "  • Add LLM API keys"
    log_info "  • Start using CPA System"
}

# Run main function
main "$@"
