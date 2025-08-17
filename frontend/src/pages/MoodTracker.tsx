import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import {
  Heart,
  TrendingUp,
  Calendar,
  Plus,
  // Lucide mood icons
  Frown,
  Meh,
  Smile,
  Laugh,
  PartyPopper,
} from "lucide-react";
import { API_URL } from "../constants/api";

type MoodEntry = {
  mood: number; // 1..7
  note: string;
  date: string; // ISO
};

const moodIcons = [
  { value: 1, icon: Frown, label: "Very Sad", color: "text-red-600" },
  { value: 2, icon: Frown, label: "Sad", color: "text-red-500" },
  { value: 3, icon: Meh, label: "Neutral", color: "text-gray-600" },
  { value: 4, icon: Smile, label: "Good", color: "text-yellow-600" },
  { value: 5, icon: Smile, label: "Happy", color: "text-emerald-600" },
  { value: 6, icon: Laugh, label: "Very Happy", color: "text-emerald-700" },
  // PartyPopper is stroke-only; looks good as-is
  { value: 7, icon: PartyPopper, label: "Ecstatic", color: "text-blue-600" },
] as const;

const getMoodMeta = (value: number) =>
  moodIcons.find((m) => m.value === value) || moodIcons[4];

const startOfDay = (d: Date) =>
  new Date(d.getFullYear(), d.getMonth(), d.getDate());

