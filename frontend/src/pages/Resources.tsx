import React, { useMemo, useState } from "react";
import {
  Library,
  Book,
  Video,
  Headphones,
  ExternalLink,
  Search,
  Filter,
  Star,
  Clock,
} from "lucide-react";

type CategoryId = "all" | "books" | "videos" | "podcasts";

type Resource = {
  id: number;
  category: Exclude<CategoryId, "all">;
  title: string;
  author: string;
  description: string;
  rating: number; // 0–5
  duration: string; // e.g. "10 minutes", "6 hour read"
  image: string;
  link: string;
  featured: boolean;
};

const categories: { id: CategoryId; name: string; icon: any }[] = [
  { id: "all", name: "All Resources", icon: Library },
  { id: "books", name: "Books", icon: Book },
  { id: "videos", name: "Videos", icon: Video },
  { id: "podcasts", name: "Podcasts", icon: Headphones },
];

// ---- helpers
const durationToMinutes = (text: string): number => {
  // Handles “10 minutes”, “15 min”, “6 hour read”, “30–45 min episodes”, etc.
  const normalized = text
    .toLowerCase()
    .replace(/read|episodes?/g, "")
    .trim();

  // grab all numbers in the string (supports ranges)
  const nums = (normalized.match(/(\d+(\.\d+)?)/g) || []).map(Number);
  if (nums.length === 0) return Number.POSITIVE_INFINITY;

  // average if it's a range like “30-45”
  const avg = nums.reduce((a, b) => a + b, 0) / nums.length;

  if (/\bhour|hr\b/.test(normalized)) return Math.round(avg * 60);
  return Math.round(avg); // treat as minutes
};

type SortKey = "rating" | "title" | "duration";

