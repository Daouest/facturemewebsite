// import FormDetailItem from "@/app/components/formDetailItem"
// import Header from "@/app/components/Header";
// import Footer from "@/app/components/footer";
// export default async function DetailItem({ params }: { params: Promise<{ id: string }> }) {
//     const { id } = await params;
//     const idObjet = parseInt(id, 10);

//     return (
//         <>
//             <Header />

//             <FormDetailItem idObjet={idObjet} />
//             <Footer/>
//         </>
//     );

// }
import FormDetailItem from "@/app/components/formDetailItem"
import Header from "@/app/components/Header";
import Footer from "@/app/components/footer";
export default async function DetailItem({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    console.log("id encoder", id)
    let idObjet: number | null = null;
    try {
        // Étape 1 : décoder les caractères d’URL (%3D -> =)
        const urlDecoded = decodeURIComponent(id);
        // Étape 2 : décoder la base64 ("MTQ=" -> "14")
        const decoded = atob(urlDecoded);

        // Étape 3: convertion en nombre
        idObjet = parseInt(decoded, 10);

    } catch (err) {
        console.error("Erreur dans le decode de l'id", err);

    }

    return (
        <>
            <Header />

            <FormDetailItem idObjet={idObjet ?? 0} />
            <Footer />
        </>
    );

}