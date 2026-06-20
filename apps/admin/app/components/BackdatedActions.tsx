"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiMutate } from "../lib/auth";

export function BackdatedActions({ id }: { id: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState<null | "APPROVE" | "REJECT">(null);
  const [done, setDone] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const decide = async (decision: "APPROVE" | "REJECT") => {
    setBusy(decision);
    setError(null);
    try {
      await apiMutate(`/ops/backdated/${id}`, "PATCH", { decision });
      setDone(decision === "APPROVE" ? "Approved" : "Rejected");
      router.refresh();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(null);
    }
  };

  if (done) {
    return <span className="pill pill-ok">{done}</span>;
  }

  return (
    <div className="row-actions">
      <button
        type="button"
        className="btn btn-sm btn-primary"
        disabled={busy !== null}
        onClick={() => decide("APPROVE")}
      >
        {busy === "APPROVE" ? "…" : "Approve"}
      </button>
      <button
        type="button"
        className="btn btn-sm btn-ghost"
        disabled={busy !== null}
        onClick={() => decide("REJECT")}
      >
        {busy === "REJECT" ? "…" : "Reject"}
      </button>
      {error ? <span className="sla-flag">{error}</span> : null}
    </div>
  );
}
