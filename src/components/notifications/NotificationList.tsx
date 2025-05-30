"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { mockNotifications } from "@/lib/mock-data";
import type { Notification } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { BellRing, CheckCheck, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useToast } from "@/hooks/use-toast";

export function NotificationList() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    // Simulate fetching notifications
    setNotifications(mockNotifications.sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
  }, []);

  const handleMarkAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
    // In a real app, you'd also call an API
  };
  
  const handleMarkAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    toast({ title: "All notifications marked as read." });
  };

  const handleDeleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    toast({ title: "Notification deleted.", variant: "destructive" });
    // In a real app, you'd also call an API
  };
  
  const handleDeleteAllNotifications = () => {
    setNotifications([]);
    toast({ title: "All notifications deleted.", variant: "destructive" });
  };


  return (
    <Card className="shadow-md">
      <CardContent className="p-0">
        <div className="p-4 flex justify-between items-center border-b">
          <h3 className="text-lg font-medium">All Notifications</h3>
          <div className="flex gap-2">
            {notifications.some(n => !n.read) && (
              <Button variant="outline" size="sm" onClick={handleMarkAllAsRead}>
                <CheckCheck className="mr-2 h-4 w-4" /> Mark all as read
              </Button>
            )}
            {notifications.length > 0 && (
               <Button variant="destructive" size="sm" onClick={handleDeleteAllNotifications}>
                <Trash2 className="mr-2 h-4 w-4" /> Clear all
              </Button>
            )}
          </div>
        </div>
        <ScrollArea className="h-[calc(100vh-20rem)]"> {/* Adjust height as needed */}
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-10 text-muted-foreground">
              <BellRing className="h-12 w-12 mb-4" />
              <p className="text-lg font-medium">No notifications yet.</p>
              <p className="text-sm">Important updates will appear here.</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {notifications.map((notification) => (
                <div 
                  key={notification.id} 
                  className={`p-4 hover:bg-muted/50 transition-colors ${notification.read ? 'opacity-70' : ''}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      {notification.link ? (
                        <Link href={notification.link} className="font-medium text-primary hover:underline">
                          {notification.message}
                        </Link>
                      ) : (
                        <p className="font-medium">{notification.message}</p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      {!notification.read && (
                        <Button variant="ghost" size="sm" onClick={() => handleMarkAsRead(notification.id)} title="Mark as read">
                          <CheckCheck className="h-4 w-4 text-primary" />
                          <span className="sr-only">Mark as read</span>
                        </Button>
                      )}
                       <Button variant="ghost" size="sm" onClick={() => handleDeleteNotification(notification.id)} title="Delete notification" className="text-destructive hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Delete notification</span>
                        </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
