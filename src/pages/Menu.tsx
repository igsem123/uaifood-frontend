import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { HeroCarousel } from "@/components/HeroCarousel";
import { CategoryFilter } from "@/components/CategoryFilter";
import { MenuItem } from "@/components/MenuItem";
import { Footer } from "@/components/Footer";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/contexts/CartContext";
import {Item} from "@/types/item.ts";
import {fetchItems} from "@/api/itemApi.ts";
import {fetchCategories} from "@/api/categoryApi.ts";
import {Category} from "@/types/category.ts";
import {useAuth} from "@/hooks/use-auth.ts";
import {FrontendError} from "@/types/frontendError.ts";

export default function Menu() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [items, setItems] = useState<Item[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
    const { toast } = useToast();
    const { addItem, itemCount } = useCart();
    const navigate = useNavigate();
    const {user} = useAuth();

    useEffect(() => {
        handleFetchCategories();
        handleFetchItems();
    }, []);

    const handleFetchCategories = async () => {
        try {
            const data = await fetchCategories();
            setCategories(data);
        } catch (err: unknown) {
            const error = err as FrontendError;

            if (error.type === "api") {
                toast({
                    title: "Erro ao carregar categorias",
                    description: error.message,
                    variant: "destructive",
                });
            }
        }
    };

    const handleFetchItems = async () => {
        try {
            const data = await fetchItems();
            setItems(data);
        } catch (err: unknown) {
            const error = err as FrontendError;

            if (error.type === "api") {
                toast({
                    title: "Erro ao carregar itens",
                    description: error.message,
                    variant: "destructive",
                });
            }
        }
    };

    const handleAddToCart = (itemId: number) => {
        if (!user) {
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
            price: Number(item.unitPrice),
            imageUrl: item.imageUrl || undefined,
        });

        toast({
            title: "Item adicionado!",
            description: "O item foi adicionado ao carrinho",
        });
    };

    const filteredItems = selectedCategory
        ? items.filter((item) => item.categoryId === selectedCategory)
        : items;

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Header cartItemsCount={itemCount} />

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
                            unitPrice={Number(item.unitPrice)}
                            imageUrl={item.imageUrl || undefined}
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
