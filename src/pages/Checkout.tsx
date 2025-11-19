import {useEffect, useState, useCallback} from "react";
import {useNavigate} from "react-router-dom";
import {CreditCard, Wallet, Banknote, Smartphone, Plus, MapPin} from "lucide-react";
import {Header} from "@/components/Header";
import {Button} from "@/components/ui/button";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {Label} from "@/components/ui/label";
import {RadioGroup, RadioGroupItem} from "@/components/ui/radio-group";
import {Separator} from "@/components/ui/separator";
import {useCart} from "@/contexts/CartContext";
import {useToast} from "@/hooks/use-toast";
import {useAuth} from "@/hooks/use-auth.ts";
import {createOrder} from "@/api/orderApi.ts";
import {PaymentMethod} from "@/types/order.ts";
import {FrontendError} from "@/types/frontendError.ts";
import {Address} from "@/types/address.ts";
import * as React from "react";

const paymentMethods = [
    {value: "CASH", label: "Dinheiro", icon: Wallet},
    {value: "DEBIT", label: "Cartão de Débito", icon: CreditCard},
    {value: "CREDIT", label: "Cartão de Crédito", icon: Banknote},
    {value: "PIX", label: "PIX", icon: Smartphone},
];

export default function Checkout() {
    const [isLoading, setIsLoading] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState("PIX");
    const {items, total, itemCount, clearCart} = useCart();
    const navigate = useNavigate();
    const {toast} = useToast();
    const {user, me} = useAuth();
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);

    const loadProfile = useCallback(async () => {
        try {
            await me();
        } catch (error) {
            console.error("Erro ao carregar perfil do usuário:", error);
        }
    }, [me]);

    useEffect(() => {
        if (!user) {
            navigate("/auth");
            return;
        }

        // Carrega o perfil apenas uma vez
        loadProfile();
    }, []);

    useEffect(() => {
        if (items.length === 0) {
            navigate("/");
        }
    }, [items, navigate]);

    useEffect(() => {
        if (user?.addresses && user.addresses.length > 0) {
            setAddresses(user.addresses);
            setSelectedAddress(prev => prev ?? user.addresses[0]);
        } else {
            setAddresses([]);
            setSelectedAddress(null);
        }
    }, [user]);


    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!user) return;

        setIsLoading(true);

        try {
            if (!selectedAddress) {
                toast({
                    title: "Endereço obrigatório",
                    description: "Por favor, selecione um endereço de entrega.",
                    variant: "destructive",
                });
                return;
            }

            try {
                const orderResult = await createOrder({
                    clientId: Number(user.id),
                    addressId: Number(selectedAddress.id),
                    paymentMethod: paymentMethod as PaymentMethod,
                    totalAmount: total,
                    items: items.map(item => ({
                        itemId: Number(item.id),
                        quantity: item.quantity,
                        unitPrice: item.price,
                        subtotal: item.price * item.quantity,
                    }))
                });

                if (!orderResult || !orderResult.id) {
                    toast({
                        title: "Erro ao criar pedido",
                        description: "Não foi possível criar o pedido.",
                        variant: "destructive",
                    });
                    return;
                }

                toast({
                    title: "Pedido realizado com sucesso!",
                    description: `Seu pedido #${orderResult.id} foi recebido e está sendo preparado.`,
                });

                clearCart();
                navigate("/profile");
            } catch (error) {
                toast({
                    title: "Erro ao criar pedido",
                    description: "Não foi possível criar o pedido.",
                    variant: "destructive",
                });
            }
        } catch (error: unknown) {
            const err = error as FrontendError;

            if (err.type === "validation") {
                for (const message of err.messages) {
                    toast({
                        title: "Erro de validação",
                        description: message,
                        variant: "destructive",
                    });
                }
            } else {
                toast({
                    title: "Erro desconhecido",
                    description: err.message,
                    variant: "destructive",
                });
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddAddress = () => {
        navigate("/profile");
    }

    if (!user || items.length === 0) return null;

    return (
        <div className="min-h-screen bg-background">
            <Header cartItemsCount={itemCount}/>

            <main className="container py-8">
                <div className="mb-8">
                    <h1 className="mb-2 text-4xl font-bold">Finalizar Pedido</h1>
                    <p className="text-muted-foreground">Preencha os dados para concluir</p>
                </div>

                <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-3">
                    <div className="lg:col-span-2 space-y-6">
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div className={"flex-col space-y-2"}>
                                        <CardTitle>Endereços</CardTitle>
                                        <CardDescription>Escolha ou adicione endereço de entrega</CardDescription>
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
                                        <MapPin className="mx-auto h-12 w-12 text-muted-foreground mb-3"/>
                                        <p className="text-muted-foreground mb-4">
                                            Você ainda não tem endereços cadastrados.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {addresses.map((address) => (
                                            <Card
                                                key={address.id}
                                                className={`relative cursor-pointer transition-colors ${
                                                    selectedAddress?.id === address.id
                                                        ? "border-primary ring-1 ring-primary"
                                                        : "border-muted"
                                                }`}
                                                onClick={() => setSelectedAddress(address)}
                                            >
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
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Forma de Pagamento</CardTitle>
                                <CardDescription>O entregador parceiro cobrará o valor na entrega.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                                    <div className="grid gap-3 sm:grid-cols-2">
                                        {paymentMethods.map((method) => {
                                            const Icon = method.icon;
                                            return (
                                                <div key={method.value}>
                                                    <RadioGroupItem
                                                        value={method.value}
                                                        id={method.value}
                                                        className="peer sr-only"
                                                    />
                                                    <Label
                                                        htmlFor={method.value}
                                                        className="flex items-center gap-3 rounded-lg border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                                                    >
                                                        <Icon className="h-5 w-5"/>
                                                        <span className="font-medium">{method.label}</span>
                                                    </Label>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </RadioGroup>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="lg:col-span-1">
                        <Card className="sticky top-20">
                            <CardHeader>
                                <CardTitle>Resumo do Pedido</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    {items.map((item) => (
                                        <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        {item.quantity}x {item.name}
                      </span>
                                            <span>R$ {(item.price * item.quantity).toFixed(2)}</span>
                                        </div>
                                    ))}
                                </div>
                                <Separator/>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Subtotal</span>
                                        <span>R$ {total.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Taxa de entrega</span>
                                        <span className="text-green-600">Grátis</span>
                                    </div>
                                </div>
                                <Separator/>
                                <div className="flex justify-between text-lg font-bold">
                                    <span>Total</span>
                                    <span className="text-primary">R$ {total.toFixed(2)}</span>
                                </div>
                            </CardContent>
                            <CardContent>
                                <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                                    {isLoading ? "Processando..." : "Confirmar Pedido"}
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </form>
            </main>
        </div>
    );
};