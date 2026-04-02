// app/page.tsx
'use client';

import React from 'react';
import { Utensils, LogIn, UserPlus } from 'lucide-react';
import Link from 'next/link';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100">
      {/* Hero Section with App Name */}
      <div className="flex flex-col items-center justify-center pt-16 pb-8 px-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-white rounded-2xl shadow-lg">
            <Utensils className="w-10 h-10 text-emerald-600" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800">
            Kitchen<span className="text-emerald-600">Manager</span>
          </h1>
        </div>
        <p className="text-gray-600 text-center max-w-md">
          Streamline your kitchen operations, manage inventory, track recipes, and reduce waste — all in one place.
        </p>
      </div>

      {/* Two Tile Options: Login & Signup */}
      <div className="flex flex-col md:flex-row items-center justify-center gap-8 max-w-4xl mx-auto px-4 py-12">
        {/* Login Tile */}
        <Link href="/login" className="w-full md:w-80">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl cursor-pointer">
            <div className="bg-emerald-600 p-4 flex justify-center">
              <LogIn className="w-12 h-12 text-white" />
            </div>
            <div className="p-6 text-center">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Welcome Back!</h2>
              <p className="text-gray-500 mb-6">Sign in to access your kitchen dashboard and manage your recipes.</p>
              <button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200">
                Login to Account
              </button>
            </div>
          </div>
        </Link>

        {/* Signup Tile */}
        <Link href="/signup" className="w-full md:w-80">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl cursor-pointer">
            <div className="bg-teal-500 p-4 flex justify-center">
              <UserPlus className="w-12 h-12 text-white" />
            </div>
            <div className="p-6 text-center">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Get Started</h2>
              <p className="text-gray-500 mb-6">Create a new account and set up your kitchen management system today.</p>
              <button className="w-full bg-teal-500 hover:bg-teal-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200">
                Create New Account
              </button>
            </div>
          </div>
        </Link>
      </div>

      {/* Footer with additional info */}
      <footer className="text-center py-8 text-gray-500 text-sm border-t border-gray-200 mt-8">
        <p>© 2025 KitchenManager — Simplify your kitchen workflow</p>
      </footer>
    </div>
  );
};

export default LandingPage;