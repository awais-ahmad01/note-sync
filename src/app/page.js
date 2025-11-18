'use client';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useRouter } from 'next/navigation';
import { FileText, Users, Share2, Lock, Zap, Bell } from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
    setLoading(false);
  };

  const handleGetStarted = () => {
    if (user) {
      router.push('/notes');
    } else {
      router.push('/sign-in');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1a1d2e] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-400"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1a1d2e]">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-8 py-16">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-indigo-500/20 text-indigo-400 px-4 py-2 rounded-full mb-6">
            <Zap className="w-4 h-4" />
            <span className="text-sm font-medium">Collaborate in Real-Time</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
            Your Notes, <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
              Shared & Synced
            </span>
          </h1>
          
          <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
            Create, organize, and collaborate on notes with your team. 
            Experience real-time updates and seamless sharing in one powerful platform.
          </p>

          <div className="flex items-center justify-center gap-4">
            <button
              onClick={handleGetStarted}
              className="bg-indigo-500 hover:bg-indigo-600 text-white px-8 py-3 rounded-lg font-semibold transition-colors shadow-lg"
            >
              {user ? 'Go to Dashboard' : 'Get Started'}
            </button>
            
            {!user && (
              <Link href="/login">
                <button className="bg-[#252837] hover:bg-[#2d3248] text-white px-8 py-3 rounded-lg font-semibold transition-colors border border-gray-700">
                  Sign In
                </button>
              </Link>
            )}
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-20">
          <FeatureCard
            icon={<FileText className="w-6 h-6 text-green-400" />}
            title="Smart Note Management"
            description="Create, edit, and organize your notes with an intuitive interface. All your thoughts in one place."
            bgColor="bg-green-500/20"
          />

          <FeatureCard
            icon={<Share2 className="w-6 h-6 text-indigo-400" />}
            title="Seamless Collaboration"
            description="Share notes with teammates and collaborate in real-time. Control permissions with viewer and editor roles."
            bgColor="bg-indigo-500/20"
          />

          <FeatureCard
            icon={<Bell className="w-6 h-6 text-purple-400" />}
            title="Real-Time Updates"
            description="Stay in sync with instant notifications. See changes as they happen, no refresh needed."
            bgColor="bg-purple-500/20"
          />

          <FeatureCard
            icon={<Lock className="w-6 h-6 text-blue-400" />}
            title="Privacy Controls"
            description="Keep notes private or share them. You're always in control of who sees what."
            bgColor="bg-blue-500/20"
          />

          <FeatureCard
            icon={<Users className="w-6 h-6 text-emerald-400" />}
            title="Team Management"
            description="Manage shared notes and track who has access. Remove or update permissions anytime."
            bgColor="bg-emerald-500/20"
          />

          <FeatureCard
            icon={<Zap className="w-6 h-6 text-yellow-400" />}
            title="Activity Tracking"
            description="Monitor all activities with detailed logs. Know exactly what's happening with your notes."
            bgColor="bg-yellow-500/20"
          />
        </div>

        {/* How It Works Section */}
        <div className="mt-24">
          <h2 className="text-3xl font-bold text-white text-center mb-4">How It Works</h2>
          <p className="text-gray-400 text-center mb-12 max-w-2xl mx-auto">
            Get started in minutes with our simple and intuitive workflow
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <StepCard
              number="1"
              title="Create Your Notes"
              description="Start by creating notes with our easy-to-use editor. Add titles, content, and organize as you like."
            />
            
            <StepCard
              number="2"
              title="Share & Collaborate"
              description="Invite team members to view or edit your notes. Grant the right permissions for each collaborator."
            />
            
            <StepCard
              number="3"
              title="Stay Synced"
              description="Watch changes happen in real-time. Get notified when someone shares a note or makes updates."
            />
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-24 text-center">
          <div className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-2xl p-12 border border-indigo-500/20">
            <h2 className="text-3xl font-bold text-white mb-4">
              Ready to get started?
            </h2>
            <p className="text-gray-400 mb-8 max-w-xl mx-auto">
              Join now and experience the power of collaborative note-taking. 
              Free to start, easy to use.
            </p>
            <button
              onClick={handleGetStarted}
              className="bg-indigo-500 hover:bg-indigo-600 text-white px-8 py-3 rounded-lg font-semibold transition-colors shadow-lg"
            >
              {user ? 'Go to Dashboard' : 'Start Taking Notes'}
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-800 mt-24">
        <div className="max-w-7xl mx-auto px-8 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-400" />
              <span className="text-white font-semibold">NoteSync Pro</span>
            </div>
            <p className="text-gray-500 text-sm">
              © 2025 NoteSync Pro. Built for seamless collaboration.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Feature Card Component
const FeatureCard = ({ icon, title, description, bgColor }) => {
  return (
    <div className="bg-[#252837] rounded-xl p-6 border border-gray-700 hover:border-gray-600 transition-colors">
      <div className={`w-12 h-12 ${bgColor} rounded-lg flex items-center justify-center mb-4`}>
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      <p className="text-gray-400 text-sm leading-relaxed">{description}</p>
    </div>
  );
};

// Step Card Component
const StepCard = ({ number, title, description }) => {
  return (
    <div className="text-center">
      <div className="w-16 h-16 bg-indigo-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-indigo-500">
        <span className="text-2xl font-bold text-indigo-400">{number}</span>
      </div>
      <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
      <p className="text-gray-400 text-sm leading-relaxed">{description}</p>
    </div>
  );
};