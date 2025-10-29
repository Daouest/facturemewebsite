import react from "react"
import Header from "@/app/components/Header"
import Footer from '@/app/components/footer'

function creatorContainer(id: string, name: string, role: string, imageUrl: string, linkedinUrl: string, githubUrl: string, description: string, extraMargin?: boolean) {
    if(!imageUrl || imageUrl.trim() === "") {
        imageUrl = "/logo.png"; // Chemin vers une image par défaut
    }

    return (
        <div id={id} className="creator-card bg-opacity-80 rounded-lg m-4 items-center" {...(extraMargin ? { style: { marginTop: '6em' } } : {})}>
            <div className="flex justify-center mt-4">
                <img src={imageUrl} alt={"picture of "+ name} className="w-32 h-32 rounded-full mb-4 bg-white" />
            </div>
            <div className="flex flex-col items-center text-center bg-white p-4 rounded-lg">
                <h2 className="text-2xl font-bold mb-2">{name}</h2>
                <h3 className="text-xl text-gray-600 mb-4">{role}</h3>
                <p className="text-center text-gray-700 mb-4">{description}</p>
                <div className="flex space-x-4">
                    {linkedinUrl && (
                        <a href={linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        LinkedIn
                    </a>
                    )}
                    {githubUrl && (
                        <a href={githubUrl} target="_blank" rel="noopener noreferrer" className="text-gray-800 hover:underline">
                        GitHub
                    </a>
                    )}
                </div>
            </div>
        </div>
    )
}



export default function AboutPage() {

    return (
        <>
            <Header />
            <div className="flex flex-col w-full h-screen background-image ">
                <div>
                    <p className="text-4xl font-bold text-center mt-28 text-white">À propos des créateurs</p>
                    <div id="creatorsContainer" className="flex flex-row justify-center mt-10 mb-20 w-3/4 place-self-center">
                        {creatorContainer(
                            "isaacContainer",
                            "Isaac Bernard Vital",
                            "Développeur",
                            "/profile-isaac.png",
                            "https://www.linkedin.com/in/sabri-bouzid-4b724b231/",
                            "",
                            "Passionné par le développement web, Sabri a apporté son expertise en React et Next.js pour créer une interface utilisateur fluide et attrayante.",
                            true
                        )}
                        {creatorContainer(
                            "emerikContainer",
                            "Emerik Couture",
                            "Développeur",
                            "/profile-emerik.png",
                            "https://www.linkedin.com/in/sabri-bouzid-4b724b231/",
                            "https://github.com/SabriBouzid",
                            "Passionné par le développement web, Sabri a apporté son expertise en React et Next.js pour créer une interface utilisateur fluide et attrayante.",
                            false
                        )}
                        {creatorContainer(
                            "lucianoContainer",
                            "Luciano Gomez",
                            "Développeur",
                            "/profile-luciano.png",
                            "https://www.linkedin.com/in/sabri-bouzid-4b724b231/",
                            "https://github.com/SabriBouzid",
                            "Passionné par le développement web, Sabri a apporté son expertise en React et Next.js pour créer une interface utilisateur fluide et attrayante.",
                            true
                        )}
                        {creatorContainer(
                            "sabrinaContainer",
                            "Sabrina Huot-Milliard",
                            "Développeuse",
                            "/profile-sabrina.png",
                            "",
                            "https://github.com/SabriBouzid",
                            "Passionné par le développement web, Sabri a apporté son expertise en React et Next.js pour créer une interface utilisateur fluide et attrayante.",
                            false
                        )}
                    </div>
                </div>
            </div>
            <Footer />
        </>
    )

}

