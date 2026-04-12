import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
export const runtime = 'nodejs'

const isProtectedRoute = createRouteMatcher(["/dashboard(.*)", "/scan(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: ["/((?!_next|.*\\..*).*)", "/"],
};
