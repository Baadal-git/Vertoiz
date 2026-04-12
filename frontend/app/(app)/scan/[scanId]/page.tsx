import { ScanReportView } from "@/components/scan-report-view";

export default function ScanReportPage({
  params,
}: {
  params: { scanId: string };
}) {
  return <ScanReportView scanId={params.scanId} />;
}
