
"use client";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import type { UserProfile } from "@/types"; // Keep UserProfile type
import { FilterX, Search } from "lucide-react";

interface TaskFilterControlsProps {
  onFilterChange: (filters: Record<string, string>) => void;
  assignees?: UserProfile[]; // Keep this for mock data or if needed later
  isLoadingAssignees?: boolean;
}

export function TaskFilterControls({ 
    onFilterChange, 
    assignees = [], 
    isLoadingAssignees = false 
}: TaskFilterControlsProps) {
  
  const handleInputChange = (name: string, value: string) => {
    onFilterChange({ [name]: value }); 
  };
  
  const clearFilters = () => {
    // Reset filter state in parent component
    onFilterChange({ 
      searchTerm: "", 
      status: "all", 
      priority: "all", 
      assignee: "all" 
    });
    
    // Visually clear inputs - this might require controlled components or direct DOM manipulation
    const searchInput = document.getElementById("search-task") as HTMLInputElement | null;
    if (searchInput) searchInput.value = "";

    // For Select components, if they are not controlled from parent, this won't visually reset them.
    // This is often handled by having the parent component pass down the current filter values as props
    // to control the Select's value, or by using a key prop on the filter controls component to force a re-mount.
  }

  return (
    <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 items-end">
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          id="search-task"
          placeholder="Search tasks..."
          className="pl-8 w-full"
          onChange={(e) => handleInputChange("searchTerm", e.target.value)}
        />
      </div>
      
      <Select onValueChange={(value) => handleInputChange("status", value)} defaultValue="all">
        <SelectTrigger>
          <SelectValue placeholder="Filter by status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Statuses</SelectItem>
          <SelectItem value="todo">To Do</SelectItem>
          <SelectItem value="in-progress">In Progress</SelectItem>
          <SelectItem value="done">Done</SelectItem>
          <SelectItem value="blocked">Blocked</SelectItem>
        </SelectContent>
      </Select>

      <Select onValueChange={(value) => handleInputChange("priority", value)} defaultValue="all">
        <SelectTrigger>
          <SelectValue placeholder="Filter by priority" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Priorities</SelectItem>
          <SelectItem value="low">Low</SelectItem>
          <SelectItem value="medium">Medium</SelectItem>
          <SelectItem value="high">High</SelectItem>
        </SelectContent>
      </Select>

      <Select onValueChange={(value) => handleInputChange("assignee", value)} defaultValue="all" disabled={isLoadingAssignees || assignees.length === 0}>
        <SelectTrigger>
          <SelectValue placeholder="Filter by assignee" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Assignees</SelectItem>
          {isLoadingAssignees && <SelectItem value="loading" disabled>Loading assignees...</SelectItem>}
          {assignees.map(user => (
            <SelectItem key={user.uid} value={user.uid}>{user.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      <Button variant="outline" onClick={clearFilters} className="w-full xl:w-auto">
        <FilterX className="mr-2 h-4 w-4" />
        Clear Filters
      </Button>
    </div>
  );
}
