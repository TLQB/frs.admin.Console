import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
    console.log("=== Middleware Debug ===");
    console.log("Request URL:", request.url);
    console.log("Request pathname:", request.nextUrl.pathname);
    console.log("Cookies:", request.cookies.getAll());
    
    const accessToken = request.cookies.get("access_token")?.value;
    const refreshToken = request.cookies.get("refresh_token")?.value;

    console.log("Access Token:", accessToken);
    console.log("Refresh Token:", refreshToken);

    // Nếu đang ở trang signin và có token, chuyển về trang chủ
    if (request.nextUrl.pathname === "/signin") {
        if (accessToken && refreshToken) {
            return NextResponse.redirect(new URL("/", request.url));
        }
        return NextResponse.next();
    }

    // Nếu không có token và không phải ở trang signin, chuyển về trang signin
    if (!accessToken || !refreshToken) {
        return NextResponse.redirect(new URL("/signin", request.url));
    }

    return NextResponse.next();
}

// Áp dụng middleware cho tất cả các route
export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
};