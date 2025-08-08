"use client";
import axios from "axios";
import { ArrowRight, ChevronLeft, Loader2, Shield, Mail, Clock } from "lucide-react";
import { redirect, useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import Cookies from "js-cookie";
import { useAppData, user_service } from "@/context/AppContext";
import Loading from "./Loading";
import toast from "react-hot-toast";

const VerifyOtp = () => {
  const {
    isAuth,
    setIsAuth,
    setUser,
    loading: userLoading,
    fetchChats,
    fetchUsers,
  } = useAppData();
  const [loading, setLoading] = useState(false);
  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const [error, setError] = useState<string>("");
  const [resendLoading, setResendLoading] = useState(false);
  const [timer, setTimer] = useState(60);
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const router = useRouter();

  const searchParams = useSearchParams();

  const email: string = searchParams.get("email") || "";

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  const handleInputChange = (index: number, value: string): void => {
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError("");

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLElement>
  ): void => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>): void => {
    e.preventDefault();
    const patedData = e.clipboardData.getData("text");
    const digits = patedData.replace(/\D/g, "").slice(0, 6);
    if (digits.length === 6) {
      const newOtp = digits.split("");
      setOtp(newOtp);
      inputRefs.current[5]?.focus();
    }
  };
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const otpString = otp.join("");
    if (otpString.length !== 6) {
      setError("Please Enter all 6 digits");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const { data } = await axios.post(`${user_service}/api/v1/verify`, {
        email,
        otp: otpString,
      });
      toast.success(data.message);
      Cookies.set("token", data.token, {
        expires: 15,
        secure: false,
        path: "/",
      });
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
      setUser(data.user);
      setIsAuth(true);
      fetchChats();
      fetchUsers();
    } catch (error: any) {
      setError(error.response.data.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setResendLoading(true);
    setError("");
    try {
      const { data } = await axios.post(`${user_service}/api/v1/login`, {
        email,
      });
      toast.success(data.message);
      setTimer(60);
    } catch (error: any) {
      setError(error.response.data.message);
    } finally {
      setResendLoading(false);
    }
  };

  if (userLoading) return <Loading />;

  if (isAuth) redirect("/chat");
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-purple-50" style={{backgroundColor: '#FFF1F2'}}>
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full opacity-20" style={{background: 'linear-gradient(135deg, #A78BFA, #F472B6)'}}></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full opacity-10" style={{background: 'linear-gradient(45deg, #F472B6, #A78BFA)'}}></div>
      </div>
      
      <div className="relative z-10 flex items-center justify-center min-h-screen p-6">
        <div className="w-full max-w-lg">
          {/* Back button - floating style */}
          <button
            className="mb-8 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white shadow-lg hover:shadow-xl transition-all duration-300 text-gray-600 hover:text-gray-800"
            onClick={() => router.push("/login")}
            style={{color: '#374151'}}
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Back to Login</span>
          </button>

          {/* Main card */}
          <div className="bg-white rounded-3xl shadow-2xl p-8 backdrop-blur-sm border border-white/50" style={{backgroundColor: '#EDE9FE'}}>
            {/* Header section */}
            <div className="text-center mb-10">
              <div className="relative mb-6">
                <div className="mx-auto w-24 h-24 rounded-full flex items-center justify-center shadow-lg" style={{background: 'linear-gradient(135deg, #A78BFA, #F472B6)'}}>
                  <Shield size={36} className="text-white" />
                </div>
              </div>
              <h1 className="text-3xl font-bold mb-3" style={{color: '#374151'}}>
                Verify Your Email
              </h1>
              <p className="text-gray-600 mb-2">
                Enter the 6-digit code we sent to
              </p>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full" style={{backgroundColor: '#A78BFA', color: 'white'}}>
                <Mail size={16} />
                <span className="font-medium text-sm">{email}</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* OTP Input Section */}
              <div className="space-y-4">
                <label className="block text-center font-medium" style={{color: '#374151'}}>
                  Enter verification code
                </label>
                <div className="flex justify-center gap-3">
                  {otp.map((digit, index) => (
                    <div key={index} className="relative">
                      <input
                        ref={(el: HTMLInputElement | null) => {
                          inputRefs.current[index] = el;
                        }}
                        type="text"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleInputChange(index, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(index, e)}
                        onPaste={index === 0 ? handlePaste : undefined}
                        className="w-14 h-14 text-center text-2xl font-bold rounded-2xl border-2 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-purple-200 bg-white shadow-sm"
                        style={{
                          borderColor: digit ? '#A78BFA' : '#E5E7EB',
                          color: '#374151'
                        }}
                      />
                      {digit && (
                        <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-8 h-1 rounded-full" style={{backgroundColor: '#A78BFA'}}></div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Error message */}
              {error && (
                <div className="rounded-2xl p-4 bg-red-50 border border-red-200">
                  <p className="text-red-600 text-sm text-center font-medium">{error}</p>
                </div>
              )}

              {/* Submit button */}
              <button
                type="submit"
                className="w-full py-4 px-6 rounded-2xl font-semibold text-white shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
                style={{background: 'linear-gradient(135deg, #A78BFA, #F472B6)'}}
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-3">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Verifying your code...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-3">
                    <span>Verify & Continue</span>
                    <ArrowRight className="w-5 h-5" />
                  </div>
                )}
              </button>
            </form>

            {/* Footer section */}
            <div className="mt-8 text-center space-y-4">
              <p className="text-gray-600 text-sm">
                Didn't receive the code?
              </p>
              
              {timer > 0 ? (
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100">
                  <Clock size={16} className="text-gray-500" />
                  <span className="text-gray-600 text-sm font-medium">
                    Resend in {timer}s
                  </span>
                </div>
              ) : (
                <button
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-medium text-sm transition-all duration-300 hover:shadow-lg disabled:opacity-50 transform hover:scale-105"
                  style={{
                    backgroundColor: '#F472B6',
                    color: 'white'
                  }}
                  disabled={resendLoading}
                  onClick={handleResendOtp}
                >
                  {resendLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <Mail size={16} />
                      <span>Resend Code</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Bottom decorative text */}
          <div className="text-center mt-6">
            <p className="text-sm text-gray-500">
              Protected by advanced security measures
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyOtp;