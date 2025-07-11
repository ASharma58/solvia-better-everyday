import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Heart, TrendingUp, Calendar, Plus } from 'lucide-react';

type MoodEntry = {
  mood: number;
  note: string;
  date: string;
};


const MoodTracker: React.FC = () => {
  const [selectedMood, setSelectedMood] = useState<number>(5);
  const [moodNote, setMoodNote] = useState('');
  const [moodHistory, setMoodHistory] = useState<MoodEntry[]>([]);

  useEffect(() => {
    axios
      .get<MoodEntry[]>('http://localhost:5000/api/mood/sarah.johnson@email.com')
      .then((res) => {
        setMoodHistory(res.data);
      })
      .catch((err) => {
        if (err && typeof err === 'object' && 'response' in err) {
          console.error('Server responded with:', err.response.status, err.response.data);
        } else {
          console.error('Unknown error or network issue:', err);
        }
      });
  }, []);





  const moodEmojis = [
    { value: 1, emoji: '😢', label: 'Very Sad', color: 'text-red-500' },
    { value: 2, emoji: '😞', label: 'Sad', color: 'text-red-400' },
    { value: 3, emoji: '😐', label: 'Neutral', color: 'text-gray-500' },
    { value: 4, emoji: '🙂', label: 'Good', color: 'text-yellow-500' },
    { value: 5, emoji: '😊', label: 'Happy', color: 'text-green-500' },
    { value: 6, emoji: '😄', label: 'Very Happy', color: 'text-green-600' },
    { value: 7, emoji: '🤩', label: 'Ecstatic', color: 'text-blue-500' },
  ];




  const weeklyData = [
    { day: 'Mon', mood: 6, date: '13' },
    { day: 'Tue', mood: 5, date: '14' },
    { day: 'Wed', mood: 7, date: '15' },
    { day: 'Thu', mood: 8, date: '16' },
    { day: 'Fri', mood: 6, date: '17' },
    { day: 'Sat', mood: 7, date: '18' },
    { day: 'Sun', mood: 5, date: '19' },
  ];

  const handleMoodSubmit = async () => {
    try {
      const payload = {
        email: 'sarah.johnson@email.com',
        mood: selectedMood, // if schema uses Number
        note: moodNote,
        date: new Date().toISOString(),
      };

      const res = await axios.post('http://localhost:5000/api/mood', payload);
      console.log('Mood saved:', res.data);

      setMoodNote('');

      // ✅ Reload mood history after saving
      const updatedHistory = await axios.get<MoodEntry[]>('http://localhost:5000/api/mood/sarah.johnson@email.com');
      setMoodHistory(updatedHistory.data); // ✅ No more TS error

    } catch (err) {
      console.error('Error saving mood:', err);
    }
  };



  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <Heart className="w-8 h-8 text-rose-500" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mood Tracker</h1>
          <p className="text-gray-600">Track your emotional journey day by day</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Mood Input Card */}
        <div className="lg:col-span-2 bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">How are you feeling today?</h2>

          {/* Mood Selector */}
          <div className="grid grid-cols-3 md:grid-cols-7 gap-4 mb-6">
            {moodEmojis.map((mood) => (
              <button
                key={mood.value}
                onClick={() => setSelectedMood(mood.value)}
                className={`
                  p-4 rounded-xl border-2 transition-all duration-200 text-center
                  ${selectedMood === mood.value
                    ? 'border-primary-500 bg-primary-50 shadow-md scale-105'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }
                `}
              >
                <div className="text-3xl mb-2">{mood.emoji}</div>
                <div className="text-xs font-medium text-gray-600">{mood.label}</div>
              </button>
            ))}
          </div>

          {/* Mood Scale */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Mood Level: {selectedMood}/10
            </label>
            <input
              type="range"
              min="1"
              max="10"
              value={selectedMood}
              onChange={(e) => setSelectedMood(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            />
          </div>

          {/* Note Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Add a note (optional)
            </label>
            <textarea
              value={moodNote}
              onChange={(e) => setMoodNote(e.target.value)}
              placeholder="What's on your mind? How was your day?"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              rows={3}
            />
          </div>

          {/* Submit Button */}
          <button
            onClick={handleMoodSubmit}
            className="w-full bg-primary-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-primary-700 transition-colors duration-200 flex items-center justify-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Log Mood</span>
          </button>
        </div>

        {/* Stats Sidebar */}
        <div className="space-y-6">
          {/* Weekly Average */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center space-x-3 mb-4">
              <TrendingUp className="w-6 h-6 text-green-500" />
              <h3 className="text-lg font-semibold text-gray-900">This Week</h3>
            </div>
            <div className="text-3xl font-bold text-green-600 mb-2">6.4</div>
            <p className="text-sm text-gray-600">Average mood</p>
            <div className="mt-4 text-sm text-green-600 font-medium">
              ↗ +0.8 from last week
            </div>
          </div>

          {/* Streak Counter */}
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-6 border border-amber-200">
            <div className="flex items-center space-x-3 mb-4">
              <Calendar className="w-6 h-6 text-amber-600" />
              <h3 className="text-lg font-semibold text-amber-900">Current Streak</h3>
            </div>
            <div className="text-3xl font-bold text-amber-700 mb-2">12</div>
            <p className="text-sm text-amber-700">days in a row</p>
          </div>

          {/* Mood Insights */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Insights</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-gray-600">Mornings tend to be your best time</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-gray-600">Exercise days show higher mood</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span className="text-gray-600">Weekend moods are more stable</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Weekly Chart */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">This Week's Trend</h2>

        <div className="relative h-32 mb-4">
          <div className="absolute inset-0 flex items-end justify-between px-4">
            {weeklyData.map((data, index) => (
              <div key={index} className="flex flex-col items-center space-y-2">
                <div className="text-xs text-gray-500 font-medium">{data.mood}</div>
                <div
                  className="w-12 bg-gradient-to-t from-primary-500 to-secondary-400 rounded-t-lg transition-all duration-300 hover:opacity-80"
                  style={{ height: `${(data.mood / 10) * 100}%` }}
                ></div>
                <div className="text-center">
                  <div className="text-sm text-gray-600 font-medium">{data.day}</div>
                  <div className="text-xs text-gray-400">{data.date}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mood History */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Recent Entries</h2>

        <div className="space-y-4">
          {moodHistory.map((entry, index) => {
            const moodData = moodEmojis.find(m => m.value === entry.mood);
            return (
              <div key={index} className="flex items-start space-x-4 p-4 hover:bg-gray-50 rounded-lg transition-colors duration-200">
                <div className="text-2xl">{moodData?.emoji}</div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="font-medium text-gray-900">{moodData?.label}</span>
                    <span className="text-sm text-gray-500">• {entry.date}</span>
                  </div>
                  <p className="text-gray-600 text-sm">{entry.note}</p>
                </div>
                <div className="text-lg font-bold text-gray-400">{entry.mood}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MoodTracker;