import React, { useState } from "react";

import {
  Link,
  useNavigate,
  useLocation,
} from "react-router-dom";

import {
  Mail,
  Lock,
  LogIn,
  AlertCircle,
  Eye,
  EyeOff,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] =
    useState(false);
  const [showPassword, setShowPassword] =
    useState(false);

  const { login } = useAuth();

  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from || null;

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

    setError("");
  };

  const validateForm = () => {
    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const minPasswordLength = 8;

    if (
      !emailRegex.test(
        formData.email.trim()
      )
    ) {
      return "Please enter a valid email address";
    }

    if (
      formData.password.length <
      minPasswordLength
    ) {
      return `Password must be at least ${minPasswordLength} characters`;
    }

    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationError =
      validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setIsSubmitting(true);
      setError("");

      const result = await login(
        formData.email.trim(),
        formData.password
      );

      if (!result.success) {
        setError(result.message);
        return;
      }

      const user =
        result.user ||
        JSON.parse(
          localStorage.getItem("user") ||
            "null"
        );

      if (!user) {
        setError(
          "User information was not found."
        );
        return;
      }

      if (user.role === "ADMIN") {
        navigate("/admin/dashboard", {
          replace: true,
        });

        return;
      }

      if (user.role === "HOSPITAL") {
        const hospital = {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          verified: user.verified,
          mustChangePassword:
            user.mustChangePassword,
          profileImage:
            user.profileImage,
        };

        localStorage.setItem(
          "hospital",
          JSON.stringify(hospital)
        );

        if (!hospital.verified) {
          navigate(
            "/hospital/verify-email",
            {
              replace: true,
            }
          );

          return;
        }

        if (
          hospital.mustChangePassword
        ) {
          navigate(
            "/hospital/change-password",
            {
              replace: true,
            }
          );

          return;
        }

        navigate(
          "/hospital/dashboard",
          {
            replace: true,
          }
        );

        return;
      }

      if (user.role === "DOCTOR") {
        navigate("/doctor/dashboard", {
          replace: true,
        });

        return;
      }

      if (user.role === "PATIENT") {
        navigate(
          from ||
            "/patient/dashboard",
          {
            replace: true,
          }
        );

        return;
      }

      setError("Unknown user role.");
    } catch (error) {
      console.error(
        "Login error:",
        error
      );

      setError(
        "Something went wrong while signing in."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex p-3 rounded-full bg-blue-50 text-blue-600 mb-4">
            <LogIn size={24} />
          </div>

          <h1 className="text-2xl font-bold text-gray-900">
            Welcome Back
          </h1>

          <p className="text-gray-500 text-sm mt-2">
            {from
              ? "Sign in to continue booking"
              : "Sign in to access your dashboard"}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 text-sm rounded-lg flex items-center gap-2">
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>

            <div className="relative">
              <Mail
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={18}
              />

              <input
                type="email"
                name="email"
                required
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                placeholder="name@example.com"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>

            <div className="relative">
              <Lock
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={18}
              />

              <input
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                name="password"
                required
                className="w-full pl-10 pr-10 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
              />

              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                onClick={() =>
                  setShowPassword(
                    !showPassword
                  )
                }
              >
                {showPassword ? (
                  <EyeOff size={18} />
                ) : (
                  <Eye size={18} />
                )}
              </button>
            </div>

            <div className="text-right mt-1">
              <Link
                to="/forgot-password"
                className="text-sm text-blue-600 hover:underline"
              >
                Forgot Password?
              </Link>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSubmitting
              ? "Signing in..."
              : "Sign In"}
          </button>
        </form>

        <p className="text-center mt-6 text-sm text-gray-500">
          Don&apos;t have an account?{" "}
          <Link
            to="/register"
            className="text-blue-600 font-medium hover:underline"
          >
            Create Account
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;