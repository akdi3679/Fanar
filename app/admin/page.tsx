import { db } from '@/lib/db';
import { briefs, visitors, pageViews } from '@/drizzle/schema';
import { desc } from 'drizzle-orm';
import { Shield, Users, FileText, Globe, Clock, Monitor, Smartphone, TrendingUp, MessageSquare } from 'lucide-react';

export default async function AdminDashboard() {
  if (!db) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <Shield className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-slate-900">Database not configured</h1>
          <p className="text-slate-600 mt-2">Check DATABASE_URL in Vercel environment variables.</p>
        </div>
      </div>
    );
  }

  const [allBriefs, allVisitors, allPageViews] = await Promise.all([
    db.select().from(briefs).orderBy(desc(briefs.createdAt)),
    db.select().from(visitors).orderBy(desc(visitors.createdAt)),
    db.select().from(pageViews).orderBy(desc(pageViews.createdAt)),
  ]);

  const totalBriefs = allBriefs.length;
  const totalVisitors = allVisitors.length;
  const totalPageViews = allPageViews.length;
  
  const uniqueSessions = new Set(allVisitors.map(v => v.sessionId).filter(Boolean));
  const uniqueVisitors = uniqueSessions.size;

  const deviceStats = allVisitors.reduce((acc: Record<string, number>, v) => {
    const device = v.deviceType || 'unknown';
    acc[device] = (acc[device] || 0) + 1;
    return acc;
  }, {});

  const browserStats = allVisitors.reduce((acc: Record<string, number>, v) => {
    const browser = v.browserName || 'Unknown';
    acc[browser] = (acc[browser] || 0) + 1;
    return acc;
  }, {});

  const countryStats = allVisitors.reduce((acc: Record<string, number>, v) => {
    const country = v.country || 'Unknown';
    acc[country] = (acc[country] || 0) + 1;
    return acc;
  }, {});

  const avgTimeOnSite = allVisitors.length > 0
    ? Math.round(allVisitors.reduce((sum, v) => sum + (v.timeOnSite || 0), 0) / allVisitors.length)
    : 0;

  const pageStats = allPageViews.reduce((acc: Record<string, number>, pv) => {
    acc[pv.page] = (acc[pv.page] || 0) + 1;
    return acc;
  }, {});
  const topPages = Object.entries(pageStats)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  const recentBriefs = allBriefs.slice(0, 10);

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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <FileText className="w-8 h-8 text-blue-600" />
              <span className="text-3xl font-bold text-slate-900">{totalBriefs}</span>
            </div>
            <p className="text-sm text-slate-600">Total Briefs</p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <Users className="w-8 h-8 text-green-600" />
              <span className="text-3xl font-bold text-slate-900">{uniqueVisitors}</span>
            </div>
            <p className="text-sm text-slate-600">Unique Visitors</p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <TrendingUp className="w-8 h-8 text-purple-600" />
              <span className="text-3xl font-bold text-slate-900">{totalPageViews}</span>
            </div>
            <p className="text-sm text-slate-600">Page Views</p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <Clock className="w-8 h-8 text-orange-600" />
              <span className="text-3xl font-bold text-slate-900">{avgTimeOnSite}s</span>
            </div>
            <p className="text-sm text-slate-600">Avg Time on Site</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              Recent Briefs ({totalBriefs})
            </h2>
            <div className="space-y-4 max-h-[600px] overflow-y-auto">
              {recentBriefs.length === 0 ? (
                <p className="text-slate-400 text-center py-8">No briefs yet</p>
              ) : (
                recentBriefs.map((brief) => {
                  const questionnaire = brief.questionnaire as Record<string, string> | null;
                  return (
                    <div key={brief.id} className="border border-slate-100 rounded-xl p-4 hover:border-blue-200 transition-colors">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-semibold text-slate-900">{brief.name}</h3>
                          <p className="text-sm text-blue-600">{brief.email}</p>
                          {brief.phone && <p className="text-xs text-slate-500">{brief.phone}</p>}
                        </div>
                        <span className="text-xs text-slate-400">
                          {new Date(brief.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      
                      {brief.businessName && (
                        <p className="text-sm font-medium text-slate-700 mb-1">
                          {brief.businessName} {brief.businessType && `(${brief.businessType})`}
                        </p>
                      )}
                      
                      {brief.businessDescription && (
                        <p className="text-sm text-slate-600 mb-2 line-clamp-2">
                          {brief.businessDescription}
                        </p>
                      )}

                      {questionnaire && (
                        <div className="mt-3 pt-3 border-t border-slate-100">
                          <p className="text-xs font-semibold text-slate-700 mb-2 flex items-center gap-1">
                            <MessageSquare className="w-3 h-3" />
                            Questionnaire Answers:
                          </p>
                          <div className="space-y-1 text-xs">
                            {questionnaire.q1 && (
                              <p className="text-slate-600">
                                <span className="font-medium">Q1:</span> {questionnaire.q1}
                              </p>
                            )}
                            {questionnaire.q2 && (
                              <p className="text-slate-600">
                                <span className="font-medium">Q2:</span> {questionnaire.q2}
                              </p>
                            )}
                            {questionnaire.q3 && (
                              <p className="text-slate-600">
                                <span className="font-medium">Q3:</span> {questionnaire.q3}
                              </p>
                            )}
                            {questionnaire.goal && (
                              <p className="text-slate-600">
                                <span className="font-medium">Goal:</span> {questionnaire.goal}
                              </p>
                            )}
                          </div>
                        </div>
                      )}

                      <div className="flex flex-wrap gap-2 mt-2">
                        {brief.projectType && (
                          <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs">
                            {brief.projectType}
                          </span>
                        )}
                        {brief.budget && (
                          <span className="px-2 py-1 bg-green-50 text-green-700 rounded text-xs">
                            {brief.budget}
                          </span>
                        )}
                        {brief.timeline && (
                          <span className="px-2 py-1 bg-purple-50 text-purple-700 rounded text-xs">
                            {brief.timeline}
                          </span>
                        )}
                        {brief.country && brief.country !== 'Unknown' && (
                          <span className="px-2 py-1 bg-slate-100 text-slate-700 rounded text-xs">
                            {brief.country}
                          </span>
                        )}
                      </div>

                      <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-4 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <Monitor className="w-3 h-3" />
                          {brief.browserName} {brief.osName}
                        </span>
                        <span className="flex items-center gap-1">
                          <Smartphone className="w-3 h-3" />
                          {brief.deviceType}
                        </span>
                        {brief.timeOnSite && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {brief.timeOnSite}s on site
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Monitor className="w-5 h-5 text-slate-600" />
                Devices
              </h3>
              <div className="space-y-3">
                {Object.entries(deviceStats).map(([device, count]) => (
                  <div key={device} className="flex items-center justify-between">
                    <span className="text-sm text-slate-600 capitalize">{device}</span>
                    <span className="text-sm font-semibold text-slate-900">{count}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Globe className="w-5 h-5 text-slate-600" />
                Browsers
              </h3>
              <div className="space-y-3">
                {Object.entries(browserStats)
                  .sort((a, b) => b[1] - a[1])
                  .slice(0, 5)
                  .map(([browser, count]) => (
                    <div key={browser} className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">{browser}</span>
                      <span className="text-sm font-semibold text-slate-900">{count}</span>
                    </div>
                  ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Globe className="w-5 h-5 text-slate-600" />
                Top Countries
              </h3>
              <div className="space-y-3">
                {Object.entries(countryStats)
                  .sort((a, b) => b[1] - a[1])
                  .slice(0, 5)
                  .map(([country, count]) => (
                    <div key={country} className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">{country}</span>
                      <span className="text-sm font-semibold text-slate-900">{count}</span>
                    </div>
                  ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <h3 className="font-bold text-slate-900 mb-4">Top Pages</h3>
              <div className="space-y-3">
                {topPages.map(([page, count]) => (
                  <div key={page} className="flex items-center justify-between">
                    <span className="text-sm text-slate-600 truncate max-w-[150px]">{page}</span>
                    <span className="text-sm font-semibold text-slate-900">{count}</span>
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