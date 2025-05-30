"use client";

import { Bell, Check } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { mockNotifications } from "@/lib/mock-data";
import type { Notification } from "@/types";
import { useState, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";

export function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Simulate fetching notifications
    setNotifications(mockNotifications.slice(0, 5)); // Show recent 5
    setUnreadCount(mockNotifications.filter(n => !n.read).length);
  }, []);

  const handleMarkAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
    // In a real app, you'd also call an API to mark as read on the server
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative rounded-full">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
            </span>
          )}
          <span className="sr-only">Open notifications</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-4">
          <h4 className="font-medium leading-none">Notifications</h4>
          {notifications.some(n => !n.read) && (
             <Button variant="link" size="sm" className="text-xs text-primary" onClick={() => notifications.filter(n => !n.read).forEach(n => handleMarkAsRead(n.id))}>
                Mark all as read
             </Button>
          )}
        </div>
        <Separator />
        <ScrollArea className="h-[300px]">
          {notifications.length === 0 ? (
            <p className="p-4 text-sm text-muted-foreground">No new notifications.</p>
          ) : (
            <div className="divide-y divide-border">
            {notifications.map((notification) => (
              <div key={notification.id} className={`p-3 ${notification.read ? 'opacity-70' : ''}`}>
                <div className="flex items-start justify-between gap-2">
                  {notification.link ? (
                    <Link href={notification.link} className="text-sm hover:underline flex-1">
                      {notification.message}
                    </Link>
                  ) : (
                    <p className="text-sm flex-1">{notification.message}</p>
                  )}
                  {!notification.read && (
                    <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={() => handleMarkAsRead(notification.id)} title="Mark as read">
                      <Check className="h-4 w-4 text-primary" />
                    </Button>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}
                </p>
              </div>
            ))}
            </div>
          )}
        </ScrollArea>
        <Separator />
        <div className="p-2 text-center">
          <Link href="/notifications" className="text-sm font-medium text-primary hover:underline">
            View all notifications
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  );
}
