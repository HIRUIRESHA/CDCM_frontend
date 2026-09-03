import React, { useState } from "react";

import {
  useNavigate,
} from "react-router-dom";

import {
  Eye,
  EyeOff,
  Lock,
} from "lucide-react";

const HospitalChangePassword = () => {
  const navigate = useNavigate();

  const token =
    localStorage.getItem("token");

  const hospital = JSON.parse(
    localStorage.getItem("hospital") ||
      "null"
  );

  const [form, setForm] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  const [
    showNewPassword,
    setShowNewPassword,
  ] = useState(false);

  const [
    showConfirmPassword,
    setShowConfirmPassword,
  ] = useState(false);

  const [error, setError] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const handleChange = (event) => {
    setForm({
      ...form,
      [event.target.name]:
        event.target.value,
    });

    setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!token || !hospital) {
      navigate("/login", {
        replace: true,
      });
      return;
    }

    if (!hospital.verified) {
      navigate(
        "/hospital/verify-email",
        {
          replace: true,
        }
      );
      return;
    }

    const passwordPattern =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

    if (
      !passwordPattern.test(
        form.newPassword
      )
    ) {
      setError(
        "Password needs at least 8 characters, uppercase, lowercase, number and special character."
      );
      return;
    }

    if (
      form.newPassword !==
      form.confirmPassword
    ) {
      setError(
        "Passwords do not match."
      );
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "http://localhost:8082/api/hospitals/first-login-password",
        {
          method: "PUT",

          headers: {
            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${token}`,
          },

          body: JSON.stringify({
            newPassword:
              form.newPassword,
          }),
        }
      );

      const data = await response
        .json()
        .catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Password change failed"
        );
      }

      const updatedHospital = {
        ...hospital,
        mustChangePassword: false,
      };

      localStorage.setItem(
        "hospital",
        JSON.stringify(
          updatedHospital
        )
      );

      const storedUser = JSON.parse(
        localStorage.getItem("user") ||
          "null"
      );

      if (storedUser) {
        localStorage.setItem(
          "user",
          JSON.stringify({
            ...storedUser,
            mustChangePassword: false,
          })
        );
      }

      navigate(
        "/hospital/dashboard",
        {
          replace: true,
        }
      );
    } catch (error) {
      setError(
        error.message ||
          "Password change failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
        <h1 className="text-2xl font-bold text-slate-800 text-center">
          Create a New Password
        </h1>

        <p className="text-slate-500 text-center mt-3 mb-7">
          You must replace the
          temporary password before
          accessing the hospital
          dashboard.
        </p>

        <form onSubmit={handleSubmit}>
          {/* New password */}
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            New password
          </label>

          <div className="relative">
            <Lock
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type={
                showNewPassword
                  ? "text"
                  : "password"
              }
              name="newPassword"
              value={form.newPassword}
              onChange={handleChange}
              autoComplete="new-password"
              required
              className="w-full border border-slate-300 rounded-xl py-3 pl-10 pr-11 outline-none focus:ring-2 focus:ring-blue-500"
            />

            <button
              type="button"
              onClick={() =>
                setShowNewPassword(
                  (current) =>
                    !current
                )
              }
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
              aria-label={
                showNewPassword
                  ? "Hide new password"
                  : "Show new password"
              }
            >
              {showNewPassword ? (
                <EyeOff size={19} />
              ) : (
                <Eye size={19} />
              )}
            </button>
          </div>

          {/* Confirm password */}
          <label className="block text-sm font-semibold text-slate-700 mt-5 mb-2">
            Confirm password
          </label>

          <div className="relative">
            <Lock
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type={
                showConfirmPassword
                  ? "text"
                  : "password"
              }
              name="confirmPassword"
              value={
                form.confirmPassword
              }
              onChange={handleChange}
              autoComplete="new-password"
              required
              className="w-full border border-slate-300 rounded-xl py-3 pl-10 pr-11 outline-none focus:ring-2 focus:ring-blue-500"
            />

            <button
              type="button"
              onClick={() =>
                setShowConfirmPassword(
                  (current) =>
                    !current
                )
              }
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
              aria-label={
                showConfirmPassword
                  ? "Hide confirmed password"
                  : "Show confirmed password"
              }
            >
              {showConfirmPassword ? (
                <EyeOff size={19} />
              ) : (
                <Eye size={19} />
              )}
            </button>
          </div>

          <p className="text-xs text-slate-500 mt-3">
            Use at least 8 characters
            with uppercase, lowercase,
            number and special character.
          </p>

          {error && (
            <p className="mt-4 text-sm text-red-600">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-6 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-semibold py-3 rounded-xl"
          >
            {loading
              ? "Changing Password..."
              : "Change Password"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default HospitalChangePassword;