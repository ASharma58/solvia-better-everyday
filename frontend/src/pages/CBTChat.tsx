import React, { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import {
  MessageCircle,
  Send,
  Brain,
  Lightbulb,
  Target,
  RefreshCw,
  User,
  Bot,
} from "lucide-react";
import { API_URL } from "../constants/api";

/* --- Local types --- */
type MessageType = "user" | "assistant";

type ChatMessage = {
  id: string | number;
  type: MessageType;
  content: string;
  timestamp: Date;
};

interface ChatResponse {
  choices: {
    message: {
      content: string;
    };
  }[];
}

/* --- Backend payload type --- */
interface BackendMessage {
  _id: string;
  userId: string;
  email: string;
  sender: "user" | "assistant";
  content: string;
  timestamp?: string;
  createdAt?: string;
  date?: string;
}

/* --- Utils --- */
const startOfDay = (d: Date) =>
  new Date(d.getFullYear(), d.getMonth(), d.getDate());
const toYMD = (d: Date) => d.toISOString().slice(0, 10);

// Tips content
const TIPS: string[] = [
  "Name the thought. Notice the feeling. Let them be separate.",
  "If a friend said this about themselves, what would you tell them?",
  "Look for the 10% you can control today.",
  "Replace “always/never” with specific facts.",
  "A 2-minute walk counts. Tiny actions change momentum.",
  "You don’t have to believe a thought to write it down.",
  "Ask: What evidence supports this? What evidence does not?",
  "Postpone worry for 15 minutes; most of it dissolves.",
  "Rate the intensity (0–10) before/after a reframe.",
];

const CARD_COLORS = [
  "from-indigo-50 to-indigo-100 text-indigo-900 border-indigo-200",
  "from-purple-50 to-purple-100 text-purple-900 border-purple-200",
  "from-rose-50 to-rose-100 text-rose-900 border-rose-200",
  "from-emerald-50 to-emerald-100 text-emerald-900 border-emerald-200",
  "from-amber-50 to-amber-100 text-amber-900 border-amber-200",
  "from-sky-50 to-sky-100 text-sky-900 border-sky-200",
];

const CBTChat: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [loading, setLoading] = useState(true);

  const userEmail =
    localStorage.getItem("userEmail") || "anonymous@example.com";
  const userId = localStorage.getItem("userId") || "anonymous";

  const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY as string | undefined;

  const bottomRef = useRef<HTMLDivElement | null>(null);
  const scrollToBottom = () =>
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });

  const cbtTechniques = [
    {
      icon: Brain,
      title: "Thought Records",
      description: "Identify and challenge negative thought patterns",
      prompt:
        "I'd like to work on identifying some negative thoughts I've been having.",
      color: "text-indigo-600",
    },
    {
      icon: Lightbulb,
      title: "Cognitive Distortions",
      description: "Recognize common thinking errors",
      prompt:
        "Can you help me identify if I'm experiencing cognitive distortions?",
      color: "text-amber-600",
    },
    {
      icon: Target,
      title: "Behavioral Activation",
      description: "Plan activities to improve mood",
      prompt: "I'd like help planning activities that could improve my mood.",
      color: "text-emerald-600",
    },
    {
      icon: RefreshCw,
      title: "Thought Challenging",
      description: "Reframe unhelpful thoughts",
      prompt: "I want to challenge some unhelpful thoughts I'm having.",
      color: "text-purple-600",
    },
  ];

  const quickResponses = [
    "I'm feeling anxious about...",
    "I keep thinking that...",
    "I'm struggling with...",
    "I feel overwhelmed by...",
    "I can't stop worrying about...",
  ];

  /* --- Load chat history --- */
  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      try {
        const res = await axios.get<BackendMessage[]>(
          `${API_URL}/api/cbt/${userId}`
        );

        const raw = Array.isArray(res.data) ? res.data : [];
        const loaded: ChatMessage[] = raw.map((msg) => ({
          id: msg._id || `local-${Math.random()}`,
          type: msg.sender === "user" ? "user" : "assistant",
          content: msg.content,
          timestamp: new Date(
            msg.timestamp || msg.createdAt || msg.date || Date.now()
          ),
        }));

        setMessages(loaded);
        setTimeout(scrollToBottom, 30);
      } catch (err) {
        console.error("Error loading chat history:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [userId]);

  /* --- Header stats (dynamic) --- */
  const { sessionsTotal, sessionsThisWeek, thoughtsChallenged } =
    useMemo(() => {
      if (messages.length === 0) {
        return { sessionsTotal: 0, sessionsThisWeek: 0, thoughtsChallenged: 0 };
      }
      const days = new Set<string>();
      const now = new Date();
      const weekAgo = new Date(now);
      weekAgo.setDate(now.getDate() - 6);

      const weekDays = new Set<string>();
      let assistantCount = 0;

      for (const m of messages) {
        const ymd = toYMD(startOfDay(m.timestamp));
        days.add(ymd);
        if (startOfDay(m.timestamp) >= startOfDay(weekAgo)) {
          weekDays.add(ymd);
        }
        if (m.type === "assistant") assistantCount++;
      }
      return {
        sessionsTotal: days.size,
        sessionsThisWeek: weekDays.size,
        thoughtsChallenged: assistantCount,
      };
    }, [messages]);

  /* --- Group messages by day --- */
  const groups = useMemo(() => {
    const map = new Map<string, ChatMessage[]>();
    for (const m of messages) {
      const key = m.timestamp.toLocaleDateString();
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(m);
    }
    return Array.from(map.entries());
  }, [messages]);

  /* --- Persist message --- */
  const sendToBackend = async (payload: {
    sender: MessageType;
    content: string;
  }) => {
    try {
      await axios.post(`${API_URL}/api/cbt`, {
        userId,
        email: userEmail,
        sender: payload.sender,
        content: payload.content,
      });
    } catch (e) {
      console.error("Failed to save CBT message:", e);
    }
  };

  /* --- Send message --- */
  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMsg: ChatMessage = {
      id: `local-${Date.now()}`,
      type: "user",
      content: inputMessage,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage("");
    setIsTyping(true);
    setTimeout(scrollToBottom, 30);

    sendToBackend({ sender: "user", content: userMsg.content });

    try {
      if (!apiKey) throw new Error("Missing OpenRouter API key");

      const response = await axios.post<ChatResponse>(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          model: "openai/gpt-3.5-turbo",
          messages: [
            { role: "system", content: "You are a helpful CBT assistant." },
            { role: "user", content: userMsg.content },
          ],
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
            "HTTP-Referer": "http://localhost:3000",
            "X-Title": "CBT Demo App",
          },
        }
      );

      const reply = response.data?.choices?.[0]?.message?.content ?? "";
      const aiMsg: ChatMessage = {
        id: `local-${Date.now()}-ai`,
        type: "assistant",
        content:
          reply ||
          "Thanks for sharing. Could you tell me a bit more about how this thought makes you feel, and when it usually shows up?",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMsg]);
      setTimeout(scrollToBottom, 30);

      sendToBackend({ sender: "assistant", content: aiMsg.content });
    } catch (error) {
      console.error("Error fetching assistant response:", error);
      const fallback: ChatMessage = {
        id: `local-${Date.now()}-err`,
        type: "assistant",
        content:
          " Sorry, I couldn't reach the assistant right now. Please try again in a moment.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, fallback]);
    } finally {
      setIsTyping(false);
      setTimeout(scrollToBottom, 30);
    }
  };

  const handleQuickPrompt = (prompt: string) => setInputMessage(prompt);
  const handleTechniqueSelect = (prompt: string) => setInputMessage(prompt);

  return (
    // prevent horizontal scrollbar
    <div className="p-6 space-y-6 overflow-x-clip">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl p-8 bg-gradient-to-r from-primary-100 to-secondary-100 border border-gray-100">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-xl bg-white/70">
              <MessageCircle className="w-7 h-7 text-purple-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                CBT Assistant
              </h1>
              <p className="text-gray-700">
                AI-powered cognitive behavioral therapy support
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="bg-white rounded-xl px-5 py-3 border border-gray-100">
              <div className="text-xs text-gray-600 mb-0.5">Sessions</div>
              <div className="text-2xl font-bold text-gray-900">
                {sessionsTotal}
              </div>
            </div>
            <div className="bg-white rounded-xl px-5 py-3 border border-gray-100">
              <div className="text-xs text-gray-600 mb-0.5">
                Thoughts Challenged
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {thoughtsChallenged}
              </div>
            </div>
            <div className="bg-white rounded-xl px-5 py-3 border border-gray-100">
              <div className="text-xs text-gray-600 mb-0.5">This Week</div>
              <div className="text-2xl font-bold text-gray-900">
                {sessionsThisWeek}
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

      {/* Main grid */}
      <div className="grid lg:grid-cols-4 gap-6">
        {/* Chat */}
        <div className="lg:col-span-3 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col">
          <div className="flex-1 p-6 overflow-y-auto space-y-6">
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    className={`h-5 ${
                      i % 2 ? "w-2/3" : "w-4/5"
                    } bg-gray-100 rounded`}
                  />
                ))}
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-5xl mb-3">💬</div>
                <p className="text-gray-800 font-semibold text-lg">
                  No messages yet
                </p>
                <p className="text-sm text-gray-600">
                  Say hello to get started.
                </p>
              </div>
            ) : (
              groups.map(([dateLabel, msgs]) => (
                <div key={dateLabel} className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-px bg-gray-200" />
                    <span className="text-xs text-gray-500">{dateLabel}</span>
                    <div className="flex-1 h-px bg-gray-200" />
                  </div>

                  {msgs.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.type === "user"
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[80%] md:max-w-[70%] px-4 py-3 rounded-2xl shadow-sm border ${
                          message.type === "user"
                            ? "bg-primary-600 text-white border-primary-600"
                            : "bg-gray-50 text-gray-900 border-gray-200"
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          <span
                            className={`rounded-full p-1 ${
                              message.type === "user"
                                ? "bg-white/20"
                                : "bg-white"
                            }`}
                          >
                            {message.type === "user" ? (
                              <User
                                className={`w-4 h-4 ${
                                  message.type === "user"
                                    ? "text-white"
                                    : "text-gray-700"
                                }`}
                              />
                            ) : (
                              <Bot className="w-4 h-4 text-purple-600" />
                            )}
                          </span>
                          <p className="text-sm leading-relaxed whitespace-pre-wrap">
                            {message.content}
                          </p>
                        </div>
                        <div
                          className={`text-[10px] mt-2 ${
                            message.type === "user"
                              ? "text-white/80"
                              : "text-gray-500"
                          }`}
                        >
                          {message.timestamp.toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ))
            )}

            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-gray-50 text-gray-900 px-4 py-3 rounded-2xl border border-gray-200">
                  <div className="flex items-center gap-2">
                    <Bot className="w-4 h-4 text-purple-600" />
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.1s" }}
                      />
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Quick prompts */}
          <div className="px-6 py-3 border-t border-gray-100 bg-white/60">
            <div className="flex flex-wrap gap-2">
              {quickResponses.map((response, index) => (
                <button
                  key={index}
                  onClick={() => handleQuickPrompt(response)}
                  className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded-full transition-colors"
                >
                  {response}
                </button>
              ))}
            </div>
          </div>

          {/* Input */}
          <div className="p-6 border-t border-gray-200 bg-white/80">
            <div className="flex gap-3">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                placeholder="Share what's on your mind..."
                className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim()}
                className="bg-primary-600 text-white px-4 py-3 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              CBT Techniques
            </h3>
            <div className="space-y-3">
              {cbtTechniques.map((t, i) => {
                const Icon = t.icon;
                return (
                  <button
                    key={i}
                    onClick={() => handleTechniqueSelect(t.prompt)}
                    className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors border border-gray-100"
                  >
                    <div className="flex items-start gap-3">
                      <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-white shadow">
                        <Icon className={`w-4 h-4 ${t.color}`} />
                      </span>
                      <div>
                        <h4 className="font-medium text-gray-900 text-sm">
                          {t.title}
                        </h4>
                        <p className="text-xs text-gray-600 mt-1">
                          {t.description}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Your Progress
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span>Sessions Completed</span>
                <span className="font-semibold text-gray-900">
                  {sessionsTotal}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Thoughts Challenged</span>
                <span className="font-semibold text-gray-900">
                  {thoughtsChallenged}
                </span>
              </div>
              <div className="flex justify-between">
                <span>This Week</span>
                <span className="font-semibold text-primary-600">
                  {sessionsThisWeek} sessions
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl p-6 border border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
            <h3 className="text-lg font-semibold text-blue-900 mb-4">
              Tips for Success
            </h3>
            <ul className="space-y-2 text-sm text-blue-800">
              <li>• Be honest about your thoughts and feelings</li>
              <li>• Practice techniques regularly for best results</li>
              <li>• Remember that change takes time</li>
              <li>• Consider professional help when needed</li>
            </ul>
          </div>
        </div>
      </div>

      {/* ===== Helpful CBT Tips (wide, no horizontal scroll) ===== */}
      {/* Use negative margins to cancel page padding instead of w-screen */}
      <section className="-mx-6 mt-4 sm:-mx-6 md:-mx-6 lg:-mx-6">
        <div className="relative overflow-hidden border-y border-purple-200/60 bg-gradient-to-r from-fuchsia-50 via-indigo-50 to-sky-50">
          {/* Decorative blobs */}
          <svg
            className="pointer-events-none absolute -top-20 -left-16 w-[36rem] h-[36rem] opacity-30 text-purple-200"
            viewBox="0 0 200 200"
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
          >
            <path
              d="M38.1,-53.2C49.2,-45.6,57.4,-34.4,62.1,-22.2C66.9,-10.1,68.2,3.1,64.2,14.4C60.2,25.7,50.8,35.1,40.1,44.7C29.4,54.3,17.3,64,3.8,67.1C-9.8,70.2,-19.6,66.7,-30.1,61.1C-40.6,55.5,-51.9,47.8,-58.5,37.2C-65.1,26.5,-67,13.3,-64.6,1.2C-62.2,-10.9,-55.4,-21.7,-48.5,-32.2C-41.6,-42.7,-34.7,-52.9,-25.4,-61.1C-16.1,-69.4,-8.1,-75.7,2.1,-78.8C12.4,-81.8,24.8,-81,38.1,-53.2Z"
              transform="translate(100 100)"
            />
          </svg>
          <svg
            className="pointer-events-none absolute -bottom-24 -right-16 w-[40rem] h-[40rem] opacity-30 text-indigo-200"
            viewBox="0 0 200 200"
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
          >
            <path
              d="M43.8,-64.5C56.5,-54.6,67.8,-43.2,74.1,-29.4C80.5,-15.7,81.9,0.4,78.2,15.4C74.6,30.4,65.8,44.3,54,56.5C42.2,68.7,27.4,79.2,11,85.2C-5.5,91.2,-22.5,92.8,-38.4,86.5C-54.3,80.3,-69.2,66.3,-77.7,49.2C-86.2,32,-88.3,11.7,-85,-6.7C-81.8,-25.2,-73.1,-41.9,-59.7,-53.6C-46.3,-65.4,-28.2,-72.3,-10,-74.6C8.2,-76.9,16.4,-74.4,43.8,-64.5Z"
              transform="translate(100 100)"
            />
          </svg>

          {/* Content */}
          <div className="relative max-w-7xl mx-auto px-6 py-10">
            <div className="flex items-center gap-3 mb-5">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white shadow">
                <span className="text-purple-600 text-base">💡</span>
              </div>
              <h3 className="text-2xl font-semibold text-purple-900">
                Helpful CBT Tips
              </h3>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {TIPS.map((t, i) => (
                <div
                  key={i}
                  className={`rounded-xl border shadow-sm bg-gradient-to-br ${
                    CARD_COLORS[i % CARD_COLORS.length]
                  } px-4 py-4`}
                >
                  <div className="flex items-start gap-2">
                    <span className="mt-0.5 inline-flex w-6 h-6 shrink-0 items-center justify-center rounded-full bg-white/70 text-purple-700 text-xs font-semibold border border-white">
                      {i + 1}
                    </span>
                    <p className="text-sm leading-6">{t}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      {/* ===== /Helpful CBT Tips ===== */}
    </div>
  );
};

export default CBTChat;
