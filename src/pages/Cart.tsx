import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/contexts/CartContext";
import { supabase } from "@/integrations/supabase/client";
import { Session } from "@supabase/supabase-js";
import {useAuth} from "@/hooks/use-auth.ts";

export default function Cart() {
  const { items, updateQuantity, removeItem, total, itemCount } = useCart();
  const navigate = useNavigate();
  const {user} = useAuth();

  if (!user) return navigate("/auth");

  return (
    <div className="min-h-screen bg-background">
      <Header cartItemsCount={itemCount} />

      <main className="container py-8">
        <div className="mb-8">
          <h1 className="mb-2 text-4xl font-bold">Seu Carrinho</h1>
          <p className="text-muted-foreground">
            {itemCount > 0
              ? `${itemCount} ${itemCount === 1 ? "item" : "itens"} no carrinho`
              : "Seu carrinho está vazio"}
          </p>
        </div>

        {items.length === 0 ? (
          <Card className="py-12">
            <CardContent className="flex flex-col items-center justify-center gap-4">
              <ShoppingBag className="h-16 w-16 text-muted-foreground" />
              <p className="text-xl text-muted-foreground">Seu carrinho está vazio</p>
              <Button onClick={() => navigate("/")}>Ver Cardápio</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => (
                <Card key={item.id}>
                  <CardContent className="flex gap-4 p-4">
                    {item.imageUrl && (
                      <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-muted">
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    )}
                    <div className="flex flex-1 flex-col justify-between">
                      <div>
                        <h3 className="font-semibold">{item.name}</h3>
                        <p className="text-lg font-bold text-primary">
                          R$ {item.price.toFixed(2)}
                        </p>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="w-8 text-center font-semibold">
                            {item.quantity}
                          </span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive"
                          onClick={() => removeItem(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
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
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span className="text-primary">R$ {total.toFixed(2)}</span>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full"
                    size="lg"
                    onClick={() => navigate("/checkout")}
                  >
                    Finalizar Pedido
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
