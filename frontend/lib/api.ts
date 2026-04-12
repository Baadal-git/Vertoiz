"use client";

import { useAuth } from "@clerk/nextjs";
import type { ScanListItem, ScanReport, ViolationStatus } from "@/lib/types";

interface RequestOptions extends Omit<RequestInit, "headers"> {
  headers?: HeadersInit;
}

function getApiBaseUrl() {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;

  if (!baseUrl) {
    throw new Error("NEXT_PUBLIC_API_URL is not configured.");
  }

  const url = new URL(baseUrl);
  url.pathname = url.pathname.replace(/\/+$/, "");

  if (url.pathname.endsWith("/api")) {
    url.pathname = url.pathname.slice(0, -4);
  }

  return url.toString().replace(/\/$/, "");
}

async function request<T>(
  path: string,
  getToken: () => Promise<string | null>,
  options: RequestOptions = {},
): Promise<T> {
  const token = await getToken();

  if (!token) {
    throw new Error("Missing Clerk session token.");
  }

  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(payload?.error ?? `Request failed with status ${response.status}.`);
  }

  return (await response.json()) as T;
}

export function useApiClient() {
  const { getToken } = useAuth();

  return {
    getScans: () => request<ScanListItem[]>("/api/scans", getToken),
    getScanReport: (scanId: string) =>
      request<ScanReport>(`/api/scans/${scanId}`, getToken),
    createApiToken: () =>
      request<{ token: string }>("/api/auth/token", getToken, {
        method: "POST",
      }),
    updateViolationStatus: (violationId: string, status: Extract<ViolationStatus, "approved" | "rejected">) =>
      request<{ id: string; status: string }>(`/api/scans/violations/${violationId}`, getToken, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      }),
  };
}
