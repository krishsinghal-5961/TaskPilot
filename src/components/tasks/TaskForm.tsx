
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
import { CalendarIcon, Loader2 } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { format, parseISO } from "date-fns";
import type { Task, UserProfile } from "@/types";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { addTaskToFirestore, updateTaskInFirestore, getAllTasks } from "@/services/taskService";
import { getAllUsers } from "@/services/userService";
// import {
//   notifyEmployeeOfTaskAssignment,
//   notifyManagerOfProgressChange,
//   notifyManagerOfTaskCompletion,
//   checkAndNotifyForDependentTasks
// } from "@/lib/notificationService"; // Needs update for Firestore

const UNASSIGNED_VALUE = "_UNASSIGNED_";

const taskFormSchema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters." }),
  description: z.string().optional(),
  status: z.enum(["todo", "in-progress", "done", "blocked"]),
  priority: z.enum(["low", "medium", "high"]),
  dueDate: z.date().optional().nullable(),
  assigneeId: z.string().optional(), 
  dependencies: z.array(z.string()).optional(),
  progress: z.number().min(0).max(100).optional(),
});

type TaskFormValues = z.infer<typeof taskFormSchema>;

interface TaskFormProps {
  task?: Task; 
  onSubmitSuccess?: () => void;
}

export function TaskForm({ task: existingTask, onSubmitSuccess }: TaskFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { currentUser } = useAuth();
  const queryClient = useQueryClient();

  const defaultValues: TaskFormValues = {
    title: existingTask?.title || "",
    description: existingTask?.description || "",
    status: existingTask?.status || "todo",
    priority: existingTask?.priority || "medium",
    dueDate: existingTask?.dueDate ? parseISO(existingTask.dueDate) : null,
    assigneeId: existingTask?.assigneeId || UNASSIGNED_VALUE,
    dependencies: existingTask?.dependencies || [],
    progress: existingTask?.progress || 0,
  };

  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues,
  });
  
  const { data: users, isLoading: usersLoading } = useQuery<UserProfile[]>({
    queryKey: ['users'],
    queryFn: getAllUsers,
    enabled: currentUser?.role === 'manager', // Managers assign tasks
  });

  const { data: allTasksForDeps, isLoading: tasksForDepsLoading } = useQuery<Task[]>({
    queryKey: ['tasks', 'allForDepsForm'],
    queryFn: () => getAllTasks(undefined, 'manager'), // Fetch all tasks for dep selection
  });


  const mutation = useMutation({
    mutationFn: (data: TaskFormValues) => {
      const finalAssigneeId = data.assigneeId === UNASSIGNED_VALUE ? null : data.assigneeId;
      const calculatedProgress = data.status === 'done' ? 100 : (data.progress ?? 0);

      const taskPayload: Omit<Task, "id" | "createdAt" | "updatedAt" | "assigneeName"> = {
        title: data.title,
        description: data.description,
        status: data.status,
        priority: data.priority,
        dueDate: data.dueDate ? format(data.dueDate, "yyyy-MM-dd") : null,
        assigneeId: finalAssigneeId,
        dependencies: data.dependencies,
        progress: calculatedProgress,
        userId: currentUser?.uid, // Associate task with current user
      };

      if (existingTask?.id) {
        return updateTaskInFirestore(existingTask.id, taskPayload);
      } else {
        return addTaskToFirestore(taskPayload);
      }
    },
    onSuccess: (result) => { // result is void for update, Task for add
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      if (existingTask?.id) {
        queryClient.invalidateQueries({ queryKey: ['task', existingTask.id] });
        toast({ title: "Task Updated", description: `Task "${form.getValues("title")}" has been updated.` });
      } else {
        toast({ title: "Task Created", description: `New task "${form.getValues("title")}" has been created.` });
      }
      
      // TODO: Re-integrate notification logic here, e.g. by calling service methods
      // This would involve fetching the full task object if it was just created (result might be the new Task)
      // and comparing old vs new for updates.

      if (onSubmitSuccess) {
        onSubmitSuccess();
      } else {
        router.push("/tasks");
      }
    },
    onError: (error: Error) => {
      toast({ title: "Operation Failed", description: error.message, variant: "destructive" });
    }
  });

  function onSubmit(data: TaskFormValues) {
    mutation.mutate(data);
  }
  
  const availableDependencies = (allTasksForDeps || []).filter(t => t.id !== existingTask?.id);

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
                <Input placeholder="Enter task title" {...field} disabled={mutation.isPending} />
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
                <Textarea placeholder="Enter task description (optional)" {...field} disabled={mutation.isPending} />
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
                <Select onValueChange={field.onChange} defaultValue={field.value} disabled={mutation.isPending}>
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
                <Select onValueChange={field.onChange} defaultValue={field.value} disabled={mutation.isPending}>
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
                        disabled={mutation.isPending}
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
                      onSelect={(date) => field.onChange(date || null)} // Handle undefined from onSelect
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
                <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value || UNASSIGNED_VALUE} 
                    disabled={usersLoading || mutation.isPending || currentUser?.role !== 'manager'}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select assignee (optional)" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value={UNASSIGNED_VALUE}>Unassigned</SelectItem>
                    {usersLoading && <SelectItem value="loading" disabled>Loading users...</SelectItem>}
                    {users?.filter(u => u.role === 'employee').map(user => (
                      <SelectItem key={user.uid} value={user.uid}>{user.name}</SelectItem>
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
              {tasksForDepsLoading ? <p>Loading tasks for dependencies...</p> : (
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
                              disabled={mutation.isPending}
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
              )}
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="progress"
          render={({ field }) => {
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
                    disabled={mutation.isPending}
                    />
                </FormControl>
                <FormMessage />
                </FormItem>
            );
        }}
        />

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => router.back()} disabled={mutation.isPending}>
            Cancel
          </Button>
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {existingTask ? "Update Task" : "Create Task"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
