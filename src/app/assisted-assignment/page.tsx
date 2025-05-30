import { PageHeader } from "@/components/shared/PageHeader";
import { AssistedAssignmentClientPage } from "@/components/assisted-assignment/AssistedAssignmentClientPage";

export default function AssistedAssignmentPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="AI Assisted Task Assignment"
        description="Leverage AI to suggest optimal due dates for tasks based on team workload and task priority."
      />
      <AssistedAssignmentClientPage />
    </div>
  );
}
