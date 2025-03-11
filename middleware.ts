import { getToken } from "next-auth/jwt"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request })
  
  if (!token) {
    if (request.nextUrl.pathname.startsWith("/auth")) {
      return NextResponse.next()
    }
    
    return NextResponse.redirect(new URL("/auth/signin", request.url))
  }

  if (request.nextUrl.pathname.startsWith("/auth")) {
    return NextResponse.redirect(new URL("/", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"]
} 