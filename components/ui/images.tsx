"use client";
import { useEffect, useState } from "react";
import Image from "next/image";

// Simple in-memory cache to avoid refetching the same image repeatedly
const imageCache = new Map<string | number, string | null>();

type ImageFromBdProps = {
  name: string;
  id: string | number;
};

export default function ImageFromBd({ name, id }: ImageFromBdProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchImage = async () => {
      try {
        setLoading(true);
        // Check cache first
        if (imageCache.has(id)) {
          setImageUrl(imageCache.get(id) ?? null);
          setLoading(false);
          return;
        }

        const res = await fetch(`/api/image/${id}`);
        if (!res.ok) {
          // store null in cache to avoid retry storms
          imageCache.set(id, null);
          setImageUrl(null);
          setLoading(false);
          return;
        }

        const body = await res.json();
        const image = body?.image ?? null;
        // Set to null if image is empty string or falsy
        const finalImage = image && image !== "" ? image : null;
        imageCache.set(id, finalImage);
        setImageUrl(finalImage);
        setLoading(false);
      } catch (err) {
        console.error("Erreur chargement image:", err);
        setImageUrl(null);
        setLoading(false);
      }
    };

    fetchImage();
  }, [id, name]);

  // Determine the source: valid imageUrl, or fallback
  const src =
    imageUrl || (loading ? "/image_loading.gif" : "/default_image.jpg");

  return (
    <Image
      src={src}
      alt={imageUrl ? `Image ${id}` : `image_loading ${id}`}
      width={80}
      height={80}
      className="object-cover w-20 h-20"
      unoptimized
    />
  );
}
