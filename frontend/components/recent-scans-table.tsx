import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export interface RecentScanRow {
  id: string;
  project: string;
  scannedAt: string;
  critical: number;
  high: number;
  medium: number;
  low: number;
  status: string;
}

function statusTone(status: string) {
  if (status === "failed") return "border-border text-white";
  return "border-border text-muted-foreground";
}

export function RecentScansTable({ scans }: { scans: RecentScanRow[] }) {
  return (
    <div className="rounded-3xl border border-border bg-card p-2">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Project</TableHead>
            <TableHead>Scanned At</TableHead>
            <TableHead>Critical</TableHead>
            <TableHead>High</TableHead>
            <TableHead>Medium</TableHead>
            <TableHead>Low</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {scans.map((scan) => (
            <TableRow key={scan.id}>
              <TableCell className="font-medium text-white">{scan.project}</TableCell>
              <TableCell className="text-muted-foreground">{scan.scannedAt}</TableCell>
              <TableCell className="text-[#ef4444]">{scan.critical}</TableCell>
              <TableCell className="text-[#f97316]">{scan.high}</TableCell>
              <TableCell className="text-[#eab308]">{scan.medium}</TableCell>
              <TableCell className="text-[#888888]">{scan.low}</TableCell>
              <TableCell>
                <Badge className={statusTone(scan.status)}>{scan.status}</Badge>
              </TableCell>
              <TableCell className="text-right">
                <Button asChild size="sm">
                  <Link href={`/scan/${scan.id}`}>
                    View Report
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
