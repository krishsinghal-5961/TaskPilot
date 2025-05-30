
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { format, parseISO } from "date-fns";
import { mockUsers, mockTasks } from "@/lib/mock-data";
import type { Task, TaskStatus, TaskPriority } from "@/types";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";

const UNASSIGNED_VALUE = "_UNASSIGNED_";

const taskFormSchema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters." }),
  description: z.string().optional(),
  status: z.enum(["todo", "in-progress", "done", "blocked"]),
  priority: z.enum(["low", "medium", "high"]),
  dueDate: z.date().optional(),
  assigneeId: z.string(), // Will be user ID or UNASSIGNED_VALUE
  dependencies: z.array(z.string()).optional(),
  progress: z.number().min(0).max(100).optional(),
});

type TaskFormValues = z.infer<typeof taskFormSchema>;

interface TaskFormProps {
  task?: Task; 
  onSubmitSuccess?: () => void;
}

export function TaskForm({ task, onSubmitSuccess }: TaskFormProps) {
  const router = useRouter();
  const { toast } = useToast();

  const defaultValues: TaskFormValues = {
    title: task?.title || "",
    description: task?.description || "",
    status: task?.status || "todo",
    priority: task?.priority || "medium",
    dueDate: task?.dueDate ? parseISO(task.dueDate) : undefined,
    assigneeId: task?.assigneeId || UNASSIGNED_VALUE,
    dependencies: task?.dependencies || [],
    progress: task?.progress || 0,
  };

  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues,
  });

  function onSubmit(data: TaskFormValues) {
    const calculatedProgress = data.status === 'done' ? 100 : (data.progress ?? 0);
    const taskMutationData: Omit<Task, "id" | "createdAt" | "updatedAt"> & { id?: string } = {
      title: data.title,
      description: data.description,
      status: data.status,
      priority: data.priority,
      dueDate: data.dueDate ? format(data.dueDate, "yyyy-MM-dd") : undefined,
      assigneeId: data.assigneeId === UNASSIGNED_VALUE ? undefined : data.assigneeId,
      dependencies: data.dependencies,
      progress: calculatedProgress,
    };
    
    if (task && task.id) { // Editing existing task
      const taskIndex = mockTasks.findIndex(t => t.id === task.id);
      if (taskIndex !== -1) {
        mockTasks[taskIndex] = { 
            ...mockTasks[taskIndex], 
            ...taskMutationData, 
            updatedAt: new Date().toISOString() 
        };
      }
      toast({ title: "Task Updated", description: `Task "${data.title}" has been updated.` });
    } else { // Creating new task
      const newTask: Task = {
        id: `task-${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...taskMutationData,
        // Ensure progress is part of the new task object if not set by status
        progress: taskMutationData.progress !== undefined ? taskMutationData.progress : (taskMutationData.status === 'done' ? 100 : 0),
      };
      mockTasks.push(newTask);
      toast({ title: "Task Created", description: `New task "${data.title}" has been created.` });
    }
    
    if (onSubmitSuccess) {
      onSubmitSuccess();
    } else {
      router.push("/tasks");
      // router.refresh(); // Consider if needed, might be handled by refreshKey on TasksPage
    }
  }

  const availableDependencies = mockTasks.filter(t => t.id !== task?.id);


  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Enter task title" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea placeholder="Enter task description (optional)" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="todo">To Do</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="done">Done</SelectItem>
                    <SelectItem value="blocked">Blocked</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="priority"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Priority</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <FormField
            control={form.control}
            name="dueDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Due Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) => date < new Date(new Date().setHours(0,0,0,0))} 
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="assigneeId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Assignee</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select assignee (optional)" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value={UNASSIGNED_VALUE}>Unassigned</SelectItem>
                    {mockUsers.map(user => (
                      <SelectItem key={user.id} value={user.id}>{user.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="dependencies"
          render={() => (
            <FormItem>
              <div className="mb-4">
                <FormLabel className="text-base">Task Dependencies</FormLabel>
                <FormDescription>
                  Select tasks that must be completed before this task can start.
                </FormDescription>
              </div>
              <ScrollArea className="h-40 w-full rounded-md border p-4">
                {availableDependencies.map((depTask) => (
                  <FormField
                    key={depTask.id}
                    control={form.control}
                    name="dependencies"
                    render={({ field }) => {
                      return (
                        <FormItem
                          key={depTask.id}
                          className="flex flex-row items-start space-x-3 space-y-0 py-2"
                        >
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes(depTask.id)}
                              onCheckedChange={(checked) => {
                                return checked
                                  ? field.onChange([...(field.value || []), depTask.id])
                                  : field.onChange(
                                      field.value?.filter(
                                        (value) => value !== depTask.id
                                      )
                                    );
                              }}
                            />
                          </FormControl>
                          <FormLabel className="font-normal">
                            {depTask.title} (ID: {depTask.id})
                          </FormLabel>
                        </FormItem>
                      );
                    }}
                  />
                ))}
                {availableDependencies.length === 0 && (
                    <p className="text-sm text-muted-foreground">No other tasks available to set as dependencies.</p>
                )}
              </ScrollArea>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="progress"
          render={({ field }) => {
            // Ensure value is a number for the input
            const numericValue = typeof field.value === 'number' ? field.value : 0;
            return (
                <FormItem>
                <FormLabel>Progress: {numericValue}%</FormLabel>
                <FormControl>
                    <Input 
                    type="range" 
                    min="0" 
                    max="100" 
                    value={numericValue}
                    onChange={e => field.onChange(parseInt(e.target.value, 10))} 
                    />
                </FormControl>
                <FormMessage />
                </FormItem>
            );
        }}
        />

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit">{task ? "Update Task" : "Create Task"}</Button>
        </div>
      </form>
    </Form>
  );
}
