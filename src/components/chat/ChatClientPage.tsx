
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Paperclip, Send, User, MessageSquare, Users, PlusCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import type { UserProfile, ChatMessage, GroupChat } from "@/types";
import { mockUsers, mockChatMessages, mockGroupChats } from "@/lib/mock-data";
import { getInitials } from "@/lib/utils";
import { format, parseISO } from "date-fns";
import { cn } from "@/lib/utils";
import { Card } from "../ui/card";
import { CreateGroupDialog } from "./CreateGroupDialog";

type Conversation = UserProfile | GroupChat;

function isGroupChat(conversation: Conversation): conversation is GroupChat {
  return 'memberIds' in conversation;
}

const getConversationId = (conversation: Conversation | null): string | undefined => {
  if (!conversation) return undefined;
  return isGroupChat(conversation) ? conversation.id : conversation.uid;
};

export function ChatClientPage() {
  const { currentUser } = useAuth();
  const [allConversations, setAllConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>(mockChatMessages); // For this mock, messages are global
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<null | HTMLDivElement>(null);
  const [refreshKey, setRefreshKey] = useState(0); // To trigger re-render of conversations list

  useEffect(() => {
    if (currentUser) {
      const usersForChat = mockUsers.filter(user => user.uid !== currentUser.uid);
      const groupsForChat = [...mockGroupChats]; // Get a copy
      setAllConversations([...usersForChat, ...groupsForChat].sort((a, b) => a.name.localeCompare(b.name)));

      if (!selectedConversation && allConversations.length > 0) {
        const firstUser = usersForChat[0];
        if (firstUser) setSelectedConversation(firstUser);
      }
    }
  }, [currentUser, refreshKey, selectedConversation, allConversations.length]); // Added allConversations.length to re-evaluate default selection

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, selectedConversation]);

  const handleGroupCreated = (newGroup: GroupChat) => {
    setRefreshKey(prev => prev + 1); 
    setSelectedConversation(newGroup); 
  };

  const handleSendMessage = () => {
    if (newMessage.trim() === "" || !currentUser || !selectedConversation) return;

    const messageToSend: ChatMessage = {
      id: `msg-${Date.now()}`,
      senderId: currentUser.uid,
      senderName: currentUser.name,
      text: newMessage.trim(),
      timestamp: new Date().toISOString(),
    };

    if (isGroupChat(selectedConversation)) {
      messageToSend.groupId = selectedConversation.id;
    } else {
      messageToSend.receiverId = selectedConversation.uid;
    }

    mockChatMessages.push(messageToSend);
    setMessages([...mockChatMessages]); 
    setNewMessage("");
  };

  const displayedMessages = messages.filter(msg => {
    if (!currentUser || !selectedConversation) return false;

    if (isGroupChat(selectedConversation)) {
      return msg.groupId === selectedConversation.id;
    } else { 
      return (
        (msg.senderId === currentUser.uid && msg.receiverId === selectedConversation.uid) ||
        (msg.senderId === selectedConversation.uid && msg.receiverId === currentUser.uid)
      );
    }
  }).sort((a, b) => parseISO(a.timestamp).getTime() - parseISO(b.timestamp).getTime());

  if (!currentUser) return <p>Loading user...</p>;

  const getConversationAvatar = (conv: Conversation) => {
    if (isGroupChat(conv)) {
      return conv.avatarUrl || `https://placehold.co/100x100.png?text=${getInitials(conv.name)}`;
    }
    return conv.avatarUrl || `https://placehold.co/100x100.png?text=${getInitials(conv.name)}`;
  };
  
  const getConversationDataAiHint = (conv: Conversation) => {
    return isGroupChat(conv) ? "group avatar" : "user avatar";
  };


  return (
    <div className="flex flex-1 border rounded-lg shadow-md overflow-hidden">
      <aside className="w-1/3 lg:w-1/4 border-r bg-muted/20 flex flex-col">
        <div className="p-3 border-b flex items-center justify-between">
          <h3 className="text-lg font-semibold">Contacts</h3>
          <CreateGroupDialog onGroupCreated={handleGroupCreated}>
            <Button variant="ghost" size="sm" className="text-primary">
              <PlusCircle className="h-4 w-4 mr-1" /> Group
            </Button>
          </CreateGroupDialog>
        </div>
        <ScrollArea className="flex-1">
          {allConversations.map(conv => (
            <Button
              key={getConversationId(conv)}
              variant="ghost"
              className={cn(
                "w-full justify-start p-3 rounded-none hover:bg-muted h-auto",
                getConversationId(selectedConversation) === getConversationId(conv) && "bg-muted font-semibold"
              )}
              onClick={() => setSelectedConversation(conv)}
            >
              <Avatar className="h-9 w-9 mr-3">
                <AvatarImage src={getConversationAvatar(conv)} alt={conv.name} data-ai-hint={getConversationDataAiHint(conv)} />
                <AvatarFallback>{getInitials(conv.name)}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col items-start text-left">
                <span className="truncate max-w-[150px]">{conv.name}</span>
                {isGroupChat(conv) && (
                    <span className="text-xs text-muted-foreground">{conv.memberIds.length} members</span>
                )}
              </div>
            </Button>
          ))}
        </ScrollArea>
      </aside>

      <main className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            <header className="p-4 border-b flex items-center gap-3 bg-muted/40">
              <Avatar className="h-9 w-9">
                <AvatarImage src={getConversationAvatar(selectedConversation)} alt={selectedConversation.name} data-ai-hint={getConversationDataAiHint(selectedConversation)} />
                <AvatarFallback>{getInitials(selectedConversation.name)}</AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-lg font-semibold">{selectedConversation.name}</h2>
                {isGroupChat(selectedConversation) ? (
                    <p className="text-xs text-muted-foreground">{selectedConversation.memberIds.length} members</p>
                ) : (
                    <p className="text-xs text-muted-foreground">{(selectedConversation as UserProfile).designation || (selectedConversation as UserProfile).role}</p>
                )}
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
                    <AvatarImage src={mockUsers.find(u => u.uid === msg.senderId)?.avatarUrl} alt={msg.senderName} data-ai-hint="message sender avatar" />
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
            <Users className="h-16 w-16 mb-4" />
            <p className="text-lg">Select a user or group to start chatting.</p>
          </div>
        )}
      </main>
    </div>
  );
}
