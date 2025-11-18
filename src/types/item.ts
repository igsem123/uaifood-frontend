export interface Item {
    id: number;
    name: string;
    description: string;
    unitPrice: number;
    imageUrl: string | null;
    categoryId: number;
    available: boolean;
}