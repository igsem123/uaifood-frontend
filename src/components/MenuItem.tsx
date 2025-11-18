import { Plus } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";

interface MenuItemProps {
  id: number;
  name: string;
  description: string;
  unitPrice: number;
  imageUrl?: string;
  available: boolean;
  onAddToCart: (id: number) => void;
}

export const MenuItem = ({
  id,
  name,
  description,
  unitPrice,
  imageUrl,
  available,
  onAddToCart,
}: MenuItemProps) => {
  return (
    <Card className="group overflow-hidden border-border/50 bg-card transition-all duration-300 hover:border-primary/20 hover:shadow-2xl hover:-translate-y-1">
      <div className="relative aspect-video w-full overflow-hidden bg-gradient-to-br from-muted to-muted/50">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <span className="text-4xl opacity-20">🍽️</span>
          </div>
        )}
        {!available && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm">
            <Badge variant="destructive" className="text-sm">Indisponível</Badge>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      </div>
      
      <CardHeader className="space-y-2">
        <CardTitle className="line-clamp-1 text-xl font-bold transition-colors group-hover:text-primary">
          {name}
        </CardTitle>
        <CardDescription className="line-clamp-2 text-sm leading-relaxed">
          {description}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex items-baseline gap-1">
          <span className="text-sm text-muted-foreground">R$</span>
          <span className="text-3xl font-bold text-primary">
            {unitPrice.toFixed(2).split('.')[0]}
          </span>
          <span className="text-xl font-bold text-primary/70">
            ,{unitPrice.toFixed(2).split('.')[1]}
          </span>
        </div>
      </CardContent>
      
      <CardFooter>
        <Button
          className="w-full transition-all duration-300 hover:scale-105"
          onClick={() => onAddToCart(id)}
          disabled={!available}
          size="lg"
        >
          <Plus className="mr-2 h-5 w-5" />
          {available ? "Adicionar ao Carrinho" : "Indisponível"}
        </Button>
      </CardFooter>
    </Card>
  );
};
