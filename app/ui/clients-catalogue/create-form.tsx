'use client';

import { useState, useEffect, startTransition } from 'react'
import { ClientForm, Address } from '@/app/lib/definitions'
import { createClient } from '@/app/lib/actions/clients-actions'
import Link from 'next/link'

export default function Form() {
    const [isPending, setisPending] = useState(false);
    const [address, setAddress] = useState<Address>({
        idAddress: -1,
        address: '',
        province: '',
        zipCode: '',
        country: 'CA',
        city: ''
    })
    const [formData, setFormData] = useState<ClientForm>({
        idUser: -1,
        idClient: -1,
        clientName: '',
        clientAddress: address
    })
    const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' | '' }>({
        text: '',
        type: '',
    });

    useEffect(() => {
        //update client address (formData) when address is updated.
        setFormData((prev) => ({
            ...prev,
            clientAddress: address
        }));
    }, [address]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!isFormValid()) {
            setMessage({ text: "Veuillez remplir tous les champs requis.", type: 'error' });
            return;
        }

        setisPending(true);
        setMessage({ text: '', type: '' }); // Clear any previous message

        // Simulate a delay
        setTimeout(() => {
            setisPending(false);
            setMessage({ text: "✅ Client ajouté avec succès !", type: 'success' });

            // action
            createClient(formData);

            // maybe reset form or navigate away
        }, 1000);
    };

    const isFormValid = () => {
        const { clientName, clientAddress } = formData;
        const { address, city, province, zipCode, country } = clientAddress;

        return (
            clientName.trim() !== '' &&
            address.trim() !== '' &&
            city.trim() !== '' &&
            province.trim() !== '' &&
            zipCode.trim() !== '' &&
            country.trim() !== ''
        );
    };

    return (
        <form onSubmit={handleSubmit}>

            <div id="bigContainer" className="flex flex-col items-center w-full max-w-5xl bg-gray-50 rounded-xl mt-20 mb-8 shadow-sm">
                {/* Messages/alerte */}
                {message.text && (
                    <div
                        className={`w-full text-center p-4 mb-4 rounded-xl ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                            }`}
                    >
                        {message.text}
                    </div>
                )}

                <h1 className="w-full ml-15 text-2xl text-gray-800 font-semibold mt-8 sm:text-3xl lg:text-2xl sm:mt-12">
                    👤 Ajouter un client à votre catalogue
                </h1>

                {/*  Form  */}
                <div id="form" className="flex flex-col gap-4 w-full p-6">

                    {/*Nom*/}
                    <div id="clientNameContainer" className="bg-blue-50 rounded-xl p-4">
                        <p className="mb-3 block font-semibold text-gray-800 flex items-center gap-2">Nom du client</p>
                        <div className="flex flex-row items-center">
                            <label className="text-sm font-semibold text-gray-800 items-center mr-3">Nom</label>
                            <input
                                required
                                placeholder="ex.: John Pork"
                                pattern="^[^\d]+$"
                                onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                                className="w-full bg-white rounded-xl border border-gray-200 py-3 pl-5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                            />
                        </div>
                    </div>

                    {/*Addresse*/}
                    <div id="clientAddressContainer" className="flex flex-col gap-1 bg-blue-50 rounded-xl p-4">
                        <p className="mb-3 block font-semibold text-gray-800 flex items-center gap-2">Addresse du client</p>

                        {/*Premier ligne: addresse, ville*/}
                        <div className="flex flex-row w-full gap-4">
                            <div className="flex flex-row items-center w-full">
                                <label className="text-sm font-semibold text-gray-800 items-center mr-3">Addresse</label>
                                <input
                                    required
                                    placeholder="ex.: 123, rue des Alphabets"
                                    onChange={(e) => setAddress({ ...address, address: e.target.value })}
                                    className="w-full bg-white rounded-xl border border-gray-200 py-3 pl-5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                                />
                            </div>
                            <div className="flex flex-row items-center w-full">
                                <label className="text-sm font-semibold text-gray-800 items-center mr-3">Ville</label>
                                <input
                                    required
                                    pattern="^[^\d]+$"
                                    placeholder="ex.: Montréal"
                                    onChange={(e) => setAddress({ ...address, city: e.target.value })}
                                    className="w-full bg-white rounded-xl border border-gray-200 py-3 pl-5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                                />
                            </div>
                        </div>

                        {/*Seconde ligne: code postal, province, pays*/}
                        <div className="flex flex-row w-full gap-4">
                            <div className="flex flex-row items-center w-full">
                                <label className="text-sm font-semibold text-gray-800 items-center mr-3">Code postal</label>
                                <input
                                    required
                                    placeholder="ex.: A1B 2C3"
                                    value={address.zipCode}
                                    minLength={6}
                                    maxLength={6}
                                    pattern="^[A-Za-z]\d[A-Za-z]\d[A-Za-z]\d$"
                                    onChange={(e) => setAddress({ ...address, zipCode: e.target.value })}
                                    className="w-full bg-white rounded-xl border border-gray-200 py-3 pl-5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                                />
                            </div>
                            <div className="flex flex-row items-center w-1/2">
                                <label className="text-sm font-semibold text-gray-800 items-center mr-3">Province</label>
                                <Provinces
                                    value={address.province}
                                    onChange={(province) => setAddress({ ...address, province })}
                                />
                            </div>
                            <div className="flex flex-row items-center w-1/2">
                                <label className="text-sm font-semibold text-gray-800 items-center mr-3">Pays</label>
                                <input
                                    required
                                    value="CA"
                                    disabled
                                    className="w-full bg-white rounded-xl border border-gray-200 py-3 pl-5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                                />
                            </div>
                        </div>
                    </div>

                    {/*Boutons de soumission*/}
                    <div id="buttons" className="flex justify-end gap-4">
                        <Link
                            href="/clients-catalogue"
                            className="px-6 py-3 rounded-xl bg-gray-200 text-gray-600 font-medium hover:bg-gray-300 transition-colors flex items-center gap-2"
                        >
                            <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                            </svg>
                            Annuler
                        </Link>
                        <button
                            type="submit"
                            className="px-6 py-3 rounded-xl bg-blue-500 text-white font-medium hover:bg-blue-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                            disabled={isPending}
                        >
                            {isPending ? (
                                <>
                                    <span className="animate-spin h-4 w-4 border-2 border-white border-t-blue-400 rounded-full"></span>
                                    Ajout...
                                </>
                            ) : (
                                <>
                                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                                    </svg>
                                    Ajouter le client
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </form>
    );
}

export function Provinces({ value, onChange }: ProvincesProps) {
    const provinces = ['AB', 'BC', 'MB', 'NB', 'NL', 'NS', 'ON', 'PE', 'QC', 'SK'];

    return (
        <select
            id="province"
            name="provinceSelect"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            required
            className="w-full bg-white rounded-xl border border-gray-200 py-3 pl-5 text-sm outline-none appearance-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
        >
            {provinces.map((province) => (
                <option key={province} value={province}>
                    {province}
                </option>
            ))}
            <option value="" disabled>
                Sélectionner
            </option>
        </select>
    );
}

type ProvincesProps = {
    value: string;
    onChange: (province: string) => void;
};