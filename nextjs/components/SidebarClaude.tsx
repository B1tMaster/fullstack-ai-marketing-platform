"use client";

import React, { useEffect, useState, useRef } from "react";
import { X, Menu, Settings, Layout } from "lucide-react";

const SpaceMonkeyIcon = () => (
  <svg viewBox="0 0 100 100" className="w-8 h-8 min-w-[32px]">
    <circle
      cx="50"
      cy="50"
      r="40"
      fill="#e0e0e0"
      stroke="#999"
      strokeWidth="3"
    />
    <circle cx="50" cy="50" r="35" fill="#f8f9fa" opacity="0.6" />
    <circle cx="50" cy="50" r="25" fill="#8B4513" />
    <circle cx="50" cy="55" r="12" fill="#6B3410" />
    <circle cx="40" cy="45" r="5" fill="white" />
    <circle cx="60" cy="45" r="5" fill="white" />
    <circle cx="40" cy="45" r="2.5" fill="black" />
    <circle cx="60" cy="45" r="2.5" fill="black" />
    <circle cx="28" cy="45" r="8" fill="#8B4513" />
    <circle cx="72" cy="45" r="8" fill="#8B4513" />
    <path
      d="M75 25 Q 80 35 75 45"
      fill="none"
      stroke="white"
      strokeWidth="3"
      opacity="0.7"
    />
    <path d="M30 85 Q 50 90 70 85" fill="none" stroke="#999" strokeWidth="3" />
  </svg>
);

function SidebarClaude() {
  const [isOpen, setIsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const sidebarRef = useRef(null);

  // Handle window resizing and initial mobile detection
  useEffect(() => {
    const handleResize = () => {
      const isMobileView = window.innerWidth < 768;
      setIsMobile(isMobileView);
      if (!isMobileView) {
        setIsOpen(true);
      } else {
        setIsOpen(false);
      }
    };

    // Set initial states
    handleResize();

    // Add event listener
    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleSidebar = () => {
    if (isMobile) {
      setIsOpen(!isOpen);
    } else {
      setIsCollapsed(!isCollapsed);
    }
  };

  // Enhanced click-away handler
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        // For mobile: close the sidebar
        if (isMobile) {
          setIsOpen(false);
        }
        // For desktop: collapse the sidebar only if it's not already collapsed
        else if (!isCollapsed) {
          setIsCollapsed(true);
        }
      }
    };

    // Only add the listener if the sidebar is open or not collapsed
    if (isOpen || !isCollapsed) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, isCollapsed, isMobile]);

  // Handle mouse enter/leave for desktop
  const handleMouseEnter = () => {
    if (!isMobile) {
      setIsCollapsed(false);
    }
  };

  const handleMouseLeave = () => {
    if (!isMobile) {
      setIsCollapsed(true);
    }
  };

  return (
    <>
      {/* Mobile Toggle Button */}
      {isMobile && (
        <button
          onClick={toggleSidebar}
          className="fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-md md:hidden"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      )}

      {/* Sidebar Container */}
      <div
        ref={sidebarRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={`sidebar fixed top-0 left-0 h-full bg-white shadow-lg transition-all duration-300 z-40
          ${
            isMobile
              ? isOpen
                ? "w-64 translate-x-0"
                : "w-64 -translate-x-full"
              : isCollapsed
              ? "w-20"
              : "w-64"
          }`}
      >
        {/* Header */}
        <div className="p-4">
          <h1
            className={`text-xl font-bold transition-opacity duration-200 
            ${isCollapsed && !isMobile ? "opacity-0" : "opacity-100"}`}
          >
            AI Marketing Platform
          </h1>
        </div>

        {/* Navigation */}
        <nav className="mt-8">
          <ul className="space-y-2">
            <li>
              <a
                href="#"
                className="flex items-center px-4 py-2 hover:bg-gray-100 transition-colors"
              >
                <Layout className="w-6 h-6 min-w-[24px]" />
                <span
                  className={`ml-3 transition-opacity duration-200 
                  ${
                    isCollapsed && !isMobile ? "opacity-0 w-0" : "opacity-100"
                  }`}
                >
                  Projects
                </span>
              </a>
            </li>
            <li>
              <a
                href="#"
                className="flex items-center px-4 py-2 hover:bg-gray-100 transition-colors"
              >
                <Layout className="w-6 h-6 min-w-[24px]" />
                <span
                  className={`ml-3 transition-opacity duration-200 
                  ${
                    isCollapsed && !isMobile ? "opacity-0 w-0" : "opacity-100"
                  }`}
                >
                  Templates
                </span>
              </a>
            </li>
            <li>
              <a
                href="#"
                className="flex items-center px-4 py-2 hover:bg-gray-100 transition-colors"
              >
                <Settings className="w-6 h-6 min-w-[24px]" />
                <span
                  className={`ml-3 transition-opacity duration-200 
                  ${
                    isCollapsed && !isMobile ? "opacity-0 w-0" : "opacity-100"
                  }`}
                >
                  Settings
                </span>
              </a>
            </li>
          </ul>
        </nav>

        {/* User Profile with Space Monkey */}
        <div className="absolute bottom-0 w-full p-4 border-t">
          <div className="flex items-center">
            <div className="rounded-full bg-gray-100 p-1">
              <SpaceMonkeyIcon />
            </div>
            <span
              className={`ml-3 transition-opacity duration-200 
              ${isCollapsed && !isMobile ? "opacity-0 w-0" : "opacity-100"}`}
            >
              bhancockio
            </span>
          </div>
        </div>
      </div>
    </>
  );
}

export default SidebarClaude;
