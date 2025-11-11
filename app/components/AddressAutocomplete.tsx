"use client";

import { useEffect, useRef, useState } from "react";
import Input from "./Input";

// Extend Window interface for Google Maps
declare global {
  interface Window {
    google?: any;
  }
}

export type AddressData = {
  address: string;
  city: string;
  province: string;
  zipCode: string;
  country: string;
};

type AddressAutocompleteProps = {
  onAddressSelect: (address: AddressData) => void;
  initialAddress?: Partial<AddressData>;
  errors?: {
    address?: string;
    city?: string;
    province?: string;
    zipCode?: string;
    country?: string;
  };
  disabled?: boolean;
};

export default function AddressAutocomplete({
  onAddressSelect,
  initialAddress = {},
  errors = {},
  disabled = false,
}: AddressAutocompleteProps) {
  const [address, setAddress] = useState(initialAddress.address || "");
  const [city, setCity] = useState(initialAddress.city || "");
  const [province, setProvince] = useState(initialAddress.province || "");
  const [zipCode, setZipCode] = useState(initialAddress.zipCode || "");
  const [country, setCountry] = useState(initialAddress.country || "CA");
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);

  const addressInputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<any>(null);

  // Load Google Places API script
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Check if script already exists
    if (window.google?.maps?.places) {
      setIsScriptLoaded(true);
      return;
    }

    // Check if script is already being loaded
    const existingScript = document.querySelector(
      'script[src*="maps.googleapis.com"]'
    );
    if (existingScript) {
      existingScript.addEventListener("load", () => setIsScriptLoaded(true));
      return;
    }

    // Load script
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places&language=fr`;
    script.async = true;
    script.defer = true;
    script.onload = () => setIsScriptLoaded(true);
    script.onerror = () => {
      console.error("Failed to load Google Maps script - autocomplete will not be available");
    };
    document.head.appendChild(script);
  }, []);

  // Initialize autocomplete
  useEffect(() => {
    if (!isScriptLoaded || !addressInputRef.current) return;

    try {
      const google = (window as any).google;
      autocompleteRef.current = new google.maps.places.Autocomplete(
        addressInputRef.current,
        {
          types: ["address"],
          componentRestrictions: { country: ["ca", "us"] },
          fields: ["address_components", "formatted_address"],
        }
      );

      autocompleteRef.current.addListener("place_changed", handlePlaceSelect);
    } catch (error) {
      console.error("Error initializing autocomplete:", error);
    }

    return () => {
      if (autocompleteRef.current && (window as any).google) {
        (window as any).google.maps.event.clearInstanceListeners(autocompleteRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isScriptLoaded]);

  const handlePlaceSelect = () => {
    const place = autocompleteRef.current?.getPlace();
    if (!place?.address_components) return;

    let streetNumber = "";
    let route = "";
    let newCity = "";
    let newProvince = "";
    let newZipCode = "";
    let newCountry = "";

    place.address_components.forEach((component: any) => {
      const types = component.types;

      if (types.includes("street_number")) {
        streetNumber = component.long_name;
      }
      if (types.includes("route")) {
        route = component.long_name;
      }
      if (types.includes("locality")) {
        newCity = component.long_name;
      }
      if (types.includes("administrative_area_level_1")) {
        newProvince = component.short_name;
      }
      if (types.includes("postal_code")) {
        newZipCode = component.long_name;
      }
      if (types.includes("country")) {
        newCountry = component.short_name;
      }
    });

    const fullAddress = `${streetNumber} ${route}`.trim();

    setAddress(fullAddress);
    setCity(newCity);
    setProvince(newProvince);
    setZipCode(newZipCode);
    setCountry(newCountry);

    onAddressSelect({
      address: fullAddress,
      city: newCity,
      province: newProvince,
      zipCode: newZipCode,
      country: newCountry,
    });
  };

  const canadianProvinces = [
    { code: "AB", name: "Alberta" },
    { code: "BC", name: "Colombie-Britannique" },
    { code: "MB", name: "Manitoba" },
    { code: "NB", name: "Nouveau-Brunswick" },
    { code: "NL", name: "Terre-Neuve-et-Labrador" },
    { code: "NS", name: "Nouvelle-Écosse" },
    { code: "NT", name: "Territoires du Nord-Ouest" },
    { code: "NU", name: "Nunavut" },
    { code: "ON", name: "Ontario" },
    { code: "PE", name: "Île-du-Prince-Édouard" },
    { code: "QC", name: "Québec" },
    { code: "SK", name: "Saskatchewan" },
    { code: "YT", name: "Yukon" },
  ];

  const usStates = [
    { code: "AL", name: "Alabama" },
    { code: "AK", name: "Alaska" },
    { code: "AZ", name: "Arizona" },
    { code: "AR", name: "Arkansas" },
    { code: "CA", name: "California" },
    { code: "CO", name: "Colorado" },
    { code: "CT", name: "Connecticut" },
    { code: "DE", name: "Delaware" },
    { code: "FL", name: "Florida" },
    { code: "GA", name: "Georgia" },
    { code: "HI", name: "Hawaii" },
    { code: "ID", name: "Idaho" },
    { code: "IL", name: "Illinois" },
    { code: "IN", name: "Indiana" },
    { code: "IA", name: "Iowa" },
    { code: "KS", name: "Kansas" },
    { code: "KY", name: "Kentucky" },
    { code: "LA", name: "Louisiana" },
    { code: "ME", name: "Maine" },
    { code: "MD", name: "Maryland" },
    { code: "MA", name: "Massachusetts" },
    { code: "MI", name: "Michigan" },
    { code: "MN", name: "Minnesota" },
    { code: "MS", name: "Mississippi" },
    { code: "MO", name: "Missouri" },
    { code: "MT", name: "Montana" },
    { code: "NE", name: "Nebraska" },
    { code: "NV", name: "Nevada" },
    { code: "NH", name: "New Hampshire" },
    { code: "NJ", name: "New Jersey" },
    { code: "NM", name: "New Mexico" },
    { code: "NY", name: "New York" },
    { code: "NC", name: "North Carolina" },
    { code: "ND", name: "North Dakota" },
    { code: "OH", name: "Ohio" },
    { code: "OK", name: "Oklahoma" },
    { code: "OR", name: "Oregon" },
    { code: "PA", name: "Pennsylvania" },
    { code: "RI", name: "Rhode Island" },
    { code: "SC", name: "South Carolina" },
    { code: "SD", name: "South Dakota" },
    { code: "TN", name: "Tennessee" },
    { code: "TX", name: "Texas" },
    { code: "UT", name: "Utah" },
    { code: "VT", name: "Vermont" },
    { code: "VA", name: "Virginia" },
    { code: "WA", name: "Washington" },
    { code: "WV", name: "West Virginia" },
    { code: "WI", name: "Wisconsin" },
    { code: "WY", name: "Wyoming" },
  ];

  const provinces =
    country === "CA"
      ? canadianProvinces
      : country === "US"
      ? usStates
      : canadianProvinces;

  return (
    <div className="space-y-4">
      {/* Address field with autocomplete */}
      <div>
        <label
          htmlFor="address-autocomplete"
          className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1"
        >
          Adresse
        </label>
        <input
          ref={addressInputRef}
          id="address-autocomplete"
          type="text"
          placeholder="ex.: 123 rue des Alphabets"
          value={address}
          onChange={(e) => {
            const newAddress = e.target.value;
            setAddress(newAddress);
            onAddressSelect({
              address: newAddress,
              city,
              province,
              zipCode,
              country,
            });
          }}
          required
          disabled={disabled}
          autoComplete="off"
          className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-zinc-800 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
        />
        {errors.address && (
          <p className="mt-1 text-xs text-red-600">{errors.address}</p>
        )}
      </div>

      {/* Manual fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Input
            label="Ville"
            type="text"
            placeholder="ex.: Montréal"
            value={city}
            onChange={(e) => {
              const newCity = e.target.value;
              setCity(newCity);
              onAddressSelect({
                address,
                city: newCity,
                province,
                zipCode,
                country,
              });
            }}
            required
            disabled={disabled}
          />
          {errors.city && (
            <p className="mt-1 text-xs text-red-600">{errors.city}</p>
          )}
        </div>

        <div>
          <Input
            label="Code postal"
            type="text"
            placeholder={country === "CA" ? "A1B 2C3" : "12345"}
            value={zipCode}
            onChange={(e) => {
              const newZipCode = e.target.value;
              setZipCode(newZipCode);
              onAddressSelect({
                address,
                city,
                province,
                zipCode: newZipCode,
                country,
              });
            }}
            required
            disabled={disabled}
          />
          {errors.zipCode && (
            <p className="mt-1 text-xs text-red-600">{errors.zipCode}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="province"
            className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1"
          >
            Province / État
          </label>
          <select
            id="province"
            value={province}
            onChange={(e) => {
              const newProvince = e.target.value;
              setProvince(newProvince);
              onAddressSelect({
                address,
                city,
                province: newProvince,
                zipCode,
                country,
              });
            }}
            required
            disabled={disabled}
            className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-zinc-800 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option value="">Sélectionner</option>
            {provinces.map((p) => (
              <option key={p.code} value={p.code}>
                {p.name}
              </option>
            ))}
          </select>
          {errors.province && (
            <p className="mt-1 text-xs text-red-600">{errors.province}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="country"
            className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1"
          >
            Pays
          </label>
          <select
            id="country"
            value={country}
            onChange={(e) => {
              const newCountry = e.target.value;
              setCountry(newCountry);
              setProvince(""); // Reset province when country changes
              onAddressSelect({
                address,
                city,
                province: "",
                zipCode,
                country: newCountry,
              });
            }}
            required
            disabled={disabled}
            className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-zinc-800 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option value="CA">Canada</option>
            <option value="US">États-Unis</option>
          </select>
          {errors.country && (
            <p className="mt-1 text-xs text-red-600">{errors.country}</p>
          )}
        </div>
      </div>
    </div>
  );
}
