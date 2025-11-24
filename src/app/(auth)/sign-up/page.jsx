
'use client';
import Link from 'next/link';
import React, { useState } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { useRouter } from 'next/navigation';

const SignUp = ({ onSignInClick }) => {
    const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Signing up with:', { fullName, email, password });
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
          data: { name: fullName },
        },
      });

      if (error) {
        console.error("Signup error:", error.message);
      } else {
        console.log("User signed up:", data);
        router.push('/sign-in')
      }
    } catch (error) {
      console.error("error signup:", error);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl p-8 border border-[#E0E0E0] shadow-lg">
       
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#2E2E2E] mb-2">NoteSync Pro</h1>
          <p className="text-[#666666]">Create your account</p>
        </div>

      
        <div className="space-y-5">
     
          <div>
            <label className="block text-[#2E2E2E] text-sm font-medium mb-2">Full Name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Enter your name"
              className="w-full bg-white text-[#2E2E2E] rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#B22222] focus:border-[#B22222] border border-[#E0E0E0] placeholder-[#999999]"
            />
          </div>

        
          <div>
            <label className="block text-[#2E2E2E] text-sm font-medium mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full bg-white text-[#2E2E2E] rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#B22222] focus:border-[#B22222] border border-[#E0E0E0] placeholder-[#999999]"
            />
          </div>


          <div>
            <label className="block text-[#2E2E2E] text-sm font-medium mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a password"
              className="w-full bg-white text-[#2E2E2E] rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#B22222] focus:border-[#B22222] border border-[#E0E0E0] placeholder-[#999999]"
            />
          </div>

         
          <button
            onClick={handleSubmit}
            className="w-full bg-[#B22222] hover:bg-[#8B0000] text-white font-semibold rounded-lg py-3 transition-colors mt-6"
          >
            Create Account
          </button>
        </div>

        
        <p className="text-center text-[#666666] mt-6">
          Already have an account?{' '}
          <Link href='/sign-in'>
            <button
              onClick={onSignInClick}
              className="text-[#B22222] hover:text-[#8B0000] font-medium"
            >
              Sign in
            </button>
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignUp;