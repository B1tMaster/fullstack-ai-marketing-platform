"use client";

import { Project } from "@/server/db/schema";
import React, { lazy, useEffect, useState } from "react";
import ProjectDetailHeader from "./ProjectDetailHeader";
import ProjectDetailStepper from "./ProjectDetailStepper";
import ConfirmationModal from "../ConfirmationModal";
import axios from "axios";
import toast from "react-hot-toast";
import { useRouter, useSearchParams } from "next/navigation";
import ProjectDetailBody from "./ProjectDetailBody";

const ManageUploadStep = lazy(() => import("../upload-step/ManageUploadStep"));
const ConfigurePromptsStep = lazy(() => import("../ConfigurePromptsStep"));
const GenerateContentStep = lazy(() => import("../GenerateContentStep"));

const steps = [
  { name: "Upload Media", tab: "upload", component: ManageUploadStep },
  { name: "Prompts", tab: "prompts", component: ConfigurePromptsStep },
  { name: "Generate", tab: "generate", component: GenerateContentStep },
];

interface ProjectDetailViewProps {
  project: Project;
}

function ProjectDetailView({ project }: ProjectDetailViewProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const searchParams = useSearchParams();

  const findStepIndex = (tab: string) => {
    const index = steps.findIndex((step) => step.tab === tab);
    return index === -1 ? 0 : index;
  };

  const [currentStep, setCurrentStep] = useState(
    findStepIndex(searchParams.get("tab") ?? "upload")
  );
  const router = useRouter();

  useEffect(() => {
    const tab = searchParams.get("tab") ?? "upload";
    setCurrentStep(findStepIndex(tab));
  }, [searchParams]);

  const handleStepClick = (index: number) => {
    router.push(`/project/${project.id}?tab=${steps[index].tab}`, {
      scroll: false,
    });
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await axios.delete(`/api/projects/${project.id}`);
      toast.success("Project deleted successfully");
      router.push("/projects?deleted=true");
    } catch (error) {
      console.error("Failed to delete project", error);
      toast.error("Failed to delete project. Please try again.");
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirmation(false);
    }
  };

  return (
    <div className="max-w-screen-xl mx-auto p-4 sm:p-6 lg:p-8 bg-white space-y-12">
      <ProjectDetailHeader
        project={project}
        setShowDeleteConfirmation={setShowDeleteConfirmation}
      />
      <ProjectDetailStepper
        currentStep={currentStep}
        handleStepClick={handleStepClick}
        steps={steps}
      />
      <div className="bg-gray-50 rounded-2xl p-4 sm:p-6 lg:p-8 shadow-sm mt-10 sm:mt-12 lg:mt-10">
        <ProjectDetailBody
          currentStep={currentStep}
          steps={steps}
          projectId={project.id}
        />
      </div>

      <ConfirmationModal
        isOpen={showDeleteConfirmation}
        title="Delete Project"
        message="Are you sure you want to delete this project? This action cannot be undone."
        isLoading={isDeleting}
        onClose={() => setShowDeleteConfirmation(false)}
        onConfirm={handleDelete}
      />
    </div>
  );
}

export default ProjectDetailView;
