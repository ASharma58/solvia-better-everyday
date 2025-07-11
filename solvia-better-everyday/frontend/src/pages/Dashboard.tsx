import React from "react";
import {
  Heart,
  BookOpen,
  Brain,
  Leaf,
  TrendingUp,
  Calendar,
  Target,
  Award,
} from "lucide-react";

const Dashboard: React.FC = () => {
  const stats = [
    {
      icon: Heart,
      label: "Mood Average",
      value: "7.2",
      trend: "+0.5",
      color: "text-primary-600",
    },
    {
      icon: BookOpen,
      label: "Journal Entries",
      value: "24",
      trend: "+3",
      color: "text-secondary-600",
    },
    {
      icon: Brain,
      label: "CBT Sessions",
      value: "8",
      trend: "+2",
      color: "text-accent-600",
    },
    {
      icon: Leaf,
      label: "Mindful Minutes",
      value: "180",
      trend: "+45",
      color: "text-accent-600",
    },
  ];

  const moodData = [
    { day: "Mon", mood: 7 },
    { day: "Tue", mood: 6 },
    { day: "Wed", mood: 8 },
    { day: "Thu", mood: 7 },
    { day: "Fri", mood: 9 },
    { day: "Sat", mood: 8 },
    { day: "Sun", mood: 7 },
  ];

  const recentActivities = [
    {
      type: "journal",
      title: "Morning Reflections",
      time: "2 hours ago",
      color: "bg-secondary-100 text-secondary-800",
    },
    {
      type: "mood",
      title: "Mood Check-in",
      time: "4 hours ago",
      color: "bg-primary-100 text-primary-800",
    },
    {
      type: "mindfulness",
      title: "Breathing Exercise",
      time: "6 hours ago",
      color: "bg-accent-100 text-accent-800",
    },
    {
      type: "cbt",
      title: "Thought Challenge",
      time: "1 day ago",
      color: "bg-accent-100 text-accent-800",
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="bg-gradient-to-r from-primary-100 to-secondary-100 rounded-2xl p-8 text-black">
        <h1 className="text-3xl font-bold mb-2">Welcome back, Sarah! 👋</h1>
        <p className="text-accent-900 text-lg">
          You're doing great! Here's your wellness journey overview.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg bg-gray-50 ${stat.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className="flex items-center text-accent-600 text-sm font-medium">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  {stat.trend}
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">
                {stat.value}
              </h3>
              <p className="text-gray-600 text-sm">{stat.label}</p>
            </div>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Weekly Mood Trend
            </h2>
            <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
              View Details
            </button>
          </div>

          <div className="relative h-64">
            <div className="absolute inset-0 flex items-end justify-between px-4">
              {moodData.map((data, index) => (
                <div
                  key={index}
                  className="flex flex-col items-center space-y-2"
                >
                  <div className="text-xs text-gray-500 font-medium">
                    {data.mood}
                  </div>
                  <div
                    className="w-8 bg-gradient-to-t from-primary-500 to-secondary-400 rounded-t-lg"
                    style={{ height: `${(data.mood / 10) * 100}%` }}
                  ></div>
                  <div className="text-sm text-gray-600 font-medium">
                    {data.day}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Recent Activity
          </h2>

          <div className="space-y-4">
            {recentActivities.map((activity, index) => (
              <div
                key={index}
                className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors duration-200"
              >
                <div
                  className={`px-2 py-1 rounded-full text-xs font-medium ${activity.color}`}
                >
                  {activity.type}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {activity.title}
                  </p>
                  <p className="text-xs text-gray-500">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-xl p-6 border border-primary-200">
          <div className="flex items-center space-x-3 mb-4">
            <Heart className="w-8 h-8 text-primary-600" />
            <h3 className="text-lg font-semibold text-primary-900">
              Check Your Mood
            </h3>
          </div>
          <p className="text-primary-700 mb-4">
            How are you feeling right now?
          </p>
          <button className="bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors duration-200">
            Log Mood
          </button>
        </div>

        <div className="bg-gradient-to-br from-secondary-50 to-secondary-100 rounded-xl p-6 border border-secondary-200">
          <div className="flex items-center space-x-3 mb-4">
            <BookOpen className="w-8 h-8 text-secondary-600" />
            <h3 className="text-lg font-semibold text-secondary-900">
              Write in Journal
            </h3>
          </div>
          <p className="text-secondary-700 mb-4">
            Capture your thoughts and reflections
          </p>
          <button className="bg-secondary-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-secondary-700 transition-colors duration-200">
            Start Writing
          </button>
        </div>

        <div className="bg-gradient-to-br from-accent-50 to-accent-100 rounded-xl p-6 border border-accent-200">
          <div className="flex items-center space-x-3 mb-4">
            <Leaf className="w-8 h-8 text-accent-600" />
            <h3 className="text-lg font-semibold text-accent-900">
              Mindfulness Break
            </h3>
          </div>
          <p className="text-accent-700 mb-4">
            Take a moment to breathe and center yourself
          </p>
          <button className="bg-accent-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-accent-700 transition-colors duration-200">
            Start Session
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
