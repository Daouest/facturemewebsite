"use client";

import React, { createContext, useContext, ReactNode ,useState} from "react";

type langageContextType = {
  langage: "fr" | "en";
  setLangage: (lang: "fr" | "en") => void;
  
};

const langageContext = createContext<langageContextType | undefined>(undefined);

export const LangageProvider=({ children }: { children: ReactNode }) =>{
  const [langage ,setLangage]= useState<"fr"|"en">("fr");

  return (
    <langageContext.Provider value={{ langage, setLangage }}>
      {children}
    </langageContext.Provider>
  );
}

export const useLangageContext=()=> {
  const context = useContext(langageContext);
  if (!context) {
    throw new Error("Erreur dans le langageContext");
  }
  return context;
}
