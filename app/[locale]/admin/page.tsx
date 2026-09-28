import { db } from "@/lib/db";
import { briefs, visitors } from "@/drizzle/schema";
import { desc } from "drizzle-orm";
import { env } from "@/lib/env";
import { Mail, Globe, Building2, Clock, MapPin } from "lucide-react";

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ key?: string }>;
}) {
  const { key } = await searchParams;

  if (key !== env.ADMIN_KEY) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        <div className="text-center">
          <h1 className="text-2xl mb-4">Access Denied</h1>
          <p className="text-white/60">Invalid key. Use ?key=your_key</p>
        </div>
      </div>
    );
  }

  const recentBriefs = db ? await db.select().from(briefs).orderBy(desc(briefs.createdAt)).limit(50) : [];
  const recentVisitors = db ? await db.select().from(visitors).orderBy(desc(visitors.createdAt)).limit(100) : [];

  const visitorsByCountry = recentVisitors.reduce((acc, v) => {
    acc[v.country] = (acc[v.country] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">
            Fanar <span className="text-blue-600">Admin</span>
          </h1>
          <p className="text-slate-600 mt-2">
            {recentBriefs.length} briefs · {recentVisitors.length} visitors tracked
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Briefs Section */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <h2 className="text-xl font-semibold text-slate-900 mb-6 flex items-center gap-2">
              <Mail className="w-5 h-5 text-blue-600" />
              Recent Briefs ({recentBriefs.length})
            </h2>
            <div className="space-y-4 max-h-[600px] overflow-y-auto">
              {recentBriefs.length === 0 && (
                <p className="text-slate-500 text-sm">No briefs yet.</p>
              )}
              {recentBriefs.map((b) => (
                <div key={b.id} className="p-4 bg-slate-50 rounded-xl border border-slate-100 hover:border-blue-200 transition-colors">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold text-slate-900">{b.name}</h3>
                      <p className="text-sm text-slate-600">{b.email}</p>
                      {b.phone && <p className="text-xs text-slate-500">{b.phone}</p>}
                    </div>
                    <span className="text-xs text-slate-400">
                      {new Date(b.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  {b.businessName && (
                    <div className="mb-2">
                      <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                        Business
                      </span>
                      <p className="text-sm text-slate-700">{b.businessName}</p>
                    </div>
                  )}

                  {b.businessType && (
                    <div className="mb-2">
                      <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                        Type
                      </span>
                      <p className="text-sm text-slate-700">{b.businessType}</p>
                    </div>
                  )}

                  {b.oldWebsite && (
                    <div className="mb-2">
                      <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                        Old Website
                      </span>
                      <a href={b.oldWebsite} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline block">
                        {b.oldWebsite}
                      </a>
                    </div>
                  )}

                  <div className="mb-2">
                    <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                      Description
                    </span>
                    <p className="text-sm text-slate-700 line-clamp-3">{b.business}</p>
                  </div>

                  <div className="flex flex-wrap gap-2 mt-3">
                    {b.goal && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                        {b.goal}
                      </span>
                    )}
                    {b.timeline && (
                      <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded text-xs">
                        {b.timeline}
                      </span>
                    )}
                    {b.budget && (
                      <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">
                        {b.budget}
                      </span>
                    )}
                    <span className="px-2 py-1 bg-slate-100 text-slate-700 rounded text-xs">
                      {b.country}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Visitors Section */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <h2 className="text-xl font-semibold text-slate-900 mb-6 flex items-center gap-2">
              <Globe className="w-5 h-5 text-green-600" />
              Visitor Analytics
            </h2>

            <div className="mb-6">
              <h3 className="text-sm font-medium text-slate-700 mb-3 flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Visitors by Country
              </h3>
              <div className="space-y-2">
                {Object.entries(visitorsByCountry)
                  .sort(([, a], [, b]) => b - a)
                  .slice(0, 10)
                  .map(([country, count]) => (
                    <div key={country} className="flex items-center justify-between text-sm">
                      <span className="text-slate-700">{country || "Unknown"}</span>
                      <div className="flex items-center gap-2">
                        <div className="h-2 bg-green-100 rounded-full overflow-hidden w-32">
                          <div
                            className="h-full bg-green-500"
                            style={{ width: `${Math.min(100, count * 5)}%` }}
                          />
                        </div>
                        <span className="text-slate-500 w-8 text-right">{count}</span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-slate-700 mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Recent Page Views
              </h3>
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {recentVisitors.slice(0, 20).map((v) => (
                  <div key={v.id} className="text-xs text-slate-600 py-1 border-b border-slate-100">
                    <span className="font-medium">{v.page}</span>
                    <span className="text-slate-400 ml-2">
                      {v.country} · {new Date(v.createdAt).toLocaleTimeString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}