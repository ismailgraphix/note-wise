import { withAuth } from "next-auth/middleware"

export default withAuth({
  callbacks: {
    authorized: ({ req, token }) => {
      const pathname = req.nextUrl.pathname
      
      // Protect API routes
      if (pathname.startsWith('/api')) {
        return !!token // require authentication for all API routes
      }

      // Allow public access to auth pages
      if (pathname.startsWith('/auth')) {
        return true
      }

      // Require authentication for all other pages
      return !!token
    }
  }
})

export const config = {
  matcher: [
    '/api/:path*',
    '/((?!auth/.*|_next/static|_next/image|favicon.ico).*)',
  ]
} 