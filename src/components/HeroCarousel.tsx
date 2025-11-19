import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import _carousel1 from "@/assets/_carousel-1.png";
import _carousel2 from "@/assets/_carousel-2.png";
import _carousel3 from "@/assets/_carousel-3.png";

export const HeroCarousel = () => {
  const images = [
    { src: _carousel3, alt: "Pratos brasileiros deliciosos" },
    { src: _carousel1, alt: "Pizzas artesanais" },
    { src: _carousel2, alt: "Hambúrgueres gourmet" },
  ];

  return (
    <Carousel
      opts={{
        align: "start",
        loop: true,
      }}
      plugins={[
        Autoplay({
          delay: 5000,
        }),
      ]}
      className="w-full"
    >
      <CarouselContent>
        {images.map((image, index) => (
          <CarouselItem key={index}>
            <div className="relative aspect-[21/9] w-full overflow-hidden rounded-lg">
              <img
                src={image.src}
                alt={image.alt}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent" />
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="left-4" />
      <CarouselNext className="right-4" />
    </Carousel>
  );
};
