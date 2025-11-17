import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
    const accessToken = request.cookies.get("accessToken")?.value;
    const refreshToken = request.cookies.get("refreshToken")?.value;

    // Check if both tokens exist
    if (!accessToken || !refreshToken) {
        // If no token, redirect to login page
        return NextResponse.redirect(new URL("/signin", request.url));
    }

    // If token exists, continue request
    return NextResponse.next();
}

// Apply middleware to specific routes
export const config = {
    matcher: ["/", "/admins", "/users"], // Apply to home page (can add more routes)
};