const MoodTracker: React.FC = () => {
  const userId = localStorage.getItem("userId") || "";
  const [selectedMood, setSelectedMood] = useState<number>(5);
  const [moodNote, setMoodNote] = useState("");
  const [moodHistory, setMoodHistory] = useState<MoodEntry[]>([]);
  const [loading, setLoading] = useState(true);

  // load history
  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    axios
      .get<MoodEntry[]>(`${API_URL}/api/mood/${userId}`)
      .then((res) => {
        setMoodHistory(res.data || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading mood history:", err);
        setLoading(false);
      });
  }, [userId]);

  const handleMoodSubmit = async () => {
    try {
      const payload = {
        userId,
        mood: selectedMood,
        note: moodNote,
        date: new Date().toISOString(),
      };
      await axios.post(`${API_URL}/api/mood`, payload);
      setMoodNote("");
      const updated = await axios.get<MoodEntry[]>(
        `${API_URL}/api/mood/${userId}`
      );
      setMoodHistory(updated.data);
    } catch (err) {
      console.error("Error saving mood:", err);
      alert("Could not save mood. Please try again.");
    }
  };

  // weekly average (last 7 days incl. today)
  const weeklyAvg = useMemo(() => {
    const now = new Date();
    const weekAgo = new Date(now);
    weekAgo.setDate(now.getDate() - 6);
    const last7 = moodHistory.filter(
      (e) => new Date(e.date) >= startOfDay(weekAgo)
    );
    if (last7.length === 0) return null;
    const avg = last7.reduce((s, e) => s + (e.mood || 0), 0) / last7.length;
    return Number(avg.toFixed(1));
  }, [moodHistory]);

  // current streak up to today
  const currentStreak = useMemo(() => {
    if (moodHistory.length === 0) return 0;
    const daysSet = new Set(
      moodHistory.map((e) =>
        startOfDay(new Date(e.date)).toISOString().slice(0, 10)
      )
    );
    let streak = 0;
    let cursor = startOfDay(new Date());
    while (true) {
      const key = cursor.toISOString().slice(0, 10);
      if (daysSet.has(key)) {
        streak += 1;
        cursor.setDate(cursor.getDate() - 1);
      } else {
        break;
      }
    }
    return streak;
  }, [moodHistory]);

  return (
    <div className="p-6 space-y-6">
      {/* Hero — consistent with Journal header */}
      <div className="relative overflow-hidden rounded-2xl p-8 bg-gradient-to-r from-primary-100 to-secondary-100 border border-gray-100">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-xl bg-white/70">
              <Heart className="w-7 h-7 text-rose-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Mood Tracker</h1>
              <p className="text-gray-700">
                Track your emotional journey day by day
              </p>
            </div>
          </div>

          {/* Quick stats in header */}
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="bg-white rounded-xl px-5 py-3 border border-gray-100">
              <div className="text-xs text-gray-600 mb-0.5">Weekly Avg</div>
              <div className="text-2xl font-bold text-gray-900">
                {weeklyAvg === null ? "—" : weeklyAvg}
              </div>
            </div>
            <div className="bg-white rounded-xl px-5 py-3 border border-gray-100">
              <div className="text-xs text-gray-600 mb-0.5">Streak</div>
              <div className="text-2xl font-bold text-gray-900">
                {currentStreak}
              </div>
            </div>
          </div>
        </div>

        {/* Decorative blob */}
        <svg
          className="absolute -right-10 -bottom-10 w-72 opacity-20"
          viewBox="0 0 200 200"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fill="currentColor"
            className="text-primary-400"
            d="M38.1,-53.2C49.2,-45.6,57.4,-34.4,62.1,-22.2C66.9,-10.1,68.2,3.1,64.2,14.4C60.2,25.7,50.8,35.1,40.1,44.7C29.4,54.3,17.3,64,3.8,67.1C-9.8,70.2,-19.6,66.7,-30.1,61.1C-40.6,55.5,-51.9,47.8,-58.5,37.2C-65.1,26.5,-67,13.3,-64.6,1.2C-62.2,-10.9,-55.4,-21.7,-48.5,-32.2C-41.6,-42.7,-34.7,-52.9,-25.4,-61.1C-16.1,-69.4,-8.1,-75.7,2.1,-78.8C12.4,-81.8,24.8,-81,38.1,-53.2Z"
            transform="translate(100 100)"
          />
        </svg>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Mood Input Card — improved */}
        <div className="lg:col-span-2 rounded-2xl overflow-hidden border border-gray-100 bg-white shadow-sm">
          {/* Selected mood preview header */}
          <div className="px-6 py-5 bg-gradient-to-r from-primary-50 to-secondary-50 border-b border-gray-100">
            {(() => {
              const meta = getMoodMeta(selectedMood);
              const Icon = meta.icon;
              return (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-white shadow flex items-center justify-center">
                      <Icon className={`w-6 h-6 ${meta.color}`} />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">
                        How are you feeling today?
                      </h2>
                      <p className="text-sm text-gray-600">
                        Selected:{" "}
                        <span className="font-medium">{meta.label}</span>
                      </p>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600">
                    Level{" "}
                    <span className="font-semibold text-gray-900">
                      {selectedMood}/7
                    </span>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Body */}
          <div className="p-6 space-y-6">
            {/* Mood chips */}
            <div className="grid grid-cols-3 md:grid-cols-7 gap-3">
              {moodIcons.map((m) => {
                const Icon = m.icon;
                const isActive = selectedMood === m.value;
                return (
                  <button
                    key={m.value}
                    onClick={() => setSelectedMood(m.value)}
                    aria-pressed={isActive}
                    className={[
                      "group relative px-3 py-3 rounded-xl border-2 text-center transition-all duration-200",
                      "focus:outline-none focus:ring-2 focus:ring-primary-500",
                      isActive
                        ? "border-primary-500 bg-primary-50 shadow-sm scale-[1.03]"
                        : "border-gray-200 hover:border-gray-300 hover:bg-gray-50",
                    ].join(" ")}
                    title={m.label}
                  >
                    <div className="flex flex-col items-center gap-1">
                      <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-white shadow">
                        <Icon className={`w-6 h-6 ${m.color}`} />
                      </span>
                      <span className="text-[11px] font-medium text-gray-600">
                        {m.label}
                      </span>
                    </div>

                    {/* Active tick */}
                    {isActive && (
                      <span className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-primary-600 text-white text-[10px] flex items-center justify-center shadow">
                        {m.value}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Slider + value pill */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-800">
                  Mood intensity
                </label>
                <span className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-white px-2.5 py-1 text-xs font-medium text-gray-700">
                  {selectedMood}/7
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="7"
                value={selectedMood}
                onChange={(e) => setSelectedMood(Number(e.target.value))}
                className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-gradient-to-r from-rose-200 via-yellow-200 to-emerald-200"
              />
              <div className="flex justify-between text-[11px] text-gray-500 mt-1 px-1">
                <span>Low</span>
                <span>High</span>
              </div>
            </div>

            {/* Note */}
            <div>
              <label className="block text-sm font-medium text-gray-800 mb-2">
                Add a note (optional)
              </label>
              <textarea
                value={moodNote}
                onChange={(e) => setMoodNote(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="What's on your mind?"
                rows={3}
              />
            </div>

            <button
              onClick={handleMoodSubmit}
              className="w-full bg-primary-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-primary-700 transition flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Log Mood
            </button>
          </div>
        </div>

        {/* Side stats cards */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-4">
              <TrendingUp className="w-6 h-6 text-emerald-600" />
              <h3 className="text-lg font-semibold text-gray-900">This Week</h3>
            </div>
            <div className="text-3xl font-bold text-emerald-700 mb-2">
              {weeklyAvg === null ? "—" : weeklyAvg}
            </div>
            <p className="text-sm text-gray-600">Average mood (last 7 days)</p>
          </div>

          <div className="rounded-2xl p-6 border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50">
            <div className="flex items-center gap-3 mb-4">
              <Calendar className="w-6 h-6 text-amber-600" />
              <h3 className="text-lg font-semibold text-amber-900">
                Current Streak
              </h3>
            </div>
            <div className="text-3xl font-bold text-amber-700 mb-2">
              {currentStreak}
            </div>
            <p className="text-sm text-amber-700">
              {currentStreak === 1 ? "day" : "days"} in a row
            </p>
          </div>
        </div>
      </div>

      {/* Recent Entries */}
      <div className="rounded-2xl p-6 shadow-sm border border-gray-100 bg-white">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          Recent Entries
        </h2>

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="animate-pulse h-20 bg-gray-100 rounded-xl"
              />
            ))}
          </div>
        ) : moodHistory.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-4xl mb-2">🙂</div>
            <p className="text-gray-800 font-medium">No moods logged yet</p>
            <p className="text-sm text-gray-500">
              Log your first mood to see it here.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {moodHistory
              .slice()
              .reverse()
              .slice(0, 12)
              .map((entry, index) => {
                const meta = getMoodMeta(entry.mood);
                const Icon = meta.icon;
                return (
                  <div
                    key={index}
                    className="flex items-start gap-4 p-4 rounded-xl border border-gray-100 hover:bg-gray-50"
                  >
                    <div className="flex-shrink-0">
                      <Icon className={`w-6 h-6 ${meta.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-gray-900 truncate">
                          {meta.label}
                        </span>
                        <span className="text-sm text-gray-500">
                          • {new Date(entry.date).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm whitespace-pre-wrap">
                        {entry.note || (
                          <span className="italic text-gray-400">No note</span>
                        )}
                      </p>
                    </div>
                    <div className="text-xs font-semibold text-gray-400">
                      {entry.mood}/7
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MoodTracker;
