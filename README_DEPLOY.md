# 🚀 DEPLOY NEXT.JS LÊN AWS EC2 FREE TIER

## 📋 TỔNG QUAN

Dự án này được thiết lập để deploy Next.js lên AWS EC2 sử dụng **Free Tier** với **CI/CD pipeline hoàn chỉnh**.

### ✨ Tính năng:
- ✅ **AWS EC2 Free Tier** (miễn phí 12 tháng)
- ✅ **Terraform** quản lý infrastructure
- ✅ **GitHub Actions** CI/CD pipeline
- ✅ **Tự động deploy** khi push code
- ✅ **Zero-downtime deployment**
- ✅ **Health checks** và monitoring
- ✅ **Rollback** dễ dàng

---

## 🏗️ KIẾN TRÚC

```
GitHub Repository
       ↓
GitHub Actions (CI/CD)
       ↓
AWS EC2 (t2.micro)
       ↓
Nginx (Reverse Proxy)
       ↓
Next.js App (PM2)
```

---

## 🚀 HƯỚNG DẪN DEPLOY

### BƯỚC 1: DEPLOY INFRASTRUCTURE (15 phút)

**Infrastructure được deploy thủ công bằng Terraform để có control tốt hơn.**

Xem hướng dẫn chi tiết: [INFRASTRUCTURE_DEPLOY.md](./INFRASTRUCTURE_DEPLOY.md)

```bash
# 1. Cài đặt Terraform + AWS CLI
# 2. Cấu hình AWS credentials
# 3. Tạo SSH keys
# 4. Deploy infrastructure
cd terraform
terraform init
terraform plan
terraform apply
```

### BƯỚC 2: SETUP GITHUB CI/CD (3 phút)

#### 2.1 Cấu hình GitHub Secrets
Vào GitHub Repository → Settings → Secrets and variables → Actions

Thêm các secrets:
```
EC2_SSH_KEY: content của ~/.ssh/key_frx_fe.pem
```

### BƯỚC 3: DEPLOY APPLICATION (1 phút)

#### 3.1 Push code lên GitHub
```bash
git add .
git commit -m "Initial deployment setup"
git push origin main
```

#### 3.2 Xem GitHub Actions chạy
- Vào GitHub → Actions tab
- Xem workflow "Deploy Next.js to AWS EC2"
- Chờ deployment hoàn thành

#### 3.3 Truy cập ứng dụng
- URL sẽ hiển thị trong GitHub Actions logs
- Ví dụ: `http://54.123.45.67`

---

## 🔄 QUY TRÌNH CI/CD

### Infrastructure (Thủ công - 1 lần):
1. **Deploy Infrastructure** (15 phút)
   - Chạy Terraform plan/apply
   - Tạo EC2 instance
   - Cấu hình VPC, Security Groups

### Application (Tự động - mỗi khi push code):

1. **Build & Test** (2 phút)
   - Cài đặt dependencies
   - Chạy tests
   - Build Next.js app

2. **Deploy Application** (3 phút)
   - Upload build artifacts lên EC2
   - Cài đặt production dependencies
   - Restart ứng dụng với PM2

3. **Health Check** (1 phút)
   - Kiểm tra ứng dụng có hoạt động không
   - Hiển thị URL truy cập

### Tổng thời gian: ~6 phút (chỉ cho application)

---

## 🛠️ QUẢN LÝ VÀ BẢO TRÌ

### Xem logs ứng dụng
```bash
# SSH vào EC2
ssh -i terraform/keys/id_rsa ec2-user@[EC2_IP]

# Xem logs PM2
pm2 logs solbiz-frs-fe

# Xem logs Nginx
sudo tail -f /var/log/nginx/access.log
```

### Restart ứng dụng
```bash
# SSH vào EC2
ssh -i terraform/keys/id_rsa ec2-user@[EC2_IP]

# Restart với PM2
pm2 restart solbiz-frs-fe
```

### Update code
```bash
# Chỉ cần push code lên GitHub
git add .
git commit -m "Update feature"
git push origin main

# GitHub Actions sẽ tự động deploy
```

### Xóa infrastructure
```bash
# Vào GitHub → Actions → Infrastructure Management
# Chọn "destroy" và chạy workflow
```

---

## 📊 MONITORING

### GitHub Actions
- Vào GitHub → Actions để xem deployment history
- Xem logs chi tiết của từng bước

### EC2 Instance
- Vào AWS Console → EC2 để xem instance status
- Xem CloudWatch metrics

### Application
- Truy cập URL ứng dụng để kiểm tra
- Xem PM2 status: `pm2 status`

---

## 🆘 TROUBLESHOOTING

### Lỗi thường gặp:

#### 1. "Permission denied (publickey)"
```bash
# Kiểm tra quyền file key
chmod 600 terraform/keys/id_rsa
```

#### 2. "Connection refused"
- Kiểm tra Security Group có mở port 22, 80, 3000
- Kiểm tra EC2 instance có running không

#### 3. "Application không load"
```bash
# SSH vào EC2 và kiểm tra
pm2 status
pm2 logs
```

#### 4. "Build failed"
- Kiểm tra Node.js version trong package.json
- Xem logs trong GitHub Actions

### Debug commands:
```bash
# Kiểm tra PM2 processes
pm2 status

# Xem logs chi tiết
pm2 logs --lines 50

# Restart tất cả
pm2 restart all

# Kiểm tra port
netstat -tulpn | grep :3000
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

## 🎉 KẾT QUẢ

Sau khi hoàn thành, bạn sẽ có:

### ✅ Infrastructure
- EC2 t2.micro instance (Free Tier)
- VPC với public subnet
- Security Group mở ports cần thiết
- Elastic IP (IP tĩnh)

### ✅ Application
- Next.js app chạy trên port 3000
- Nginx reverse proxy trên port 80
- PM2 quản lý process
- Auto-restart khi reboot

### ✅ CI/CD
- Tự động deploy khi push code
- Zero-downtime deployment
- Health checks và monitoring
- Rollback dễ dàng

### ✅ Access
- **URL chính**: `http://[EC2_IP]`
- **URL trực tiếp**: `http://[EC2_IP]:3000`
- **SSH**: `ssh -i terraform/keys/id_rsa ec2-user@[EC2_IP]`

---

## 📞 HỖ TRỢ

Nếu gặp vấn đề:
1. Kiểm tra GitHub Actions logs
2. SSH vào EC2 và xem PM2 logs
3. Kiểm tra AWS Console → EC2
4. Xem troubleshooting section ở trên

**Chúc bạn deploy thành công! 🚀**
