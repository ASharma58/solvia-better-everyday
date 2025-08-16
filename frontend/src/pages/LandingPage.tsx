import React from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  CheckCircle,
  Smile,
  NotebookPen,
  BrainCircuit,
  Flower2,
} from "lucide-react";

const features = [
  {
    icon: Smile,
    title: "Mood Tracking",
    description:
      "Monitor your emotional patterns with intuitive visual indicators and analytics.",
  },
  {
    icon: NotebookPen,
    title: "Private Journaling",
    description:
      "Express your thoughts in a secure, judgment-free space with guided prompts.",
  },
  {
    icon: BrainCircuit,
    title: "AI-Powered CBT",
    description:
      "Receive personalized therapy-style guidance through our intelligent assistant.",
  },
  {
    icon: Flower2,
    title: "Mindfulness Activities",
    description:
      "Practice breathing exercises, meditation, and grounding techniques for inner peace.",
  },
];

const benefits = [
  "Track your emotional journey with beautiful visual insights",
  "Access professional-grade CBT techniques anytime, anywhere",
  "Build consistent wellness habits with gentle reminders",
  "Explore curated mental health resources and content",
];

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen font-inter bg-gradient-to-br from-[#f9f7f1] via-[#ffffff] to-[#e6f4ea] text-gray-800">
      <header className="relative z-10">
        <nav className="flex items-center justify-between p-6 lg:px-8">
          <div className="flex items-center space-x-2">
            <img
              src="/assets/images/logo.png"
              alt="Solvia Logo"
              className="w-10 h-10 object-contain"
            />
            <span className="text-2xl font-bold">Solvia</span>
          </div>
          <div className="flex gap-4">
            {/* Login Button */}
            <Link
              to="/login"
              className="border border-blue-600 text-blue-600 px-6 py-2 rounded-lg font-medium hover:bg-blue-50 transition"
            >
              Login
            </Link>
            {/* Try for Free Button */}
            <Link
              to="/signup"
              className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition"
            >
              Try for free
            </Link>
          </div>
        </nav>
      </header>

      <section
        className="relative px-6 lg:px-20 py-20"
        style={{ backgroundColor: "#fcf3e6" }}
      >
        <div className="max-w-7xl mx-auto flex flex-col-reverse lg:flex-row items-center justify-between gap-12">
          {/* Left Side – Text */}
          <div className="lg:w-1/2 text-center lg:text-left">
            <h1 className="text-2xl lg:text-6xl font text-gray-900 mb-6 animate-fade-in">
              Better Every{" "}
              <span className="bg-gradient-to-r from-blue-500 to-orange-400 bg-clip-text text-transparent">
                Day
              </span>
            </h1>
            <p className="text-xl lg:text-l text-gray-700 mb-8 animate-slide-up">
              Your personal mental wellness companion. Track your mood, journal
              your thoughts, and discover inner peace through guided mindfulness
              and CBT techniques.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start animate-slide-up">
              <Link
                to="/login"
                className="bg-orange-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-orange-700 transition transform hover:scale-105 flex items-center group"
              >
                Start Your Journey
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Right Side – Image */}
          <div className="lg:w-1/2 flex justify-center">
            <img
              src="/assets/images/hero-image.png"
              alt="Mental wellness illustration"
              className="w-full max-w-lg lg:max-w-xl"
            />
          </div>
        </div>
      </section>

      {/* Need for mental health */}
      <section className="py-20 bg-gradient-to-r from-[#a3d5ff] via-[#b9fbc0] to-[#ffe5b4]">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-gray-900">
              Everything You Need for Mental Wellness
            </h2>
            <p className="text-xl text-gray-700 max-w-2xl mx-auto">
              Tools crafted by mental health professionals to guide your
              personal journey.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;

              const colorStyles = [
                { bg: "bg-blue-100", text: "text-blue-600" },
                { bg: "bg-green-100", text: "text-green-600" },
                { bg: "bg-pink-100", text: "text-pink-600" },
                { bg: "bg-purple-100", text: "text-purple-600" },
              ];

              const { bg, text } = colorStyles[index % colorStyles.length];

              return (
                <div
                  key={index}
                  className="bg-white p-6 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 group"
                >
                  <div
                    className={`w-14 h-14 ${bg} ${text} rounded-full flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2 text-gray-800">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 text-sm">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-white py-20 px-6 lg:px-12">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900">How It Works</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mt-4">
            Follow these simple steps to begin your journey toward better mental
            wellness.
          </p>
        </div>

        <div className="relative max-w-7xl mx-auto px-4">
          {/* Horizontal Line */}
          <div className="absolute top-32 left-12 right-12 h-1 bg-gray-300 z-0"></div>

          <div className="flex flex-col lg:flex-row justify-between items-start relative z-10">
            {[1, 2, 3].map((step, index) => {
              const steps = [
                {
                  title: "Set Your Goals",
                  text: "Define your emotional well-being targets, like managing stress or building confidence.",
                  img: "/assets/images/step1.png",
                  color: "bg-blue-500",
                },
                {
                  title: "Track Daily",
                  text: "Log your mood, reflect through journaling, and try out daily CBT activities.",
                  img: "/assets/images/step2.png",
                  color: "bg-orange-500",
                },
                {
                  title: "Grow & Reflect",
                  text: "Review your journey with insights and suggestions that reinforce your growth.",
                  img: "/assets/images/step3.png",
                  color: "bg-green-500",
                },
              ];

              const { title, text, img, color } = steps[index];

              return (
                <div
                  key={index}
                  className="flex flex-col items-center text-center w-full relative px-6"
                >
                  {/* Image */}
                  <img
                    src={img}
                    alt={title}
                    className="w-24 h-24 mb-4 z-10 relative"
                  />

                  {/* Step Circle */}
                  <div
                    className={`w-10 h-10 rounded-full ${color} text-white font-bold flex items-center justify-center shadow-md mb-4 z-10 relative`}
                  >
                    {step}
                  </div>

                  {/* Title and Description */}
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    {title}
                  </h3>
                  <p className="text-gray-600 text-base max-w-sm">{text}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 bg-[#fffaf3]">
        <div className="max-w-5xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-gray-900">
              Why Choose Solvia?
            </h2>
            <p className="text-xl text-gray-600">
              Join thousands on a journey of emotional well-being
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            {benefits.map((benefit, index) => (
              <div
                key={index}
                className={`flex items-start gap-4 p-6 rounded-xl shadow-sm border-l-4 ${
                  index % 3 === 0
                    ? "border-blue-400 bg-[#e6f0fa]"
                    : index % 3 === 1
                    ? "border-green-400 bg-[#e3f9e5]"
                    : "border-orange-400 bg-[##ffefe6]"
                }`}
              >
                <CheckCircle
                  className={`w-6 h-6 flex-shrink-0 mt-1 ${
                    index % 3 === 0
                      ? "text-blue-600"
                      : index % 3 === 1
                      ? "text-green-600"
                      : "text-yellow-500"
                  }`}
                />
                <span className="text-lg text-gray-800">{benefit}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* Footer */}
      <footer className="bg-[#ffffff] text-gray-800 py-12">
        <div className="max-w-6xl mx-auto px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Logo & Name */}
          <div className="flex items-center space-x-3">
            {/* Replace this with logo when available */}
            <div className="w-10 h-10 bg-blue-600 rounded-full text-white font-bold flex items-center justify-center">
              S
            </div>
            <span className="text-xl font-bold">Solvia</span>
          </div>

          {/* Copyright */}
          <p className="text-sm text-gray-500 text-center md:text-right">
            © 2025 Solvia. Built with ❤️ for mental wellness.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
