export interface Notification {
    id: number;
    title: string;
    body: string;
    read: boolean;
    createdAt: string;
    data?: JSON;
}