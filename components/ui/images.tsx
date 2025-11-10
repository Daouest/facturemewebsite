"use client";
import { useEffect, useState } from "react";
import Image from "next/image";

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
        const res = await fetch(`/api/image/${id}`);
        const { image } = await res.json();
        // Set to null if image is empty string or falsy
        setImageUrl(image && image !== "" ? image : null);
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
    />
  );
}
