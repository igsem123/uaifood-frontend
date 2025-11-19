import { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import { Button } from "./ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { ScrollArea } from "./ui/scroll-area";
import { Separator } from "./ui/separator";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { connectSocket } from "@/integrations/socket.ts";
import { Notification } from "@/types/notification.ts";
import { getAllNotifications, markNotificationAsRead, markAllNotificationsAsRead } from "@/api/notificationApi.ts";

interface NotificationsPopoverProps {
    userId: number | null;
}

export const NotificationsPopover = ({ userId }: NotificationsPopoverProps) => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [open, setOpen] = useState(false);

    // Conectar ao socket e escutar eventos
    useEffect(() => {
        if (!userId) return;

        const socket = connectSocket();

        socket.on("new_notification", (notification: Notification) => {
            setNotifications(prev => [notification, ...prev]);
            setUnreadCount(prev => prev + 1);
        });

        socket.on("unread_count", ({ count }: { count: number }) => {
            setUnreadCount(count);
        });

        return () => {
            socket.off("new_notification");
            socket.off("unread_count");
        };

    }, [userId]);

    // Chamada ao backend para buscar notificações
    const loadNotifications = async () => {
        if (!userId) return;

        const list = await getAllNotifications();

        setNotifications(list);
        setUnreadCount(list.filter(n => !n.read).length);
    };

    // Carregar notificações ao abrir popover ou ao logar
    useEffect(() => {
        if (userId) loadNotifications();
    }, [userId]);

    // Marcar notificação como lida
    const markAsRead = async (notificationId: number) => {
        await markNotificationAsRead(notificationId);

        setNotifications(prev =>
            prev.map(n => (n.id === notificationId ? { ...n, read: true } : n))
        );

        setUnreadCount(prev => Math.max(0, prev - 1));
    };

    // Marcar todas como lidas
    const markAllAsRead = async () => {
        await markAllNotificationsAsRead();

        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        setUnreadCount(0);
    };

    if (!userId) return null;

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-xs text-destructive-foreground">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
                    )}
                </Button>
            </PopoverTrigger>

            <PopoverContent className="w-80 p-0" align="end">
                <div className="flex items-center justify-between p-4">
                    <h3 className="font-semibold">Notificações</h3>
                    {unreadCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={markAllAsRead}
                            className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground"
                        >
                            Marcar todas como lidas
                        </Button>
                    )}
                </div>

                <Separator />

                <ScrollArea className="h-[400px]">
                    {notifications.length === 0 ? (
                        <div className="p-4 text-center text-sm text-muted-foreground">
                            Nenhuma notificação
                        </div>
                    ) : (
                        <div className="space-y-1">
                            {notifications.map(notification => (
                                <div
                                    key={notification.id}
                                    className={`cursor-pointer p-4 transition-colors hover:bg-accent ${
                                        !notification.read ? "bg-accent/50" : ""
                                    }`}
                                    onClick={() => !notification.read && markAsRead(notification.id)}
                                >
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="flex-1 space-y-1">
                                            <p className="text-sm font-medium leading-none">{notification.title}</p>
                                            <p className="text-sm text-muted-foreground">{notification.body}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {formatDistanceToNow(new Date(notification.createdAt), {
                                                    addSuffix: true,
                                                    locale: ptBR,
                                                })}
                                            </p>
                                        </div>

                                        {!notification.read && <div className="h-2 w-2 rounded-full bg-primary" />}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </ScrollArea>
            </PopoverContent>
        </Popover>
    );
};
