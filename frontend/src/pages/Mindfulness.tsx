import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Leaf,
  Play,
  Pause,
  RotateCcw,
  Wind,
  Heart,
  Clock,
  Star,
} from "lucide-react";

const Mindfulness: React.FC = () => {
  const [activeSession, setActiveSession] = useState<string | null>(null);
  const [sessionTime, setSessionTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  // Breathing circle state
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [phaseElapsed, setPhaseElapsed] = useState(0);
  const [scale, setScale] = useState(1);
  const tickRef = useRef<number | null>(null);

  // --- Keep your arrays as-is ---
  const breathingExercises = [
    {
      id: "box-breathing",
      title: "Box Breathing",
      description: "Breathe in for 4, hold for 4, out for 4, hold for 4",
      duration: "5-10 minutes",
      difficulty: "Beginner",
      icon: Wind,
      color: "bg-blue-500",
      audio: "https://pixabay.com/music/upbeat-breathing-waves-304927/",
    },
    {
      id: "478-breathing",
      title: "4-7-8 Breathing",
      description: "Inhale for 4, hold for 7, exhale for 8",
      duration: "3-5 minutes",
      difficulty: "Intermediate",
      icon: Heart,
      color: "bg-green-500",
      audio:
        "https://cdn.pixabay.com/download/audio/2022/03/15/audio_08c5f4e5fd.mp3?filename=calm-meditation-112934.mp3",
    },
    {
      id: "coherent-breathing",
      title: "Coherent Breathing",
      description: "Equal inhale and exhale for 5 seconds each",
      duration: "10-20 minutes",
      difficulty: "Beginner",
      icon: Leaf,
      color: "bg-teal-500",
      audio:
        "https://cdn.pixabay.com/download/audio/2022/10/25/audio_60e1585a2a.mp3?filename=deep-meditation-ambient-124008.mp3",
    },
  ];

  const meditations = [
    {
      id: "body-scan",
      title: "Body Scan Meditation",
      description: "Progressive relaxation through body awareness",
      duration: "15 minutes",
      category: "Relaxation",
      image:
        "https://images.pexels.com/photos/3822622/pexels-photo-3822622.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop",
    },
    {
      id: "loving-kindness",
      title: "Loving-Kindness Meditation",
      description: "Cultivate compassion for yourself and others",
      duration: "10 minutes",
      category: "Compassion",
      image:
        "https://images.pexels.com/photos/3822567/pexels-photo-3822567.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop",
    },
    {
      id: "mindful-breathing",
      title: "Mindful Breathing",
      description: "Focus on the breath to anchor your attention",
      duration: "5 minutes",
      category: "Focus",
      image:
        "https://images.pexels.com/photos/3822844/pexels-photo-3822844.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop",
    },
    {
      id: "walking-meditation",
      title: "Walking Meditation",
      description: "Mindful movement and awareness",
      duration: "20 minutes",
      category: "Movement",
      image:
        "https://images.pexels.com/photos/3822693/pexels-photo-3822693.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop",
    },
  ];

  const quickActivities = [
    { title: "1-Minute Breathing", duration: "1 min", icon: Wind },
    { title: "5-4-3-2-1 Grounding", duration: "3 min", icon: Star },
    { title: "Gratitude Moment", duration: "2 min", icon: Heart },
    { title: "Mindful Listening", duration: "5 min", icon: Leaf },
  ];

  // ----- PHASE PATTERNS (seconds per step) -----
  type Phase = { label: "Inhale" | "Hold" | "Exhale"; seconds: number };
  const patterns: Record<string, Phase[]> = {
    "box-breathing": [
      { label: "Inhale", seconds: 4 },
      { label: "Hold", seconds: 4 },
      { label: "Exhale", seconds: 4 },
      { label: "Hold", seconds: 4 },
    ],
    "478-breathing": [
      { label: "Inhale", seconds: 4 },
      { label: "Hold", seconds: 7 },
      { label: "Exhale", seconds: 8 },
      { label: "Hold", seconds: 4 }, // finishing hold for smooth loop
    ],
    "coherent-breathing": [
      { label: "Inhale", seconds: 5 },
      { label: "Exhale", seconds: 5 },
    ],
  };

  const currentPattern = useMemo<Phase[]>(() => {
    if (!activeSession) return [];
    return patterns[activeSession] || patterns["box-breathing"];
  }, [activeSession]);

  const currentPhase = currentPattern[phaseIndex] || {
    label: "Inhale",
    seconds: 4,
  };
  const phaseProgress =
    currentPhase.seconds > 0
      ? Math.min(phaseElapsed / currentPhase.seconds, 1)
      : 0;

  // Session timer every 1s
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isRunning) {
      interval = setInterval(() => setSessionTime((t) => t + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  // Breathing engine: smooth tick ~10fps to update phaseElapsed + auto-advance
  useEffect(() => {
    if (!activeSession || !isRunning || currentPattern.length === 0) return;

    const targetScale =
      currentPhase.label === "Inhale"
        ? 1.25
        : currentPhase.label === "Exhale"
        ? 0.8
        : scale; // Hold keeps current scale

    setScale(targetScale);

    const start = performance.now();
    const durationMs = currentPhase.seconds * 1000;

    const tick = (now: number) => {
      const elapsedMs = now - start;
      const newElapsedSec = Math.min(durationMs, elapsedMs) / 1000;
      setPhaseElapsed(newElapsedSec);

      if (elapsedMs >= durationMs) {
        setPhaseIndex((i) => (i + 1) % currentPattern.length);
        setPhaseElapsed(0);
        return;
      }
      tickRef.current = requestAnimationFrame(tick);
    };

    tickRef.current = requestAnimationFrame(tick);
    return () => {
      if (tickRef.current) cancelAnimationFrame(tickRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    activeSession,
    isRunning,
    phaseIndex,
    currentPhase.seconds,
    currentPhase.label,
  ]);

  // Reset phase when a new session starts/stops
  useEffect(() => {
    if (!activeSession) {
      setPhaseIndex(0);
      setPhaseElapsed(0);
      setScale(1);
    }
  }, [activeSession]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const startSession = (sessionId: string) => {
    setActiveSession(sessionId);
    setSessionTime(0);
    setPhaseIndex(0);
    setPhaseElapsed(0);
    setIsRunning(true);
  };

  const toggleSession = () => setIsRunning((v) => !v);

  const resetSession = () => {
    setActiveSession(null);
    setSessionTime(0);
    setIsRunning(false);
  };

  // ---------- UI ----------
  return (
    <div className="p-6 space-y-6">
      {/* HERO — unified with other pages */}
      <div className="relative overflow-hidden rounded-2xl p-8 bg-gradient-to-r from-primary-100 to-secondary-100 border border-gray-100">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-xl bg-white/70">
              <Leaf className="w-7 h-7 text-emerald-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Mindfulness</h1>
              <p className="text-gray-700">
                Find peace through breathing, meditation, and awareness
              </p>
            </div>
          </div>

          {/* Quick hero stats */}
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="bg-white rounded-xl px-5 py-3 border border-gray-100">
              <div className="text-xs text-gray-600 mb-0.5">Session Time</div>
              <div className="text-2xl font-bold text-gray-900">
                {formatTime(sessionTime)}
              </div>
            </div>
            <div className="bg-white rounded-xl px-5 py-3 border border-gray-100">
              <div className="text-xs text-gray-600 mb-0.5">Current Phase</div>
              <div className="text-2xl font-bold text-gray-900">
                {activeSession ? currentPhase.label : "—"}
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

      {/* Active Session — Breathing Circle */}
      {activeSession && (
        <div
          className="rounded-2xl p-8 text-white relative overflow-hidden"
          style={{ background: "linear-gradient(90deg, #22c55e, #14b8a6)" }}
        >
          <div className="max-w-xl mx-auto text-center space-y-6">
            <h2 className="text-2xl font-bold">
              {breathingExercises.find((ex) => ex.id === activeSession)
                ?.title || "Breathing Session"}
            </h2>

            {/* Circle with conic progress + scaling orb */}
            <div
              className="relative mx-auto"
              style={{ width: 220, height: 220 }}
            >
              {/* Progress ring */}
              <div
                className="absolute inset-0 rounded-full"
                style={{
                  background: `conic-gradient(rgba(255,255,255,0.9) ${
                    phaseProgress * 360
                  }deg, rgba(255,255,255,0.25) 0deg)`,
                }}
              />
              {/* Inner track */}
              <div className="absolute inset-3 rounded-full bg-white/15 backdrop-blur-sm" />
              {/* Breathing orb */}
              <div
                className="absolute inset-8 rounded-full bg-white/90 text-gray-900 flex items-center justify-center shadow-2xl"
                style={{
                  transform: `scale(${scale})`,
                  transition: `transform ${Math.max(
                    currentPhase.seconds,
                    0.2
                  )}s ease-in-out`,
                }}
              >
                <div>
                  <div className="text-sm uppercase tracking-wide text-gray-600">
                    {currentPhase.label}
                  </div>
                  <div className="text-4xl font-extrabold tabular-nums">
                    {Math.ceil(currentPhase.seconds - phaseElapsed)}
                  </div>
                </div>
              </div>
            </div>

            {/* Timer + controls */}
            <div className="flex items-center justify-center gap-4">
              <div className="text-5xl font-mono font-bold">
                {formatTime(sessionTime)}
              </div>
            </div>
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={toggleSession}
                className="bg-white/20 hover:bg-white/30 p-4 rounded-full transition-colors duration-200"
                aria-label={isRunning ? "Pause" : "Play"}
              >
                {isRunning ? (
                  <Pause className="w-8 h-8" />
                ) : (
                  <Play className="w-8 h-8" />
                )}
              </button>
              <button
                onClick={resetSession}
                className="bg-white/20 hover:bg-white/30 p-4 rounded-full transition-colors duration-200"
                aria-label="Reset"
              >
                <RotateCcw className="w-8 h-8" />
              </button>
            </div>

            {/* Pattern legend */}
            <div className="flex flex-wrap items-center justify-center gap-2 text-sm">
              {currentPattern.map((p, i) => (
                <span
                  key={i}
                  className={`px-2 py-1 rounded-full ${
                    i === phaseIndex
                      ? "bg-white text-emerald-700"
                      : "bg-white/20 text-white"
                  }`}
                >
                  {p.label} {p.seconds}s
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Quick Activities */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Quick Activities
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActivities.map((activity, index) => {
            const Icon = activity.icon as any;
            return (
              <button
                key={index}
                onClick={() => startSession("box-breathing")} // quick actions start a simple session
                className="p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors duration-200 text-center"
              >
                <Icon className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <h3 className="font-medium text-gray-900 text-sm">
                  {activity.title}
                </h3>
                <p className="text-xs text-gray-600 mt-1">
                  {activity.duration}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Breathing Exercises (unchanged list; Start opens the circle above) */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Breathing Exercises
          </h2>
          <div className="space-y-4">
            {breathingExercises.map((exercise) => {
              const Icon = exercise.icon as any;
              return (
                <div
                  key={exercise.id}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors duration-200"
                >
                  <div className="flex items-start space-x-4">
                    <div
                      className={`p-3 rounded-lg ${exercise.color} text-white`}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-gray-900">
                          {exercise.title}
                        </h3>
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                          {exercise.difficulty}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm mb-3">
                        {exercise.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                          <Clock className="w-4 h-4" />
                          <span>{exercise.duration}</span>
                        </div>
                        <button
                          onClick={() => startSession(exercise.id)}
                          className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors duration-200 flex items-center space-x-2"
                        >
                          <Play className="w-4 h-4" />
                          <span>Start</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Guided Meditations */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Guided Meditations
          </h2>
          <div className="space-y-4">
            {meditations.map((meditation) => (
              <div
                key={meditation.id}
                className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow duration-200"
              >
                <div className="relative h-32">
                  <img
                    src={meditation.image}
                    alt={meditation.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                    <button className="bg-white/20 hover:bg-white/30 p-3 rounded-full transition-colors duration-200">
                      <Play className="w-6 h-6 text-white" />
                    </button>
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-900">
                      {meditation.title}
                    </h3>
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                      {meditation.category}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm mb-3">
                    {meditation.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <Clock className="w-4 h-4" />
                      <span>{meditation.duration}</span>
                    </div>
                    <button className="text-green-600 hover:text-green-700 text-sm font-medium">
                      Listen Now
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Progress Stats (placeholder/static as in original) */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          Your Mindfulness Journey
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">180</div>
            <p className="text-gray-600">Minutes This Week</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">12</div>
            <p className="text-gray-600">Sessions Completed</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">7</div>
            <p className="text-gray-600">Day Streak</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-amber-600 mb-2">24</div>
            <p className="text-gray-600">Total Hours</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Mindfulness;
