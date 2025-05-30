
"use client";

import { PageHeader } from "@/components/shared/PageHeader";
import { ChatClientPage } from "@/components/chat/ChatClientPage";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

export default function ChatPage() {
  const { currentUser, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !currentUser) {
      router.replace("/login");
    }
  }, [currentUser, isLoading, router]);

  if (isLoading || !currentUser) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] p-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
         <p className="text-muted-foreground">Loading chat...</p>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-var(--header-height,4rem)-2rem)] flex flex-col"> {/* Adjust height based on header */}
      <PageHeader
        title="Team Chat"
        description="Connect with your team members. (Simulated chat)"
      />
      <ChatClientPage />
    </div>
  );
}
