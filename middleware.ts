export { auth as middleware } from "@/auth"

export const config = {
  // Protect all routes EXCEPT: auth page, api/auth, static files, and the landing page
  matcher: [
    "/dashboard/:path*",
    "/projects/:path*",
    "/settings/:path*",
  ],
}
