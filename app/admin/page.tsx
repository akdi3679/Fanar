"use client";
import { useState, useEffect } from "react";
import { Lock, Eye, EyeOff, Shield, Mail, Globe, Users, AlertTriangle, Clock, LogOut, Inbox } from "lucide-react";

const MAX_ATTEMPTS = 5;
const LOCK_MS = 5 * 60 * 1000;
const LS_KEY = "fanar_admin_lockout";

type Brief = any;
type Visitor = any;

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [checking, setChecking] = useState(true);
  const [code, setCode] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [attemptsLeft, setAttemptsLeft] = useState(MAX_ATTEMPTS);
  const [lockedUntil, setLockedUntil] = useState(0);
  const [now, setNow] = useState(() => Date.now());
  const [briefs, setBriefs] = useState<Brief[]>([]);
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [loading, setLoading] = useState(false);

  // ticking clock for countdown
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  // restore lockout from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) {
        const p = JSON.parse(raw);
        if (p.lockedUntil > Date.now()) setLockedUntil(p.lockedUntil);
        setAttemptsLeft(p.attemptsLeft ?? MAX_ATTEMPTS);
      }
    } catch {}
  }, []);

  const saveLockout = (attemptsLeft: number, lockedUntil: number) => {
    try { localStorage.setItem(LS_KEY, JSON.stringify({ attemptsLeft, lockedUntil })); } catch {}
  };

  const loadData = async () => {
    try {
      const res = await fetch("/api/admin/data");
      if (res.ok) {
        const json = await res.json();
        setBriefs(json.briefs || []);
        setVisitors(json.visitors || []);
        setAuthed(true);
        return true;
      }
    } catch {}
    return false;
  };

  // check existing session on mount
  useEffect(() => {
    (async () => {
      await loadData();
      setChecking(false);
    })();
  }, []);

  const isLocked = lockedUntil > now;
  const lockSecs = Math.max(0, Math.ceil((lockedUntil - now) / 1000));
  const lockMin = Math.floor(lockSecs / 60);
  const lockSec = lockSecs % 60;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLocked || loading) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      if (res.ok) {
        localStorage.removeItem(LS_KEY);
        setAttemptsLeft(MAX_ATTEMPTS);
        setLockedUntil(0);
        await loadData();
      } else if (res.status === 429) {
        const j = await res.json().catch(() => ({}));
        const lu = Date.now() + (j.retryAfter || 300) * 1000;
        setLockedUntil(lu);
        setAttemptsLeft(0);
        saveLockout(MAX_ATTEMPTS, lu);
        setError(j.error || "Too many attempts. Access blocked.");
      } else {
        const j = await res.json().catch(() => ({}));
        const left = j.attemptsLeft ?? Math.max(0, attemptsLeft - 1);
        setAttemptsLeft(left);
        if (left <= 0) {
          const lu = Date.now() + LOCK_MS;
          setLockedUntil(lu);
          saveLockout(MAX_ATTEMPTS, lu);
          setError("Too many attempts. Access blocked for 5 minutes.");
        } else {
          saveLockout(left, 0);
          setError(`Wrong code. ${left} attempt${left === 1 ? "" : "s"} left.`);
        }
      }
    } catch {
      setError("Network error. Try again.");
    } finally {
      setLoading(false);
      setCode("");
    }
  };

  const logout = async () => {
    await fetch("/api/admin/logout", { method: "POST" }).catch(() => {});
    setAuthed(false);
    setBriefs([]);
    setVisitors([]);
  };

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-slate-400">Checking…</p>
      </div>
    );
  }

  // ---- DASHBOARD ----
  if (authed) {
    const byCountry = visitors.reduce((acc: Record<string, number>, v) => {
      acc[v.country || "?"] = (acc[v.country || "?"] || 0) + 1;
      return acc;
    }, {});
    const topCountries = Object.entries(byCountry).sort((a, b) => b[1] - a[1]).slice(0, 10);

    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Shield className="w-6 h-6 text-blue-600" /> Fanar Admin
            </h1>
            <button onClick={logout} className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 text-sm">
              <LogOut className="w-4 h-4" /> Log out
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-white rounded-2xl border border-slate-200 p-5">
              <div className="text-sm text-slate-500 mb-1">Total briefs</div>
              <div className="text-3xl font-bold text-slate-900">{briefs.length}</div>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 p-5">
              <div className="text-sm text-slate-500 mb-1">Tracked visitors</div>
              <div className="text-3xl font-bold text-slate-900">{visitors.length}</div>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 p-5">
              <div className="text-sm text-slate-500 mb-1">Countries</div>
              <div className="text-3xl font-bold text-slate-900">{topCountries.length}</div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <Inbox className="w-5 h-5 text-blue-600" /> Briefs ({briefs.length})
              </h2>
              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {briefs.length === 0 && <p className="text-slate-400 text-sm">No briefs yet.</p>}
                {briefs.map((b) => (
                  <div key={b.id} className="p-4 rounded-xl border border-slate-100 bg-slate-50">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="font-semibold text-slate-900">{b.name}</div>
                        <div className="text-sm text-blue-600 flex items-center gap-1"><Mail className="w-3.5 h-3.5" />{b.email}</div>
                        {b.phone && <div className="text-xs text-slate-500">{b.phone}</div>}
                      </div>
                      <span className="text-xs text-slate-400">{new Date(b.createdAt).toLocaleDateString()}</span>
                    </div>
                    {b.businessName && <div className="text-sm text-slate-700"><b>{b.businessName}</b>{b.businessType ? ` · ${b.businessType}` : ""}</div>}
                    <p className="text-sm text-slate-600 mt-1 line-clamp-3">{b.business}</p>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {b.goal && <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">{b.goal}</span>}
                      {b.budget && <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs">{b.budget}</span>}
                      {b.timeline && <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded text-xs">{b.timeline}</span>}
                      <span className="px-2 py-0.5 bg-slate-200 text-slate-600 rounded text-xs">{b.country}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <Globe className="w-5 h-5 text-green-600" /> Visitors by country
              </h2>
              <div className="space-y-2">
                {topCountries.map(([c, n]) => (
                  <div key={c} className="flex items-center justify-between text-sm">
                    <span className="text-slate-700">{c}</span>
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 bg-green-100 rounded-full overflow-hidden w-28">
                        <div className="h-full bg-green-500" style={{ width: `${Math.min(100, n * 8)}%` }} />
                      </div>
                      <span className="text-slate-400 w-8 text-right">{n}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ---- CODE ENTRY ----
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-white p-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center mx-auto mb-4">
            <Lock className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Admin access</h1>
          <p className="text-slate-500 text-sm mt-1">Enter your access code.</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          {isLocked ? (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-center">
              <AlertTriangle className="w-6 h-6 text-red-500 mx-auto mb-2" />
              <p className="text-sm font-medium text-red-700">Access blocked</p>
              <p className="text-xs text-red-600 mt-1 flex items-center justify-center gap-1">
                <Clock className="w-3.5 h-3.5" /> Try again in {lockMin}:{String(lockSec).padStart(2, "0")}
              </p>
            </div>
          ) : (
            <>
              <div className="relative">
                <input
                  type={show ? "text" : "password"}
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Access code"
                  autoFocus
                  className="w-full px-4 py-3.5 pr-12 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
                <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {show ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              {error && (
                <p className="text-sm text-red-600 flex items-start gap-1.5">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" /> {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading || !code}
                className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Checking…" : "Enter"}
              </button>

              <p className="text-xs text-slate-400 text-center">
                {attemptsLeft} of {MAX_ATTEMPTS} attempts remaining
              </p>
            </>
          )}
        </form>
      </div>
    </div>
  );
}