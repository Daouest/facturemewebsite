import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import Image from "next/image";
import clsx from "clsx";

type CreatorProps = {
  id: string;
  name: string;
  role: string;
  imageUrl?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  description: string;
  extraMargin?: boolean;
};

function CreatorCard({
  id,
  name,
  role,
  imageUrl,
  linkedinUrl,
  githubUrl,
  description,
  extraMargin,
}: CreatorProps) {
  const src = imageUrl && imageUrl.trim() !== "" ? imageUrl : "/logo.png";

  return (
    <div
      id={id}
      className={clsx(
        "creator-card rounded-2xl border shadow-lg",
        "bg-white/90 dark:bg-zinc-900/80 border-zinc-200 dark:border-zinc-800",
        "p-6 sm:p-8 text-center",
        extraMargin && "mt-24"
      )}
    >
      <div className="flex justify-center mb-4">
        <div className="relative w-28 h-28 sm:w-32 sm:h-32">
          <Image
            src={src}
            alt={`Photo de ${name}`}
            fill
            className="rounded-full object-cover bg-white"
            sizes="128px"
          />
        </div>
      </div>

      <h2 className="text-xl sm:text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
        {name}
      </h2>
      <h3 className="text-base sm:text-lg text-zinc-600 dark:text-zinc-400 mt-1 mb-4">
        {role}
      </h3>

      <p className="text-sm sm:text-base text-zinc-700 dark:text-zinc-300 mb-5">
        {description}
      </p>

      <div className="flex items-center justify-center gap-5">
        {linkedinUrl && (
          <a
            href={linkedinUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-700 dark:text-blue-400 hover:underline underline-offset-4"
            aria-label={`${name} sur LinkedIn`}
          >
            LinkedIn
          </a>
        )}
        {githubUrl && (
          <a
            href={githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-zinc-900 dark:text-zinc-100 hover:underline underline-offset-4"
            aria-label={`${name} sur GitHub`}
          >
            GitHub
          </a>
        )}
      </div>
    </div>
  );
}

export default function AboutPage() {
  return (
    <>
      <Header />
      {/* Darker blue background */}
      <div className="min-h-screen w-full bg-gradient-to-b from-blue-900 via-blue-950 to-blue-950 dark:from-zinc-950 dark:to-zinc-900">
        <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-24 pb-20">
          <h1 className="text-3xl sm:text-4xl font-bold text-center text-white drop-shadow">
            À propos des créateurs
          </h1>

          <section
            id="creatorsContainer"
            className="mt-10 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 sm:gap-8"
          >
            <CreatorCard
              id="isaacContainer"
              name="Isaac Bernard Vital"
              role="Développeur"
              imageUrl="/profile-isaac.png"
              linkedinUrl="https://www.linkedin.com/in/sabri-bouzid-4b724b231/"
              description="Passionné par le développement web, Sabri a apporté son expertise en React et Next.js pour créer une interface utilisateur fluide et attrayante."
              extraMargin
            />
            <CreatorCard
              id="emerikContainer"
              name="Emerik Couture"
              role="Développeur"
              imageUrl="/profile-emerik.png"
              linkedinUrl="https://www.linkedin.com/in/sabri-bouzid-4b724b231/"
              githubUrl="https://github.com/SabriBouzid"
              description="Passionné par le développement web, Sabri a apporté son expertise en React et Next.js pour créer une interface utilisateur fluide et attrayante."
            />
            <CreatorCard
              id="lucianoContainer"
              name="Luciano Gomez"
              role="Développeur"
              imageUrl="/profile-luciano.png"
              linkedinUrl="https://www.linkedin.com/in/sabri-bouzid-4b724b231/"
              githubUrl="https://github.com/SabriBouzid"
              description="Passionné par le développement web, Sabri a apporté son expertise en React et Next.js pour créer une interface utilisateur fluide et attrayante."
              extraMargin
            />
            <CreatorCard
              id="sabrinaContainer"
              name="Sabrina Huot-Milliard"
              role="Développeuse"
              imageUrl="/profile-sabrina.png"
              githubUrl="https://github.com/SabriBouzid"
              description="Passionné par le développement web, Sabri a apporté son expertise en React et Next.js pour créer une interface utilisateur fluide et attrayante."
            />
          </section>
        </main>
      </div>
      <Footer />
    </>
  );
}
