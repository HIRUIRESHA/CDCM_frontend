import { useState } from "react";
import axios from "axios";

export default function ForgotPassword() {

  const [email, setEmail] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
     await axios.post("http://localhost:8082/api/auth/forgot-password?email=" + email);
      alert("Reset link sent to your email");
    } catch (error) {
      alert("Error sending email");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-96">
        <h2 className="text-2xl font-bold text-center mb-6">
          Forgot Password
        </h2>

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Enter your email"
            className="w-full p-3 border rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <button
            type="submit"
            className="w-full bg-blue-500 text-white p-3 rounded-lg hover:bg-blue-600 transition"
          >
            Send Reset Link
          </button>
        </form>
      </div>
    </div>
  );
}
