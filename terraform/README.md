# Terraform Infrastructure cho Solbiz FRS Frontend

## Yêu cầu

1. **AWS CLI** đã được cài đặt và cấu hình
2. **Terraform** >= 1.0
3. **SSH Key Pair** đã tạo trong AWS

## Cấu hình

### Bước 1: Tạo SSH Key Pair

```bash
# Tạo SSH key pair
ssh-keygen -t rsa -b 4096 -f keys/id_rsa -N ""

# Upload public key lên AWS (hoặc tạo qua AWS Console)
aws ec2 import-key-pair --key-name "solbiz-frs-key" --public-key-material fileb://keys/id_rsa.pub
```

### Bước 2: Cấu hình Terraform

```bash
# Copy file cấu hình
cp terraform.tfvars.example terraform.tfvars

# Chỉnh sửa terraform.tfvars theo nhu cầu
nano terraform.tfvars
```

### Bước 3: Deploy Infrastructure

```bash
# Khởi tạo Terraform
terraform init

# Xem kế hoạch deploy
terraform plan

# Deploy infrastructure
terraform apply
```

### Bước 4: Deploy Application

```bash
# SSH vào EC2 instance
ssh -i keys/id_rsa ec2-user@<EC2_PUBLIC_IP>

# Clone repository
cd /home/ec2-user/app
git clone https://github.com/yourusername/solbiz.frs.fe.git .

# Cài đặt dependencies và build
npm install
npm run build

# Start application với PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

## Cấu trúc Infrastructure

- **VPC**: 10.0.0.0/16
- **Public Subnet**: 10.0.1.0/24
- **Security Group**: Mở ports 22, 80, 443, 3000
- **EC2 Instance**: t2.micro (Free tier)
- **Elastic IP**: IP tĩnh cho instance

## Monitoring và Logs

```bash
# Xem logs application
pm2 logs

# Xem status
pm2 status

# Restart application
pm2 restart solbiz-frs-fe

# Xem logs Nginx
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

## Cleanup

```bash
# Xóa toàn bộ infrastructure
terraform destroy
```

## Troubleshooting

### Lỗi thường gặp:

1. **SSH connection failed**: Kiểm tra Security Group và Key Pair
2. **Application không start**: Kiểm tra logs với `pm2 logs`
3. **Nginx 502 error**: Kiểm tra application có chạy trên port 3000 không
4. **Build failed**: Kiểm tra Node.js version và dependencies

### Commands hữu ích:

```bash
# Kiểm tra status services
sudo systemctl status nginx
pm2 status

# Restart services
sudo systemctl restart nginx
pm2 restart all

# Xem disk usage
df -h

# Xem memory usage
free -h

# Xem running processes
ps aux | grep node
```
