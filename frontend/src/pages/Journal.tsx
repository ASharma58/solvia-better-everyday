import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  BookOpen,
  Plus,
  Search,
  Calendar,
  Edit3,
  Trash2,
  Star,
  Filter,
  SortAsc,
  SortDesc,
  X,
  Smile,
  Meh,
  Frown,
  HeartHandshake,
  AlertTriangle,
  Brain,
  Heart,
  Target,
  CheckCircle2,
  Sparkles,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { API_URL } from "../constants/api";

type JournalEntry = {
  _id?: string;
  email: string;
  entry: string;
  date: string;
  title: string;
  mood: string;
  favorite: boolean;
};

// Map moods to Lucide icons + colors
const MOODS = [
  { label: "Happy", icon: Smile, color: "text-yellow-500" },
  { label: "Neutral", icon: Meh, color: "text-gray-500" },
  { label: "Sad", icon: Frown, color: "text-blue-600" },
  { label: "Grateful", icon: HeartHandshake, color: "text-pink-600" },
  { label: "Stressed", icon: AlertTriangle, color: "text-red-600" },
] as const;

const PROMPTS = [
  "What am I grateful for today?",
  "What challenged me today and how did I handle it?",
  "What made me smile today?",
  "What would I like to improve about today?",
  "What am I looking forward to tomorrow?",
  "How did I take care of myself today?",
  "What emotions did I experience today?",
  "What did I learn about myself today?",
];

type MoodLabel = (typeof MOODS)[number]["label"];

const getMoodMeta = (label?: string) =>
  MOODS.find((m) => m.label === label) || MOODS[0];

