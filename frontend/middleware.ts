import { clerkMiddleware } from "@clerk/nextjs/server";

export const runtime = "nodejs";

export default clerkMiddleware(async (auth) => {
  await auth.protect();
});

export const config = {
  matcher: ["/dashboard(.*)", "/scan(.*)"],
};
