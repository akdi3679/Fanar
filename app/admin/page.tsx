import { db } from '@/lib/db';
import { briefs, visitors, pageViews } from '@/drizzle/schema';
import { desc } from 'drizzle-orm';
import { Shield, Users, FileText, Globe, Clock, Monitor, Smartphone, TrendingUp, MessageSquare, AlertTriangle, MapPin, BarChart3 } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  if (!db) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
        <div className="text-center max-w-md">
          <Shield className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-slate-900">Database not configured</h1>
          <p className="text-slate-600 mt-2">Check DATABASE_URL in Vercel environment variables.</p>
        </div>
      </div>
    );
  }

  let allBriefs: any[] = [];
  let allVisitors: any[] = [];
  let allPageViews: any[] = [];
  let loadError: string | null = null;

  try {
    [allBriefs, allVisitors, allPageViews] = await Promise.all([
      db.select().from(briefs).orderBy(desc(briefs.createdAt)).catch(() => []),
      db.select().from(visitors).orderBy(desc(visitors.createdAt)).catch(() => []),
      db.select().from(pageViews).orderBy(desc(pageViews.createdAt)).catch(() => []),
    ]);
  } catch (err: any) {
    loadError = err?.message || "Failed to load data. Run migration-tracking-clean.sql in Supabase SQL editor.";
  }

  if (loadError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
        <div className="text-center max-w-lg bg-white rounded-2xl border border-red-200 p-8">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Dashboard error</h1>
          <p className="text-slate-600">{loadError}</p>
          <p className="text-sm text-slate-500 mt-4">
            Run <code className="bg-slate-100 px-1.5 py-0.5 rounded">migration-tracking-clean.sql</code> in Supabase SQL editor, then redeploy.
          </p>
        </div>
      </div>
    );
  }

  const totalBriefs = allBriefs.length;
  const totalVisitors = allVisitors.length;
  const totalPageViews = allPageViews.length;
  const uniqueSessions = new Set(allVisitors.map(v => v.sessionId).filter(Boolean)).size;

  const deviceStats = allVisitors.reduce((acc: Record<string, number>, v) => {
    const d = v.deviceType || 'unknown';
    acc[d] = (acc[d] || 0) + 1;
    return acc;
  }, {});

  const browserStats = allVisitors.reduce((acc: Record<string, number>, v) => {
    const b = v.browserName || 'Unknown';
    acc[b] = (acc[b] || 0) + 1;
    return acc;
  }, {});

  const countryStats = allVisitors.reduce((acc: Record<string, number>, v) => {
    const c = v.country || 'Unknown';
    acc[c] = (acc[c] || 0) + 1;
    return acc;
  }, {});

  const avgTimeOnSite = allVisitors.length > 0
    ? Math.round(allVisitors.reduce((sum, v) => sum + (v.timeOnSite || 0), 0) / allVisitors.length)
    : 0;

  const pageStats = allPageViews.reduce((acc: Record<string, number>, pv) => {
    acc[pv.page] = (acc[pv.page] || 0) + 1;
    return acc;
  }, {});
  const topPages = Object.entries(pageStats).sort((a, b) => b[1] - a[1]).slice(0, 10);

  const recentBriefs = allBriefs.slice(0, 10);
  const recentVisitors = allVisitors.slice(0, 20);

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <Shield className="w-8 h-8 text-blue-600" />
            Admin Dashboard
          </h1>
          <p className="text-slate-600 mt-2">Complete overview of your site performance and leads</p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <div className="flex items-center justify-between mb-3">
              <FileText className="w-7 h-7 text-blue-600" />
              <span className="text-2xl font-bold text-slate-900">{totalBriefs}</span>
            </div>
            <p className="text-sm text-slate-600">Briefs</p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <div className="flex items-center justify-between mb-3">
              <Users className="w-7 h-7 text-green-600" />
              <span className="text-2xl font-bold text-slate-900">{uniqueSessions}</span>
            </div>
            <p className="text-sm text-slate-600">Unique visitors</p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <div className="flex items-center justify-between mb-3">
              <TrendingUp className="w-7 h-7 text-purple-600" />
              <span className="text-2xl font-bold text-slate-900">{totalPageViews}</span>
            </div>
            <p className="text-sm text-slate-600">Page views</p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <div className="flex items-center justify-between mb-3">
              <Clock className="w-7 h-7 text-orange-600" />
              <span className="text-2xl font-bold text-slate-900">{avgTimeOnSite}s</span>
            </div>
            <p className="text-sm text-slate-600">Avg time on site</p>
          </div>
        </div>

        {/* Main grid: briefs + visitors sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Briefs column */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              Recent Briefs ({totalBriefs})
            </h2>
            <div className="space-y-4 max-h-[700px] overflow-y-auto">
              {recentBriefs.length === 0 ? (
                <p className="text-slate-400 text-center py-8">No briefs yet</p>
              ) : (
                recentBriefs.map((b) => {
                  const q = b.questionnaire as Record<string, string> | null;
                  return (
                    <div key={b.id} className="border border-slate-100 rounded-xl p-4 hover:border-blue-200 transition-colors">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-semibold text-slate-900">{b.name}</h3>
                          <p className="text-sm text-blue-600">{b.email}</p>
                          {b.phone && <p className="text-xs text-slate-500">{b.phone}</p>}
                        </div>
                        <span className="text-xs text-slate-400">{new Date(b.createdAt).toLocaleDateString()}</span>
                      </div>

                      {b.businessName && (
                        <p className="text-sm font-medium text-slate-700 mb-1">
                          {b.businessName} {b.businessType && `(${b.businessType})`}
                        </p>
                      )}

                      {b.businessDescription && (
                        <p className="text-sm text-slate-600 mb-2 line-clamp-3">{b.businessDescription}</p>
                      )}

                      {q && (
                        <div className="mt-3 pt-3 border-t border-slate-100">
                          <p className="text-xs font-semibold text-slate-700 mb-2 flex items-center gap-1">
                            <MessageSquare className="w-3 h-3" /> Questionnaire:
                          </p>
                          <div className="space-y-1 text-xs">
                            {q.q1 && <p className="text-slate-600"><span className="font-medium">Q1:</span> {q.q1}</p>}
                            {q.q2 && <p className="text-slate-600"><span className="font-medium">Q2:</span> {q.q2}</p>}
                            {q.q3 && <p className="text-slate-600"><span className="font-medium">Q3:</span> {q.q3}</p>}
                            {q.goal && <p className="text-slate-600"><span className="font-medium">Goal:</span> {q.goal}</p>}
                          </div>
                        </div>
                      )}

                      <div className="flex flex-wrap gap-2 mt-2">
                        {b.projectType && <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs">{b.projectType}</span>}
                        {b.budget && <span className="px-2 py-1 bg-green-50 text-green-700 rounded text-xs">{b.budget}</span>}
                        {b.timeline && <span className="px-2 py-1 bg-purple-50 text-purple-700 rounded text-xs">{b.timeline}</span>}
                        {b.country && b.country !== 'Unknown' && <span className="px-2 py-1 bg-slate-100 text-slate-700 rounded text-xs">{b.country}</span>}
                        {b.audioUrl && <span className="px-2 py-1 bg-amber-50 text-amber-700 rounded text-xs">🎙 Voice</span>}
                      </div>

                      <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-4 text-xs text-slate-500">
                        <span className="flex items-center gap-1"><Monitor className="w-3 h-3" />{b.browserName} {b.osName}</span>
                        <span className="flex items-center gap-1"><Smartphone className="w-3 h-3" />{b.deviceType}</span>
                        {b.timeOnSite && <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{b.timeOnSite}s</span>}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Sidebar: stats + recent visitors */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-slate-600" />Top countries
              </h3>
              <div className="space-y-2">
                {Object.entries(countryStats).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([country, count]) => (
                  <div key={country} className="flex items-center justify-between text-sm">
                    <span className="text-slate-700">{country}</span>
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 bg-green-100 rounded-full overflow-hidden w-20">
                        <div className="h-full bg-green-500" style={{ width: `${Math.min(100, count * 12)}%` }} />
                      </div>
                      <span className="text-slate-400 w-6 text-right text-xs">{count}</span>
                    </div>
                  </div>
                ))}
                {Object.keys(countryStats).length === 0 && <p className="text-slate-400 text-xs">No visitors yet</p>}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-slate-600" />Top pages
              </h3>
              <div className="space-y-2">
                {topPages.map(([page, count]) => (
                  <div key={page} className="flex items-center justify-between text-sm">
                    <span className="text-slate-700 truncate max-w-[140px]">{page}</span>
                    <span className="text-slate-400 text-xs">{count}</span>
                  </div>
                ))}
                {topPages.length === 0 && <p className="text-slate-400 text-xs">No page views yet</p>}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Monitor className="w-5 h-5 text-slate-600" />Devices
              </h3>
              <div className="space-y-2">
                {Object.entries(deviceStats).map(([d, c]) => (
                  <div key={d} className="flex items-center justify-between text-sm">
                    <span className="text-slate-700 capitalize">{d}</span>
                    <span className="text-slate-400 text-xs">{c}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Globe className="w-5 h-5 text-slate-600" />Browsers
              </h3>
              <div className="space-y-2">
                {Object.entries(browserStats).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([b, c]) => (
                  <div key={b} className="flex items-center justify-between text-sm">
                    <span className="text-slate-700">{b}</span>
                    <span className="text-slate-400 text-xs">{c}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent visitors list */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-slate-600" />Recent visitors ({recentVisitors.length})
              </h3>
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {recentVisitors.length === 0 ? (
                  <p className="text-slate-400 text-xs">No visitors tracked yet. Browse the site first to generate data.</p>
                ) : (
                  recentVisitors.map((v) => (
                    <div key={v.id} className="text-xs border-b border-slate-100 pb-2 last:border-0">
                      <div className="flex justify-between">
                        <span className="font-medium text-slate-700">{v.currentPage}</span>
                        <span className="text-slate-400">{new Date(v.createdAt).toLocaleTimeString()}</span>
                      </div>
                      <div className="text-slate-500 mt-0.5">
                        {v.country} · {v.browserName} · {v.deviceType}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}