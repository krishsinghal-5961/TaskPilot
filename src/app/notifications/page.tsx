import { PageHeader } from "@/components/shared/PageHeader";
import { NotificationList } from "@/components/notifications/NotificationList";

export default function NotificationsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Notifications"
        description="Stay up-to-date with important events and task updates."
      />
      <NotificationList />
    </div>
  );
}
