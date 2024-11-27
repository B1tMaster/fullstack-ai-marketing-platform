import React from "react";
import UploadStepHeader from "./UploadStepHeader";

interface ManageUploadStepProps {
  projectId: string;
}

function ManageUploadStep({ projectId }: ManageUploadStepProps) {
  return (
    <div>
      <UploadStepHeader projectId={projectId} />
      {/*  */}
    </div>
  );
}

export default ManageUploadStep;
