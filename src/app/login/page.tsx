"use client";
import Loading from "@/components/Loading";
import { useAppData, user_service } from "@/context/AppContext";
import axios from "axios";
import { ArrowRight, Loader2 } from "lucide-react";
import { redirect, useRouter } from "next/navigation";
import React, { useState } from "react";
import toast from "react-hot-toast";

const LoginPage = () => {
  const [email, setEmail] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();

  const { isAuth, loading: userLoading } = useAppData();

  const handleSubmit = async (
    e: React.FormEvent<HTMLElement>
  ): Promise<void> => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log('Attempting login with email:', email);
      console.log('Login URL:', `${user_service}/api/v1/login`);
      
      const { data } = await axios.post(`${user_service}/api/v1/login`, {
        email,
      });

      console.log('Login response:', data);
      toast.success(data.message);
      router.push(`/verify?email=${email}`);
    } catch (error: any) {
      console.error('Login error:', error);
      
      // Handle different types of errors
      if (error.response) {
        // Server responded with error status
        const message = error.response.data?.message || 'Login failed';
        toast.error(message);
      } else if (error.request) {
        // Request was made but no response received (network error)
        toast.error('Network error: Unable to reach the server. Please check if the backend is running.');
      } else {
        // Something else happened
        toast.error('An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (userLoading) return <Loading />;
  if (isAuth) return redirect("/chat");
  
  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: '#FFF1F2' }}>
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        {/* Floating Orbs */}
        <div 
          className="absolute w-96 h-96 rounded-full opacity-15"
          style={{ 
            background: 'linear-gradient(135deg, #A78BFA 0%, #F472B6 100%)',
            top: '-10%',
            left: '-5%'
          }}
        ></div>
        <div 
          className="absolute w-80 h-80 rounded-full opacity-10"
          style={{ 
            background: 'linear-gradient(135deg, #F472B6 0%, #A78BFA 100%)',
            top: '20%',
            right: '-8%'
          }}
        ></div>
        <div 
          className="absolute w-64 h-64 rounded-full opacity-8"
          style={{ 
            background: 'radial-gradient(circle, #A78BFA 0%, transparent 70%)',
            bottom: '-5%',
            left: '30%'
          }}
        ></div>
        
        {/* Geometric Shapes */}
        <div className="absolute top-1/4 right-1/4 w-32 h-32 opacity-8">
          <div className="w-full h-full border-2 transform rotate-45" style={{ borderColor: '#A78BFA' }}></div>
        </div>
        <div className="absolute bottom-1/3 left-1/5 w-24 h-24 opacity-12">
          <div className="w-full h-full rounded-lg transform rotate-12" style={{ background: 'linear-gradient(135deg, #A78BFA 0%, #F472B6 100%)' }}></div>
        </div>
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="h-full w-full" style={{ 
            backgroundImage: `linear-gradient(rgba(167, 139, 250, 0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(167, 139, 250, 0.3) 1px, transparent 1px)`,
            backgroundSize: '20px 20px'
          }}></div>
        </div>
        
        {/* Scattered Dots */}
        <div className="absolute w-2 h-2 rounded-full opacity-15 top-1/4 left-1/5" style={{ background: '#A78BFA' }}></div>
        <div className="absolute w-2 h-2 rounded-full opacity-15 top-1/3 right-1/4" style={{ background: '#F472B6' }}></div>
        <div className="absolute w-2 h-2 rounded-full opacity-15 top-2/3 left-1/3" style={{ background: '#A78BFA' }}></div>
        <div className="absolute w-2 h-2 rounded-full opacity-15 bottom-1/4 right-1/3" style={{ background: '#F472B6' }}></div>
        <div className="absolute w-2 h-2 rounded-full opacity-15 top-1/2 left-3/4" style={{ background: '#A78BFA' }}></div>
        <div className="absolute w-2 h-2 rounded-full opacity-15 bottom-1/3 left-1/2" style={{ background: '#F472B6' }}></div>
        <div className="absolute w-2 h-2 rounded-full opacity-15 top-3/4 right-1/5" style={{ background: '#A78BFA' }}></div>
        <div className="absolute w-2 h-2 rounded-full opacity-15 bottom-1/2 right-2/3" style={{ background: '#F472B6' }}></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          {/* Glassmorphism Card */}
          <div 
            className="backdrop-blur-xl rounded-3xl p-10 shadow-2xl border border-opacity-20"
            style={{
              background: 'rgba(255, 255, 255, 0.25)',
              borderColor: '#A78BFA',
              boxShadow: '0 25px 45px -10px rgba(167, 139, 250, 0.3), 0 0 50px rgba(244, 114, 182, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.3)'
            }}
          >
            <div className="text-center mb-10">
              <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
                Welcome to Zelo
              </h1>
              <p className="text-lg opacity-80" style={{ color: '#374151' }}>
                Enter your email to continue your journey
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium mb-3 opacity-90"
                  style={{ color: '#374151' }}
                >
                  Email Address
                </label>
                <div className="relative group">
                  <input
                    type="email"
                    id="email"
                    className="w-full px-6 py-4 rounded-2xl backdrop-blur-md border border-opacity-30 placeholder-opacity-60 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-opacity-50 focus:border-opacity-60"
                    style={{
                      background: 'rgba(255, 255, 255, 0.2)',
                      borderColor: '#A78BFA',
                      color: '#374151',
                      boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.1)'
                    }}
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                    required
                  />
                  <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                    style={{ 
                      background: 'linear-gradient(135deg, rgba(167, 139, 250, 0.1) 0%, rgba(244, 114, 182, 0.1) 100%)',
                      boxShadow: '0 0 20px rgba(167, 139, 250, 0.2)'
                    }}
                  ></div>
                </div>
              </div>
              
              <button
                type="submit"
                className="w-full py-4 px-8 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none backdrop-blur-md border border-opacity-30 shadow-lg hover:shadow-xl active:scale-95"
                style={{
                  background: loading 
                    ? 'rgba(167, 139, 250, 0.6)' 
                    : 'linear-gradient(135deg, #A78BFA 0%, #F472B6 100%)',
                  color: 'white',
                  borderColor: '#A78BFA',
                  boxShadow: loading 
                    ? '0 8px 32px rgba(167, 139, 250, 0.3)' 
                    : '0 8px 32px rgba(167, 139, 250, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1) inset'
                }}
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-3">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Sending Otp to your mail...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-3 group">
                    <span>Send Verification Code</span>
                    <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                  </div>
                )}
              </button>
            </form>

            {/* Additional Decorative Elements */}
            <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-20 h-1 rounded-full opacity-60" 
              style={{ background: 'linear-gradient(90deg, #A78BFA 0%, #F472B6 100%)' }}>
            </div>
          </div>
          
          {/* Floating Elements Around Card */}
          <div className="absolute -top-4 -left-4 w-8 h-8 rounded-full opacity-20" 
            style={{ background: '#F472B6' }}>
          </div>
          <div className="absolute -bottom-6 -right-6 w-6 h-6 rounded-full opacity-25" 
            style={{ background: '#A78BFA' }}>
          </div>
          <div className="absolute top-1/2 -right-8 w-4 h-4 transform rotate-45 opacity-20" 
            style={{ background: 'linear-gradient(45deg, #A78BFA, #F472B6)' }}>
          </div>
        </div>
      </div>

      <style jsx>{`
        input:focus {
          box-shadow: 
            inset 0 2px 4px rgba(0, 0, 0, 0.1),
            0 0 0 2px rgba(167, 139, 250, 0.3),
            0 0 20px rgba(167, 139, 250, 0.2) !important;
          border-color: rgba(167, 139, 250, 0.8) !important;
        }
        
        button:hover:not(:disabled) {
          box-shadow: 
            0 20px 40px -10px rgba(167, 139, 250, 0.5), 
            0 0 30px rgba(244, 114, 182, 0.3),
            0 0 0 1px rgba(255, 255, 255, 0.2) inset !important;
        }
        
        .backdrop-blur-xl {
          backdrop-filter: blur(20px);
        }
        
        .backdrop-blur-md {
          backdrop-filter: blur(8px);
        }
        
        .backdrop-blur-lg {
          backdrop-filter: blur(12px);
        }
      `}</style>
    </div>
  );
};

export default LoginPage;