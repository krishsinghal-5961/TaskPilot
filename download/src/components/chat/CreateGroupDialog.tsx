
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { UserProfile, GroupChat } from "@/types";
import { useAuth } from "@/contexts/AuthContext";
import { mockUsers, mockGroupChats } from "@/lib/mock-data";
import { useToast } from "@/hooks/use-toast";
import { formatISO } from "date-fns";
import { getInitials } from "@/lib/utils";
import { Loader2 } from "lucide-react";

const createGroupSchema = z.object({
  groupName: z.string().min(3, { message: "Group name must be at least 3 characters." }),
  memberIds: z.array(z.string()).min(1, { message: "Select at least one member." }),
});

type CreateGroupFormValues = z.infer<typeof createGroupSchema>;

interface CreateGroupDialogProps {
  onGroupCreated: (newGroup: GroupChat) => void;
  children: React.ReactNode; // Trigger element
}

export function CreateGroupDialog({ onGroupCreated, children }: CreateGroupDialogProps) {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const availableMembers = mockUsers.filter(user => user.uid !== currentUser?.uid);

  const form = useForm<CreateGroupFormValues>({
    resolver: zodResolver(createGroupSchema),
    defaultValues: {
      groupName: "",
      memberIds: [],
    },
  });

  function onSubmit(data: CreateGroupFormValues) {
    if (!currentUser) {
      toast({ title: "Error", description: "You must be logged in to create a group.", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);

    const newGroupId = `group-${Date.now()}`;
    const allMemberIds = Array.from(new Set([currentUser.uid, ...data.memberIds])); // Ensure creator is a member

    const newGroup: GroupChat = {
      id: newGroupId,
      name: data.groupName,
      memberIds: allMemberIds,
      avatarUrl: `https://placehold.co/100x100.png?text=${getInitials(data.groupName)}`,
      createdAt: formatISO(new Date()),
      createdBy: currentUser.uid,
    };

    mockGroupChats.push(newGroup); // Add to global mock array

    toast({
      title: "Group Created",
      description: `Group "${newGroup.name}" has been successfully created.`,
    });

    onGroupCreated(newGroup); // Callback to inform parent
    form.reset();
    setIsSubmitting(false);
    setIsOpen(false);
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Create New Group Chat</DialogTitle>
          <DialogDescription>
            Name your group and select members to start a conversation.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-2">
            <FormField
              control={form.control}
              name="groupName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Group Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Project Alpha Team" {...field} disabled={isSubmitting} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="memberIds"
              render={() => (
                <FormItem>
                  <div className="mb-2">
                    <FormLabel className="text-base">Select Members</FormLabel>
                    <FormDescription>
                      Choose who you want to add to this group.
                    </FormDescription>
                  </div>
                  <ScrollArea className="h-48 w-full rounded-md border p-4">
                    {availableMembers.length > 0 ? (
                      availableMembers.map((member) => (
                        <FormField
                          key={member.uid}
                          control={form.control}
                          name="memberIds"
                          render={({ field }) => {
                            return (
                              <FormItem
                                key={member.uid}
                                className="flex flex-row items-start space-x-3 space-y-0 py-2"
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(member.uid)}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([...(field.value || []), member.uid])
                                        : field.onChange(
                                            field.value?.filter(
                                              (value) => value !== member.uid
                                            )
                                          );
                                    }}
                                    disabled={isSubmitting}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  {member.name} ({member.designation || member.role})
                                </FormLabel>
                              </FormItem>
                            );
                          }}
                        />
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">No other users available to add.</p>
                    )}
                  </ScrollArea>
                  <FormMessage /> {/* For the memberIds array itself */}
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => { setIsOpen(false); form.reset(); }} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Group
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
