import React, { useState } from "react";
import { Mail, Loader2, MessageSquare, ShieldCheck, KeyRound } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import AuthImagePattern from "../components/AuthImagePattern";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";

const Reset = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [isOTPSent, setIsOTPSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();

  const validateEmail = (email) => /\S+@\S+\.\S+/.test(email);

  const sendOTP = async () => {
    if (!validateEmail(email)) return toast.error("Invalid email format");
    setIsSubmitting(true);
    try {
      await axiosInstance.post("/auth/request-reset", { email });
      setIsOTPSent(true);
      toast.success("OTP sent to your email");
    } catch {
      toast.error(error.response?.data?.message || "Failed to send OTP");
    } finally {
      setIsSubmitting(false);
    }
  };

  const verifyOTP = async () => {
    if (otp.length !== 6) return toast.error("OTP must be 6 digits");
    setIsSubmitting(true);
    try {
      await axiosInstance.post("auth/verify-otp", { email, otp });
      toast.success("OTP verified");
      setStep(2);
    } catch {
      toast.error(error.response?.data?.message || "Invalid OTP");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetPassword = async () => {
    if (password.length < 6) return toast.error("Password too short");
    setIsSubmitting(true);
    try {
      await axiosInstance.post("/auth/reset-password", {
        email,
        newPassword: password,
      });
      toast.success("Password successfully reset");
      setTimeout(() => navigate("/login"), 1500);
    } catch {
      toast.error(error.response?.data?.message || "Reset failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (step === 1) {
      isOTPSent ? verifyOTP() : sendOTP();
    } else if (step === 2) {
      resetPassword();
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left section */}
      <div className="flex flex-col justify-center items-center p-12 sm:p-6">
        <div className="flex flex-col items-center gap-3 group mb-6">
          <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
            <MessageSquare className="size-6 text-primary" />
          </div>
          <h1 className="text-2xl font-bold mt-2">Reset Password</h1>
          <p className="text-base-content/60 text-center">
            {step === 1
              ? "Enter your email and verify OTP"
              : "Set a new password for your account"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 w-[50%]">
          {/* STEP 1 */}
          {step === 1 && (
            <>
              {/* Email */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Email</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="size-5 text-base-content/40" />
                  </div>
                  <input
                    type="email"
                    className="input input-bordered w-full pl-10"
                    placeholder="abc@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    readOnly={isOTPSent}
                  />
                </div>
              </div>

              {/* OTP */}
              {isOTPSent && (
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">OTP</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <ShieldCheck className="size-5 text-base-content/40" />
                    </div>
                    <input
                      type="text"
                      className="input input-bordered w-full pl-10"
                      placeholder="6-digit OTP"
                      maxLength={6}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                className="btn btn-primary text-black w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="size-5 animate-spin" />
                    Processing...
                  </>
                ) : isOTPSent ? (
                  "Verify OTP"
                ) : (
                  "Send OTP"
                )}
              </button>
            </>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <>
              {/* Email (readonly) */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Email</span>
                </label>
                <input
                  type="email"
                  className="input input-bordered w-full"
                  value={email}
                  readOnly
                />
              </div>

              {/* New Password */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">New Password</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <KeyRound className="size-5 text-base-content/40" />
                  </div>
                  <input
                    type="password"
                    className="input input-bordered w-full pl-10"
                    placeholder="Enter new password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary text-black w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="size-5 animate-spin" />
                    Resetting...
                  </>
                ) : (
                  "Reset Password"
                )}
              </button>
            </>
          )}
        </form>

        {/* Back to login */}
        <div className="text-center mt-5 space-y-2">
          <p className="text-base-content/60">
            Remembered your password?{" "}
            <Link to="/login" className="link link-primary">
              Sign in
            </Link>
          </p>
        </div>
      </div>

      {/* Right section */}
      <AuthImagePattern
        className="flex flex-col items-center justify-center text-center h-full"
        title="Trouble Logging In?"
        subtitle="We'll help you get back on track"
      />
    </div>
  );
};

export default Reset;
