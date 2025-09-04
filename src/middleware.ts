import { withAuth } from "next-auth/middleware"

export default withAuth(
  function middleware() {
    // Add any additional middleware logic here
  },
  {
    pages: {
      signIn: '/signin', // Must match NextAuth config
    },
    callbacks: {
      authorized: ({ token }) => !!token
    },
  }
)

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/groups/:path*',
    '/events/:path*',
    '/profile/:path*'
  ]
}