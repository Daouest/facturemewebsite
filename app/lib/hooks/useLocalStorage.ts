import { useEffect, useState } from "react";

export default function useLocalStorage<T>(key: string, initialValue: T): [T, React.Dispatch<React.SetStateAction<T>>] { //[T,React.Dispatch<React.SetStateAction<T>>]: Permet de modifier la valeur comme setValue(newValue) ou setValue(prev => ...)
    const isClient = typeof window !== "undefined";

    const [storedValue, setStoredValue] = useState<T>(() => {
        if (!isClient) {
            return initialValue;
        }
        try {
            const item = localStorage.getItem(key);
            console.log("item", item);
            console.log("initialValue", initialValue);
            return item ? (JSON.parse(item) as T) : initialValue; // as T Définit dans l'initialisation:initialValue: T =  number  as number

        } catch (error) {
            console.error("Erreur dans lecture de localStorage", error)
            return initialValue
        }
    })


    useEffect(() => {
           if (!isClient) return ;
        try {
            localStorage.setItem(key, JSON.stringify(storedValue));
        } catch (error) {
            console.error("Erreur dans l'écriture de localStorage", error)
        }
    }, [key, storedValue])

    return [storedValue, setStoredValue];
}

/*
[T,React.Dispatch<React.SetStateAction<T>>] : définition
    T: retourne de type number  <a l'assignation
 React.Dispatch<React.SetStateAction<T>>: Permet de modifier la valeur comme setValue(newValue) ou setValue(prev => ...)
 EXEMPLE: 
 const [count, setCount] = useState<number>(0);
 count: number
setCount: Dispatch<SetStateAction<number>>
*/