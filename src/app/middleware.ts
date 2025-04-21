import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
    const accessToken = request.cookies.get("accessToken")?.value;
    const refreshToken = request.cookies.get("refreshToken")?.value;

    // Kiểm tra xem cả 2 token có tồn tại hay không
    if (!accessToken || !refreshToken) {
        // Nếu không có token, chuyển hướng về trang đăng nhập
        return NextResponse.redirect(new URL("/signin", request.url));
    }

    // Nếu có token, tiếp tục request
    return NextResponse.next();
}

// Áp dụng middleware cho route cụ thể
export const config = {
    matcher: ["/", "/admins", "/users"], // Áp dụng cho trang chủ (có thể thêm các route khác)
};