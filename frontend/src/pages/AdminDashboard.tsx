import { useEffect, useState } from "react";
import {
  Users,
  TrendingUp,
  Smile,
  Clock,
  Eye,
  AlertTriangle,
} from "lucide-react";

interface Stats {
  totalUsers: number;
  totalCBTSessions: number;
  totalMoods: number;
  activeUsers?: number;
  today?: {
    newUsers: number;
    moods: number;
    cbtMessages: number;
  };
}

interface Activity {
  id: string;
  description: string;
  timestamp: string;
}

interface Alert {
  id: string;
  title: string;
  dueDate: string | number | Date;
}

// small helper so HTML responses don't crash json()
async function getJSON<T>(url: string): Promise<T> {
  const res = await fetch(url, { headers: { Accept: "application/json" } });
  const ct = res.headers.get("content-type") || "";
  const text = await res.text();
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${text.slice(0, 300)}`);
  if (!ct.includes("application/json")) {
    throw new Error(`Expected JSON, got ${ct}. First bytes: ${text.slice(0, 120)}`);
  }
  return JSON.parse(text) as T;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalCBTSessions: 0,
    totalMoods: 0,
  });

  const [activity, setActivity] = useState<Activity[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

useEffect(() => {
  (async () => {
    try {
      const [rawStats, a, al] = await Promise.all([
        getJSON<any>("/api/admin/stats"),
        getJSON<Activity[]>("/api/admin/recent-activity"),
        getJSON<Alert[]>("/api/admin/compliance-alerts"),
      ]);

      // normalize in case backend returns only raw collection names
      const mapped: Stats = {
        totalUsers: rawStats.totalUsers ?? rawStats.users ?? 0,
        totalCBTSessions: rawStats.totalCBTSessions ?? rawStats.cbtmessages ?? 0,
        totalMoods: rawStats.totalMoods ?? rawStats.moods ?? 0,
        activeUsers: rawStats.activeUsers, // optional if you add it later
        today: rawStats.today,             // optional
      };

      setStats(mapped);
      setActivity(a);
      setAlerts(al);
    } catch (err) {
      console.error("AdminDashboard load error:", err);
    } finally {
      setLoading(false);
    }
  })();
}, []);


  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>

      {loading && (
        <div className="text-sm text-gray-500">Loading…</div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Total Users */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">
            {stats.totalUsers}
          </h3>
          <p className="text-gray-600 text-sm">Total Users</p>
        </div>

        {/* CBT Sessions */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">
            {stats.totalCBTSessions}
          </h3>
          <p className="text-gray-600 text-sm">CBT Sessions</p>
        </div>

        {/* Moods Logged */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Smile className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">
            {stats.totalMoods}
          </h3>
          <p className="text-gray-600 text-sm">Moods Logged</p>
        </div>
      </div>

      {/* Recent Activity & Compliance Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Recent Activity
          </h2>
          <div className="space-y-4">
            {activity.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <p className="text-gray-700 text-sm">{item.description}</p>
                <span className="text-xs text-gray-500 flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {new Date(item.timestamp).toLocaleString()}
                </span>
              </div>
            ))}
            {activity.length === 0 && (
              <p className="text-gray-500 text-sm">No recent activity</p>
            )}
          </div>
        </div>

        {/* Compliance Alerts */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Compliance Alerts
          </h2>
          <div className="space-y-4">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg"
              >
                <p className="text-gray-700 text-sm">{alert.title}</p>
                <span className="text-xs text-gray-500 flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  Due: {new Date(alert.dueDate).toLocaleDateString()}
                </span>
              </div>
            ))}
            {alerts.length === 0 && (
              <p className="text-gray-500 text-sm">No compliance alerts</p>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <button className="p-6 bg-white rounded-xl shadow-sm border border-gray-100 hover:bg-gray-50 transition">
          <Users className="w-6 h-6 text-blue-600 mb-3" />
          <h3 className="font-medium text-gray-900">Manage Users</h3>
        </button>

        <button className="p-6 bg-white rounded-xl shadow-sm border border-gray-100 hover:bg-gray-50 transition">
          <AlertTriangle className="w-6 h-6 text-red-600 mb-3" />
          <h3 className="font-medium text-gray-900">Review Flags</h3>
        </button>

        <button className="p-6 bg-white rounded-xl shadow-sm border border-gray-100 hover:bg-gray-50 transition">
          <Eye className="w-6 h-6 text-purple-600 mb-3" />
          <h3 className="font-medium text-gray-900">Monitor Activity</h3>
        </button>
      </div>
    </div>
  );
}
