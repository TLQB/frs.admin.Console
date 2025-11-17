# 🏗️ DEPLOY INFRASTRUCTURE THỦ CÔNG

## 📋 TỔNG QUAN

Infrastructure (EC2, VPC, Security Groups) sẽ được deploy thủ công bằng Terraform để có control tốt hơn.

## 🚀 HƯỚNG DẪN DEPLOY INFRASTRUCTURE

### BƯỚC 1: CHUẨN BỊ (5 phút)

#### 1.1 Cài đặt Terraform
```bash
# Cài Terraform
wget https://releases.hashicorp.com/terraform/1.6.0/terraform_1.6.0_linux_amd64.zip
unzip terraform_1.6.0_linux_amd64.zip
sudo mv terraform /usr/local/bin/

# Kiểm tra
terraform --version
```

#### 1.2 Cấu hình AWS CLI
```bash
aws configure
# Nhập: Access Key, Secret Key, Region: ap-southeast-1
```

#### 1.3 Tạo SSH Keys (Thủ công)
```bash
# Tạo SSH key pair thủ công
ssh-keygen -t rsa -b 4096 -f ~/.ssh/key_frx_fe -N ""

# Upload lên AWS
aws ec2 import-key-pair --key-name "key_frx_fe" --public-key-material fileb://~/.ssh/key_frx_fe.pub
```

**Hoặc tạo qua AWS Console:**
1. Vào EC2 → Key Pairs → Create key pair
2. Name: `key_frx_fe`
3. Type: RSA
4. Download file `.pem`
5. Lưu vào `~/.ssh/key_frx_fe.pem`

### BƯỚC 2: DEPLOY INFRASTRUCTURE (10 phút)

#### 2.1 Cấu hình Terraform
```bash
cd terraform
cp terraform.tfvars.example terraform.tfvars

# Chỉnh sửa nếu cần (thường không cần)
nano terraform.tfvars
```

#### 2.2 Khởi tạo Terraform
```bash
terraform init
```

#### 2.3 Xem kế hoạch deploy
```bash
terraform plan
# Kiểm tra kỹ các resources sẽ được tạo
```

#### 2.4 Deploy infrastructure
```bash
terraform apply
# Nhập 'yes' khi được hỏi
```

#### 2.5 Lấy thông tin EC2
```bash
# Lấy IP của EC2
terraform output instance_public_ip

# Lấy SSH command
terraform output ssh_connection

# Lấy URL ứng dụng
terraform output app_url
```

### BƯỚC 3: KIỂM TRA INFRASTRUCTURE (2 phút)

#### 3.1 SSH vào EC2
```bash
ssh -i ~/.ssh/key_frx_fe.pem ec2-user@[EC2_IP]
```

#### 3.2 Kiểm tra services
```bash
# Kiểm tra Node.js
node --version

# Kiểm tra PM2
pm2 --version

# Kiểm tra Nginx
nginx -v

# Kiểm tra app directory
ls -la /home/ec2-user/app
```

#### 3.3 Kiểm tra placeholder app
```bash
# Truy cập từ browser
http://[EC2_IP]

# Hoặc từ terminal
curl http://[EC2_IP]
```

---

## 🔄 QUẢN LÝ INFRASTRUCTURE

### Xem trạng thái
```bash
cd terraform
terraform show
```

### Xem outputs
```bash
cd terraform
terraform output
```

### Update infrastructure
```bash
cd terraform
terraform plan
terraform apply
```

### Xóa infrastructure
```bash
cd terraform
terraform destroy
# Nhập 'yes' khi được hỏi
```

---

## 📊 INFRASTRUCTURE ĐƯỢC TẠO

### EC2 Instance
- **Type**: t2.micro (Free Tier)
- **OS**: Amazon Linux 2
- **Storage**: 30 GB EBS gp2
- **Security**: SSH key authentication

### VPC & Networking
- **VPC**: 10.0.0.0/16
- **Public Subnet**: 10.0.1.0/24
- **Internet Gateway**: Kết nối Internet
- **Route Table**: Routing cho public subnet

### Security Groups
- **SSH**: Port 22 (từ mọi nơi)
- **HTTP**: Port 80 (từ mọi nơi)
- **HTTPS**: Port 443 (từ mọi nơi)
- **App**: Port 3000 (từ mọi nơi)

### Elastic IP
- **IP tĩnh** cho EC2 instance
- **Không thay đổi** khi restart

---

## 🛠️ SERVICES ĐƯỢC CÀI ĐẶT

### Node.js 20
- Runtime cho Next.js app
- Cài đặt qua NodeSource repository

### PM2
- Process manager cho Node.js
- Auto-restart khi crash
- Zero-downtime deployment

### Nginx
- Reverse proxy
- Serve static files
- Load balancing (nếu cần)

### Git
- Clone source code
- Update application

---

## 🆘 TROUBLESHOOTING

### Lỗi "Permission denied (publickey)"
```bash
# Kiểm tra quyền file key
chmod 600 terraform/keys/id_rsa

# Kiểm tra key có đúng không
ssh-keygen -y -f terraform/keys/id_rsa
```

### Lỗi "Connection refused"
```bash
# Kiểm tra Security Group
aws ec2 describe-security-groups --group-ids [SG_ID]

# Kiểm tra EC2 status
aws ec2 describe-instances --instance-ids [INSTANCE_ID]
```

### Lỗi "Terraform state locked"
```bash
# Force unlock (cẩn thận!)
terraform force-unlock [LOCK_ID]
```

### Lỗi "Resource already exists"
```bash
# Import existing resource
terraform import aws_instance.web i-1234567890abcdef0

# Hoặc xóa resource cũ trước
```

---

## 💰 CHI PHÍ

### AWS Free Tier (12 tháng đầu):
- **EC2 t2.micro**: 750 giờ/tháng (miễn phí)
- **EBS Storage**: 30 GB (miễn phí)
- **Data Transfer**: 15 GB out (miễn phí)
- **Elastic IP**: 1 IP (miễn phí)

### Sau 12 tháng:
- **EC2 t2.micro**: ~$8-10/tháng
- **EBS Storage**: ~$3/tháng
- **Data Transfer**: ~$1-2/tháng

**Tổng chi phí sau 12 tháng: ~$12-15/tháng**

---

## 🎯 BƯỚC TIẾP THEO

Sau khi deploy infrastructure xong:

1. **Push code lên GitHub** để trigger CI/CD
2. **GitHub Actions** sẽ tự động deploy application
3. **Truy cập app** qua URL hiển thị

**Infrastructure chỉ cần deploy 1 lần, application sẽ tự động deploy mỗi khi push code!**