const Journal: React.FC = () => {
  const [title, setTitle] = useState("");
  const [mood, setMood] = useState<MoodLabel>(MOODS[0].label);
  const [newEntry, setNewEntry] = useState("");
  const [selectedPrompt, setSelectedPrompt] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterMood, setFilterMood] = useState<"All" | string>("All");
  const [showFavOnly, setShowFavOnly] = useState(false);
  const [sortBy, setSortBy] = useState<"dateDesc" | "dateAsc" | "titleAsc">(
    "dateDesc"
  );

  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);

  // Edit modal state
  const [editOpen, setEditOpen] = useState(false);
  const [editDraft, setEditDraft] = useState<JournalEntry | null>(null);

  const userEmail = localStorage.getItem("userEmail") || "";
  const userId = localStorage.getItem("userId") || "";

  // Load entries
  useEffect(() => {
    if (!userEmail) return;
    setLoading(true);
    axios
      .get<JournalEntry[]>(`${API_URL}/api/journal/${userEmail}`)
      .then((res) => {
        setJournalEntries(res.data.reverse()); // newest first
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch journals", err);
        setLoading(false);
      });
  }, [userEmail]);

  const totalEntries = journalEntries.length;
  const favoriteCount = journalEntries.filter((e) => e.favorite).length;

  const handlePromptPick = (p: string) => {
    setSelectedPrompt(p);
    if (!title) setTitle(p.slice(0, 60));
    if (!newEntry) setNewEntry(p + "\n\n");
  };

  const handleSubmitEntry = async () => {
    if (!newEntry.trim() || !userEmail) return;
    const payload: JournalEntry = {
      email: userEmail,
      entry: newEntry,
      mood,
      date: new Date().toISOString(),
      title: title || selectedPrompt || "Untitled",
      favorite: false,
    };
    try {
      const res = await axios.post<JournalEntry>(`${API_URL}/api/journal`, {
        ...payload,
        userId,
      });
      setJournalEntries((prev) => [res.data, ...prev]);
      setNewEntry("");
      setSelectedPrompt("");
      setTitle("");
      setMood(MOODS[0].label);
    } catch (err) {
      console.error("Error saving journal:", err);
      alert("Could not save entry. Please try again.");
    }
  };

  // FAVORITE toggle (Lucide star fill)
  const toggleFavorite = async (entry: JournalEntry) => {
    const nextFav = !entry.favorite;

    const prev = journalEntries;
    setJournalEntries((p) =>
      p.map((e) => (e._id === entry._id ? { ...e, favorite: nextFav } : e))
    );

    try {
      try {
        await axios.put(
          `${API_URL}/api/journal/${entry._id}/favorite`,
          { favorite: nextFav },
          { headers: { "Content-Type": "application/json" } }
        );
      } catch {
        await axios.patch(
          `${API_URL}/api/journal/${entry._id}`,
          { favorite: nextFav },
          { headers: { "Content-Type": "application/json" } }
        );
      }
    } catch (err) {
      console.error("Failed to toggle favorite:", err);
      setJournalEntries(prev);
      alert("Could not update favorite. Please try again.");
    }
  };

  const deleteEntry = async (id?: string) => {
    if (!id) return;
    if (!confirm("Delete this entry? This cannot be undone.")) return;
    const prev = [...journalEntries];
    setJournalEntries((p) => p.filter((e) => e._id !== id));
    try {
      await axios.delete(`${API_URL}/api/journal/${id}`);
    } catch (err) {
      setJournalEntries(prev); // revert on error
      console.error("Failed to delete:", err);
      alert("Could not delete entry. Please try again.");
    }
  };

  const openEdit = (entry: JournalEntry) => {
    setEditDraft({ ...entry });
    setEditOpen(true);
  };

  const saveEdit = async () => {
    if (!editDraft?._id) return;
    const { _id, title, mood, entry } = editDraft;

    const prev = journalEntries;
    // optimistic
    setJournalEntries((p) =>
      p.map((e) => (e._id === _id ? { ...e, title, mood, entry } : e))
    );
    setEditOpen(false);

    try {
      try {
        await axios.patch(
          `${API_URL}/api/journal/${_id}`,
          { title, mood, entry },
          { headers: { "Content-Type": "application/json" } }
        );
      } catch {
        await axios.put(
          `${API_URL}/api/journal/${_id}`,
          { title, mood, entry },
          { headers: { "Content-Type": "application/json" } }
        );
      }
      setEditDraft(null);
    } catch (err) {
      console.error("Failed to update entry:", err);
      setJournalEntries(prev); // revert
      setEditOpen(true); // re-open so they don't lose the draft
      alert("Could not save changes. Please try again.");
    }
  };

  const filtered = useMemo(() => {
    let list = [...journalEntries];

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      list = list.filter(
        (e) =>
          e.title?.toLowerCase().includes(q) ||
          e.entry?.toLowerCase().includes(q) ||
          e.mood?.toLowerCase().includes(q)
      );
    }
    if (filterMood !== "All") list = list.filter((e) => e.mood === filterMood);
    if (showFavOnly) list = list.filter((e) => e.favorite);

    if (sortBy === "dateDesc")
      list.sort((a, b) => +new Date(b.date) - +new Date(a.date));
    if (sortBy === "dateAsc")
      list.sort((a, b) => +new Date(a.date) - +new Date(b.date));
    if (sortBy === "titleAsc")
      list.sort((a, b) => (a.title || "").localeCompare(b.title || ""));
    return list;
  }, [journalEntries, searchTerm, filterMood, showFavOnly, sortBy]);

  // Small component to render the selected mood icon inline
  const SelectedMoodIcon: React.FC<{ label?: string; className?: string }> = ({
    label,
    className = "w-5 h-5",
  }) => {
    const meta = getMoodMeta(label);
    const Icon = meta.icon;
    return <Icon className={`${className} ${meta.color}`} />;
  };

  // ===== Benefits Flip Card (interactive, one-by-one) =====
  const benefitTips = [
    {
      title: "Clarity & Brainstorming",
      desc: "Organize thoughts and think through next steps.",
      icon: (
        <span className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-indigo-100">
          <Brain className="w-6 h-6 text-indigo-600" />
        </span>
      ),
      gradient: "from-indigo-50 to-blue-50",
    },
    {
      title: "Stress Relief",
      desc: "Release emotions safely and reduce rumination.",
      icon: (
        <span className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-rose-100">
          <Heart className="w-6 h-6 text-rose-600" />
        </span>
      ),
      gradient: "from-rose-50 to-orange-50",
    },
    {
      title: "Goal Tracking",
      desc: "See progress, habits, and patterns over time.",
      icon: (
        <span className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-green-100">
          <Target className="w-6 h-6 text-green-600" />
        </span>
      ),
      gradient: "from-green-50 to-emerald-50",
    },
    {
      title: "Mood Boost",
      desc: "Capture positives and build gratitude.",
      icon: (
        <span className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-yellow-100">
          <Smile className="w-6 h-6 text-yellow-600" />
        </span>
      ),
      gradient: "from-yellow-50 to-amber-50",
    },
  ];

  const [tipIndex, setTipIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  const activeTip = benefitTips[tipIndex];

  return (
    <div className="p-6 space-y-6">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl p-8 bg-gradient-to-r from-primary-100 to-secondary-100 border border-gray-100">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-xl bg-white/70">
              <BookOpen
                className="w-7 h-7 text-primary-700"
                aria-hidden="true"
              />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Journal</h1>
              <p className="text-gray-700">
                Capture your thoughts and reflections
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="bg-white rounded-xl px-5 py-3 border border-gray-100">
              <div className="text-2xl font-bold text-gray-900">
                {totalEntries}
              </div>
              <div className="text-xs text-gray-600">Entries</div>
            </div>
            <div className="bg-white rounded-xl px-5 py-3 border border-gray-100">
              <div className="text-2xl font-bold text-gray-900">
                {favoriteCount}
              </div>
              <div className="text-xs text-gray-600">Favorites</div>
            </div>
          </div>
        </div>

        {/* Decorative blob */}
        <svg
          className="absolute -right-10 -bottom-10 w-72 opacity-20"
          viewBox="0 0 200 200"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
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
        {/* Composer */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              New Entry
            </h2>

            {/* Title + Mood  */}
            <div className="grid md:grid-cols-3 gap-4 mb-4">
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Title (optional)"
                className="md:col-span-2 w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />

              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
                  <SelectedMoodIcon label={mood} />
                </div>
                <select
                  value={mood}
                  onChange={(e) => setMood(e.target.value as MoodLabel)}
                  className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 appearance-none bg-white"
                  title="Select mood"
                >
                  {MOODS.map((m) => (
                    <option key={m.label} value={m.label}>
                      {m.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Prompts as pills */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Need inspiration?
              </label>
              <div className="flex flex-wrap gap-2">
                {PROMPTS.map((p) => (
                  <button
                    key={p}
                    onClick={() => handlePromptPick(p)}
                    className={`px-3 py-2 rounded-full text-sm border transition ${
                      selectedPrompt === p
                        ? "border-secondary-500 bg-secondary-50"
                        : "border-gray-300 hover:bg-gray-50"
                    }`}
                    title={p}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Entry */}
            <textarea
              value={newEntry}
              onChange={(e) => setNewEntry(e.target.value)}
              placeholder="What's on your mind today? Write freely..."
              className="w-full h-56 p-4 border border-gray-300 rounded-lg resize-y focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <div className="flex items-center justify-between mt-3">
              <span className="text-sm text-gray-500">
                {newEntry.length} characters
              </span>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setTitle("");
                    setSelectedPrompt("");
                    setMood(MOODS[0].label);
                    setNewEntry("");
                  }}
                  className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Clear
                </button>
                <button
                  onClick={handleSubmitEntry}
                  disabled={!newEntry.trim()}
                  className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 disabled:opacity-50 flex items-center"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Save Entry
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Tips / Side panel */}
        <div className="space-y-6">
          {/* TIPS*/}
          <div className="bg-gradient-to-br from-secondary-50 via-accent-50 to-primary-50 p-6 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-900">
                Journaling Tips
              </h3>
              <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-500">
                <Sparkles className="w-4 h-4" />
                Quick wins
              </span>
            </div>

            <ul className="divide-y divide-gray-100">
              <li className="py-3 flex items-start gap-3">
                <div className="h-5 w-1 rounded bg-amber-400 mt-0.5" />
                <div className="flex items-start gap-2 text-sm text-gray-700">
                  <CheckCircle2 className="w-4 h-4 text-amber-600 mt-0.5" />
                  <span>Write without judgment</span>
                </div>
              </li>
              <li className="py-3 flex items-start gap-3">
                <div className="h-5 w-1 rounded bg-blue-400 mt-0.5" />
                <div className="flex items-start gap-2 text-sm text-gray-700">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 mt-0.5" />
                  <span>Be honest and expressive</span>
                </div>
              </li>
              <li className="py-3 flex items-start gap-3">
                <div className="h-5 w-1 rounded bg-violet-400 mt-0.5" />
                <div className="flex items-start gap-2 text-sm text-gray-700">
                  <CheckCircle2 className="w-4 h-4 text-violet-600 mt-0.5" />
                  <span>Use prompts when stuck</span>
                </div>
              </li>
              <li className="py-3 flex items-start gap-3">
                <div className="h-5 w-1 rounded bg-emerald-400 mt-0.5" />
                <div className="flex items-start gap-2 text-sm text-gray-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5" />
                  <span>Reflect often and revisit older entries</span>
                </div>
              </li>
              <li className="py-3 flex items-start gap-3">
                <div className="h-5 w-1 rounded bg-yellow-400 mt-0.5" />
                <div className="flex items-start gap-2 text-sm text-gray-700">
                  <CheckCircle2 className="w-4 h-4 text-yellow-600 mt-0.5" />
                  <span>Mark favorites to build a positivity playlist</span>
                </div>
              </li>
              <li className="py-3 flex items-start gap-3">
                <div className="h-5 w-1 rounded bg-rose-400 mt-0.5" />
                <div className="flex items-start gap-2 text-sm text-gray-700">
                  <CheckCircle2 className="w-4 h-4 text-rose-600 mt-0.5" />
                  <span>Stay consistent — 5 min daily &gt; 30 min weekly</span>
                </div>
              </li>
            </ul>
          </div>

          {/* BENEFITS — interactive single flip card */}
          <div className="relative overflow-hidden p-6 rounded-2xl border border-transparent bg-gradient-to-br from-primary-50 via-secondary-50 to-secondary-100">
            {/* Decorative blob */}
            <svg
              className="absolute -right-10 -bottom-14 w-64 opacity-20"
              viewBox="0 0 200 200"
            >
              <path
                fill="currentColor"
                className="text-primary-300"
                d="M38.1,-53.2C49.2,-45.6,57.4,-34.4,62.1,-22.2C66.9,-10.1,68.2,3.1,64.2,14.4C60.2,25.7,50.8,35.1,40.1,44.7C29.4,54.3,17.3,64,3.8,67.1C-9.8,70.2,-19.6,66.7,-30.1,61.1C-40.6,55.5,-51.9,47.8,-58.5,37.2C-65.1,26.5,-67,13.3,-64.6,1.2C-62.2,-10.9,-55.4,-21.7,-48.5,-32.2C-41.6,-42.7,-34.7,-52.9,-25.4,-61.1C-16.1,-69.4,-8.1,-75.7,2.1,-78.8C12.4,-81.8,24.8,-81,38.1,-53.2Z"
                transform="translate(100 100)"
              />
            </svg>

            <h3 className="text-lg font-semibold text-gray-900 mb-4 relative z-10">
              Benefits of Journaling
            </h3>

            {/* Card wrapper */}
            <div className="relative z-10">
              {/* Flip card container with perspective */}
              <div
                className={`rounded-xl border border-white/60 bg-gradient-to-br ${activeTip.gradient} p-4 shadow-sm`}
                style={{ perspective: "1000px" }}
              >
                {/* 3D inner */}
                <div
                  onClick={() => setFlipped((f) => !f)}
                  className="cursor-pointer relative w-full h-36"
                  style={{
                    transformStyle: "preserve-3d",
                    transform: flipped ? "rotateY(180deg)" : "none",
                    transition: "transform 500ms",
                  }}
                  title="Click to flip"
                >
                  {/* Front */}
                  <div
                    className="absolute inset-0 rounded-lg bg-white/70 backdrop-blur flex items-center justify-between px-5"
                    style={{ backfaceVisibility: "hidden" }}
                  >
                    <div className="flex items-center gap-3">
                      <span className="inline-flex items-center justify-center h-9 w-9 rounded-full bg-white shadow">
                        {activeTip.icon}
                      </span>
                      <p className="text-sm font-medium text-gray-900">
                        {activeTip.title}
                      </p>
                    </div>
                    <span className="text-xs text-gray-500">Click to flip</span>
                  </div>

                  {/* Back */}
                  <div
                    className="absolute inset-0 rounded-lg bg-white/80 backdrop-blur flex items-center justify-center px-6 text-center"
                    style={{
                      transform: "rotateY(180deg)",
                      backfaceVisibility: "hidden",
                    }}
                  >
                    <p className="text-sm text-gray-800">{activeTip.desc}</p>
                  </div>
                </div>
              </div>

              {/* Prev / Next */}
              {/* Controls under the card */}
              <div className="flex items-center justify-center gap-4 mt-4">
                <button
                  onClick={() => {
                    setTipIndex(
                      (i) => (i - 1 + benefitTips.length) % benefitTips.length
                    );
                    setFlipped(false);
                  }}
                  className="p-2 rounded-lg bg-white/70 hover:bg-white border border-white/60"
                  title="Previous"
                >
                  <ChevronLeft className="w-4 h-4 text-gray-700" />
                </button>

                <button
                  onClick={() => {
                    setTipIndex((i) => (i + 1) % benefitTips.length);
                    setFlipped(false);
                  }}
                  className="p-2 rounded-lg bg-white/70 hover:bg-white border border-white/60"
                  title="Next"
                >
                  <ChevronRight className="w-4 h-4 text-gray-700" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Entries  */}
      <div className="rounded-2xl p-6 shadow-sm border border-gray-100 bg-gradient-to-br from-primary-50 via-accent-100 to-secondary-200 min-h-[65vh]">
        {/* Toolbar */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Your Entries</h2>
          <div className="flex flex-wrap gap-2 md:justify-end">
            {/* search */}
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-600" />
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-400 bg-white/80"
              />
            </div>
            {/* filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-700" />
              <select
                value={filterMood}
                onChange={(e) => setFilterMood(e.target.value as any)}
                className="py-2 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-400 bg-white/80"
              >
                <option>All</option>
                {MOODS.map((m) => (
                  <option key={m.label}>{m.label}</option>
                ))}
              </select>
            </div>
            {/* fav only */}
            <button
              onClick={() => setShowFavOnly((s) => !s)}
              className={`px-3 py-2 rounded-lg border text-sm flex items-center gap-1 transition ${
                showFavOnly
                  ? "border-yellow-500 bg-yellow-100"
                  : "border-gray-300 bg-white/80 hover:bg-white"
              }`}
              title="Show favorites only"
            >
              <Star
                className={`w-4 h-4 ${
                  showFavOnly ? "text-yellow-600" : "text-gray-600"
                }`}
                fill={showFavOnly ? "currentColor" : "none"}
              />
              Favs
            </button>
            {/* sort */}
            <button
              onClick={() =>
                setSortBy((s) =>
                  s === "dateDesc"
                    ? "dateAsc"
                    : s === "dateAsc"
                    ? "titleAsc"
                    : "dateDesc"
                )
              }
              className="px-3 py-2 rounded-lg border border-gray-300 text-sm flex items-center gap-1 hover:bg-white/80 bg-white/80"
              title="Change sort"
            >
              {sortBy === "dateDesc" && <SortDesc className="w-4 h-4" />}
              {sortBy === "dateAsc" && <SortAsc className="w-4 h-4" />}
              {sortBy === "titleAsc" && <SortAsc className="w-4 h-4" />}
              Sort
            </button>
          </div>
        </div>

        {/* List / Loading / Empty */}
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="animate-pulse h-24 bg-white/70 rounded-xl"
              />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-3">🗒️</div>
            <p className="text-gray-800 font-semibold text-lg">
              No entries found
            </p>
            <p className="text-sm text-gray-700">
              Try adjusting your filters or start a new entry.
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {filtered.map((entry) => {
              const meta = getMoodMeta(entry.mood);
              const MoodIcon = meta.icon;
              return (
                <div
                  key={entry._id}
                  className="border border-gray-200 bg-white/90 rounded-xl p-6 hover:shadow-lg hover:bg-white transition"
                >
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex items-start gap-4">
                      <div className="mt-0.5">
                        <MoodIcon className={`w-7 h-7 ${meta.color}`} />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-gray-900">
                          {entry.title || "Untitled"}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="w-4 h-4" />
                          <span>
                            {new Date(entry.date).toLocaleDateString()}
                          </span>
                          <span>• {entry.mood}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleFavorite(entry)}
                        className="p-2 rounded-lg hover:bg-yellow-50"
                        title={entry.favorite ? "Unfavorite" : "Favorite"}
                      >
                        <Star
                          className={`w-5 h-5 ${
                            entry.favorite ? "text-yellow-600" : "text-gray-600"
                          }`}
                          fill={entry.favorite ? "currentColor" : "none"}
                        />
                      </button>
                      <button
                        onClick={() => openEdit(entry)}
                        className="p-2 rounded-lg hover:bg-blue-50"
                        title="Edit"
                      >
                        <Edit3 className="w-5 h-5 text-blue-600" />
                      </button>
                      <button
                        onClick={() => deleteEntry(entry._id)}
                        className="p-2 rounded-lg hover:bg-red-50"
                        title="Delete"
                      >
                        <Trash2 className="w-5 h-5 text-red-600" />
                      </button>
                    </div>
                  </div>
                  <p className="text-gray-800 text-base whitespace-pre-wrap leading-relaxed">
                    {entry.entry}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editOpen && editDraft && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl border border-gray-100">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">Edit Entry</h3>
              <button
                className="p-2 rounded-lg hover:bg-gray-100"
                onClick={() => {
                  setEditOpen(false);
                  setEditDraft(null);
                }}
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
                <input
                  value={editDraft.title || ""}
                  onChange={(e) =>
                    setEditDraft({ ...editDraft, title: e.target.value })
                  }
                  placeholder="Title"
                  className="md:col-span-2 w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />

                {/* Mood select with inline icon */}
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
                    <SelectedMoodIcon label={editDraft.mood} />
                  </div>
                  <select
                    value={editDraft.mood}
                    onChange={(e) =>
                      setEditDraft({ ...editDraft, mood: e.target.value })
                    }
                    className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    {MOODS.map((m) => (
                      <option key={m.label} value={m.label}>
                        {m.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <textarea
                value={editDraft.entry}
                onChange={(e) =>
                  setEditDraft({ ...editDraft, entry: e.target.value })
                }
                rows={8}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div className="flex items-center justify-end gap-3 p-4 border-t">
              <button
                onClick={() => {
                  setEditOpen(false);
                  setEditDraft(null);
                }}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={saveEdit}
                className="px-5 py-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Journal;
