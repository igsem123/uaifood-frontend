import {useCallback, useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import * as z from "zod";
import {Header} from "@/components/Header";
import {Footer} from "@/components/Footer";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {Badge} from "@/components/ui/badge";
import {Separator} from "@/components/ui/separator";
import {useToast} from "@/hooks/use-toast";
import {AlertTriangle, Loader2, LogOut, MapPin, Pencil, Plus, Trash2} from "lucide-react";
import {useAuth} from "@/hooks/use-auth.ts";
import {fetchOrderByClientId} from "@/api/orderApi.ts";
import {Order, paymentMap, statusMap} from "@/types/order.ts";
import {updateUser, fetchUserWithRelationsById} from "@/api/userApi.ts";
import {deleteAddress} from "@/api/addressApi.ts";
import {Address} from "@/types/address.ts";
import {AddressDialog} from "@/components/AddressDialog.tsx";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {deleteUser} from "@/api/userApi.ts";
import noLocation from "@/assets/no-location.svg";

const profileSchema = z.object({
    name: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
    phone: z.string().min(10, "Telefone inválido"),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function Profile() {
    const navigate = useNavigate();
    const {toast} = useToast();
    const {user, logout} = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [orders, setOrders] = useState<Order[]>([]);
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [addressDialogOpen, setAddressDialogOpen] = useState(false);
    const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
    const [deleteAccountDialogOpen, setDeleteAccountDialogOpen] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const images = [
        { src: noLocation, alt: "Carrinho vazio" },
    ];

    const profileForm = useForm<ProfileFormData>({
        resolver: zodResolver(profileSchema),
        defaultValues: {name: "", phone: ""},
    });

    const loadOrders = useCallback(async (clientId: number) => {
        const response = await fetchOrderByClientId(clientId);
        setOrders(response.data ?? []);
    }, []);


    const loadProfile = async (id: number) => {
        try {
            const data = await fetchUserWithRelationsById(id, ["addresses"]);
            if (data.addresses) {
                setAddresses(data.addresses);
            }
        } catch (error) {
            toast({
                title: "Erro ao carregar perfil",
                description: "Não foi possível carregar os dados do perfil.",
                variant: "destructive",
            });
        }
    }

    useEffect(() => {
        if (!user) {
            navigate("/auth");
            return;
        }

        profileForm.setValue("name", user.name ?? "");
        profileForm.setValue("phone", user.phone ?? "");
        if (user.addresses) {
            setAddresses(user.addresses);
        }

        if (user.id) {
            loadOrders(Number(user.id)).catch(() => {
                toast({
                    title: "Erro ao carregar pedidos",
                    description: "Não foi possível carregar os pedidos.",
                    variant: "destructive",
                });
            });
        }

        setLoading(false);

    }, [user, loadOrders, toast, profileForm, navigate]);

    const handleLogout = async () => {
        try {
            await logout();
            toast({
                title: "Logout realizado",
                description: "Você foi desconectado com sucesso",
            });
            navigate("/auth");
        } catch (error) {
            toast({
                title: "Erro ao sair",
                description: error.message,
                variant: "destructive",
            });
        }
    };

    const handleDeleteAccount = async () => {
        if (!user.id) return;

        setDeleting(true);

        try {
            await deleteUser();
            toast({
                title: "Conta deletada",
                description: "Sua conta foi deletada permanentemente.",
            });
            try {
            await logout();
            } catch (error: unknown) {
                const err = error as { response?: { status: number }; message?: string };
                console.warn("Falha no logout após deleção de conta:", err?.response?.status || err?.message || err);
            }
            navigate("/auth");
        } catch (error) {
            console.log(error)
            setDeleting(false);
            toast({
                title: "Erro ao deletar conta",
                description: "Não foi possível deletar sua conta.",
                variant: "destructive",
            });
        } finally {
            setDeleting(false);
            setDeleteAccountDialogOpen(false);
        }
    };

    const onProfileSubmit = async (data: ProfileFormData) => {
        if (!user.id) return;

        setSaving(true);

        try {
            await updateUser({
                name: data.name,
                phone: data.phone,
            });

            setSaving(false);
            toast({
                title: "Dados atualizados",
                description: "Suas informações foram salvas com sucesso.",
            });
        } catch (error) {
            toast({
                title: "Erro ao salvar",
                description: "Não foi possível atualizar seus dados.",
                variant: "destructive",
            });
        }
    };

    const handleAddAddress = () => {
        setSelectedAddress(null);
        setAddressDialogOpen(true);
    };

    const handleEditAddress = (address: Address) => {
        setSelectedAddress(address);
        setAddressDialogOpen(true);
    };

    const handleDeleteAddress = async (addressId: number) => {
        if (!user.id) return;

        setSaving(true);

        try {
            await deleteAddress(addressId);

            setAddresses((prev) => prev.filter((addr) => addr.id !== addressId));

            toast({
                title: "Endereço deletado",
                description: "Seu endereço foi removido com sucesso.",
            });
        } catch (error) {
            toast({
                title: "Erro ao deletar",
                description: "Não foi possível deletar o endereço.",
                variant: "destructive",
            });
        }

        setSaving(false);
    };

    const handleAddressSuccess = () => {
        if (user.id) {
            loadProfile(Number(user.id));
        }
    };

    // Protege a tela caso user seja null
    if (!user && !loading) {
        navigate("/auth");
        return null;
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-background">
                <Header/>
                <div className="container py-8 flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin"/>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Header/>
            <main className="container flex-1 py-8">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-3xl font-bold">Meu Perfil</h1>
                    <Button variant="outline" onClick={handleLogout}>
                        <LogOut className="mr-2 h-4 w-4"/>
                        Sair
                    </Button>
                </div>

                <Tabs defaultValue="dados" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 max-w-md">
                        <TabsTrigger value="dados">Meus Dados</TabsTrigger>
                        <TabsTrigger value="pedidos">Meus Pedidos</TabsTrigger>
                    </TabsList>

                    <TabsContent value="dados" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Informações Pessoais</CardTitle>
                                <CardDescription>Atualize seus dados pessoais</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Form {...profileForm}>
                                    <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
                                        <FormField
                                            control={profileForm.control}
                                            name="name"
                                            render={({field}) => (
                                                <FormItem>
                                                    <FormLabel>Nome</FormLabel>
                                                    <FormControl>
                                                        <Input {...field} />
                                                    </FormControl>
                                                    <FormMessage/>
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={profileForm.control}
                                            name="phone"
                                            render={({field}) => (
                                                <FormItem>
                                                    <FormLabel>Telefone</FormLabel>
                                                    <FormControl>
                                                        <Input {...field} />
                                                    </FormControl>
                                                    <FormMessage/>
                                                </FormItem>
                                            )}
                                        />
                                        <Button type="submit" disabled={saving}>
                                            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                                            Salvar Alterações
                                        </Button>
                                    </form>
                                </Form>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle>Endereços</CardTitle>
                                        <CardDescription>Gerencie seus endereços de entrega</CardDescription>
                                    </div>
                                    <Button onClick={handleAddAddress} size="sm">
                                        <Plus className="mr-2 h-4 w-4"/>
                                        Adicionar
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {addresses.length === 0 ? (
                                    <div className="text-center py-8">
                                        <img
                                            src={images[0].src}
                                            alt={images[0].alt}
                                            className="mx-auto mb-4 h-40 w-40 object-contain"
                                        />
                                        <p className="text-muted-foreground mb-4">
                                            Você ainda não tem endereços cadastrados.
                                        </p>
                                        <Button onClick={handleAddAddress} variant="link">
                                            <Plus className="mr-2 h-4 w-4"/>
                                            Adicionar Endereço
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {addresses.map((address) => (
                                            <Card key={address.id} className="relative">
                                                <CardContent className="pt-6">
                                                    <div className="space-y-2">
                                                        <div className="flex items-start justify-between gap-2">
                                                            <div className="flex-1 min-w-0">
                                                                <p className="font-medium truncate">
                                                                    {address.street}, {address.number}
                                                                </p>
                                                                <p className="text-sm text-muted-foreground truncate">
                                                                    {address.district}
                                                                </p>
                                                                <p className="text-sm text-muted-foreground truncate">
                                                                    {address.city} - {address.state}
                                                                </p>
                                                                <p className="text-sm text-muted-foreground">
                                                                    CEP: {address.zipCode}
                                                                </p>
                                                            </div>
                                                            <div className="flex gap-1">
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    onClick={() => handleEditAddress(address)}
                                                                >
                                                                    <Pencil className="h-4 w-4"/>
                                                                </Button>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    onClick={() => handleDeleteAddress(address.id)}
                                                                >
                                                                    <Trash2 className="h-4 w-4"/>
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <Card className="border-destructive">
                            <CardHeader>
                                <CardTitle className="text-destructive flex items-center gap-2">
                                    <AlertTriangle className="h-5 w-5" />
                                    Zona de Perigo
                                </CardTitle>
                                <CardDescription>
                                    Ações irreversíveis relacionadas à sua conta
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Button
                                    variant="destructive"
                                    onClick={() => setDeleteAccountDialogOpen(true)}
                                    className="w-full"
                                >
                                    Deletar Minha Conta
                                </Button>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="pedidos">
                        <Card>
                            <CardHeader>
                                <CardTitle>Histórico de Pedidos</CardTitle>
                                <CardDescription>Acompanhe seus pedidos realizados</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {orders.length === 0 ? (
                                    <p className="text-muted-foreground text-center py-8">
                                        Você ainda não realizou nenhum pedido.
                                    </p>
                                ) : (
                                    <div className="space-y-4">
                                        {orders.map((order) => (
                                            <Card key={order.id}>
                                                <CardHeader>
                                                    <div className="flex items-center justify-between">
                                                        <CardTitle className="text-lg">Pedido #{order.id}</CardTitle>
                                                        <Badge variant={statusMap[order.status]?.variant || "default"}>
                                                            {statusMap[order.status]?.label || order.status}
                                                        </Badge>
                                                    </div>
                                                    <CardDescription>
                                                        {new Date(order.createdAt).toLocaleDateString("pt-BR", {
                                                            day: "2-digit",
                                                            month: "long",
                                                            year: "numeric",
                                                            hour: "2-digit",
                                                            minute: "2-digit",
                                                        })}
                                                    </CardDescription>
                                                </CardHeader>
                                                <CardContent>
                                                    <div className="space-y-2">
                                                        {(order.items ?? []).map((orderItem) => (
                                                            <div key={orderItem.id} className="flex justify-between text-sm">
                                                                <span>
                                                                  {orderItem.quantity}x {orderItem.item.name}
                                                                </span>
                                                                <span>
                                                                  R$ {(orderItem.quantity * orderItem.unitPrice).toFixed(2)}
                                                                </span>
                                                            </div>
                                                        ))}
                                                        <Separator className="my-2"/>
                                                        <div className="flex justify-between font-semibold">
                                                            <span>Total</span>
                                                            <span>R$ {Number(order.totalAmount).toFixed(2)}</span>
                                                        </div>
                                                        <p className="text-sm text-muted-foreground mt-2">
                                                            Pagamento: {paymentMap[order.paymentMethod] || order.paymentMethod}
                                                        </p>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </main>

            <Footer/>

            {user.id && (
                <AddressDialog
                    open={addressDialogOpen}
                    onOpenChange={setAddressDialogOpen}
                    address={selectedAddress}
                    userId={user.id}
                    onSuccess={handleAddressSuccess}
                />
            )}

            <AlertDialog open={deleteAccountDialogOpen} onOpenChange={setDeleteAccountDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2 text-destructive">
                            <AlertTriangle className="h-5 w-5" />
                            Você tem certeza absoluta?
                        </AlertDialogTitle>
                        <AlertDialogDescription className="space-y-2">
                            <p className="font-semibold">Esta ação não pode ser desfeita!</p>
                            <p>
                                Ao deletar sua conta, todos os seus dados serão permanentemente removidos:
                            </p>
                            <ul className="list-disc list-inside space-y-1 text-sm">
                                <li>Informações pessoais e de perfil</li>
                                <li>Todos os endereços cadastrados</li>
                                <li>Histórico completo de pedidos</li>
                                <li>Notificações</li>
                            </ul>
                            <p className="font-semibold mt-4">
                                Esta ação é irreversível e seus dados não poderão ser recuperados.
                            </p>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteAccount}
                            disabled={deleting}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {deleting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Deletando...
                                </>
                            ) : (
                                "Sim, deletar minha conta"
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}