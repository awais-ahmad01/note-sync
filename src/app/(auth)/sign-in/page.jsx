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
        
        window.location.href = '/all-notes';
      }
    } catch (err) {
      console.error("Unexpected error:", err);
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="min-h-screen bg-[#0f0f23] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#1a1d2e] rounded-2xl p-8 border border-gray-800">
       
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-indigo-400 mb-2">NoteSync Pro</h1>
          <p className="text-gray-400">Collaborate in real-time</p>
        </div>

        
        <div className="space-y-5">
        
          <div>
            <label className="block text-gray-300 text-sm mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="awais@example.com"
              className="w-full bg-[#252837] text-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 border border-gray-700 placeholder-gray-500"
            />
          </div>

          
          <div>
            <label className="block text-gray-300 text-sm mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-[#252837] text-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 border border-gray-700 placeholder-gray-500"
            />
          </div>

   
          <button
            onClick={handleSubmit}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg py-3 transition-colors mt-6"
          >
            Sign In
          </button>
        </div>

       
        <p className="text-center text-gray-400 mt-6">
          Don't have an account?{' '}
          <Link href='/sign-up'>
            <button
            onClick={onSignUpClick}
            className="text-indigo-400 hover:text-indigo-300 font-medium"
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