"use client";

import { useState, type ReactNode } from "react";
import { useAuth } from "../lib/auth";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

export function AuthGate({ children }: { children: ReactNode }) {
  const { user, ready } = useAuth();

  if (!ready) {
    return <div className="auth-loading">Loading…</div>;
  }

  if (!user) {
    return <LoginScreen />;
  }

  if (user.role !== "ADMIN") {
    return <WrongRole role={user.role} />;
  }

  return (
    <div className="shell">
      <Sidebar />
      <div className="main">
        <Topbar />
        <main className="content">{children}</main>
      </div>
    </div>
  );
}

function LoginScreen() {
  const { requestOtp, verifyOtp } = useAuth();
  const [step, setStep] = useState<"mobile" | "otp">("mobile");
  const [mobile, setMobile] = useState("9000000001");
  const [code, setCode] = useState("");
  const [hint, setHint] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const send = async () => {
    setError(null);
    setBusy(true);
    try {
      const res = await requestOtp(mobile);
      setStep("otp");
      setHint(res.devCode ? `Demo code: ${res.devCode}` : null);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const verify = async () => {
    setError(null);
    setBusy(true);
    try {
      await verifyOtp(mobile, code);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="login-wrap">
      <div className="login-card">
        <div className="login-brand">
          <span className="brand-mark">AB</span>
          <div>
            <strong>AUTOBAT</strong>
            <small>Operations Portal</small>
          </div>
        </div>
        <h1>Sign in</h1>
        <p className="login-sub">Admin access via mobile OTP.</p>

        {step === "mobile" ? (
          <>
            <label className="field">
              <span>Mobile number</span>
              <input
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                inputMode="numeric"
                placeholder="10-digit mobile"
              />
            </label>
            <button className="btn btn-primary btn-block" onClick={send} disabled={busy}>
              {busy ? "Sending…" : "Send OTP"}
            </button>
          </>
        ) : (
          <>
            <label className="field">
              <span>Enter OTP</span>
              <input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                inputMode="numeric"
                placeholder="6-digit code"
                autoFocus
              />
            </label>
            {hint ? <p className="login-hint">{hint}</p> : null}
            <button className="btn btn-primary btn-block" onClick={verify} disabled={busy}>
              {busy ? "Verifying…" : "Verify & sign in"}
            </button>
            <button className="link-btn" onClick={() => setStep("mobile")}>
              Change number
            </button>
          </>
        )}
        {error ? <p className="login-error">{error}</p> : null}
      </div>
    </div>
  );
}

function WrongRole({ role }: { role: string }) {
  const { logout } = useAuth();
  return (
    <div className="login-wrap">
      <div className="login-card">
        <h1>No portal access</h1>
        <p className="login-sub">
          Your role is <strong>{role}</strong>. The web portal is for AutoBat
          admins. Please use the AutoBat mobile app.
        </p>
        <button className="btn btn-ghost btn-block" onClick={logout}>
          Sign in with a different account
        </button>
      </div>
    </div>
  );
}
