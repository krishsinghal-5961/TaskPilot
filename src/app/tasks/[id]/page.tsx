import { PageHeader } from "@/components/shared/PageHeader";
import { TaskDetailView } from "@/components/tasks/TaskDetailView";
import { mockTasks } from "@/lib/mock-data"; // Used to get task title for header

export async function generateStaticParams() {
  // In a real app, fetch IDs from a database
  return mockTasks.map(task => ({ id: task.id }));
}

interface TaskPageProps {
  params: { id: string };
}

export default function TaskPage({ params }: TaskPageProps) {
  const task = mockTasks.find(t => t.id === params.id);
  const taskTitle = task ? task.title : "Task Details";
  
  return (
    <div className="space-y-6">
      <PageHeader
        title={taskTitle}
        description={`Viewing details for task ID: ${params.id}`}
      />
      <TaskDetailView taskId={params.id} />
    </div>
  );
}
