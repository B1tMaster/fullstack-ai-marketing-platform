"use client";

import React, { useEffect, useRef, useState } from "react";
import { Button } from "./ui/button";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import SidebarNav from "./SidebarNav";
import SidebarToggle from "./SidebarToggle";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
  useUser,
} from "@clerk/nextjs";
import UserProfileSection from "./UserProfileSection";

function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { isSignedIn } = useUser();

  const sidebarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target as Node)
      ) {
        if (isOpen) {
          setIsOpen(false);
        }
      }
    };

    window.addEventListener("mousedown", handleOutsideClick);

    return () => {
      window.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [isOpen]);

  const toggleSidebar = () => {
    setIsOpen((prev) => !prev);
  };

  const toggleCollapse = () => {
    setIsCollapsed((prev) => !prev);
  };

  const renderMenuIcon = () => {
    return isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />;
  };

  return (
    <div>
      {/* Mobile X toggle in the left side of screen  */}
      <Button
        variant="ghost"
        onClick={toggleSidebar}
        className={cn(
          "fixed top-4 left-4 z-50 bg-transparent hover:bg-gray-100/50 backdrop-blur-sm",
          "lg:hidden"
        )}
      >
        {renderMenuIcon()}
      </Button>

      {/* Sidebar content */}
      <div
        ref={sidebarRef}
        className={cn(
          "bg-gray-100 flex flex-col h-screen transition-all duration-300 overflow-y-auto",
          // Base styles for mobile sidebar
          "fixed inset-y-0 left-0 z-40 w-64 transform",
          isOpen ? "translate-x-0" : "-translate-x-full",
          // Adjustments for desktop
          "lg:translate-x-0 lg:static lg:w-64",
          isCollapsed && "lg:w-28"
        )}
      >
        <div className={cn("flex flex-col flex-grow p-6", "pt-16 lg:pt-10")}>
          {!isCollapsed && (
            <h1 className="text-4xl font-bold mb-10 hidden lg:block">
              AI Marketing Platform
            </h1>
          )}

          <SidebarNav isCollapsed={isCollapsed} />
        </div>

        {isSignedIn && <UserProfileSection isCollapsed={isCollapsed} />}
        <SidebarToggle
          isCollapsed={isCollapsed}
          toggleSidebar={toggleCollapse}
        />
      </div>
      <SignedOut>
        <SignInButton />
      </SignedOut>
      <SignedIn>
        <UserButton />
      </SignedIn>
    </div>
  );
}

export default Sidebar;
