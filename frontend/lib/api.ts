"use client";

import { useAuth } from "@clerk/nextjs";
import type {
  GitHubRepoSummary,
  JobStatusResponse,
  ScanJobResponse,
  ScanListItem,
  ScanReport,
  ViolationStatus,
} from "@/lib/types";

interface RequestOptions extends Omit<RequestInit, "headers"> {
  headers?: HeadersInit;
}

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
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

function getBackendBaseUrl() {
  const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

  if (!baseUrl) {
    throw new Error("NEXT_PUBLIC_BACKEND_URL is not configured.");
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
    throw new ApiError(payload?.error ?? `Request failed with status ${response.status}.`, response.status);
  }

  return (await response.json()) as T;
}

async function backendRequest<T>(
  path: string,
  getToken: () => Promise<string | null>,
  options: RequestOptions = {},
): Promise<T> {
  const token = await getToken();

  if (!token) {
    throw new Error("Missing Clerk session token.");
  }

  const url = `${getBackendBaseUrl()}${path}`;
  console.log("Vertoiz backend API fetch:", {
    url,
    hasClerkToken: Boolean(token),
  });

  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as
      | { error?: string }
      | null;

    console.log("Vertoiz backend API fetch failed:", {
      url,
      status: response.status,
      error: payload?.error ?? null,
    });

    throw new ApiError(
      payload?.error ?? `Request failed with status ${response.status}.`,
      response.status,
    );
  }

  const payload = (await response.json()) as T;
  console.log("Vertoiz backend API fetch succeeded:", { url });

  return payload;
}

export function useApiClient() {
  const { getToken } = useAuth();

  return {
    getScans: () => request<ScanListItem[]>("/api/scans", getToken),
    getScanReport: (scanId: string) =>
      request<ScanReport>(`/api/scans/${scanId}`, getToken),
    getApiToken: () =>
      request<{ token: string; createdAt: string | null }>("/api/auth/token", getToken),
    createApiToken: () =>
      request<{ token: string; createdAt: string }>("/api/auth/token", getToken, {
        method: "POST",
      }),
    getGitHubRepos: () =>
      backendRequest<{ repos: GitHubRepoSummary[] }>("/api/github/repos", getToken),
    createScanJob: (repo: { fullName: string; defaultBranch: string }) =>
      backendRequest<ScanJobResponse>("/api/jobs/scan", getToken, {
        method: "POST",
        body: JSON.stringify({
          repoFullName: repo.fullName,
          defaultBranch: repo.defaultBranch,
        }),
      }),
    getJobStatus: (jobId: string) =>
      backendRequest<JobStatusResponse>(`/api/jobs/${jobId}/status`, getToken),
    updateViolationStatus: (violationId: string, status: Extract<ViolationStatus, "approved" | "rejected">) =>
      request<{ id: string; status: string }>(`/api/scans/violations/${violationId}`, getToken, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      }),
  };
}
