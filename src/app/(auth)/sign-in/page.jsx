
'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { supabase } from '../../../lib/supabaseClient';

const SignIn = ({ onSignUpClick }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Signing in with:', { email, password });
    setError("");
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("Login error:", error.message);
        setError(error.message);
      } else {
        console.log("User logged in:", data);
        window.location.href = '/notes';
      }
    } catch (err) {
      console.error("Unexpected error:", err);
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl p-8 border border-[#E0E0E0] shadow-lg">
      
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#2E2E2E] mb-2">NoteSync Pro</h1>
          <p className="text-[#666666]">Welcome back</p>
        </div>

      
        {error && (
          <div className="mb-4 p-3 bg-[#FFEBEE] border border-[#EF9A9A] text-[#D32F2F] rounded-lg text-sm">
            {error}
          </div>
        )}

     <div className="space-y-5">
        
          <div>
            <label className="block text-[#2E2E2E] text-sm font-medium mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="awais@example.com"
              className="w-full bg-white text-[#2E2E2E] rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#B22222] focus:border-[#B22222] border border-[#E0E0E0] placeholder-[#999999]"
            />
          </div>

       
          <div>
            <label className="block text-[#2E2E2E] text-sm font-medium mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-white text-[#2E2E2E] rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#B22222] focus:border-[#B22222] border border-[#E0E0E0] placeholder-[#999999]"
            />
          </div>

      
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-[#B22222] hover:bg-[#8B0000] disabled:bg-[#999999] text-white font-semibold rounded-lg py-3 transition-colors mt-6 flex items-center justify-center"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </div>

    
        <p className="text-center text-[#666666] mt-6">
          Don't have an account?{' '}
          <Link href='/sign-up'>
            <button
              onClick={onSignUpClick}
              className="text-[#B22222] hover:text-[#8B0000] font-medium"
            >
              Sign up
            </button>
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignIn;