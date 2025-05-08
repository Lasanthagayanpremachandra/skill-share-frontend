import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  // We'll handle authentication client-side since we're using a separate backend
  // No need for server-side middleware authentication checks
  return NextResponse.next()
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    // We'll keep the matchers for potential future use, but the middleware won't block access
    "/dashboard/:path*",
    "/learning-plans/:path*",
    "/profile/:path*",
    "/notifications/:path*",
    "/explore/:path*",
    "/auth/:path*",
  ],
}
