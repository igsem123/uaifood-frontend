import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Loader2, LogOut } from "lucide-react";

const profileSchema = z.object({
  name: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
  phone: z.string().min(10, "Telefone inválido"),
});

const addressSchema = z.object({
  street: z.string().min(3, "Rua é obrigatória"),
  number: z.string().min(1, "Número é obrigatório"),
  district: z.string().min(2, "Bairro é obrigatório"),
  city: z.string().min(2, "Cidade é obrigatória"),
  state: z.string().length(2, "Estado deve ter 2 caracteres"),
  zip_code: z.string().min(8, "CEP inválido"),
});

type ProfileFormData = z.infer<typeof profileSchema>;
type AddressFormData = z.infer<typeof addressSchema>;

interface Order {
  id: number;
  total: number;
  status: string;
  payment_method: string;
  created_at: string;
  order_items: {
    quantity: number;
    unit_price: number;
    items: {
      name: string;
    };
  }[];
}

const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  PENDING: { label: "Pendente", variant: "outline" },
  CONFIRMED: { label: "Confirmado", variant: "secondary" },
  DELIVERED: { label: "Entregue", variant: "default" },
  CANCELED: { label: "Cancelado", variant: "destructive" },
};

const paymentMap: Record<string, string> = {
  CASH: "Dinheiro",
  DEBIT: "Débito",
  CREDIT: "Crédito",
  PIX: "PIX",
};

export default function Profile() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [addressId, setAddressId] = useState<number | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);

  const profileForm = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: "", phone: "" },
  });

  const addressForm = useForm<AddressFormData>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      street: "",
      number: "",
      district: "",
      city: "",
      state: "",
      zip_code: "",
    },
  });

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      navigate("/auth");
      return;
    }

    setUserId(session.user.id);
    await Promise.all([loadProfile(session.user.id), loadOrders(session.user.id)]);
    setLoading(false);
  };

  const loadProfile = async (uid: string) => {
    const { data: profile } = await supabase
      .from("profiles")
      .select("*, addresses(*)")
      .eq("id", uid)
      .single();

    if (profile) {
      profileForm.reset({
        name: profile.name,
        phone: profile.phone,
      });

      if (profile.addresses) {
        setAddressId(profile.address_id);
        addressForm.reset({
          street: profile.addresses.street,
          number: profile.addresses.number,
          district: profile.addresses.district,
          city: profile.addresses.city,
          state: profile.addresses.state,
          zip_code: profile.addresses.zip_code,
        });
      }
    }
  };

  const loadOrders = async (uid: string) => {
    const { data } = await supabase
      .from("orders")
      .select(`
        id,
        total,
        status,
        payment_method,
        created_at,
        order_items (
          quantity,
          unit_price,
          items (
            name
          )
        )
      `)
      .eq("client_id", uid)
      .order("created_at", { ascending: false });

    if (data) {
      setOrders(data as Order[]);
    }
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      toast({
        title: "Erro ao sair",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Logout realizado",
        description: "Você foi desconectado com sucesso",
      });
      navigate("/auth");
    }
  };

  const onProfileSubmit = async (data: ProfileFormData) => {
    if (!userId) return;
    
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ name: data.name, phone: data.phone })
      .eq("id", userId);

    setSaving(false);

    if (error) {
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível atualizar seus dados.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Dados atualizados",
        description: "Suas informações foram salvas com sucesso.",
      });
    }
  };

  const onAddressSubmit = async (data: AddressFormData) => {
    if (!userId) return;

    setSaving(true);

    if (addressId) {
      const { error } = await supabase
        .from("addresses")
        .update({
          street: data.street,
          number: data.number,
          district: data.district,
          city: data.city,
          state: data.state,
          zip_code: data.zip_code,
        })
        .eq("id", addressId);

      if (error) {
        toast({
          title: "Erro ao salvar",
          description: "Não foi possível atualizar o endereço.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Endereço atualizado",
          description: "Seu endereço foi salvo com sucesso.",
        });
      }
    } else {
      const { data: newAddress, error: insertError } = await supabase
        .from("addresses")
        .insert({
          street: data.street,
          number: data.number,
          district: data.district,
          city: data.city,
          state: data.state,
          zip_code: data.zip_code,
        })
        .select()
        .single();

      if (insertError || !newAddress) {
        toast({
          title: "Erro ao salvar",
          description: "Não foi possível criar o endereço.",
          variant: "destructive",
        });
      } else {
        setAddressId(newAddress.id);
        await supabase
          .from("profiles")
          .update({ address_id: newAddress.id })
          .eq("id", userId);

        toast({
          title: "Endereço criado",
          description: "Seu endereço foi salvo com sucesso.",
        });
      }
    }

    setSaving(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header isAuthenticated />
        <div className="container py-8 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header isAuthenticated />
      <main className="container flex-1 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Meu Perfil</h1>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
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
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={profileForm.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Telefone</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" disabled={saving}>
                      {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Salvar Alterações
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Endereço</CardTitle>
                <CardDescription>Atualize seu endereço de entrega</CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...addressForm}>
                  <form onSubmit={addressForm.handleSubmit(onAddressSubmit)} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={addressForm.control}
                        name="street"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Rua</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={addressForm.control}
                        name="number"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Número</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={addressForm.control}
                        name="district"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Bairro</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={addressForm.control}
                        name="city"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Cidade</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={addressForm.control}
                        name="state"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Estado (UF)</FormLabel>
                            <FormControl>
                              <Input {...field} maxLength={2} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={addressForm.control}
                        name="zip_code"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>CEP</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <Button type="submit" disabled={saving}>
                      {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Salvar Endereço
                    </Button>
                  </form>
                </Form>
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
                            {new Date(order.created_at).toLocaleDateString("pt-BR", {
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
                            {order.order_items.map((item, idx) => (
                              <div key={idx} className="flex justify-between text-sm">
                                <span>
                                  {item.quantity}x {item.items.name}
                                </span>
                                <span>
                                  R$ {(item.quantity * item.unit_price).toFixed(2)}
                                </span>
                              </div>
                            ))}
                            <Separator className="my-2" />
                            <div className="flex justify-between font-semibold">
                              <span>Total</span>
                              <span>R$ {order.total.toFixed(2)}</span>
                            </div>
                            <p className="text-sm text-muted-foreground mt-2">
                              Pagamento: {paymentMap[order.payment_method] || order.payment_method}
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

      <Footer />
    </div>
  );
}
