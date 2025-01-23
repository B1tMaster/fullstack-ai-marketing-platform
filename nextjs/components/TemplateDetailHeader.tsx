"use client";

import { Template } from "@/server/db/schema";
import React, { useState } from "react";
import { Button } from "./ui/button";
import { CheckIcon, SquarePen, Trash2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "./ui/input";
import axios from "axios";
import toast from "react-hot-toast";

interface TemplateDetailHeaderProps {
  template: Template;
  setShowTemplateDeleteConfirmation: React.Dispatch<
    React.SetStateAction<boolean>
  >;
}

function TemplateDetailHeader({
  template,
  setShowTemplateDeleteConfirmation,
}: TemplateDetailHeaderProps) {
  const [title, setTitle] = useState(template.title);
  const [isEditing, setIsEditing] = useState(false);

  const handleTitleSubmit = async () => {
    try {
      const response = await axios.patch(`/api/templates/${template.id}`, {
        title,
      });
      setTitle(response.data.title);
      toast.success("Title updated successfully.");
    } catch (error) {
      console.error("Error updating title", error);
      toast.error("Error updating title. Please try again later.");
    } finally {
      setIsEditing(false);
    }
  };

  if (isEditing) {
    return (
      <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
        <div className="flex items-center space-x-2 w-full">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="p-0 border-gray-100 bg-gray-50 text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 w-full focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
          />
          <Button
            onClick={handleTitleSubmit}
            className="h-8 w-8 sm:h-10 sm:w-10 rounded-full p-0 bg-green-100 text-green-600 hover:bg-green-200 flex items-center justify-center"
          >
            <CheckIcon className="w-4 h-4 sm:w-5 sm:h-5" />
          </Button>
          <Button
            onClick={() => {
              setIsEditing(false);
              setTitle(template.title);
            }}
            className="h-8 w-8 sm:h-10 sm:w-10 rounded-full p-0 bg-red-100 text-red-500 hover:bg-red-200 flex items-center justify-center"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between md:justify-start md:space-x-2 w-full">
      <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 truncate py-1">
        {title}
      </h1>
      <div className="flex items-center space-x-2">
        <Button
          onClick={() => setIsEditing(true)}
          className={cn(
            "rounded-full p-0 bg-gray-100 text-gray-500 flex items-center justify-center",
            "h-8 w-8 sm:h-10 sm:w-10",
            "hover:text-main hover:bg-main/20"
          )}
        >
          <SquarePen className="w-4 h-4 sm:w-5 sm:h-5" />
        </Button>
        <Button
          onClick={() => setShowTemplateDeleteConfirmation(true)}
          className={cn(
            "rounded-full p-0 bg-gray-100 text-gray-500 flex items-center justify-center",
            "h-8 w-8 sm:h-10 sm:w-10",
            "hover:text-red-600 hover:bg-red-50"
          )}
        >
          <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
        </Button>
      </div>
    </div>
  );
}

export default TemplateDetailHeader;
