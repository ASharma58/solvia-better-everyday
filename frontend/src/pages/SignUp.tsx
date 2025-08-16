import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";

const SignUp: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [formErrors, setFormErrors] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setFormErrors({ ...formErrors, [e.target.name]: "" }); // Clear individual field error
  };

  const validateForm = () => {
    const { name, email, password, confirmPassword } = formData;
    const newErrors = {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    };
    let isValid = true;

    if (name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters.";
      isValid = false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      newErrors.email = "Please enter a valid email address.";
      isValid = false;
    }

    const passwordRegex =
      /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      newErrors.password =
        "Password must be at least 8 characters and include letters, numbers and special characters.";
      isValid = false;
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match.";
      isValid = false;
    }

    setFormErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!validateForm()) return;

    try {
      const res = await fetch("http://localhost:5000/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess("Signup successful! Redirecting...");
        setTimeout(() => navigate("/login"), 1500);
      } else {
        setError(data.error || "Signup failed.");
      }
    } catch (err) {
      console.error("Signup error:", err);
      setError("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fffcf7] relative overflow-hidden px-4">
      {/* Background Blobs */}
      <div className="absolute inset-0 z-0">
        <div className="absolute w-14 h-14 bg-blue-500 rounded-full opacity-20 top-8 left-10 animate-float-slow"></div>
        <div className="absolute w-10 h-10 bg-green-500 rounded-full opacity-30 top-[20%] left-[70%] animate-float-fast"></div>
        <div className="absolute w-12 h-12 bg-orange-500 rounded-full opacity-20 top-[60%] left-[15%] animate-float-slower"></div>
        <div className="absolute w-14 h-14 bg-blue-400 rounded-full opacity-20 top-[40%] right-[10%] animate-float"></div>
        <div className="absolute w-10 h-10 bg-green-400 rounded-full opacity-20 bottom-[15%] left-[30%] animate-float-slow"></div>
        <div className="absolute w-8 h-8 bg-orange-400 rounded-full opacity-20 bottom-[5%] right-[25%] animate-float-fast"></div>
      </div>

      <div className="relative z-10 w-full max-w-4xl mx-auto bg-white rounded-xl shadow-lg flex flex-col lg:flex-row overflow-hidden h-[650px]">
        {/* Illustration */}
        <div className="hidden lg:flex items-center justify-center p-8 bg-gradient-to-br from-pink-100 via-green-100 to-blue-100">
          <img
            src="/assets/images/signup.png"
            alt="Mental wellness"
            className="w-full max-w-sm object-contain"
          />
        </div>

        {/* Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-10 bg-[#ffffff]">
          <div className="w-full max-w-md">
            <div className="flex justify-center mb-6">
              <img
                src="/assets/images/logo.png"
                alt="Solvia Logo"
                className="w-12 h-12 object-contain"
              />
            </div>

            <h2 className="text-3xl font-bold mb-4 text-center text-gray-800">
              Sign Up
            </h2>

            {error && (
              <div className="mb-4 p-3 text-sm text-red-700 bg-red-100 border border-red-300 rounded">
                {error}
              </div>
            )}

            {success && (
              <div className="mb-4 p-3 text-sm text-green-700 bg-green-100 border border-green-300 rounded">
                {success}
              </div>
            )}

            <p className="text-sm text-gray-600 text-center mb-6">
              Already have an account?{" "}
              <Link to="/login" className="text-blue-600 hover:underline">
                Log In
              </Link>
            </p>

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="block text-gray-700 font-medium">Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Full Name*"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {formErrors.name && (
                  <p className="text-sm text-red-600 mt-1">{formErrors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-gray-700 font-medium">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com*"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {formErrors.email && (
                  <p className="text-sm text-red-600 mt-1">
                    {formErrors.email}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-gray-700 font-medium">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter a strong password*"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                  />
                  <span
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 cursor-pointer text-gray-500"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </span>
                </div>
                {formErrors.password && (
                  <p className="text-sm text-red-600 mt-1">
                    {formErrors.password}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-gray-700 font-medium">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Repeat your password*"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                  />
                  <span
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-2.5 cursor-pointer text-gray-500"
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </span>
                </div>
                {formErrors.confirmPassword && (
                  <p className="text-sm text-red-600 mt-1">
                    {formErrors.confirmPassword}
                  </p>
                )}
              </div>

              <button
                type="submit"
                className="w-full bg-orange-600 text-white py-3 rounded-lg font-semibold hover:bg-orange-700 transition"
              >
                Sign Up
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
