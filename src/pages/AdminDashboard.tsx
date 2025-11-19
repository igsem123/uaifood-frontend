import {useState, useEffect, useCallback} from "react";
import {useNavigate} from "react-router-dom";
import {useToast} from "@/hooks/use-toast";
import {Header} from "@/components/Header";
import {Footer} from "@/components/Footer";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Textarea} from "@/components/ui/textarea";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog";
import {Badge} from "@/components/ui/badge";
import {Pencil, Trash2, Plus, Upload, Loader2, EyeIcon} from "lucide-react";
import {Category} from "@/types/category.ts";
import {Item} from "@/types/item.ts";
import {Order, OrderStatus} from "@/types/order.ts";
import {User} from "@/types/user.ts";
import {useAuth} from "@/hooks/use-auth.ts";
import {fetchOrders, updateOrder} from "@/api/orderApi.ts";
import {fetchCategories, updateCategory, createCategory, deleteCategory} from "@/api/categoryApi.ts";
import {fetchItems, updateItem, createItem, deleteItem} from "@/api/itemApi.ts";
import {FrontendError} from "@/types/frontendError.ts";
import * as React from "react";

export default function AdminDashboard() {
    const [isAdmin, setIsAdmin] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [categories, setCategories] = useState<Category[]>([]);
    const [items, setItems] = useState<Item[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [editingItem, setEditingItem] = useState<Item | null>(null);
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const navigate = useNavigate();
    const {toast} = useToast();
    const { user } = useAuth();
    const [ordersPage, setOrdersPage] = useState(1);
    const [ordersPageSize] = useState(10);
    const [confirmDeleteItemId, setConfirmDeleteItemId] = useState<number | null>(null);
    const [confirmDeleteCategoryId, setConfirmDeleteCategoryId] = useState<number | null>(null);

    const checkAdminAccess = useCallback((currentUser: User | null) => {
        if (!currentUser) {
            navigate("/auth");
            return;
        }

        if (currentUser.type !== "ADMIN") {
            toast({
                title: "Acesso negado",
                description: "Você não tem permissão para acessar esta página",
                variant: "destructive",
            });
            navigate("/");
            return;
        }

        setIsAdmin(true);
        setIsLoading(false);
        loadData();
    }, [navigate, toast]);

    useEffect(() => {
        const current = user ?? null;
        checkAdminAccess(current);

    }, [user, checkAdminAccess]);

    const loadData = async () => {
        const [categoriesRes, itemsRes, ordersRes] = await Promise.all([
            fetchCategories(),
            fetchItems(),
            fetchOrders(ordersPage, ordersPageSize),
        ]);

        if (categoriesRes) setCategories(categoriesRes);
        if (itemsRes) setItems(itemsRes);
        if (ordersRes.data) setOrders(ordersRes.data);
    };

    const handleSaveCategory = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const name = formData.get("name") as string;
        const description = formData.get("description") as string;

        try {
            if (editingCategory?.id) {
                await updateCategory(editingCategory!.id, { name, description });
                toast({title: "Categoria atualizada com sucesso!"});
            } else {
                await createCategory({ name, description });
                toast({title: "Categoria criada com sucesso!"});
            }
            setEditingCategory(null);
            loadData();
        } catch (error: unknown) {
            const err = error as FrontendError;

            if (err.type === "api") {
                toast({
                    title: "Erro ao salvar categoria",
                    description: err.message,
                    variant: "destructive",
                });
            } else {
                toast({
                    title: "Erro desconhecido",
                    description: "Ocorreu um erro desconhecido ao salvar a categoria",
                    variant: "destructive",
                });
            }
        }
    };

    const handleDeleteCategory = async (id: number) => {
        // abre o diálogo de confirmação
        setConfirmDeleteCategoryId(id);
    }

    const handleConfirmDeleteCategory = async () => {
        if (confirmDeleteCategoryId == null) return;

        try {
            await deleteCategory(confirmDeleteCategoryId);
            toast({title: "Categoria excluída com sucesso!"});
            await loadData();
            setConfirmDeleteCategoryId(null);
        } catch (error: unknown) {
            const err = error as FrontendError;

            if (err.type === "api") {
                toast({
                    title: "Erro ao excluir categoria",
                    description: err.message,
                    variant: "destructive",
                });
            } else {
                toast({
                    title: "Erro desconhecido",
                    description: "Ocorreu um erro desconhecido ao excluir a categoria",
                    variant: "destructive",
                });
            }
        }
    };

    const handleSaveItem = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);

        const itemData = {
            name: formData.get("name") as string,
            description: formData.get("description") as string,
            unitPrice: parseFloat(formData.get("unitPrice") as string),
            categoryId: parseInt(formData.get("categoryId") as string),
            available: formData.get("available") === "true",
            imageUrl: formData.get("imageUrl") as string,
        };

        try {
            if (editingItem?.id) {
                await updateItem(editingItem.id, itemData);
                toast({ title: "Item atualizado com sucesso!" });
            } else {
                await createItem(itemData);
                toast({ title: "Item criado com sucesso!" });
            }

            setEditingItem(null);
            loadData();

        } catch (error: unknown) {
            const err = error as FrontendError;

            if (err.type === "api") {
                toast({
                    title: "Erro ao salvar item",
                    description: err.message,
                    variant: "destructive",
                });
                return;
            }

            if (err.type === "validation") {
                for (const message of err.messages) {
                    toast({
                        title: "Erro de validação",
                        description: message,
                        variant: "destructive",
                    });
                }
                return;
            }

            toast({
                title: "Erro desconhecido",
                description: "Ocorreu um erro desconhecido ao salvar o item",
                variant: "destructive",
            })
        }
    };

    const handleDeleteItem = async (id: number) => {
        // abre o diálogo de confirmação
        setConfirmDeleteItemId(id);
    };

    const handleConfirmDeleteItem = async () => {
        if (confirmDeleteItemId == null) return;

        try {
            await deleteItem(confirmDeleteItemId);
            toast({title: "Item excluído com sucesso!"});
            setConfirmDeleteItemId(null);
            await loadData();
        } catch (error: unknown) {
            const err = error as FrontendError;

            if (err.type === "api") {
                toast({
                    title: "Erro ao excluir item",
                    description: err.message,
                    variant: "destructive",
                });
            } else {
                toast({
                    title: "Erro desconhecido",
                    description: "Ocorreu um erro desconhecido ao excluir o item",
                    variant: "destructive",
                });
            }
            setConfirmDeleteItemId(null);
        }
    };

    const handleUpdateOrderStatus = async (orderId: number, clientId: number, newStatus: OrderStatus) => {
        try {
            await updateOrder(orderId, { clientId: Number(clientId), confirmedByUserId: Number(user.id), status: newStatus });
            toast({title: "Status do pedido atualizado!"});
            loadData();
        } catch (error: unknown) {
            const err = error as FrontendError;

            if (err.type === "api") {
                toast({
                    title: "Erro ao atualizar pedido",
                    description: err.message,
                    variant: "destructive",
                });
                return;
            } else if (err.type === "validation") {
                for (const message of err.messages) {
                    toast({
                        title: "Erro de validação",
                        description: message,
                        variant: "destructive",
                    });
                }
                return;
            }
        }
    };

    if (isLoading) {
        return <div className="flex min-h-screen items-center justify-center">Carregando...</div>;
    }

    if (!isAdmin) return null;

    const getStatusBadge = (status: string) => {
        const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
            PENDING: "outline",
            CONFIRMED: "default",
            DELIVERED: "secondary",
            CANCELED: "destructive",
        };
        return <Badge variant={variants[status] || "default"}>{status}</Badge>;
    };

    return (
        <div className="min-h-screen bg-background">
            <Header/>
            <div className="container py-8">
                <h1 className="mb-8 text-4xl font-bold">Dashboard Admin</h1>

                <Tabs defaultValue="categories">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="categories">Categorias</TabsTrigger>
                        <TabsTrigger value="items">Itens do Cardápio</TabsTrigger>
                        <TabsTrigger value="orders">Pedidos</TabsTrigger>
                    </TabsList>

                    <TabsContent value="categories" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Gerenciar Categorias</CardTitle>
                                <CardDescription>Adicione, edite ou remova categorias do cardápio</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Dialog open={editingCategory !== null}
                                        onOpenChange={(open) => !open && setEditingCategory(null)}>
                                    <DialogTrigger asChild>
                                        <Button onClick={() => setEditingCategory({} as Category)} className="mb-4">
                                            <Plus className="mr-2 h-4 w-4"/> Nova Categoria
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>{editingCategory?.id ? "Editar" : "Nova"} Categoria</DialogTitle>
                                            <DialogDescription>Preencha os dados da categoria</DialogDescription>
                                        </DialogHeader>
                                        <form onSubmit={handleSaveCategory} className="space-y-4">
                                            <div>
                                                <Label htmlFor="name">Nome</Label>
                                                <Input
                                                    id="name"
                                                    name="name"
                                                    defaultValue={editingCategory?.name}
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="description">Nome da Categoria</Label>
                                                <Input
                                                    id="description"
                                                    name="description"
                                                    defaultValue={editingCategory?.description}
                                                    required
                                                />
                                            </div>
                                            <Button type="submit" className="w-full">Salvar</Button>
                                        </form>
                                    </DialogContent>
                                </Dialog>

                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>ID</TableHead>
                                            <TableHead>Nome</TableHead>
                                            <TableHead>Descrição</TableHead>
                                            <TableHead className="text-right">Ações</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {categories.map((category) => (
                                            <TableRow key={category.id}>
                                                <TableCell>{category.id}</TableCell>
                                                <TableCell>{category.name}</TableCell>
                                                <TableCell>{category.description}</TableCell>
                                                <TableCell className="text-right">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => setEditingCategory(category)}
                                                    >
                                                        <Pencil className="h-4 w-4"/>
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleDeleteCategory(category.id)}
                                                    >
                                                        <Trash2 className="h-4 w-4"/>
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>

                        <Dialog open={confirmDeleteCategoryId !== null} onOpenChange={(open) => !open && setConfirmDeleteCategoryId(null)}>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Confirmar exclusão</DialogTitle>
                                    <DialogDescription>Tem certeza que deseja excluir esta categoria?</DialogDescription>
                                </DialogHeader>

                                <div className="flex justify-end gap-2 mt-4">
                                    <Button variant="ghost" onClick={() => setConfirmDeleteCategoryId(null)}>Cancelar</Button>
                                    <Button onClick={handleConfirmDeleteCategory} className="bg-destructive">Excluir</Button>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </TabsContent>

                    <TabsContent value="items" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Gerenciar Itens</CardTitle>
                                <CardDescription>Adicione, edite ou remova itens do cardápio</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Dialog open={editingItem !== null} onOpenChange={(open) => {
                                    if (!open) {
                                        setEditingItem(null);
                                        setSelectedImage(null);
                                        setImagePreview(null);
                                    }
                                }}>
                                    <DialogTrigger asChild>
                                        <Button onClick={() => setEditingItem({} as Item)} className="mb-4">
                                            <Plus className="mr-2 h-4 w-4"/> Novo Item
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                                        <DialogHeader>
                                            <DialogTitle>{editingItem?.id ? "Editar" : "Novo"} Item</DialogTitle>
                                            <DialogDescription>Preencha os dados do item do cardápio</DialogDescription>
                                        </DialogHeader>
                                        <form onSubmit={handleSaveItem} className="space-y-4">
                                            <div>
                                                <Label htmlFor="name">Nome</Label>
                                                <Input id="name" name="name" defaultValue={editingItem?.name} required />
                                            </div>

                                            <div>
                                                <Label htmlFor="description">Descrição</Label>
                                                <Textarea
                                                    id="description"
                                                    name="description"
                                                    defaultValue={editingItem?.description}
                                                    required
                                                />
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <Label htmlFor="unitPrice">Preço</Label>
                                                    <Input
                                                        id="unitPrice"
                                                        name="unitPrice"
                                                        type="number"
                                                        step="0.01"
                                                        defaultValue={editingItem?.unitPrice}
                                                        required
                                                    />
                                                </div>

                                                <div>
                                                    <Label htmlFor="categoryId">Categoria</Label>
                                                    <Select
                                                        name="categoryId"
                                                        defaultValue={editingItem?.categoryId?.toString()}
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Selecione" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {categories.map((cat) => (
                                                                <SelectItem key={cat.id} value={cat.id.toString()}>
                                                                    {cat.description}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>

                                            {/* Campo só de URL */}
                                            <div>
                                                <Label htmlFor="imageUrl">URL da Imagem</Label>
                                                <Input
                                                    id="imageUrl"
                                                    name="imageUrl"
                                                    defaultValue={editingItem?.imageUrl ?? ""}
                                                    placeholder="https://exemplo.com/imagem.jpg"
                                                />

                                                {/* Preview automático se for URL válida */}
                                                {(editingItem?.imageUrl) && (
                                                    <div className="relative mt-3 aspect-video w-full overflow-hidden rounded-lg border bg-muted">
                                                        <img
                                                            src={editingItem.imageUrl}
                                                            alt="Preview"
                                                            className="h-full w-full object-cover"
                                                        />
                                                    </div>
                                                )}
                                            </div>

                                            <div>
                                                <Label htmlFor="available">Disponível</Label>
                                                <Select
                                                    name="available"
                                                    defaultValue={editingItem?.available?.toString() || "true"}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="true">Sim</SelectItem>
                                                        <SelectItem value="false">Não</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <Button type="submit" className="w-full">
                                                Salvar
                                            </Button>
                                        </form>
                                    </DialogContent>
                                </Dialog>

                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>ID</TableHead>
                                            <TableHead>Nome</TableHead>
                                            <TableHead>Preço</TableHead>
                                            <TableHead>Categoria</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead className="text-right">Ações</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {items.map((item) => (
                                            <TableRow key={item.id}>
                                                <TableCell>{item.id}</TableCell>
                                                <TableCell>{item.name}</TableCell>
                                                <TableCell>R$ {Number(item.unitPrice).toFixed(2)}</TableCell>
                                                <TableCell>
                                                    {categories.find((c) => c.id === item.categoryId)?.name}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant={item.available ? "default" : "secondary"}>
                                                        {item.available ? "Disponível" : "Indisponível"}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => setEditingItem(item)}
                                                    >
                                                        <Pencil className="h-4 w-4"/>
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleDeleteItem(item.id)}
                                                    >
                                                        <Trash2 className="h-4 w-4"/>
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="orders" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Gerenciar Pedidos</CardTitle>
                                <CardDescription>Visualize e atualize o status dos pedidos</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>ID</TableHead>
                                            <TableHead>Data</TableHead>
                                            <TableHead>Total</TableHead>
                                            <TableHead>Pagamento</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Atualizar Status</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {orders.map((order) => (
                                            <TableRow key={order.id}>
                                                <TableCell>{order.id}</TableCell>
                                                <TableCell>
                                                    {new Date(order.createdAt).toLocaleDateString("pt-BR", {
                                                        day: "2-digit",
                                                        month: "2-digit",
                                                        year: "numeric",
                                                        hour: "2-digit",
                                                        minute: "2-digit",
                                                    })}
                                                </TableCell>
                                                <TableCell>R$ {Number(order.totalAmount).toFixed(2)}</TableCell>
                                                <TableCell>{order.paymentMethod}</TableCell>
                                                <TableCell>{getStatusBadge(order.status)}</TableCell>
                                                <TableCell>
                                                    <Select
                                                        value={order.status}
                                                        onValueChange={(value) => handleUpdateOrderStatus(order.id, order.clientId, value as OrderStatus)}
                                                    >
                                                        <SelectTrigger className="w-[150px]">
                                                            <SelectValue/>
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value={OrderStatus.PENDING}>PENDING</SelectItem>
                                                            <SelectItem value={OrderStatus.CONFIRMED}>CONFIRMED</SelectItem>
                                                            <SelectItem value={OrderStatus.DELIVERED}>DELIVERED</SelectItem>
                                                            <SelectItem value={OrderStatus.CANCELED}>CANCELED</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>

                <Dialog open={confirmDeleteItemId !== null} onOpenChange={(open) => !open && setConfirmDeleteItemId(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirmar exclusão</DialogTitle>
                        <DialogDescription>Tem certeza que deseja excluir este item?</DialogDescription>
                    </DialogHeader>

                    <div className="flex justify-end gap-2 mt-4">
                        <Button variant="ghost" onClick={() => setConfirmDeleteItemId(null)}>Cancelar</Button>
                        <Button onClick={handleConfirmDeleteItem} className="bg-destructive">Excluir</Button>
                    </div>
                </DialogContent>
                </Dialog>
            </div>
        </div>
    );
}