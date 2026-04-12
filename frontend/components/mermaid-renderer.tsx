"use client";

import { useEffect, useId, useState } from "react";
import mermaid from "mermaid";
import { ErrorState } from "@/components/error-state";

let mermaidInitialized = false;

export function MermaidRenderer({ chart }: { chart: string }) {
  const chartId = useId().replace(/:/g, "");
  const [svg, setSvg] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!mermaidInitialized) {
      mermaid.initialize({
        startOnLoad: false,
        theme: "dark",
        securityLevel: "loose",
        themeVariables: {
          background: "#0a0a0a",
          primaryColor: "#111111",
          primaryBorderColor: "#222222",
          primaryTextColor: "#ffffff",
          lineColor: "#888888",
          secondaryColor: "#111111",
          tertiaryColor: "#111111",
          clusterBkg: "#111111",
          clusterBorder: "#222222",
          edgeLabelBackground: "#0a0a0a",
          tertiaryTextColor: "#ffffff",
          nodeTextColor: "#ffffff",
          fontFamily: "Inter, sans-serif",
        },
      });
      mermaidInitialized = true;
    }

    let active = true;

    mermaid
      .render(`vertoiz-${chartId}`, chart)
      .then((result) => {
        if (active) {
          setSvg(result.svg);
          setError(null);
        }
      })
      .catch((err: unknown) => {
        if (active) {
          setError(err instanceof Error ? err.message : "Failed to render Mermaid diagram.");
        }
      });

    return () => {
      active = false;
    };
  }, [chart, chartId]);

  if (error) {
    return (
      <ErrorState
        title="Mermaid diagram failed to render"
        description={error}
      />
    );
  }

  return <div className="overflow-x-auto [&_svg]:mx-auto [&_svg]:max-w-full" dangerouslySetInnerHTML={{ __html: svg }} />;
}
