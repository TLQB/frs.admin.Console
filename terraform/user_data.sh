#!/bin/bash

# Update system
yum update -y

# Install essential tools
yum install -y git curl wget unzip

# Install Node.js 16 (compatible with Amazon Linux 2)
cd /tmp
wget https://nodejs.org/dist/v16.20.2/node-v16.20.2-linux-x64.tar.xz
tar -xf node-v16.20.2-linux-x64.tar.xz
mv node-v16.20.2-linux-x64 /opt/nodejs
ln -s /opt/nodejs/bin/node /usr/local/bin/node
ln -s /opt/nodejs/bin/npm /usr/local/bin/npm
ln -s /opt/nodejs/bin/npx /usr/local/bin/npx

# Install PM2 globally
npm install -g pm2

# Install Nginx
sudo amazon-linux-extras install nginx1 -y
sudo systemctl start nginx
sudo systemctl enable nginx

# Create application directory
mkdir -p /home/ec2-user/app
cd /home/ec2-user/app

# Create placeholder - will be replaced by CI/CD
cat > package.json << 'EOF'
{
  "name": "solbiz-frs-fe",
  "version": "1.0.0",
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start"
  },
  "dependencies": {
    "next": "^13.5.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  }
}
EOF

# Create placeholder app
mkdir -p pages
cat > pages/index.js << 'EOF'
export default function Home() {
  return (
    <div style={{ padding: '50px', textAlign: 'center' }}>
      <h1>🚀 Solbiz FRS Frontend</h1>
      <p>Application is being deployed via CI/CD...</p>
      <p>Please wait for the deployment to complete.</p>
    </div>
  )
}
EOF

# Create environment file
cat > .env.production << 'EOF'
NODE_ENV=production
NEXT_PUBLIC_API_URL=http://ec2-47-128-230-177.ap-southeast-1.compute.amazonaws.com/api
NEXT_PUBLIC_APP_URL=http://YOUR_EC2_IP:3000
EOF

# Configure Nginx
cat > /etc/nginx/conf.d/nextjs.conf << 'EOF'
server {
    listen 80;
    server_name _;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

# Test Nginx configuration
nginx -t

# Restart Nginx
systemctl restart nginx

# Create PM2 ecosystem file
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'solbiz-frs-fe',
    script: 'npm',
    args: 'start',
    cwd: '/home/ec2-user/app',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
};
EOF

# Set ownership
chown -R ec2-user:ec2-user /home/ec2-user/app

echo "Setup completed! EC2 is ready for CI/CD deployment."
