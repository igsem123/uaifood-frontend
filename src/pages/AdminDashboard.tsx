import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { useToast } from "@/hooks/use-toast";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, Plus, Upload, Loader2 } from "lucide-react";

type Category = {
  id: number;
  description: string;
};

type Item = {
  id: number;
  name: string;
  description: string;
  unit_price: number;
  category_id: number;
  available: boolean;
  image_url: string | null;
};

type Order = {
  id: number;
  created_at: string;
  status: Database["public"]["Enums"]["order_status"];
  total: number;
  payment_method: Database["public"]["Enums"]["payment_method"];
  client_id: string;
};

export default function AdminDashboard() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      navigate("/auth");
      return;
    }

    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .single();

    if (!roleData) {
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
  };

  const loadData = async () => {
    const [categoriesRes, itemsRes, ordersRes] = await Promise.all([
      supabase.from("categories").select("*").order("description"),
      supabase.from("items").select("*").order("name"),
      supabase.from("orders").select("*").order("created_at", { ascending: false }),
    ]);

    if (categoriesRes.data) setCategories(categoriesRes.data);
    if (itemsRes.data) setItems(itemsRes.data);
    if (ordersRes.data) setOrders(ordersRes.data);
  };

  const handleSaveCategory = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const description = formData.get("description") as string;

    try {
      if (editingCategory) {
        const { error } = await supabase
          .from("categories")
          .update({ description })
          .eq("id", editingCategory.id);
        if (error) throw error;
        toast({ title: "Categoria atualizada com sucesso!" });
      } else {
        const { error } = await supabase
          .from("categories")
          .insert({ description });
        if (error) throw error;
        toast({ title: "Categoria criada com sucesso!" });
      }
      setEditingCategory(null);
      loadData();
    } catch (error: any) {
      toast({
        title: "Erro ao salvar categoria",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDeleteCategory = async (id: number) => {
    if (!confirm("Tem certeza que deseja excluir esta categoria?")) return;
    
    try {
      const { error } = await supabase.from("categories").delete().eq("id", id);
      if (error) throw error;
      toast({ title: "Categoria excluída com sucesso!" });
      loadData();
    } catch (error: any) {
      toast({
        title: "Erro ao excluir categoria",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleSaveItem = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    let imageUrl = editingItem?.image_url || null;
    
    // Upload da imagem se foi selecionada
    if (selectedImage) {
      setUploadingImage(true);
      try {
        const fileExt = selectedImage.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('menu-items')
          .upload(filePath, selectedImage, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) throw uploadError;

        // Obter URL pública da imagem
        const { data: { publicUrl } } = supabase.storage
          .from('menu-items')
          .getPublicUrl(filePath);

        imageUrl = publicUrl;
      } catch (error: any) {
        toast({
          title: "Erro ao fazer upload da imagem",
          description: error.message,
          variant: "destructive",
        });
        setUploadingImage(false);
        return;
      } finally {
        setUploadingImage(false);
      }
    }

    const itemData = {
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      unit_price: parseFloat(formData.get("unit_price") as string),
      category_id: parseInt(formData.get("category_id") as string),
      available: formData.get("available") === "true",
      image_url: imageUrl,
    };

    try {
      if (editingItem?.id) {
        const { error } = await supabase
          .from("items")
          .update(itemData)
          .eq("id", editingItem.id);
        if (error) throw error;
        toast({ title: "Item atualizado com sucesso!" });
      } else {
        const { error } = await supabase.from("items").insert(itemData);
        if (error) throw error;
        toast({ title: "Item criado com sucesso!" });
      }
      setEditingItem(null);
      setSelectedImage(null);
      setImagePreview(null);
      loadData();
    } catch (error: any) {
      toast({
        title: "Erro ao salvar item",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDeleteItem = async (id: number) => {
    if (!confirm("Tem certeza que deseja excluir este item?")) return;
    
    try {
      const { error } = await supabase.from("items").delete().eq("id", id);
      if (error) throw error;
      toast({ title: "Item excluído com sucesso!" });
      loadData();
    } catch (error: any) {
      toast({
        title: "Erro ao excluir item",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleUpdateOrderStatus = async (orderId: number, newStatus: Database["public"]["Enums"]["order_status"]) => {
    try {
      const { error } = await supabase
        .from("orders")
        .update({ status: newStatus })
        .eq("id", orderId);
      
      if (error) throw error;
      toast({ title: "Status do pedido atualizado!" });
      loadData();
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar pedido",
        description: error.message,
        variant: "destructive",
      });
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
      <Header isAuthenticated={true} />
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
                <Dialog open={editingCategory !== null} onOpenChange={(open) => !open && setEditingCategory(null)}>
                  <DialogTrigger asChild>
                    <Button onClick={() => setEditingCategory({} as Category)} className="mb-4">
                      <Plus className="mr-2 h-4 w-4" /> Nova Categoria
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{editingCategory?.id ? "Editar" : "Nova"} Categoria</DialogTitle>
                      <DialogDescription>Preencha os dados da categoria</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSaveCategory} className="space-y-4">
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
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {categories.map((category) => (
                      <TableRow key={category.id}>
                        <TableCell>{category.id}</TableCell>
                        <TableCell>{category.description}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setEditingCategory(category)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteCategory(category.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
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
                      <Plus className="mr-2 h-4 w-4" /> Novo Item
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
                          <Label htmlFor="unit_price">Preço</Label>
                          <Input
                            id="unit_price"
                            name="unit_price"
                            type="number"
                            step="0.01"
                            defaultValue={editingItem?.unit_price}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="category_id">Categoria</Label>
                          <Select name="category_id" defaultValue={editingItem?.category_id?.toString()}>
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
                      <div>
                        <Label htmlFor="image">Imagem do Item</Label>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Input
                              id="image"
                              type="file"
                              accept="image/*"
                              onChange={handleImageSelect}
                              className="flex-1"
                            />
                            <Upload className="h-4 w-4 text-muted-foreground" />
                          </div>
                          {(imagePreview || editingItem?.image_url) && (
                            <div className="relative aspect-video w-full overflow-hidden rounded-lg border bg-muted">
                              <img
                                src={imagePreview || editingItem?.image_url || ""}
                                alt="Preview"
                                className="h-full w-full object-cover"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="available">Disponível</Label>
                        <Select name="available" defaultValue={editingItem?.available?.toString() || "true"}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="true">Sim</SelectItem>
                            <SelectItem value="false">Não</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <Button type="submit" className="w-full" disabled={uploadingImage}>
                        {uploadingImage ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Fazendo upload...
                          </>
                        ) : (
                          "Salvar"
                        )}
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
                        <TableCell>R$ {item.unit_price.toFixed(2)}</TableCell>
                        <TableCell>
                          {categories.find((c) => c.id === item.category_id)?.description}
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
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteItem(item.id)}
                          >
                            <Trash2 className="h-4 w-4" />
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
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell>{order.id}</TableCell>
                        <TableCell>
                          {new Date(order.created_at).toLocaleString("pt-BR")}
                        </TableCell>
                        <TableCell>R$ {order.total.toFixed(2)}</TableCell>
                        <TableCell>{order.payment_method}</TableCell>
                        <TableCell>{getStatusBadge(order.status)}</TableCell>
                        <TableCell className="text-right">
                          <Select
                            value={order.status}
                            onValueChange={(value) => handleUpdateOrderStatus(order.id, value as Database["public"]["Enums"]["order_status"])}
                          >
                            <SelectTrigger className="w-[150px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="PENDING">PENDING</SelectItem>
                              <SelectItem value="CONFIRMED">CONFIRMED</SelectItem>
                              <SelectItem value="DELIVERED">DELIVERED</SelectItem>
                              <SelectItem value="CANCELED">CANCELED</SelectItem>
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
      </div>

      <Footer />
    </div>
  );
}