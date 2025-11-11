"use client"
import { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Client, UserData } from "@/app/lib/definitions";
import { useUser } from "@/app/context/UserContext";
import "../css/adminAcceuil.css";

export default function AdminAcceuil() {
    const countRef = useRef<string | null>(null);

    const router = useRouter();
    const [searche, setSearche] = useState("");
    const [showData, setShowData] = useState({ clients: true, users: false });
    const [dataOutput, setDataOutput] = useState<Client[] | UserData[]>([]);

    const { user } = useUser();
    // useEffect(() => {
    //     if (!user?.isAdmin) router.push("/homePage");
    // }, []);
    const handleClients = async () => {
        let resquestString = "";
        if (showData.clients) {
            resquestString = "/api/client/clients";
        } else if (showData.users) {
            resquestString = "/api/users";
        }
        const res = await fetch(`${resquestString}`, {
            cache: "no-cache",
            headers: { "if-count-change": countRef.current ?? "0" },
        })
        const data = await res.json();
        // console.log("data clients",data);
        const newCount = res.headers.get("Count");
        if (newCount) countRef.current = newCount;
        if (res.status == 304) {
            throw new Error("non Modifier");
        }
        return data;
    }

    const {
        data,
        isLoading,
        isFetching,
        status,

    } = useQuery<Client[] | UserData[]>({
        queryKey: ["dataUsersClients"],
        queryFn: (async () => {
            try {
                return await handleClients();
            } catch (err: any) { //erreur 304 
                if (err.message === "non Modifier") {

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
        setSearche(e.target.value);
    };
    useEffect(() => {
        if (searche === "") setDataOutput(data ?? []);
        let filter;
        if (showData.users) {
            filter = (data as UserData[]).filter(i =>
                i?.lastName.toLowerCase().includes(searche.toLowerCase())
            );
        }
        if (showData.clients) {
            filter = (data as Client[])?.filter(i =>
                i?.nomClient.toLowerCase().includes(searche.toLowerCase())
            );
        }
        setDataOutput(filter ?? []);
    }, [searche]);

    useEffect(() => {
        console.log("clients", data);
        setDataOutput(data ?? []);
    }, [data]);

    const renderedList = useMemo(() => {
        if (dataOutput.length === 0) {
            return <p className="self-center text-white">Aucune donnée trouvée</p>;
        }

        if (showData.users) {
            return (dataOutput as UserData[]).map((u, index) => (
                <div key={index} className="border-white/10 bg-gradient-to-br from-sky-500/10 to-indigo-500/10 backdrop-blur user-card" onClick={() => router.push("/clients-catalogue")}>
                    <div className="user-avatar">{u?.firstName?.charAt(0) ?? ""}</div>
                    <div className="user-info">
                        <h3 className="user-name">{u.lastName}</h3>
                        <div className={`user-status ${u.isOnline ? "online" : "offline"}`}>
                            {u.isOnline ? "online" : "offline"}
                        </div>
                    </div>
                </div>
            ));
        }

        return (dataOutput as Client[]).map((u, index) => (
            <div key={index} className="border-white/10 bg-gradient-to-br from-sky-500/10 to-indigo-500/10 backdrop-blur user-card user-card" onClick={() => router.push("/clients-catalogue")}>
                <div className="user-avatar">{u?.nomClient?.charAt(0) ?? ""}</div>
                <div className="user-info">
                    <h3 className="user-name">{u.nomClient}</h3>
                </div>
            </div>
        ));
    }, [dataOutput, showData]);
    return (
        <div className="admin-acceuil ">

            {/* Main Content */}
            <div className="main-content bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 px-6 overflow-hidden">
                {/* Header */}
                <header className="content-header">
                    <h1>#</h1>
                    <div className="recherche-board">
                        <label htmlFor="recherche"> recherche</label>
                        <input
                            className=" text-white h-11 w-full sm:flex-1 rounded-xl border border-gray-200 px-3 py-2  placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
                            type="text"
                            id="recherche"
                            name="recherche"
                            placeholder="recherche"
                            value={searche}
                            onChange={handleChange}
                            required
                        />
                    </div>
                </header>

                {/* Navigation Tabs */}
                <div className="content-tabs">
                    <button className="tab active" onClick={() => { setShowData({ ...showData, clients: true, users: false }); }}>Clients</button>
                    <button className="tab" onClick={() => { setShowData({ ...showData, clients: false, users: true }) }}>Users</button>
                </div>

                {/* Users Section */}
                <div className="users-section">
                    <h2 className="users-title">{showData.clients ? "Clients" : "Users"}</h2>

                    {
                        (isLoading) ? (
                            <div className="users-grid flex justify-center items-center py-10">
                                <p className="text-gray-700 text-lg animate-pulse">Loading...</p>
                            </div>
                        )
                            : (
                                < div className="users-grid">
                                    {renderedList}
                                </div>
                            )
                    }

                </div>

            </div>
        </div>
    );
};

