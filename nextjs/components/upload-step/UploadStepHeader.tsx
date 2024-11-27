"use client";

import { Upload } from "lucide-react";
import React, { useRef, useState } from "react";
import { Button } from "../ui/button";
import { upload } from "@vercel/blob/client";
import toast from "react-hot-toast";

interface UploadStepHeaderProps {
  projectId: string;
}

function UploadStepHeader({ projectId }: UploadStepHeaderProps) {
  const [uploading, setUploading] = useState(false);
  const [browserFiles, setBrowerFiles] = useState<File[]>([]);

  const inputFileRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    if (e.dataTransfer.files) {
      setBrowerFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileSelectClick = () => {
    if (inputFileRef.current) {
      inputFileRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setBrowerFiles(Array.from(e.target.files));
    }
  };

  const getFileType = (file: File) => {
    if (file.type.startsWith("video/")) return "video";
    if (file.type.startsWith("audio/")) return "audio";
    if (file.type === "text/plain") return "text";
    if (file.type === "text/markdown") return "markdown";
    return "other";
  };

  const handleUpload = async () => {
    // check if files are uploaded
    setUploading(true);

    try {
      // upload files
      const uploadPromises = browserFiles.map(async (file) => {
        const fileData = {
          projectId,
          title: file.name,
          fileType: getFileType(file),
          mimeType: file.type,
          size: file.size,
        };

        const filename = `${projectId}/${file.name}`;
        const result = await upload(filename, file, {
          access: "public",
          handleUploadUrl: "/api/upload",
          multipart: true,
          clientPayload: JSON.stringify(fileData),
        });

        return result;
      });

      const uploadResults = await Promise.all(uploadPromises);

      toast.success(`Successfully uploaded ${uploadResults.length} files`);
      setBrowerFiles([]);
      if (inputFileRef.current) {
        inputFileRef.current.value = "";
      }

      // TODO: fetch files
      // fetchFiles();
    } catch (error) {
      console.error("Error in upload process:", error);
      toast.error("Failed to upload one or more files. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <h2 className="text-xl md:text-2xl lg:text-2xl font-bold mb-8">
        Step 1: Upload Media
      </h2>
      {/* TODO: Upload box */}
      <div
        className="p-10 border-2 border-dashed border-main bg-white rounded-3xl text-center cursor-pointer mb-10"
        onDrop={handleDrop}
        onClick={handleFileSelectClick}
        onDragOver={(e) => e.preventDefault()}
      >
        {browserFiles.length === 0 ? (
          <div>
            <Upload className="mx-auto h-8 w-8 sm:h-10 sm:w-10 text-main" />
            <input
              type="file"
              accept=".mp4,.txt,.md,video/*,audio/*,text/plain,text/markdown"
              multiple
              className="hidden"
              onChange={handleFileChange}
              ref={inputFileRef}
            />
            <p className="mt-2 text-xs sm:text-sm text-main font-semibold">
              Drag and drop files here, or click the select files
            </p>
          </div>
        ) : (
          <div>
            <h3 className="font-bold mb-2">Selected Files:</h3>
            <ul className="text-sm">
              {browserFiles.map((file, index) => (
                <li key={index}>{file.name}</li>
              ))}
            </ul>
            <Button
              onClick={handleUpload}
              disabled={uploading}
              className="mt-4 bg-main text-white round-3xl text-sm"
            >
              <Upload className="h-4 w-4 sm:h-5 sm:w-5 mr-1" />
              {uploading ? "Uploading..." : "Upload Files"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export default UploadStepHeader;