const Resources: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<CategoryId>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<SortKey>("rating");

  const resources: Resource[] = [
    // Books
    {
      id: 1,
      category: "books",
      title: "The Anxiety and Depression Toolkit",
      author: "Alice Boyes",
      description:
        "Simple strategies for anyone who struggles with anxiety or depression.",
      rating: 4.8,
      duration: "6 hour read",
      image:
        "https://images.pexels.com/photos/159866/books-book-pages-read-literature-159866.jpeg?auto=compress&cs=tinysrgb&w=300&h=400&fit=crop",
      link: "https://www.aliceboyes.com/books/",
      featured: true,
    },
    {
      id: 2,
      category: "books",
      title: "Mindfulness for Beginners",
      author: "Jon Kabat-Zinn",
      description:
        "Reclaiming the present moment and your life through mindfulness meditation.",
      rating: 4.7,
      duration: "4 hour read",
      image:
        "https://images.pexels.com/photos/1319854/pexels-photo-1319854.jpeg?auto=compress&cs=tinysrgb&w=300&h=400&fit=crop",
      link: "https://www.mindfulnesscds.com/products/mindfulness-for-beginners",
      featured: false,
    },
    {
      id: 3,
      category: "books",
      title: "Feeling Good: The New Mood Therapy",
      author: "David D. Burns",
      description:
        "Clinically proven techniques for overcoming depression and anxiety.",
      rating: 4.9,
      duration: "8 hour read",
      image:
        "https://images.pexels.com/photos/1370295/pexels-photo-1370295.jpeg?auto=compress&cs=tinysrgb&w=300&h=400&fit=crop",
      link: "https://feelinggood.com/books/",
      featured: true,
    },

    // Videos
    {
      id: 4,
      category: "videos",
      title: "10-Minute Daily Meditation",
      author: "Headspace",
      description:
        "A guided meditation perfect for building a daily mindfulness practice.",
      rating: 4.6,
      duration: "10 minutes",
      image:
        "https://images.pexels.com/photos/3822622/pexels-photo-3822622.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop",
      link: "https://www.youtube.com/@headspace",
      featured: false,
    },
    {
      id: 5,
      category: "videos",
      title: "Understanding Anxiety",
      author: "TED-Ed",
      description:
        "What happens when you have anxiety and how to manage it effectively.",
      rating: 4.8,
      duration: "5 minutes",
      image:
        "https://images.pexels.com/photos/3822567/pexels-photo-3822567.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop",
      link: "https://www.youtube.com/@TEDEd",
      featured: true,
    },
    {
      id: 6,
      category: "videos",
      title: "Breathing Techniques for Stress",
      author: "Yoga with Adriene",
      description: "Simple breathing exercises to reduce stress and find calm.",
      rating: 4.7,
      duration: "15 minutes",
      image:
        "https://images.pexels.com/photos/3822844/pexels-photo-3822844.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop",
      link: "https://www.youtube.com/@yogawithadriene",
      featured: false,
    },

    // Podcasts
    {
      id: 7,
      category: "podcasts",
      title: "The Happiness Lab",
      author: "Dr. Laurie Santos",
      description:
        "Insights from the latest scientific research on how to be happier.",
      rating: 4.9,
      duration: "30–45 min episodes",
      image:
        "https://images.pexels.com/photos/3785079/pexels-photo-3785079.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop",
      link: "https://www.happinesslab.fm/",
      featured: true,
    },
    {
      id: 8,
      category: "podcasts",
      title: "On Being",
      author: "Krista Tippett",
      description:
        "Conversations about meaning, spirituality, and what it means to be human.",
      rating: 4.8,
      duration: "45–60 min episodes",
      image:
        "https://images.pexels.com/photos/3756774/pexels-photo-3756774.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop",
      link: "https://onbeing.org/series/podcast/",
      featured: false,
    },
    {
      id: 9,
      category: "podcasts",
      title: "Ten Percent Happier",
      author: "Dan Harris",
      description:
        "Practical meditation and mindfulness advice from leading experts.",
      rating: 4.7,
      duration: "20–40 min episodes",
      image:
        "https://images.pexels.com/photos/3756766/pexels-photo-3756766.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop",
      link: "https://www.tenpercent.com/podcast",
      featured: true,
    },
  ];

  const filteredAndSorted = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    const filtered = resources.filter((r) => {
      const matchesCategory =
        activeCategory === "all" || r.category === activeCategory;
      if (!matchesCategory) return false;

      if (!term) return true;
      const hay = `${r.title} ${r.author} ${r.description}`.toLowerCase();
      return hay.includes(term);
    });

    const sorted = [...filtered].sort((a, b) => {
      if (sortBy === "rating") return b.rating - a.rating;
      if (sortBy === "title") return a.title.localeCompare(b.title);
      // duration: shortest first
      return durationToMinutes(a.duration) - durationToMinutes(b.duration);
    });

    return sorted;
  }, [resources, activeCategory, searchTerm, sortBy]);

  const featuredResources = useMemo(
    () => resources.filter((r) => r.featured).slice(0, 3),
    [resources]
  );

  // --- banner stats ---
  const total = resources.length;
  const featuredCount = featuredResources.length;
  const avgRating = useMemo(() => {
    const sum = resources.reduce((s, r) => s + r.rating, 0);
    return (sum / resources.length).toFixed(1);
  }, [resources]);

  return (
    <div className="p-6 space-y-6">
      {/* HERO — unified with other pages */}
      <div className="relative overflow-hidden rounded-2xl p-8 bg-gradient-to-r from-primary-100 to-secondary-100 border border-gray-100">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-xl bg-white/70">
              <Library className="w-7 h-7 text-indigo-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Resources</h1>
              <p className="text-gray-700">
                Curated content to support your mental wellness journey
              </p>
            </div>
          </div>

          {/* Quick stats in header */}
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="bg-white rounded-xl px-5 py-3 border border-gray-100">
              <div className="text-xs text-gray-600 mb-0.5">Total</div>
              <div className="text-2xl font-bold text-gray-900">{total}</div>
            </div>
            <div className="bg-white rounded-xl px-5 py-3 border border-gray-100">
              <div className="text-xs text-gray-600 mb-0.5">Featured</div>
              <div className="text-2xl font-bold text-gray-900">
                {featuredCount}
              </div>
            </div>
            <div className="bg-white rounded-xl px-5 py-3 border border-gray-100">
              <div className="text-xs text-gray-600 mb-0.5">Avg Rating</div>
              <div className="text-2xl font-bold text-gray-900">
                {avgRating}
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

      {/* Featured */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-8 text-white">
        <h2 className="text-2xl font-bold mb-6">Featured This Week</h2>
        <div className="grid md:grid-cols-3 gap-4">
          {featuredResources.map((r) => (
            <div
              key={r.id}
              className="bg-white/10 backdrop-blur-sm rounded-lg p-4 hover:bg-white/20 transition-colors duration-200"
            >
              <h3 className="font-semibold mb-1">{r.title}</h3>
              <p className="text-sm text-indigo-100 mb-3">{r.author}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1">
                  <Star className="w-4 h-4 fill-current" />
                  <span className="text-sm">{r.rating.toFixed(1)}</span>
                </div>
                <a
                  href={r.link}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs bg-white/20 hover:bg-white/30 px-3 py-1 rounded-full transition-colors duration-200"
                >
                  View
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Search + Sort */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search resources..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-400" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortKey)}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <option value="rating">Sort by Rating</option>
            <option value="title">Sort by Title (A–Z)</option>
            <option value="duration">Sort by Duration (shortest)</option>
          </select>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2">
        {categories.map((c) => {
          const Icon = c.icon;
          const isActive = activeCategory === c.id;
          return (
            <button
              key={c.id}
              onClick={() => setActiveCategory(c.id)}
              className={[
                "flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors duration-200",
                isActive
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200",
              ].join(" ")}
            >
              <Icon className="w-4 h-4" />
              <span>{c.name}</span>
            </button>
          );
        })}
      </div>

      {/* Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAndSorted.map((r) => (
          <div
            key={r.id}
            className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-200"
          >
            <div className="relative">
              <img
                src={r.image}
                alt={r.title}
                className="w-full h-48 object-cover"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src =
                    "https://via.placeholder.com/600x320?text=Resource";
                }}
              />
              {r.featured && (
                <div className="absolute top-3 left-3 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded-full">
                  Featured
                </div>
              )}
              <div className="absolute top-3 right-3 bg-black/50 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>{r.duration}</span>
              </div>
            </div>

            <div className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span
                  className={[
                    "text-xs font-medium px-2 py-1 rounded-full capitalize",
                    r.category === "books"
                      ? "bg-blue-100 text-blue-700"
                      : r.category === "videos"
                      ? "bg-red-100 text-red-700"
                      : "bg-green-100 text-green-700",
                  ].join(" ")}
                >
                  {r.category}
                </span>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-current text-yellow-400" />
                  <span className="text-sm font-medium text-gray-700">
                    {r.rating.toFixed(1)}
                  </span>
                </div>
              </div>

              <h3 className="font-semibold text-gray-900 mb-1">{r.title}</h3>
              <p className="text-sm text-gray-600 mb-2">{r.author}</p>
              <p className="text-sm text-gray-700 mb-4 line-clamp-2">
                {r.description}
              </p>

              <a
                href={r.link}
                target="_blank"
                rel="noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 bg-gray-900 text-white py-2 px-4 rounded-lg font-medium hover:bg-gray-800 transition-colors duration-200"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Access Resource</span>
              </a>
            </div>
          </div>
        ))}
      </div>

      {filteredAndSorted.length === 0 && (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No resources found
          </h3>
          <p className="text-gray-600">
            Try adjusting your search or filter criteria
          </p>
        </div>
      )}
    </div>
  );
};

export default Resources;
