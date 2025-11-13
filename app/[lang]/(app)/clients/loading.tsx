import Image from "next/image";

export default function Loading() {
  return (
    <div className="flex justify-center items-center min-h-[400px]">
      <Image
        src="/Loading_Paperplane.gif"
        alt="loading"
        width={300}
        height={300}
        className="object-contain max-w-full h-auto opacity-90"
      />
    </div>
  );
}
