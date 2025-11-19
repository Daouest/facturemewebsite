import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import Sidebar from "@/app/components/Sidebar";
import MobileSidebarWrapper from "@/app/components/MobileSidebarWrapper";
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
        "creator-card rounded-2xl border border-white/10 bg-white/5 backdrop-blur shadow-[0_10px_30px_-15px_rgba(0,0,0,0.6)]",
        "p-6 sm:p-8 text-center transition-all hover:bg-white/10",
        // apply the extra top offset only on large screens so small/medium
        // layouts keep the grid aligned and don't show a gap between cards
        extraMargin && "lg:mt-24"
      )}
    >
      <div className="flex justify-center mb-4">
        <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full ring-2 ring-sky-400/30 ring-offset-2 ring-offset-slate-900">
          <Image
            src={src}
            alt={`Photo de ${name}`}
            fill
            className="rounded-full object-cover"
            sizes="128px"
          />
        </div>
      </div>

      <h2 className="text-xl sm:text-2xl font-semibold text-slate-100">
        {name}
      </h2>
      <h3 className="text-base sm:text-lg text-sky-300 mt-1 mb-4">{role}</h3>

      <p className="text-sm sm:text-base text-slate-300 mb-5 leading-relaxed">
        {description}
      </p>

      <div className="flex items-center justify-center gap-5">
        {linkedinUrl && (
          <a
            href={linkedinUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-sky-300 hover:text-sky-200 transition-colors underline-offset-4 hover:underline"
            aria-label={`${name} sur LinkedIn`}
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
            </svg>
            LinkedIn
          </a>
        )}
        {githubUrl && (
          <a
            href={githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-slate-200 hover:text-slate-100 transition-colors underline-offset-4 hover:underline"
            aria-label={`${name} sur GitHub`}
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
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
      <div className="min-h-dvh flex flex-col bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800">
        <Header />

        {/* Decorative gradient glows */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/4 -left-64 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 -right-64 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
        </div>

        <main className="flex-1 pt-20 pb-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-10 flex flex-col lg:flex-row gap-6 lg:items-start">

            {/* Main Content */}
            <section className="flex-1">
              <h1 className="text-3xl sm:text-4xl font-bold text-center text-slate-100 mb-3">
                À propos des créateurs
              </h1>
              <p className="text-center text-slate-400 mb-10 max-w-2xl mx-auto">
                Rencontrez l'équipe passionnée derrière FactureMe
              </p>

              <div
                id="creatorsContainer"
                className="mt-10 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 sm:gap-8"
              >
                <CreatorCard
                  id="isaacContainer"
                  name="Isaac Bernard Vital"
                  role="Développeur"
                  imageUrl="/profile-isaac.png"
                  linkedinUrl="https://www.linkedin.com/in/isaac-bernard-vital-1a508b238/"
                  githubUrl="https://github.com/IBV1234"
                  description="Amoureux du code depuis le secondaire, Isaac pense qu'être un programmeur est une façon de développer sa créativité de manière réelle et concrète. "
                  extraMargin
                />
                <CreatorCard
                  id="emerikContainer"
                  name="Emerik Couture"
                  role="Développeur"
                  imageUrl="/profile-emerik.png"
                  linkedinUrl="https://www.linkedin.com/in/emerik-couture-755054387/"
                  githubUrl="https://github.com/EmerikC"
                  description="Passionné par la technologie et la programmation depuis son enfance, Emerik est un programmeur hors pair qui ne recule jamais devant un défi."
                />
                <CreatorCard
                  id="lucianoContainer"
                  name="Luciano Gomez"
                  role="Développeur"
                  imageUrl="/profile-luciano.png"
                  linkedinUrl="https://www.linkedin.com/in/lucianogh/"
                  githubUrl="https://github.com/Daouest"
                  description="Intéressé par les nouvelles technologies et la mécanique, Luciano a toujours aimé tout ce qui se rapporte aux ordinateurs dès son plus jeune âge."
                  extraMargin
                />
                <CreatorCard
                  id="sabrinaContainer"
                  name="Sabrina Huot-Milliard"
                  role="Développeuse"
                  imageUrl="/profile-sabrina.png"
                  linkedinUrl="https://www.linkedin.com/in/sabrina-huot-milliard/"
                  githubUrl="https://github.com/sabrinahuotmilliard"
                  description="Femme de lettres reconvertie en femme d'informatique, Sabrina adore s'amuser avec des problèmes complexes."
                />
              </div>
            </section>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
}
