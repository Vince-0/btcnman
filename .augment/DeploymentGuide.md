# Bitcoin Node Manager - Deployment Guide

This guide provides detailed instructions for deploying the Bitcoin Node Manager application on a Debian/Ubuntu Linux server using Apache as the web server and Node.js for the backend.

## Prerequisites

Before beginning the deployment process, ensure the following prerequisites are met:

### System Requirements
- Debian 11+ or Ubuntu 20.04+ server
- Minimum 2GB RAM
- At least 20GB free disk space
- Root or sudo access

### Required Software
- Node.js 18.x LTS or newer
- npm 8.x or newer
- Apache 2.4 or newer
- SQLite 3
- Certbot (for Let's Encrypt SSL)
- PM2 (for Node.js process management)

## Installation Steps

### 1. Update System Packages

```bash
sudo apt update
sudo apt upgrade -y
```

### 2. Install Required Dependencies

```bash
# Install Node.js and npm
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install Apache
sudo apt install -y apache2

# Install SQLite
sudo apt install -y sqlite3

# Install Certbot for Let's Encrypt
sudo apt install -y certbot python3-certbot-apache

# Install PM2 globally
sudo npm install -g pm2
```

### 3. Configure Firewall

```bash
# Allow SSH, HTTP, and HTTPS
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

### 4. Create Application Directory

```bash
# Create application directory
sudo mkdir -p /var/www/bitcoin-node-manager
sudo chown $USER:$USER /var/www/bitcoin-node-manager
```

### 5. Deploy Application Code

#### Option 1: Clone from Git Repository

```bash
# Clone repository
git clone https://github.com/yourusername/bitcoin-node-manager.git /var/www/bitcoin-node-manager
cd /var/www/bitcoin-node-manager
```

#### Option 2: Upload Pre-built Application

```bash
# Upload files to server
scp -r ./build/* user@your-server:/var/www/bitcoin-node-manager/
```

### 6. Install Application Dependencies

```bash
# Install backend dependencies
cd /var/www/bitcoin-node-manager/backend
npm install --production

# Install frontend dependencies (if building on server)
cd /var/www/bitcoin-node-manager/frontend
npm install --production
```

### 7. Build Frontend (if not pre-built)

```bash
cd /var/www/bitcoin-node-manager/frontend
npm run build
```

### 8. Configure Environment Variables

Create a `.env` file in the backend directory:

```bash
cd /var/www/bitcoin-node-manager/backend
cat > .env << EOF
# Application settings
NODE_ENV=production
PORT=3000
FRONTEND_URL=https://your-domain.com

# JWT settings
JWT_SECRET=your-secure-random-string
JWT_EXPIRATION=24h

# Bitcoin Core RPC settings
BITCOIN_RPC_HOST=127.0.0.1
BITCOIN_RPC_PORT=8332
BITCOIN_RPC_USER=your-rpc-username
BITCOIN_RPC_PASSWORD=your-rpc-password

# Database settings
DATABASE_URL=file:/var/www/bitcoin-node-manager/data/database.sqlite
EOF

# Set proper permissions
chmod 600 .env
```

### 9. Initialize Database

```bash
# Create data directory
mkdir -p /var/www/bitcoin-node-manager/data
chmod 750 /var/www/bitcoin-node-manager/data

# Run database migrations
cd /var/www/bitcoin-node-manager/backend
npx prisma migrate deploy
```

### 10. Set Up PM2 for Process Management

```bash
cd /var/www/bitcoin-node-manager/backend

# Start application with PM2
pm2 start server.js --name "bitcoin-node-manager"

# Save PM2 configuration
pm2 save

# Set up PM2 to start on boot
pm2 startup
# Follow the instructions provided by the above command
```

### 11. Configure Apache Virtual Host

Create a new Apache virtual host configuration:

```bash
sudo nano /etc/apache2/sites-available/bitcoin-node-manager.conf
```

Add the following configuration:

```apache
<VirtualHost *:80>
    ServerName your-domain.com
    ServerAdmin webmaster@your-domain.com
    DocumentRoot /var/www/bitcoin-node-manager/frontend/build

    # Frontend static files
    <Directory /var/www/bitcoin-node-manager/frontend/build>
        Options -Indexes +FollowSymLinks
        AllowOverride All
        Require all granted
    </Directory>

    # Protect data directory
    <Directory /var/www/bitcoin-node-manager/data>
        Options -Indexes -FollowSymLinks
        AllowOverride None
        Require all denied
    </Directory>

    # Proxy API requests to Node.js backend
    ProxyRequests Off
    ProxyPreserveHost On
    ProxyVia Full

    <Location /api>
        ProxyPass http://127.0.0.1:3000/api
        ProxyPassReverse http://127.0.0.1:3000/api
    </Location>

    # Proxy WebSocket connections
    <Location /socket.io>
        ProxyPass ws://127.0.0.1:3000/socket.io
        ProxyPassReverse ws://127.0.0.1:3000/socket.io
    </Location>

    # Logging
    ErrorLog ${APACHE_LOG_DIR}/bitcoin-node-manager-error.log
    CustomLog ${APACHE_LOG_DIR}/bitcoin-node-manager-access.log combined
</VirtualHost>
```

### 12. Enable Required Apache Modules

```bash
sudo a2enmod proxy proxy_http proxy_wstunnel rewrite ssl headers
sudo systemctl restart apache2
```

### 13. Enable the Virtual Host

```bash
sudo a2ensite bitcoin-node-manager.conf
sudo systemctl reload apache2
```

### 14. Set Up SSL with Let's Encrypt

```bash
sudo certbot --apache -d your-domain.com
```

Follow the prompts to complete the SSL certificate setup.

### 15. Set Up Automatic SSL Renewal

Certbot creates a systemd timer by default, but you can verify it:

```bash
sudo systemctl status certbot.timer
```

### 16. Set Up Database Backup

Create a backup script:

```bash
sudo nano /usr/local/bin/backup-bnm-db.sh
```

Add the following content:

```bash
#!/bin/bash
TIMESTAMP=$(date +"%Y%m%d-%H%M%S")
BACKUP_DIR="/var/backups/bitcoin-node-manager"
DB_FILE="/var/www/bitcoin-node-manager/data/database.sqlite"

# Create backup directory if it doesn't exist
mkdir -p $BACKUP_DIR

# Create backup
sqlite3 $DB_FILE ".backup '$BACKUP_DIR/database-$TIMESTAMP.sqlite'"

# Compress backup
gzip "$BACKUP_DIR/database-$TIMESTAMP.sqlite"

# Keep only the last 7 backups
find $BACKUP_DIR -name "database-*.sqlite.gz" -type f -mtime +7 -delete
```

Make the script executable:

```bash
sudo chmod +x /usr/local/bin/backup-bnm-db.sh
```

Set up a daily cron job:

```bash
sudo crontab -e
```

Add the following line:

```
0 2 * * * /usr/local/bin/backup-bnm-db.sh
```

## Post-Installation Steps

### 1. Create Initial Admin User

```bash
cd /var/www/bitcoin-node-manager/backend
node scripts/create-admin-user.js
```

Follow the prompts to create an admin user.

### 2. Verify Installation

Open your browser and navigate to `https://your-domain.com`. You should see the Bitcoin Node Manager login page.

### 3. Configure Bitcoin Core

Ensure your Bitcoin Core node has the following settings in `bitcoin.conf`:

```
# RPC settings
server=1
rpcuser=your-rpc-username
rpcpassword=your-rpc-password
rpcallowip=127.0.0.1
```

Restart Bitcoin Core after making changes:

```bash
bitcoin-cli stop
bitcoind
```

## Maintenance and Updates

### Updating the Application

```bash
# Navigate to application directory
cd /var/www/bitcoin-node-manager

# Pull latest changes
git pull

# Update backend dependencies
cd backend
npm install --production

# Run database migrations
npx prisma migrate deploy

# Update frontend dependencies and rebuild
cd ../frontend
npm install --production
npm run build

# Restart the application
pm2 restart bitcoin-node-manager
```

### Monitoring the Application

```bash
# Check application status
pm2 status

# View application logs
pm2 logs bitcoin-node-manager

# Monitor application
pm2 monit
```

### Database Maintenance

```bash
# Backup database manually
/usr/local/bin/backup-bnm-db.sh

# Restore database from backup
gunzip -c /var/backups/bitcoin-node-manager/database-TIMESTAMP.sqlite.gz > /tmp/restored-db.sqlite
sqlite3 /var/www/bitcoin-node-manager/data/database.sqlite ".restore '/tmp/restored-db.sqlite'"
rm /tmp/restored-db.sqlite
```

## Troubleshooting

### Node.js Backend Issues

1. **Backend not starting:**
   ```bash
   # Check logs
   pm2 logs bitcoin-node-manager
   
   # Verify environment variables
   cat /var/www/bitcoin-node-manager/backend/.env
   
   # Restart the application
   pm2 restart bitcoin-node-manager
   ```

2. **Database connection issues:**
   ```bash
   # Check database file permissions
   ls -la /var/www/bitcoin-node-manager/data/
   
   # Verify database file exists
   file /var/www/bitcoin-node-manager/data/database.sqlite
   ```

### Apache Issues

1. **Apache not serving the application:**
   ```bash
   # Check Apache error logs
   sudo tail -f /var/log/apache2/bitcoin-node-manager-error.log
   
   # Verify Apache configuration
   sudo apachectl configtest
   
   # Restart Apache
   sudo systemctl restart apache2
   ```

2. **SSL certificate issues:**
   ```bash
   # Check SSL certificate status
   sudo certbot certificates
   
   # Renew certificates manually
   sudo certbot renew --dry-run
   ```

### Bitcoin Core Connection Issues

1. **Cannot connect to Bitcoin Core:**
   ```bash
   # Check if Bitcoin Core is running
   bitcoin-cli getnetworkinfo
   
   # Verify RPC credentials
   grep rpcuser ~/.bitcoin/bitcoin.conf
   grep rpcpassword ~/.bitcoin/bitcoin.conf
   
   # Check if RPC port is open
   ss -tulpn | grep 8332
   ```

## Security Recommendations

1. **Firewall Configuration:**
   - Only allow necessary ports (SSH, HTTP, HTTPS)
   - Consider using fail2ban to protect against brute force attacks

2. **Regular Updates:**
   ```bash
   sudo apt update
   sudo apt upgrade
   ```

3. **Secure Apache Configuration:**
   - Implement HTTP Strict Transport Security (HSTS)
   - Configure Content Security Policy
   - Enable XSS protection headers

4. **File Permissions:**
   - Ensure sensitive files have restricted permissions
   - Regularly audit file permissions

5. **Backup Strategy:**
   - Regularly backup the database
   - Consider off-site backups for critical data

## Conclusion

This deployment guide provides a comprehensive approach to deploying Bitcoin Node Manager on a Debian/Ubuntu server with Apache and Node.js. By following these steps, you'll have a secure, production-ready installation that can be easily maintained and updated.

For additional support or questions, refer to the project documentation or contact the development team.
