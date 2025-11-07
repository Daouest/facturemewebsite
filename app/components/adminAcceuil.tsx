"use client"
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Client } from "@/app/lib/definitions";
import "@/app/css/adminAcceuil.css";

export default function AdminAcceuil() {
    const countRef = useRef<string | null>(null);

    const router = useRouter();
    const [clientSearche, setClientSeacrche] = useState("");
    const [clientsOuput, setClientsOutput] = useState<Client[]>([]);



    const handleClients = async () => {
        const res = await fetch("/api/client/clients", {
            cache: "no-cache",
            headers: { "if-count-change": countRef.current ?? "0" },
        })
        const data = await res.json();
        // console.log("data clients",data);
        const newCount = res.headers.get("Count");
        if (newCount) countRef.current = newCount;
        if (res.status == 304) {
            throw new Error("Clients non Modifier");
        }
        return data;
    }

    const {
        data: clients,
        isLoading,
        status,

    } = useQuery<Client[]>({
        queryKey: ["clients"],
        queryFn: (async () => {
            try {
                return await handleClients();
            } catch (err: any) { //erreur 304 
                if (err.message === "Clients non Modifier") {

                    return Promise.reject({ status: 304 });
                }
                throw err;
            }
        }),
        refetchInterval: 5000,//10 sec
        refetchOnWindowFocus: true,
        refetchOnReconnect: true,
        staleTime: 8000 //  les données son considérées comme bonne après 8 secondes

    })

    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setClientSeacrche(e.target.value);
    };
    useEffect(() => {
        if (clientSearche === "") setClientsOutput(clients??[]);
        const filter = clients?.filter(client =>
            client.nomClient.toLowerCase().includes(clientSearche.toLowerCase())
        );
        setClientsOutput(filter ?? []);
    }, [clientSearche]);

    useEffect(() => {
        console.log("clients",clients);
        setClientsOutput(clients ?? []);
    }, [clients]);
    return (
        <div className="admin-acceuil">

            {/* Main Content */}
            <div className="main-content">
                {/* Header */}
                <header className="content-header">
                    <h1>#</h1>
                    <div className="recherche-board">
                        <label htmlFor="recherche"> recherche</label>
                        <input
                            className="h-11 w-full sm:flex-1 rounded-xl border border-gray-200 px-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
                            type="text"
                            id="recherche"
                            name="recherche"
                            placeholder="recherche"
                            value={clientSearche}
                            onChange={handleChange}
                            required
                        />
                    </div>
                </header>

                {/* Navigation Tabs */}
                <div className="content-tabs">
                    <button className="tab active">#</button>
                    <button className="tab">#</button>
                </div>

                {/* Users Section */}
                <div className="users-section">
                    <h2 className="users-title">Clients</h2>
                   {isLoading ?(
                     <div className="users-grid">
                       <p className="self-center"> Loading...</p>
                    </div>
                   ):(
                     <div className="users-grid">
                        {clientsOuput?.map(client => (
                            <div key={client.idClient} className="user-card"
                                onClick={() => { router.push("/clients-catalogue") }}>
                                <div className="user-avatar">
                                    {client.nomClient.charAt(0)}
                                </div>
                                <div className="user-info">
                                    <h3 className="user-name">{client.nomClient}</h3>
                                    <div className={`user-status ${client.isOnline ? 'online':'offline'}`}>
                                        {client.isOnline ? 'online':'offline'}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                   )}
                </div>
            </div>
        </div>
    );
};

