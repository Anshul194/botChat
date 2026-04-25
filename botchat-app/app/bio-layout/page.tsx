"use client";

import React, { useState } from "react";
import { Briefcase, MapPin, MessageCircle, Bookmark, User, LayoutGrid, Menu, X, ArrowUpRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function BioLayout() {
  const [activeTab, setActiveTab] = useState("portfolio");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col font-sans">
      {/* Navbar */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <button 
              className="md:hidden p-2 text-gray-600"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center text-white font-bold">W</div>
              <span className="font-bold text-lg hidden sm:block">Wall of Portfolios</span>
            </Link>
            <nav className="hidden md:flex items-center gap-6 ml-6">
              <Link href="#" className="text-sm font-medium text-gray-600 hover:text-black">Portfolios</Link>
              <Link href="#" className="text-sm font-medium text-gray-600 hover:text-black">Case Studies</Link>
              <div className="flex items-center gap-2">
                <Link href="#" className="text-sm font-medium text-gray-600 hover:text-black">Job Tracker</Link>
                <span className="text-[10px] uppercase font-bold text-blue-600 border border-blue-600 rounded px-1.5 py-0.5">New</span>
              </div>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <Link href="#" className="hidden lg:block text-sm font-medium text-white bg-black px-4 py-2 rounded-full hover:bg-gray-800 transition">
              Submit Portfolio
            </Link>
            <Link href="#" className="text-sm font-medium text-gray-600 hover:text-black">
              Log in / Signup
            </Link>
          </div>
        </div>
      </header>

      {/* Main Layout */}
      <div className="flex-1 max-w-[1400px] w-full mx-auto flex flex-col md:flex-row">
        
        {/* Sidebar */}
        <aside className="w-full md:w-[320px] lg:w-[380px] bg-white border-r border-gray-200 flex-shrink-0 flex flex-col">
          <div className="p-6 md:p-8 flex flex-col items-center md:items-start md:sticky md:top-16 md:h-[calc(100vh-64px)] overflow-y-auto">
            
            {/* Profile Image & Status */}
            <div className="relative mb-6">
              <img 
                src="https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=400&h=400&fit=crop" 
                alt="Profile" 
                className="w-28 h-28 md:w-32 md:h-32 rounded-full object-cover border-4 border-white shadow-sm"
              />
              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 md:left-auto md:-right-4 md:translate-x-0 bg-white border border-gray-200 shadow-sm rounded-full px-3 py-1.5 flex items-center gap-1.5 whitespace-nowrap">
                <Briefcase size={14} className="text-green-600" />
                <span className="text-xs font-semibold text-gray-700">Open to Work</span>
              </div>
            </div>

            {/* User Info */}
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Qasim Khalid</h1>
            
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 text-sm text-gray-500 mb-4">
              <span className="font-medium">@Qasim Khalid</span>
              <span>·</span>
              <div className="flex items-center gap-1">
                <MapPin size={14} />
                <span>United States</span>
              </div>
            </div>

            <h2 className="text-lg font-medium text-gray-800 mb-8 text-center md:text-left">Creative Director</h2>

            {/* Experience */}
            <div className="w-full mb-8">
              <div className="flex items-center gap-2 mb-3 justify-center md:justify-start">
                <span className="font-bold text-gray-900">6 years</span>
                <span className="text-gray-500 text-sm">Experience Includes:</span>
              </div>
              <div className="flex items-center gap-3 justify-center md:justify-start">
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center border border-gray-200 overflow-hidden">
                  <span className="font-bold text-gray-400 text-xs">C</span>
                </div>
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center border border-gray-200 overflow-hidden">
                  <span className="font-bold text-gray-400 text-xs">H</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 w-full mb-10">
              <button className="flex-1 bg-black text-white rounded-full py-3 px-4 flex items-center justify-center gap-2 hover:bg-gray-800 transition font-medium">
                <MessageCircle size={18} />
                Message
              </button>
              <button className="w-12 h-12 rounded-full border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition flex-shrink-0 shadow-sm">
                <Bookmark size={20} />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-2 w-full bg-gray-50/80 p-1.5 rounded-2xl">
              <button 
                onClick={() => setActiveTab("profile")}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold transition-all ${
                  activeTab === "profile" 
                    ? "bg-white text-black shadow-sm" 
                    : "text-gray-500 hover:text-gray-900"
                }`}
              >
                <User size={16} />
                Profile
              </button>
              <button 
                onClick={() => setActiveTab("portfolio")}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold transition-all ${
                  activeTab === "portfolio" 
                    ? "bg-white text-black shadow-sm" 
                    : "text-gray-500 hover:text-gray-900"
                }`}
              >
                <LayoutGrid size={16} />
                Portfolio
              </button>
            </div>

          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 bg-[#f5f5f5] min-h-[500px] flex flex-col">
          {activeTab === "portfolio" ? (
            <div className="p-4 md:p-8 h-full flex flex-col gap-6">
              {/* This mimics the iframe/blocks content of the portfolio */}
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-xl font-bold text-gray-900">Featured Work</h3>
                <button className="text-sm font-medium text-blue-600 hover:underline flex items-center gap-1">
                  View Site <ArrowUpRight size={14} />
                </button>
              </div>

              {/* Grid of Blocks */}
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                
                {/* Block 1 */}
                <div className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all border border-gray-100 cursor-pointer">
                  <div className="aspect-[4/3] bg-gray-100 relative overflow-hidden">
                    <img src="https://images.unsplash.com/photo-1600132806370-bf17e65e942f?w=800&q=80" alt="Project" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <div className="p-5">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-bold text-gray-900 text-lg">Brand Identity</h4>
                      <span className="text-xs font-semibold bg-gray-100 text-gray-600 px-2 py-1 rounded-md">2023</span>
                    </div>
                    <p className="text-sm text-gray-500 line-clamp-2">A complete visual overhaul for a modern fintech startup, including logo, typography, and UI system.</p>
                  </div>
                </div>

                {/* Block 2 */}
                <div className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all border border-gray-100 cursor-pointer">
                  <div className="aspect-[4/3] bg-gray-100 relative overflow-hidden">
                    <img src="https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&q=80" alt="Project" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <div className="p-5">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-bold text-gray-900 text-lg">UI/UX App Design</h4>
                      <span className="text-xs font-semibold bg-gray-100 text-gray-600 px-2 py-1 rounded-md">2024</span>
                    </div>
                    <p className="text-sm text-gray-500 line-clamp-2">Mobile application design for a health and wellness platform with a focus on accessibility.</p>
                  </div>
                </div>

                {/* Block 3 */}
                <div className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all border border-gray-100 cursor-pointer lg:col-span-2 xl:col-span-1">
                  <div className="aspect-[4/3] bg-gray-100 relative overflow-hidden">
                    <img src="https://images.unsplash.com/photo-1558655146-d09347e92766?w=800&q=80" alt="Project" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <div className="p-5">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-bold text-gray-900 text-lg">Social Media Campaign</h4>
                      <span className="text-xs font-semibold bg-gray-100 text-gray-600 px-2 py-1 rounded-md">2023</span>
                    </div>
                    <p className="text-sm text-gray-500 line-clamp-2">Engaging visual creatives designed for high-conversion marketing across social channels.</p>
                  </div>
                </div>

              </div>
            </div>
          ) : (
            <div className="p-4 md:p-8 max-w-3xl">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">About</h3>
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <p className="text-gray-600 leading-relaxed text-lg mb-6">
                  Qasim Khalid is a Creative Director renowned for transforming digital noise into strategic visual identities that captivate and convert. With a global perspective and a passion for impactful design, Qasim crafts brand identities and user experiences that dominate industries and drive measurable results.
                </p>
                <p className="text-gray-600 leading-relaxed text-lg">
                  His expertise spans brand identity, social media creatives, and UI/UX design, making him a sought-after partner for businesses aiming to elevate their brand&apos;s value and connect deeply with their audience.
                </p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
