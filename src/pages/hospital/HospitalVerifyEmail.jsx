import React, {
  useEffect,
  useState,
} from "react";

import { useNavigate } from "react-router-dom";

const HospitalVerifyEmail = () => {
  const navigate = useNavigate();

  const token =
    localStorage.getItem("token");

  const hospital = JSON.parse(
    localStorage.getItem("hospital") ||
      "null"
  );

  const [code, setCode] =
    useState("");

  const [codeRequested, setCodeRequested] =
    useState(false);

  const [error, setError] =
    useState("");

  const [message, setMessage] =
    useState("");

  const [requesting, setRequesting] =
    useState(false);

  const [verifying, setVerifying] =
    useState(false);

  const [countdown, setCountdown] =
    useState(0);

  // Reduce resend countdown every second
  useEffect(() => {
    if (countdown <= 0) {
      return;
    }

    const timer = setInterval(() => {
      setCountdown((current) =>
        current > 0
          ? current - 1
          : 0
      );
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, [countdown]);

  // Check login information when page opens
  useEffect(() => {
    if (!token || !hospital) {
      navigate("/login", {
        replace: true,
      });
      return;
    }

    if (hospital.role !== "HOSPITAL") {
      navigate("/", {
        replace: true,
      });
      return;
    }

    if (hospital.verified) {
      if (hospital.mustChangePassword) {
        navigate(
          "/hospital/change-password",
          {
            replace: true,
          }
        );
      } else {
        navigate(
          "/hospital/dashboard",
          {
            replace: true,
          }
        );
      }
    }
  }, [navigate, token, hospital]);

  // Request first OTP or resend OTP
  const handleRequestCode = async () => {
    if (!token || !hospital) {
      navigate("/login", {
        replace: true,
      });
      return;
    }

    try {
      setRequesting(true);
      setError("");
      setMessage("");

      const response = await fetch(
        "http://localhost:8082/api/hospitals/request-verification-code",
        {
          method: "POST",

          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );

      const data = await response
        .json()
        .catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to send verification code"
        );
      }

      setCode("");
      setCodeRequested(true);
      setCountdown(60);

      setMessage(
        data.message ||
          "Verification code sent successfully."
      );
    } catch (error) {
      setError(
        error.message ||
          "Unable to send verification code"
      );
    } finally {
      setRequesting(false);
    }
  };

  // Verify entered OTP
  const handleVerify = async (event) => {
    event.preventDefault();

    if (!hospital?.email) {
      setError(
        "Hospital login information was not found. Please log in again."
      );
      return;
    }

    if (!codeRequested) {
      setError(
        "Please request a verification code first."
      );
      return;
    }

    if (!/^\d{6}$/.test(code)) {
      setError(
        "Please enter a valid 6-digit code."
      );
      return;
    }

    try {
      setVerifying(true);
      setError("");
      setMessage("");

      const response = await fetch(
        "http://localhost:8082/api/auth/verify",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            email: hospital.email,
            code,
            role: "HOSPITAL",
          }),
        }
      );

      const data = await response
        .json()
        .catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Email verification failed"
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

      const storedUser = JSON.parse(
        localStorage.getItem("user") ||
          "null"
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

      setMessage(
        "Email verified successfully."
      );

      setTimeout(() => {
        navigate(
          "/hospital/change-password",
          {
            replace: true,
          }
        );
      }, 800);
    } catch (error) {
      setError(
        error.message ||
          "Email verification failed"
      );
    } finally {
      setVerifying(false);
    }
  };

  const handleBackToLogin = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("hospital");
    localStorage.removeItem("user");
    localStorage.removeItem("userRole");

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

        <p className="text-slate-500 text-center mt-3">
          Request a verification code for
        </p>

        <p className="font-semibold text-slate-700 text-center mt-1 mb-7 break-all">
          {hospital?.email ||
            "your email"}
        </p>

        {/* Show initial request button */}
        {!codeRequested && (
          <button
            type="button"
            onClick={handleRequestCode}
            disabled={requesting}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-semibold py-3 rounded-xl"
          >
            {requesting
              ? "Sending Code..."
              : "Request Verification Code"}
          </button>
        )}

        {/* Show OTP form only after code request */}
        {codeRequested && (
          <form
            onSubmit={handleVerify}
          >
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Verification code
            </label>

            <input
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              value={code}
              onChange={(event) => {
                const value =
                  event.target.value
                    .replace(/\D/g, "");

                setCode(value);
                setError("");
              }}
              placeholder="123456"
              className="w-full border border-slate-300 rounded-xl p-3 text-center text-xl tracking-[0.4em] outline-none focus:ring-2 focus:ring-blue-500"
            />

            <button
              type="submit"
              disabled={
                verifying ||
                requesting
              }
              className="w-full mt-5 bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white font-semibold py-3 rounded-xl"
            >
              {verifying
                ? "Verifying..."
                : "Verify Email"}
            </button>
          </form>
        )}

        {error && (
          <p className="mt-4 text-sm text-red-600 text-center">
            {error}
          </p>
        )}

        {message && (
          <p className="mt-4 text-sm text-green-600 text-center">
            {message}
          </p>
        )}

        {/* Resend option */}
        {codeRequested && (
          <div className="text-center mt-5">
            <p className="text-sm text-slate-500">
              Didn&apos;t receive the code?
            </p>

            <button
              type="button"
              onClick={handleRequestCode}
              disabled={
                countdown > 0 ||
                requesting ||
                verifying
              }
              className="mt-2 text-sm font-semibold text-blue-600 hover:text-blue-800 disabled:text-slate-400 disabled:cursor-not-allowed"
            >
              {requesting
                ? "Sending..."
                : countdown > 0
                  ? `Resend code in ${countdown}s`
                  : "Resend Verification Code"}
            </button>
          </div>
        )}

        <button
          type="button"
          onClick={handleBackToLogin}
          className="w-full mt-5 text-slate-500 hover:text-slate-800 py-2"
        >
          Back to login
        </button>
      </div>
    </div>
  );
};

export default HospitalVerifyEmail;