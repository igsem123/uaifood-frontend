import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CreditCard, Wallet, Banknote, Smartphone } from "lucide-react";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/contexts/CartContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Session } from "@supabase/supabase-js";
import { z } from "zod";

const addressSchema = z.object({
  street: z.string().min(3, "Rua deve ter no mínimo 3 caracteres"),
  number: z.string().min(1, "Número é obrigatório"),
  district: z.string().min(2, "Bairro deve ter no mínimo 2 caracteres"),
  city: z.string().min(2, "Cidade deve ter no mínimo 2 caracteres"),
  state: z.string().length(2, "Estado deve ter 2 caracteres"),
  zipCode: z.string().regex(/^\d{5}-?\d{3}$/, "CEP inválido"),
});

const paymentMethods = [
  { value: "CASH", label: "Dinheiro", icon: Wallet },
  { value: "DEBIT", label: "Cartão de Débito", icon: CreditCard },
  { value: "CREDIT", label: "Cartão de Crédito", icon: Banknote },
  { value: "PIX", label: "PIX", icon: Smartphone },
];

export default function Checkout() {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("PIX");
  const { items, total, itemCount, clearCart } = useCart();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (!session) {
        navigate("/auth");
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (!session) {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (items.length === 0) {
      navigate("/");
    }
  }, [items, navigate]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!session?.user) return;

    setIsLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
      const addressData = {
        street: formData.get("street") as string,
        number: formData.get("number") as string,
        district: formData.get("district") as string,
        city: formData.get("city") as string,
        state: formData.get("state") as string,
        zip_code: (formData.get("zipCode") as string).replace("-", ""),
      };

      // Validate address
      addressSchema.parse({
        ...addressData,
        zipCode: addressData.zip_code,
      });

      // Create or update address
      const { data: addressResult, error: addressError } = await supabase
        .from("addresses")
        .insert([addressData])
        .select()
        .single();

      if (addressError) throw addressError;

      // Create order
      const { data: orderResult, error: orderError } = await supabase
        .from("orders")
        .insert([{
          client_id: session.user.id,
          created_by_user_id: session.user.id,
          payment_method: paymentMethod as "CASH" | "DEBIT" | "CREDIT" | "PIX",
          total: total,
          status: "PENDING" as const,
        }])
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = items.map((item) => ({
        order_id: orderResult.id,
        item_id: item.id,
        quantity: item.quantity,
        unit_price: item.price,
        subtotal: item.price * item.quantity,
      }));

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // Update user profile with address
      const { error: profileError } = await supabase
        .from("profiles")
        .update({ address_id: addressResult.id })
        .eq("id", session.user.id);

      if (profileError) throw profileError;

      toast({
        title: "Pedido realizado com sucesso!",
        description: `Seu pedido #${orderResult.id} foi recebido e está sendo preparado.`,
      });

      clearCart();
      navigate("/profile");
    } catch (error: any) {
      toast({
        title: "Erro ao finalizar pedido",
        description: error.message || "Tente novamente",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!session || items.length === 0) return null;

  return (
    <div className="min-h-screen bg-background">
      <Header cartItemsCount={itemCount} isAuthenticated={!!session} />

      <main className="container py-8">
        <div className="mb-8">
          <h1 className="mb-2 text-4xl font-bold">Finalizar Pedido</h1>
          <p className="text-muted-foreground">Preencha os dados para concluir</p>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Endereço de Entrega</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="zipCode">CEP</Label>
                    <Input
                      id="zipCode"
                      name="zipCode"
                      placeholder="12345-678"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="street">Rua</Label>
                    <Input
                      id="street"
                      name="street"
                      placeholder="Rua exemplo"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="number">Número</Label>
                    <Input
                      id="number"
                      name="number"
                      placeholder="123"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="district">Bairro</Label>
                    <Input
                      id="district"
                      name="district"
                      placeholder="Centro"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city">Cidade</Label>
                    <Input
                      id="city"
                      name="city"
                      placeholder="Belo Horizonte"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">Estado</Label>
                    <Input
                      id="state"
                      name="state"
                      placeholder="MG"
                      maxLength={2}
                      required
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Forma de Pagamento</CardTitle>
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
                            <Icon className="h-5 w-5" />
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
                <Separator />
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
                <Separator />
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
}
