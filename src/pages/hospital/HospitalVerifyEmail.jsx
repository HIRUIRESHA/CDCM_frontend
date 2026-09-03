import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const HospitalVerifyEmail = () => {
  const navigate = useNavigate();

  const hospital = JSON.parse(
    localStorage.getItem("hospital") || "null"
  );

  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleVerify = async (event) => {
    event.preventDefault();

    if (!hospital?.email) {
      setError("Hospital login information was not found. Please log in again.");
      return;
    }

    if (!/^\d{6}$/.test(code)) {
      setError("Please enter a valid 6-digit code.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setMessage("");

      const response = await fetch(
        "http://localhost:8082/api/auth/verify",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: hospital.email,
            code: code,
            role: "HOSPITAL",
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Email verification failed"
        );
      }

      const updatedHospital = {
        ...hospital,
        verified: true,
      };

      localStorage.setItem(
        "hospital",
        JSON.stringify(updatedHospital)
      );

      // Update AuthContext's stored user if it uses localStorage.user
      const storedUser = JSON.parse(
        localStorage.getItem("user") || "null"
      );

      if (storedUser) {
        localStorage.setItem(
          "user",
          JSON.stringify({
            ...storedUser,
            verified: true,
          })
        );
      }

      setMessage("Email verified successfully.");

      setTimeout(() => {
        navigate("/hospital/change-password", {
          replace: true,
        });
      }, 800);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("hospital");
    localStorage.removeItem("user");

    navigate("/login", {
      replace: true,
    });
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
        <h1 className="text-2xl font-bold text-slate-800 text-center">
          Verify Hospital Email
        </h1>

        <p className="text-slate-500 text-center mt-3 mb-7">
          Enter the six-digit verification code sent to{" "}
          <span className="font-semibold text-slate-700">
            {hospital?.email || "your email"}
          </span>
        </p>

        <form onSubmit={handleVerify}>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Verification code
          </label>

          <input
            type="text"
            inputMode="numeric"
            maxLength={6}
            value={code}
            onChange={(event) => {
              const value = event.target.value.replace(
                /\D/g,
                ""
              );

              setCode(value);
              setError("");
            }}
            placeholder="123456"
            className="w-full border border-slate-300 rounded-xl p-3 text-center text-xl tracking-[0.4em] outline-none focus:ring-2 focus:ring-blue-500"
          />

          {error && (
            <p className="mt-4 text-sm text-red-600">
              {error}
            </p>
          )}

          {message && (
            <p className="mt-4 text-sm text-green-600">
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-6 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-semibold py-3 rounded-xl"
          >
            {loading
              ? "Verifying..."
              : "Verify Email"}
          </button>
        </form>

        <button
          type="button"
          onClick={handleBackToLogin}
          className="w-full mt-3 text-slate-500 hover:text-slate-800 py-2"
        >
          Back to login
        </button>
      </div>
    </div>
  );
};

export default HospitalVerifyEmail;