output "instance_public_ip" {
  description = "Public IP address of the EC2 instance"
  value       = aws_eip.web.public_ip
}

output "instance_public_dns" {
  description = "Public DNS name of the EC2 instance"
  value       = aws_instance.web.public_dns
}

output "ssh_connection" {
  description = "SSH connection command"
  value       = "ssh -i ~/.ssh/key_frx_fe.pem ec2-user@${aws_eip.web.public_ip}"
}

output "app_url" {
  description = "Application URL"
  value       = "http://${aws_eip.web.public_ip}:3000"
}

output "nginx_url" {
  description = "Application URL through Nginx"
  value       = "http://${aws_eip.web.public_ip}"
}
