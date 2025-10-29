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
        setImageUrl(image);
        setLoading(false);
      } catch (err) {
        console.error("Erreur chargement image:", err);
      }
    };

    fetchImage();
  }, [id, name]);

  return imageUrl && imageUrl !== "" ? (
    <Image
      src={imageUrl ? imageUrl : "/default_image.jpg"}
      alt={`Image ${id}`}
      width={60}
      height={50}
    />
  ) : (
    <Image
      src={loading ? "/image_loading.gif" : "/default_image.jpg"}
      alt={`image_loading ${id}`}
      width={60}
      height={50}
    />
  );
}
