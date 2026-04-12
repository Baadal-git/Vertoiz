"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ErrorState } from "@/components/error-state";
import { LoadingState } from "@/components/loading-state";
import { MermaidRenderer } from "@/components/mermaid-renderer";
import { useApiClient } from "@/lib/api";
import { formatDateTime } from "@/lib/dashboard";
import { severityOrder, severityTone } from "@/lib/scan";
import type { ScanReport, Violation } from "@/lib/types";

type ReviewStatus = "approved" | "rejected";

function SummaryCard({ title, summary }: { title: string; summary?: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm leading-7 text-muted-foreground">
          {summary ?? "Not available for this scan yet."}
        </p>
      </CardContent>
    </Card>
  );
}

function StageList({ title, items }: { title: string; items: unknown }) {
  const values = Array.isArray(items) ? items : [];

  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-white">{title}</h3>
      <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
        {values.length ? (
          values.map((item, index) => <li key={`${title}-${index}`}>• {String(item)}</li>)
        ) : (
          <li>• No plan details returned by the API.</li>
        )}
      </ul>
    </div>
  );
}

function ViolationCard({
  violation,
  onUpdate,
  pending,
}: {
  violation: Violation;
  onUpdate: (id: string, status: ReviewStatus) => void;
  pending: boolean;
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <CardTitle>{violation.title}</CardTitle>
            <CardDescription className="mt-2">
              {violation.description}
            </CardDescription>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge className={severityTone(violation.severity)}>{violation.severity}</Badge>
            <Badge>{violation.status}</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid gap-4 lg:grid-cols-2">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Location</p>
            <p className="mt-2 text-sm text-white">{violation.location ?? "Unknown"}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Fix description</p>
            <p className="mt-2 text-sm text-white">{violation.fixDescription}</p>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-background p-4">
          <p className="mb-3 text-xs uppercase tracking-[0.2em] text-muted-foreground">Fix code</p>
          <pre className="overflow-x-auto whitespace-pre-wrap font-mono text-sm text-white">
            <code>{violation.fixCode ?? "// No code diff returned for this violation."}</code>
          </pre>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button
            disabled={pending || violation.status === "approved"}
            onClick={() => onUpdate(violation.id, "approved")}
          >
            Approve Fix
          </Button>
          <Button
            variant="destructive"
            disabled={pending || violation.status === "rejected"}
            onClick={() => onUpdate(violation.id, "rejected")}
          >
            Reject
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export function ScanReportView({ scanId }: { scanId: string }) {
  const api = useApiClient();
  const [report, setReport] = useState<ScanReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  async function load() {
    try {
      setLoading(true);
      setError(null);
      const nextReport = await api.getScanReport(scanId);
      setReport(nextReport);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load scan report.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, [scanId]);

  const groupedViolations = useMemo(() => {
    if (!report) return [];

    return [...report.violations].sort(
      (a, b) => severityOrder[a.severity] - severityOrder[b.severity],
    );
  }, [report]);

  function handleStatusUpdate(id: string, status: ReviewStatus) {
    startTransition(() => {
      void api
        .updateViolationStatus(id, status)
        .then(() => load())
        .catch((err) => {
          setError(err instanceof Error ? err.message : "Failed to update violation.");
        });
    });
  }

  if (loading) {
    return <LoadingState label="Loading scan report..." />;
  }

  if (error || !report) {
    return (
      <ErrorState
        title="Scan report failed to load"
        description={error ?? "The requested scan report was not returned by the API."}
        onRetry={() => {
          void load();
        }}
      />
    );
  }

  const bottlenecks = Array.isArray(report.scalingPlan?.currentBottlenecks)
    ? report.scalingPlan.currentBottlenecks
    : [];

  return (
    <div className="space-y-6">
      <section className="rounded-[32px] border border-border bg-card p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-[#2563EB]">Scan report</p>
            <h1 className="mt-2 text-4xl font-semibold text-white">Report {scanId}</h1>
            <p className="mt-3 text-sm text-muted-foreground">
              Status: {report.scan.status} • Created {formatDateTime(report.scan.createdAt)}
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        <SummaryCard title="Architecture Summary" summary={report.blueprint?.architectureSummary} />
        <SummaryCard title="Security Summary" summary={report.blueprint?.securitySummary} />
        <SummaryCard title="Scaling Summary" summary={report.blueprint?.scalingSummary} />
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-2xl font-semibold text-white">Violations</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Ordered by severity so critical fixes are always reviewed first.
          </p>
        </div>
        <div className="space-y-4">
          {groupedViolations.length ? (
            groupedViolations.map((violation) => (
              <ViolationCard
                key={violation.id}
                violation={violation}
                onUpdate={handleStatusUpdate}
                pending={isPending}
              />
            ))
          ) : (
            <Card>
              <CardContent className="py-10 text-center text-sm text-muted-foreground">
                This scan has no violations yet.
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.3fr)_minmax(320px,1fr)]">
        <Card>
          <CardHeader>
            <CardTitle>Scaling Plan</CardTitle>
            <CardDescription>
              Current bottlenecks and staged recommendations from the scan engine.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-2xl border border-border bg-card p-4">
              <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-white">Current bottlenecks</h3>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                {bottlenecks.length ? (
                  bottlenecks.map((item, index) => <li key={`bottleneck-${index}`}>• {String(item)}</li>)
                ) : (
                  <li>• No bottlenecks returned by the API.</li>
                )}
              </ul>
            </div>
            <div className="grid gap-4 lg:grid-cols-3">
              <StageList title="100 users" items={report.scalingPlan?.plan100Users} />
              <StageList title="10k users" items={report.scalingPlan?.plan10kUsers} />
              <StageList title="100k users" items={report.scalingPlan?.plan100kUsers} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Architecture Diagram</CardTitle>
            <CardDescription>Rendered from the Mermaid blueprint stored with the scan.</CardDescription>
          </CardHeader>
          <CardContent>
            {report.blueprint?.mermaidDiagram ? (
              <MermaidRenderer chart={report.blueprint.mermaidDiagram} />
            ) : (
              <p className="text-sm text-muted-foreground">No Mermaid diagram is available for this scan.</p>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
