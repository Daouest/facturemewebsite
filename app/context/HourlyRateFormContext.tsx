"use client"
import React, { useState, useContext, createContext } from 'react'

type FormData = {
    _id?: string,
    idObjet?: number,
    idUser: number,
    clientName: string,
    workPosition: string,
    hourlyRate: number,
    idParent: -1,
    enforcementDate: ""
}

type FormDataContextType = {
    formData: FormData;
    setFormData: React.Dispatch<React.SetStateAction<FormData>>; // permet de set les paramètres dans le setter
}

const FormDataContext = createContext<FormDataContextType | undefined>(undefined)// creation du context

export const HourlyFormDataProvider = ({ children }: { children: React.ReactNode }) => {
    const [formData, setFormData] = useState<FormData>({ clientName: '', idUser: -1, workPosition: '', hourlyRate: 0, idParent: -1, enforcementDate: ""})
    return (
        <FormDataContext.Provider value={{ formData, setFormData }}>
            {children}
        </FormDataContext.Provider>
    )
}


export const useFormData = () => { // pour utiliser le le form dans d'autres pages
    const context = useContext(FormDataContext);
    if (context === undefined) {
        throw new Error("FormData must be used within a FormDataProvider")
    }

    return context;
}