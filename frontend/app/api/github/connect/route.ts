import { NextResponse } from "next/server";

function getBackendUrl() {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

  if (!backendUrl) {
    throw new Error("NEXT_PUBLIC_BACKEND_URL is not configured.");
  }

  return backendUrl.replace(/\/$/, "");
}

export function GET() {
  return NextResponse.redirect(`${getBackendUrl()}/api/github/connect`, 307);
}
