import React, { useEffect, useState, useRef } from "react";
import { Heart, BookOpen, Brain } from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
} from "recharts";

type MoodPoint = { day: string; mood: number; journals?: number; cbt?: number };
type Activity = { type: string; title: string; time: string };

type DashboardData = {
  moodAverage: string;
  journalCount: number;
  cbtSessions: number;
  moodTrend: MoodPoint[];
  recentActivity: Activity[];
};

type ChartView = "mood" | "journal" | "cbt";

const sr = "sr-only";
const WeeklyTrendChart: React.FC<{ data: MoodPoint[] }> = ({ data }) => {
  const [view, setView] = React.useState<ChartView>("mood");
  const tabs = ["mood", "journal", "cbt"] as ChartView[];
  const selectedIndex = tabs.indexOf(view);
  const tabsRef = useRef<Array<HTMLButtonElement | null>>([]);

  const rows = (data ?? []).map((d) => ({
    day: d.day,
    mood: typeof d.mood === "number" ? d.mood : 0,
    journals: typeof d.journals === "number" ? d.journals : 0,
    cbt: typeof d.cbt === "number" ? d.cbt : 0,
  }));
  const hasData = rows.length > 0;
  const chartTitleId = "weekly-trend-title";
  const chartDescId = "weekly-trend-desc";
  const chartFigureId = "weekly-trend-figure";

  const onKeyDownTabs = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight" || e.key === "Right") {
      e.preventDefault();
      const next = (selectedIndex + 1) % tabs.length;
      setView(tabs[next]);
      tabsRef.current[next]?.focus();
    } else if (e.key === "ArrowLeft" || e.key === "Left") {
      e.preventDefault();
      const prev = (selectedIndex - 1 + tabs.length) % tabs.length;
      setView(tabs[prev]);
      tabsRef.current[prev]?.focus();
    }
  };

  return (
    <section role="region" aria-labelledby={chartTitleId} className="w-full">
      <div className="flex items-center justify-between mb-6">
        <h2 id={chartTitleId} className="text-xl font-semibold text-gray-900">
          Weekly Mood Trend
        </h2>

        {/* Accessible tablist for chart view */}
        <div
          className="bg-gray-100 rounded-lg p-1 text-sm font-medium"
          role="tablist"
          aria-label="Select data to display on the chart"
          onKeyDown={onKeyDownTabs}
        >
          {tabs.map((k, i) => (
            <button
              key={k}
              ref={(el) => (tabsRef.current[i] = el)}
              role="tab"
              id={`tab-${k}`}
              aria-controls={`panel-${k}`}
              aria-selected={view === k}
              tabIndex={view === k ? 0 : -1}
              onClick={() => setView(k)}
              className={`px-3 py-1 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${
                view === k
                  ? "bg-white shadow text-gray-900"
                  : "text-gray-700 hover:text-gray-900"
              }`}
            >
              {k === "mood" ? "Mood" : k === "journal" ? "Journal" : "CBT"}
            </button>
          ))}
        </div>
      </div>

      {/* live hint for screen readers */}
      <p className={`${sr}`} aria-live="polite">
        Showing{" "}
        {view === "mood"
          ? "mood scores"
          : view === "journal"
          ? "journal counts"
          : "CBT counts"}{" "}
        for the past week.
      </p>

      {!hasData ? (
        <p className="text-gray-700 text-sm">No trend data yet.</p>
      ) : (
        <figure
          id={chartFigureId}
          aria-describedby={chartDescId}
          className="h-64"
        >
          {/* role="img" wrapper helps SR users understand the chart as a graphic */}
          <div
            role="img"
            aria-label={
              view === "mood"
                ? "Line chart of daily mood scores from one to seven over the past week."
                : view === "journal"
                ? "Bar chart of daily journal entry counts over the past week."
                : "Bar chart of daily CBT activity counts over the past week."
            }
            className="w-full h-full"
          >
            <ResponsiveContainer width="100%" height="100%">
              {view === "mood" ? (
                <LineChart
                  data={rows}
                  margin={{ top: 10, right: 12, bottom: 0, left: 0 }}
                  aria-hidden
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis domain={[1, 7]} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="mood"
                    strokeWidth={3}
                    dot={{ r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              ) : (
                <BarChart
                  data={rows}
                  margin={{ top: 10, right: 12, bottom: 0, left: 0 }}
                  aria-hidden
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  {view === "journal" ? (
                    <Bar dataKey="journals" radius={[6, 6, 0, 0]} />
                  ) : (
                    <Bar dataKey="cbt" radius={[6, 6, 0, 0]} />
                  )}
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>

          <figcaption id={chartDescId} className="mt-2 text-xs text-gray-700">
            {view === "mood"
              ? "Scale: 1–7 (higher is better)."
              : view === "journal"
              ? "Daily journal entries."
              : "Daily CBT messages or sessions."}
          </figcaption>

          {/* Hidden data table for screen readers */}
          <div
            className={sr}
            id={`panel-${view}`}
            role="tabpanel"
            aria-labelledby={`tab-${view}`}
          >
            <table>
              <caption>Weekly data table for {view}</caption>
              <thead>
                <tr>
                  <th scope="col">Day</th>
                  {view === "mood" ? <th scope="col">Mood</th> : null}
                  {view === "journal" ? (
                    <th scope="col">Journal entries</th>
                  ) : null}
                  {view === "cbt" ? <th scope="col">CBT count</th> : null}
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={`${r.day}`}>
                    <th scope="row">{r.day}</th>
                    {view === "mood" ? <td>{r.mood}</td> : null}
                    {view === "journal" ? <td>{r.journals}</td> : null}
                    {view === "cbt" ? <td>{r.cbt}</td> : null}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </figure>
      )}
    </section>
  );
};

const Dashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null
  );
  const userId = localStorage.getItem("userId");
  const userName = localStorage.getItem("userName") || "Friend";

  useEffect(() => {
    if (!userId) return;
    const fetchData = async () => {
      try {
        const res = await fetch(
          `http://localhost:5000/api/dashboard/${userId}`
        );
        const data = await res.json();
        setDashboardData({
          moodAverage: data.moodAverage || "0.0",
          journalCount: data.journalCount || 0,
          cbtSessions: data.cbtSessions || 0,

          moodTrend: data.moodTrend || [],
          recentActivity: data.recentActivity || [],
        });
      } catch (err) {
        console.error("Error fetching dashboard:", err);
      }
    };
    fetchData();
  }, [userId]);

  return (
    <>
      {/* Skip link (place once near top of app layout) */}
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 bg-white text-blue-700 px-3 py-2 rounded"
      >
        Skip to main content
      </a>

      <main id="main" className="p-6 space-y-6" aria-labelledby="dash-title">
        <header
          className="bg-gradient-to-r from-primary-200 to-secondary-200 rounded-2xl p-8 text-black"
          role="banner"
        >
          <h1 id="dash-title" className="text-3xl font-bold mb-2">
            Welcome back, {userName}! <span aria-hidden>👋</span>
          </h1>
          <p className="text-gray-900 text-lg" aria-live="polite">
            {dashboardData
              ? "You're doing great! Here's your wellness overview."
              : "Let’s get started! Log your first mood or journal entry."}
          </p>
        </header>

        {dashboardData && (
          <>
            {/* Stats as definition list for SR clarity */}
            <section aria-labelledby="stats-title">
              <h2 id="stats-title" className="sr-only">
                Your current stats
              </h2>
              <dl className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
                {[
                  {
                    icon: Heart,
                    label: "Mood Average",
                    value: dashboardData.moodAverage,
                    color: "text-rose-700",
                  },
                  {
                    icon: BookOpen,
                    label: "Journal Entries",
                    value: dashboardData.journalCount.toString(),
                    color: "text-blue-700",
                  },
                  {
                    icon: Brain,
                    label: "CBT Sessions",
                    value: dashboardData.cbtSessions.toString(),
                    color: "text-purple-700",
                  },
                ].map((stat, i) => {
                  const Icon = stat.icon;
                  return (
                    <div
                      key={i}
                      className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 focus-within:ring-2 focus-within:ring-offset-2"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div
                          className={`p-3 rounded-lg bg-gray-50 ${stat.color}`}
                          aria-hidden
                        >
                          <Icon className="w-6 h-6" />
                        </div>
                      </div>
                      <dt className="text-gray-700 text-sm">{stat.label}</dt>
                      <dd className="text-2xl font-bold text-gray-900 mb-1">
                        {stat.value}
                      </dd>
                    </div>
                  );
                })}
              </dl>
            </section>

            {/* Trend & Activity */}
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <WeeklyTrendChart data={dashboardData.moodTrend} />
              </div>

              <section
                className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
                aria-labelledby="activity-title"
              >
                <h2
                  id="activity-title"
                  className="text-xl font-semibold text-gray-900 mb-6"
                >
                  Recent Activity
                </h2>
                {dashboardData.recentActivity.length === 0 ? (
                  <p className="text-gray-700 text-sm">No recent activity.</p>
                ) : (
                  <ul className="space-y-4">
                    {dashboardData.recentActivity.map((activity, index) => (
                      <li
                        key={index}
                        className="p-3 hover:bg-gray-50 rounded-lg transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-900"
                            aria-label={`Type: ${activity.type}`}
                          >
                            {activity.type}
                          </span>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">
                              {activity.title}
                            </p>
                            <p className="text-xs text-gray-700">
                              {activity.time}
                            </p>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            </div>
          </>
        )}
      </main>
    </>
  );
};

export default Dashboard;
