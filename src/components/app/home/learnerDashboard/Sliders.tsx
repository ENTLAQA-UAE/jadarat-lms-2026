import { SliderType } from "@/app/home/types";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { ArrowLeft, ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React from "react";

function Sliders({ sliders }: { sliders: SliderType[] }) {
  return (
    <Carousel className="w-full aspect-[6/2] mb-8" dir="auto">
      <CarouselContent>
        {sliders.map((slider) => {
          return (
            <CarouselItem key={slider.id}>
              {slider.link && (
                <Link
                  href={slider.link}
                  target="_blank"
                  className="w-full h-full bg-transparent absolute"
                />
              )}
              <Image
                src={slider.image}
                width={1920}
                height={640}
                alt="Image"
                className="aspect-[6/2] object-cover rounded-md"
              />
            </CarouselItem>
          );
        })}
      </CarouselContent>
      <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2 z-10" aria-label="Previous slide">
        <Button
          variant="ghost"
          size="icon"
          className="bg-card/50 hover:bg-card"
          aria-hidden="true"
          tabIndex={-1}
        >
          <ArrowLeft className="w-6 h-6" />
        </Button>
      </CarouselPrevious>
      <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2 z-10" aria-label="Next slide">
        <Button
          variant="ghost"
          size="icon"
          className="bg-card/50 hover:bg-card"
          aria-hidden="true"
          tabIndex={-1}
        >
          <ArrowRight className="w-6 h-6" />
        </Button>
      </CarouselNext>
    </Carousel>
  );
}

export default Sliders;
