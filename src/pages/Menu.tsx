import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { HeroCarousel } from "@/components/HeroCarousel";
import { CategoryFilter } from "@/components/CategoryFilter";
import { MenuItem } from "@/components/MenuItem";
import { Footer } from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/contexts/CartContext";
import { Session } from "@supabase/supabase-js";

interface Category {
  id: number;
  description: string;
}

interface Item {
  id: number;
  name: string;
  description: string;
  unit_price: number;
  image_url: string | null;
  category_id: number;
  available: boolean;
}

export default function Menu() {
  const [session, setSession] = useState<Session | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const { toast } = useToast();
  const { addItem, itemCount } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    fetchCategories();
    fetchItems();
  }, []);

  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("description");

    if (error) {
      toast({
        title: "Erro ao carregar categorias",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    setCategories(data || []);
  };

  const fetchItems = async () => {
    const { data, error } = await supabase
      .from("items")
      .select("*")
      .eq("available", true)
      .order("name");

    if (error) {
      toast({
        title: "Erro ao carregar itens",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    setItems(data || []);
  };

  const handleAddToCart = (itemId: number) => {
    if (!session) {
      toast({
        title: "Faça login para adicionar itens",
        description: "Você precisa estar logado para fazer pedidos",
      });
      navigate("/auth");
      return;
    }

    const item = items.find((i) => i.id === itemId);
    if (!item) return;

    addItem({
      id: item.id,
      name: item.name,
      price: Number(item.unit_price),
      imageUrl: item.image_url || undefined,
    });

    toast({
      title: "Item adicionado!",
      description: "O item foi adicionado ao carrinho",
    });
  };

  const filteredItems = selectedCategory
    ? items.filter((item) => item.category_id === selectedCategory)
    : items;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header cartItemsCount={itemCount} isAuthenticated={!!session} />

      <main className="container flex-1 py-8">
        <div className="mb-8">
          <HeroCarousel />
        </div>

        <div className="mb-8">
          <h1 className="mb-2 text-4xl font-bold">Nosso Cardápio</h1>
          <p className="text-muted-foreground">
            Escolha seus pratos favoritos e faça seu pedido
          </p>
        </div>

        <CategoryFilter
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredItems.map((item) => (
            <MenuItem
              key={item.id}
              id={item.id}
              name={item.name}
              description={item.description}
              price={Number(item.unit_price)}
              imageUrl={item.image_url || undefined}
              available={item.available}
              onAddToCart={handleAddToCart}
            />
          ))}
        </div>

        {filteredItems.length === 0 && (
          <div className="py-12 text-center">
            <p className="text-muted-foreground">Nenhum item encontrado nesta categoria</p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
