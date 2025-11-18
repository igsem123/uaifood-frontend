import {Button} from "./ui/button";
import {ScrollArea, ScrollBar} from "./ui/scroll-area";
import {Category} from "@/types/category.ts";

interface CategoryFilterProps {
    categories: Category[];
    selectedCategory: number | null;
    onSelectCategory: (id: number | null) => void;
}

export const CategoryFilter = ({ categories, selectedCategory, onSelectCategory }: CategoryFilterProps) => {
    return (
        <ScrollArea className="w-full whitespace-nowrap">
            <div className="flex gap-2 py-4">
                <Button
                    variant={selectedCategory === null ? "default" : "outline"}
                    onClick={() => onSelectCategory(null)}
                    className="flex-shrink-0"
                >
                    Todos
                </Button>
                {categories.map((category) => (
                    <Button
                        key={category.id}
                        variant={selectedCategory === category.id ? "default" : "outline"}
                        onClick={() => onSelectCategory(category.id)}
                        className="flex-shrink-0"
                    >
                        {category.name}
                    </Button>
                ))}
            </div>
            <ScrollBar orientation="horizontal"/>
        </ScrollArea>
    );
};
