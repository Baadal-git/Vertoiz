"use client";

import { useEffect, useState, type ComponentType } from "react";
import { AlertTriangle, FolderSearch, Github, ShieldAlert, TimerReset } from "lucide-react";
import { ErrorState } from "@/components/error-state";
import { LoadingState } from "@/components/loading-state";
import { NewScanDialog } from "@/components/new-scan-dialog";
import { RecentScansTable, type RecentScanRow } from "@/components/recent-scans-table";
import { FixProgressChart, ViolationsByCategoryChart } from "@/components/dashboard-charts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useApiClient } from "@/lib/api";
import { formatDateTime, summarizeDashboard } from "@/lib/dashboard";
import type { GitHubRepoSummary, ScanListItem, ScanReport } from "@/lib/types";
import { cn } from "@/lib/utils";

function StatCard({
  label,
  value,
  icon: Icon,
  valueClassName,
}: {
  label: string;
  value: number;
  icon: ComponentType<{ className?: string }>;
  valueClassName?: string;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardDescription className="text-sm">{label}</CardDescription>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className={cn("text-4xl font-semibold text-white", valueClassName)}>{value}</div>
      </CardContent>
    </Card>
  );
}

export function DashboardView() {
  const api = useApiClient();
  const [scanList, setScanList] = useState<ScanListItem[]>([]);
  const [reports, setReports] = useState<Record<string, ScanReport>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [githubConnected, setGithubConnected] = useState(false);
  const [showGitHubRepos, setShowGitHubRepos] = useState(false);
  const [githubRepos, setGithubRepos] = useState<GitHubRepoSummary[]>([]);
  const [selectedRepo, setSelectedRepo] = useState<{
    fullName: string;
    defaultBranch: string;
  } | null>(null);
  const [githubLoading, setGithubLoading] = useState(true);
  const [githubError, setGithubError] = useState<string | null>(null);

  async function load() {
    try {
      setLoading(true);
      setError(null);
      const scans = await api.getScans();
      setScanList(scans);

      const reportEntries = await Promise.all(
        scans.map(async (scan) => {
          try {
            const report = await api.getScanReport(scan.id);
            return [scan.id, report] as const;
          } catch {
            return [scan.id, null] as const;
          }
        }),
      );

      setReports(
        Object.fromEntries(
          reportEntries.filter((entry): entry is readonly [string, ScanReport] => entry[1] !== null),
        ),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load dashboard.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const returnedFromOAuth = params.get("github") === "connected";

    if (returnedFromOAuth) {
      setShowGitHubRepos(true);
    }

    async function loadGitHubConnection() {
      try {
        setGithubLoading(true);
        setGithubError(null);

        const data = await api.getGitHubRepos();
        console.log("Vertoiz GitHub repos loaded:", {
          count: data.repos.length,
        });
        setGithubRepos(data.repos);
        setGithubConnected(true);
        setShowGitHubRepos(true);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to load GitHub repositories.";
        console.log("Vertoiz GitHub repos load failed:", message);
        setGithubConnected(false);
        setGithubRepos([]);

        if (returnedFromOAuth) {
          setGithubError(message);
        }
      } finally {
        setGithubLoading(false);
      }
    }

    void loadGitHubConnection();
  }, []);

  if (loading) {
    return <LoadingState label="Loading scans and reports..." />;
  }

  if (error) {
    return (
      <ErrorState
        title="Dashboard failed to load"
        description={error}
        onRetry={() => {
          void load();
        }}
      />
    );
  }

  const summary = summarizeDashboard(scanList, reports);
  const rows: RecentScanRow[] = scanList.map((scan) => {
    const report = reports[scan.id];
    const counts = report
      ? {
          critical: report.violations.filter((violation) => violation.severity === "critical").length,
          high: report.violations.filter((violation) => violation.severity === "high").length,
          medium: report.violations.filter((violation) => violation.severity === "medium").length,
          low: report.violations.filter((violation) => violation.severity === "low").length,
        }
      : { critical: 0, high: 0, medium: 0, low: 0 };

    return {
      id: scan.id,
      project: scan.projectName,
    scannedAt: formatDateTime(scan.completedAt ?? scan.createdAt),
    status: scan.status,
      ...counts,
    };
  });

  return (
    <div className="space-y-6">
      <section className="grid gap-4 rounded-[32px] border border-border bg-card p-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
        <div>
          <p className="text-sm uppercase tracking-[0.28em] text-muted-foreground">Control center</p>
          <h1 className="mt-3 text-4xl font-semibold text-white">Scan architecture. Ship fixes faster.</h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground">
            Vertoiz pulls live scan reports from your backend, surfaces architectural and security violations, and keeps
            fix approvals in one place.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row lg:justify-end">
          {githubLoading && !showGitHubRepos ? (
            <div className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-border bg-[#111111] px-4 text-sm font-medium text-muted-foreground">
              <Github className="h-4 w-4" />
              Checking GitHub
            </div>
          ) : githubConnected ? (
            <div className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-[#2563EB]/40 bg-[#2563EB]/10 px-4 text-sm font-medium text-[#2563EB]">
              <Github className="h-4 w-4" />
              GitHub Connected
            </div>
          ) : (
            <Button asChild>
              <a href="/api/github/connect">
                <Github className="h-4 w-4" />
                Connect GitHub
              </a>
            </Button>
          )}
          <NewScanDialog />
        </div>
      </section>

      {showGitHubRepos ? (
        <Card>
          <CardHeader>
            <CardTitle>GitHub repository</CardTitle>
            <CardDescription>
              Choose a connected repository for your next Vertoiz scan.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {githubLoading ? (
              <p className="text-sm text-muted-foreground">Loading repositories...</p>
            ) : githubError ? (
              <p className="text-sm text-[#ef4444]">{githubError}</p>
            ) : (
              <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
                <select
                  className="h-11 rounded-xl border border-border bg-[#0a0a0a] px-4 text-sm text-white outline-none transition-colors focus:border-[#2563EB]"
                  value={selectedRepo?.fullName ?? ""}
                  onChange={(event) => {
                    const repo = githubRepos.find(
                      (item) => item.fullName === event.target.value,
                    );

                    setSelectedRepo(
                      repo
                        ? {
                            fullName: repo.fullName,
                            defaultBranch: repo.defaultBranch,
                          }
                        : null,
                    );
                  }}
                >
                  <option value="">Select a repository</option>
                  {githubRepos.map((repo) => (
                    <option key={repo.id} value={repo.fullName}>
                      {repo.fullName} ({repo.defaultBranch})
                    </option>
                  ))}
                </select>
                <p className="text-sm text-muted-foreground">
                  {selectedRepo
                    ? `${selectedRepo.fullName} · ${selectedRepo.defaultBranch}`
                    : `${githubRepos.length} repos available`}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      ) : null}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Critical Violations"
          value={summary.criticalViolations}
          icon={ShieldAlert}
          valueClassName="text-[#ef4444]"
        />
        <StatCard
          label="High Violations"
          value={summary.highViolations}
          icon={AlertTriangle}
          valueClassName="text-[#f97316]"
        />
        <StatCard
          label="Pending Approvals"
          value={summary.pendingApprovals}
          icon={TimerReset}
          valueClassName="text-[#eab308]"
        />
        <StatCard
          label="Projects Scanned"
          value={summary.projectsScanned}
          icon={FolderSearch}
          valueClassName="text-[#2563EB]"
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.6fr)_minmax(340px,1fr)]">
        <Card>
          <CardHeader>
            <CardTitle>Recent scans</CardTitle>
            <CardDescription>Live scan data from the authenticated API.</CardDescription>
          </CardHeader>
          <CardContent>
            <RecentScansTable scans={rows} />
          </CardContent>
        </Card>
        <FixProgressChart data={summary.fixProgress} />
      </section>

      <ViolationsByCategoryChart data={summary.categoryCounts} />
    </div>
  );
}
