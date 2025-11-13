"use client";

import EditProfileForm from "@/app/profile/EditProfileForm";
import EditBusinessForm from "@/app/profile/EditBusinessForm";
import EditAddressForm from "@/app/profile/EditAddressForm";
import { useLangageContext } from "@/app/context/langageContext";
import { createTranslator } from "@/app/lib/utils";
import { useParams } from "next/navigation";

export default function ProfilePage() {
  const params = useParams();
  const lang = params?.lang as "fr" | "en";
  const { langage } = useLangageContext();
  const t = createTranslator(lang || langage);

  return (
    <div className="flex-1 w-full">
      <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-4 sm:p-6 md:p-8 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.6)]">
        <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-slate-100 text-center mb-4">
          {t("profileInfo")}
        </h1>

        {/* Divider under title */}
        <div className="mb-6 border-t border-white/10" />

        <EditProfileForm />

        {/* Divider between sections */}
        <div className="my-8 border-t border-white/10" />

        <EditAddressForm />

        {/* Divider between sections */}
        <div className="my-8 border-t border-white/10" />

        <EditBusinessForm />
      </div>
    </div>
  );
}
