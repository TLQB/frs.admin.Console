import cv2
import time
import requests
from datetime import datetime
import os
from silent_anti_spoofing import SilentAntiSpoofing

def capture_and_send():
    # Khởi tạo anti-spoofing detector
    anti_spoof = SilentAntiSpoofing()
    
    while True:
        try:
            # Khởi tạo webcam trong mỗi vòng lặp
            cap = cv2.VideoCapture(0)
            
            # Kiểm tra xem webcam có được mở thành công không
            if not cap.isOpened():
                print("Không thể mở webcam")
                time.sleep(5)
                continue
            
            # Chụp ảnh
            ret, frame = cap.read()
            
            # Giải phóng webcam ngay sau khi chụp
            cap.release()
            
            if not ret:
                print("Không thể chụp ảnh")
                time.sleep(5)
                continue
            
            # Tạo tên file với timestamp
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"capture_{timestamp}.jpg"
            print(f"Đang chụp ảnh: {filename}")
            
            # Lưu ảnh tạm thời
            cv2.imwrite(filename, frame)
            
            # Kiểm tra anti-spoofing
            spoof_result = anti_spoof.process_image(filename)
            
            if not spoof_result['face_detected']:
                print(f"Lỗi: {spoof_result['message']}")
                os.remove(filename)
                time.sleep(5)
                continue
                
            if spoof_result['is_spoof']:
                print(f"Phát hiện giả mạo! Độ tin cậy: {spoof_result['confidence']:.2f}")
                os.remove(filename)
                time.sleep(5)
                continue
            
            print(f"Khuôn mặt thật. Độ tin cậy: {spoof_result['confidence']:.2f}")
            
            # Gửi ảnh lên API
            url_api = "http://ec2-47-128-230-177.ap-southeast-1.compute.amazonaws.com/api/face-service/verify/"
            
            # Đảm bảo file tồn tại trước khi gửi
            if os.path.exists(filename):
                with open(filename, 'rb') as image_file:
                    files = {'image': image_file}
                    response = requests.post(url_api, files=files)
                
                # Kiểm tra kết quả gửi
                if response.status_code == 200:
                    print(f"Đã gửi ảnh thành công: {filename}")
                    print("Kết quả:", response.json())
                else:
                    print(f"Lỗi khi gửi ảnh: {response.status_code}")
                
                # Xóa file ảnh tạm sau khi gửi xong
                try:
                    os.remove(filename)
                    print(f"Đã xóa file tạm: {filename}")
                except Exception as e:
                    print(f"Không thể xóa file {filename}: {str(e)}")
            else:
                print(f"Không tìm thấy file {filename}")
            
            # Đợi 7 giây trước khi chụp ảnh tiếp theo
            time.sleep(7)
            
        except Exception as e:
            print(f"Có lỗi xảy ra: {str(e)}")
            time.sleep(5)  # Đợi 5 giây nếu có lỗi

if __name__ == "__main__":
    print("Bắt đầu chương trình chụp ảnh...")
    capture_and_send() 