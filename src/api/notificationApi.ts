import {api} from "@/api/api.ts";
import {Notification} from "@/types/notification.ts";

export async function getAllNotifications() {
    const response = await api.get(`/api/notifications`);
    return response.data.notifications as Notification[];
}

export async function markNotificationAsRead(notificationId: number) {
    const response = await api.post(`/api/notifications/read`, { id: notificationId });
    return response.data;
}

export async function markAllNotificationsAsRead() {
    const response = await api.post(`/api/notifications/read-all`);
    return response.data;
}