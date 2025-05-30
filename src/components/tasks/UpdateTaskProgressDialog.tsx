"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import type { Task } from "@/types";

interface UpdateTaskProgressDialogProps {
  task: Task;
  onUpdateProgress: (taskId: string, progress: number) => void;
  children: React.ReactNode; // Trigger element
}

export function UpdateTaskProgressDialog({ task, onUpdateProgress, children }: UpdateTaskProgressDialogProps) {
  const [progress, setProgress] = useState(task.progress);
  const [isOpen, setIsOpen] = useState(false);

  const handleSubmit = () => {
    onUpdateProgress(task.id, progress);
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Update Progress for "{task.title}"</DialogTitle>
          <DialogDescription>
            Adjust the slider to set the new progress for this task.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="progress" className="text-right">
              Progress
            </Label>
            <Slider
              id="progress"
              value={[progress]}
              onValueChange={(value) => setProgress(value[0])}
              max={100}
              step={1}
              className="col-span-2"
            />
            <span className="col-span-1 text-sm font-medium">{progress}%</span>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
          <Button type="submit" onClick={handleSubmit}>Save changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
