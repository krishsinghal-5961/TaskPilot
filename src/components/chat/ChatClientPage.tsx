
"use client";

import { useState, useEffect, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Paperclip, Send, User, MessageSquare } from "lucide-react"; // Added MessageSquare
import { useAuth } from "@/contexts/AuthContext";
import type { UserProfile, ChatMessage } from "@/types";
import { mockUsers, mockChatMessages } from "@/lib/mock-data";
import { getInitials } from "@/lib/utils";
import { format, parseISO } from "date-fns";
import { cn } from "@/lib/utils";
import { Card } from "../ui/card";


export function ChatClientPage() {
  const { currentUser } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>(mockChatMessages);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  useEffect(() => {
    // Load all users except the current one for the chat list
    if (currentUser) {
      setUsers(mockUsers.filter(user => user.uid !== currentUser.uid));
      if (mockUsers.length > 1 && currentUser) {
         const defaultSelected = mockUsers.find(user => user.uid !== currentUser.uid);
         setSelectedUser(defaultSelected || null);
      }
    }
  }, [currentUser]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, selectedUser]);


  const handleSendMessage = () => {
    if (newMessage.trim() === "" || !currentUser || !selectedUser) return;

    const messageToSend: ChatMessage = {
      id: `msg-${Date.now()}`,
      senderId: currentUser.uid,
      senderName: currentUser.name,
      receiverId: selectedUser.uid,
      text: newMessage.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages(prevMessages => [...prevMessages, messageToSend]);
    setNewMessage("");
  };
  
  const displayedMessages = messages.filter(msg => 
    (msg.senderId === currentUser?.uid && msg.receiverId === selectedUser?.uid) ||
    (msg.senderId === selectedUser?.uid && msg.receiverId === currentUser?.uid)
  ).sort((a,b) => parseISO(a.timestamp).getTime() - parseISO(b.timestamp).getTime());

  if (!currentUser) return <p>Loading user...</p>;

  return (
    <div className="flex flex-1 border rounded-lg shadow-md overflow-hidden">
      {/* User List Sidebar */}
      <aside className="w-1/4 border-r bg-muted/20">
        <div className="p-4 border-b">
          <h3 className="text-lg font-semibold">Contacts</h3>
        </div>
        <ScrollArea className="h-[calc(100%-4rem)]"> {/* Adjust based on header */}
          {users.map(user => (
            <Button
              key={user.uid}
              variant="ghost"
              className={cn(
                "w-full justify-start p-3 rounded-none hover:bg-muted",
                selectedUser?.uid === user.uid && "bg-muted font-semibold"
              )}
              onClick={() => setSelectedUser(user)}
            >
              <Avatar className="h-8 w-8 mr-3">
                <AvatarImage src={user.avatarUrl} alt={user.name} data-ai-hint="user avatar" />
                <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
              </Avatar>
              {user.name}
            </Button>
          ))}
        </ScrollArea>
      </aside>

      {/* Chat Area */}
      <main className="flex-1 flex flex-col">
        {selectedUser ? (
          <>
            <header className="p-4 border-b flex items-center gap-3 bg-muted/40">
              <Avatar className="h-9 w-9">
                <AvatarImage src={selectedUser.avatarUrl} alt={selectedUser.name} data-ai-hint="user avatar" />
                <AvatarFallback>{getInitials(selectedUser.name)}</AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-lg font-semibold">{selectedUser.name}</h2>
                <p className="text-xs text-muted-foreground">{selectedUser.designation || selectedUser.role}</p>
              </div>
            </header>

            <ScrollArea className="flex-1 p-4 space-y-4 bg-background">
              {displayedMessages.length > 0 ? displayedMessages.map(msg => (
                <div
                  key={msg.id}
                  className={cn(
                    "flex items-end gap-2 max-w-[75%]",
                    msg.senderId === currentUser.uid ? "ml-auto flex-row-reverse" : "mr-auto"
                  )}
                >
                  <Avatar className="h-7 w-7">
                    <AvatarImage src={mockUsers.find(u=>u.uid === msg.senderId)?.avatarUrl} alt={msg.senderName} data-ai-hint="message sender avatar" />
                    <AvatarFallback>{getInitials(msg.senderName)}</AvatarFallback>
                  </Avatar>
                  <Card className={cn(
                      "p-3 rounded-lg shadow",
                      msg.senderId === currentUser.uid ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
                    )}>
                    <p className="text-sm">{msg.text}</p>
                    <p className={cn(
                        "text-xs mt-1",
                        msg.senderId === currentUser.uid ? "text-primary-foreground/70 text-right" : "text-secondary-foreground/70 text-left"
                        )}>
                      {format(parseISO(msg.timestamp), "p")}
                    </p>
                  </Card>
                </div>
              )) : (
                 <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground h-full">
                    <MessageSquare className="h-16 w-16 mb-4 text-muted-foreground/50" />
                    <p className="text-lg">No messages yet.</p>
                    <p className="text-sm">Start the conversation!</p>
                </div>
              )}
              <div ref={messagesEndRef} />
            </ScrollArea>
            
            <Separator />

            <footer className="p-3 border-t bg-muted/30">
              <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="flex items-center gap-2">
                <Button type="button" variant="ghost" size="icon" className="text-muted-foreground hover:text-primary" disabled>
                  <Paperclip className="h-5 w-5" />
                  <span className="sr-only">Attach file (not implemented)</span>
                </Button>
                <Input
                  type="text"
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="flex-1 bg-background"
                  autoFocus
                />
                <Button type="submit" size="icon">
                  <Send className="h-5 w-5" />
                  <span className="sr-only">Send message</span>
                </Button>
              </form>
            </footer>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
            <User className="h-16 w-16 mb-4" />
            <p className="text-lg">Select a user to start chatting.</p>
          </div>
        )}
      </main>
    </div>
  );
}
