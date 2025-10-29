'use server'

import { ClientForm } from "../definitions"
import mongoose from "mongoose"
import { DbClient, DbAddress } from "@/app/lib/models"
import { fetchNextAddressId, fetchNextClientId } from '@/app/lib/data'
import { redirect } from 'next/navigation';
import { getSession } from '@/app/lib/session'

export async function createClient(formData: ClientForm) {
    console.log("action hello", formData);
    //1) Transformer les données reçues:.................................................................
    //1.1) Code postal
    let zipCode = formData.clientAddress.zipCode.toUpperCase();
    zipCode = zipCode.slice(0, 3) + ' ' + zipCode.slice(3);

    //1.2) Upper Case dans le nom 
    const clientname = formData.clientName.split(' ')
        .filter(word => word.trim() !== '') // ignore extra spaces
        .map(word => word[0].toUpperCase() + word.slice(1))
        .join(' ');

    //1.3) Upper Case pour la ville
    const city = formData.clientAddress.city.split(' ')
        .filter(word => word.trim() !== '') // ignore extra spaces
        .map(word => word[0].toUpperCase() + word.slice(1))
        .join(' ');

    //2) Chercher l'utilisateur (idUser/idClient)........................................................
    const userSession = await getSession();
    const idUser = userSession?.idUser;
    const idClient = await fetchNextClientId();

    //3) Ajouter l'addresse a la BD......................................................................
    let addresse = formData.clientAddress;
    const idAddress = await fetchNextAddressId();

    const session = await mongoose.startSession();
    try {
        await session.withTransaction(async () => {
            //Addresse
            const address = new DbAddress({
                idAddress: idAddress,
                address: addresse.address,
                province: addresse.province,
                zipCode: zipCode,
                city: city,
                country: addresse.country
            });
            await address.save({ session });

            //Client
            const client = new DbClient({
                idClient: idClient,
                idUser: idUser,
                nomClient: clientname,
                idAddress: idAddress
            })
            await client.save({ session });
        })

    } catch (error: any) {
        console.error("Database error:", error?.message || error);
    } finally {
        await session.endSession();
        redirect('/clients-catalogue');
    }
}