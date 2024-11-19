"use client";

import { cn } from "@/lib/utils";
import { UserButton, useUser } from "@clerk/nextjs";
import React, { useRef, useState } from "react";

interface UserProfileSectionProps {
  isCollapsed: boolean;
}

function UserProfileSection({ isCollapsed }: UserProfileSectionProps) {
  const { user, isSignedIn } = useUser();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const userButtonWrapperRef = useRef<HTMLDivElement>(null);

  const handleUserProfileClick = () => {
    if (userButtonWrapperRef.current) {
      const userButtonElement =
        userButtonWrapperRef.current.querySelector("button");
      if (userButtonElement) {
        if (isProfileOpen) {
          userButtonElement.blur();
        } else {
          userButtonElement.click();
        }
        setIsProfileOpen((prev) => !prev);
      }
    }
  };

  if (!isSignedIn) return null;

  return (
    <div
      className={cn(
        "p-4 border-t border-gray-200",
        isCollapsed ? "lg:px-2" : "lg:px-8"
      )}
    >
      <div
        className={cn(
          "flex items-center space-x-3 text-gray-700 hover:scale-[1.02] transition-all duration-300",
          isCollapsed ? "lg:justify-center" : "lg:justify-start"
        )}
      >
        <div ref={userButtonWrapperRef}>
          <UserButton
            appearance={{ elements: { userButtonAvatarBox: "h-8 w-8" } }}
          />
        </div>

        {/* DESKTOP */}
        {!isCollapsed && (
          <span
            className="text-md font-medium cursor-pointer hidden lg:block"
            onClick={handleUserProfileClick}
          >
            {user?.username || user?.firstName || user?.fullName || "Profile"}
          </span>
        )}

        {/* MOBILE */}
        <span
          className="text-md font-medium cursor-pointer lg:hidden"
          onClick={handleUserProfileClick}
        >
          {user?.username || user?.firstName || user?.fullName || "Profile"}
        </span>
      </div>
    </div>
  );
}

export default UserProfileSection;
