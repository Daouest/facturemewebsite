"use client";
import {
 useEffect, useRef, useState, useId 
}
 from "react";
import Input from "./Input";// Extend Window interface for Google Mapsdeclare global {
  interface Window {
    google?: any;  
}

}
type PlacePrediction = {
  placeId: string;  text: {
 text: string 
}
;  mainText: {
 text: string 
}
;  secondaryText: {
 text: string 
}
;
}
;

export type AddressData = {
  address: string;  city: string;  province: string;  zipCode: string;  country: string;
}
;

type AddressAutocompleteProps = {
  onAddressSelect: (address: AddressData) => void;  initialAddress?: Partial<AddressData>;  errors?: {
    address?: string;    city?: string;    province?: string;    zipCode?: string;    country?: string;  
}
;  disabled?: boolean;  variant?: "default" | "profile"; // default for signup/auth forms, profile for profile page
}
;

export default function AddressAutocomplete({
  onAddressSelect,  initialAddress = {

}
,  errors = {

}
,  disabled = false,  variant = "default",
}
: AddressAutocompleteProps) {
  const [address, setAddress] = useState(initialAddress.address || "");  const [city, setCity] = useState(initialAddress.city || "");  const [province, setProvince] = useState(initialAddress.province || "");  const [zipCode, setZipCode] = useState(initialAddress.zipCode || "");  const [country, setCountry] = useState(initialAddress.country || "CA");  const [isScriptLoaded, setIsScriptLoaded] = useState(false);    // Autocomplete state  const [inputValue, setInputValue] = useState("");  const [predictions, setPredictions] = useState<PlacePrediction[]>([]);  const [showDropdown, setShowDropdown] = useState(false);  const [selectedIndex, setSelectedIndex] = useState(-1);    const sessionTokenRef = useRef<any>(null);  const dropdownRef = useRef<HTMLDivElement>(null);  const inputRef = useRef<HTMLInputElement>(null);  // Generate unique IDs for this instance  const uniqueId = useId();  const addressInputId = `address-input-${
uniqueId
}
`;  const provinceId = `province-${
uniqueId
}
`;  // Update local state when initialAddress changes (e.g., when data loads from API)  useEffect(() => {
    if (initialAddress.address !== undefined) {
      setAddress(initialAddress.address);      setInputValue(initialAddress.address); // Also set the input value    
}
    if (initialAddress.city !== undefined) setCity(initialAddress.city);    if (initialAddress.province !== undefined) setProvince(initialAddress.province);    if (initialAddress.zipCode !== undefined) setZipCode(initialAddress.zipCode);    if (initialAddress.country !== undefined) setCountry(initialAddress.country);  
}
, [initialAddress.address, initialAddress.city, initialAddress.province, initialAddress.zipCode, initialAddress.country]);  // Style configurations based on variant  const styles = {
    label: variant === "profile"       ? "block text-sm font-medium text-slate-300 mb-1"      : "block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1",    input: variant === "profile"      ? "w-full h-11 rounded-xl border border-white/20 bg-white/10 backdrop-blur px-3 py-2 text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400/20 focus:border-sky-400/60 disabled:opacity-50 disabled:cursor-not-allowed"      : "w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-zinc-900 dark:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed",    select: variant === "profile"      ? "w-full h-11 rounded-xl border border-white/20 bg-white/10 backdrop-blur px-3 py-2 text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400/20 focus:border-sky-400/60 disabled:opacity-50 disabled:cursor-not-allowed"      : "w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-zinc-900 dark:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed",    error: variant === "profile" ? "mt-1 text-xs text-red-400" : "mt-1 text-xs text-red-600",    inputClass: variant === "profile"      ? "w-full h-11 rounded-xl border border-white/20 bg-white/10 backdrop-blur px-3 py-2 text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400/20 focus:border-sky-400/60"      : "", // empty string means use Input component's default styling  
}
;  // Load Google Places API script  useEffect(() => {
    if (typeof window === "undefined") return;    if (window.google?.maps?.places?.AutocompleteSuggestion) {
      setIsScriptLoaded(true);      return;    
}
    const existingScript = document.querySelector(      'script[src*="maps.googleapis.com"]'    );    if (existingScript) {
      const checkLoaded = setInterval(() => {
        if (window.google?.maps?.places?.AutocompleteSuggestion) {
          clearInterval(checkLoaded);          setIsScriptLoaded(true);        
}
      
}
, 100);      return () => clearInterval(checkLoaded);    
}
    const script = document.createElement("script");    script.src = `https://maps.googleapis.com/maps/api/js?key=${
process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
}
&libraries=places&language=fr&loading=async`;    script.async = true;    script.defer = true;    script.onload = () => {
      const checkLoaded = setInterval(() => {
        if (window.google?.maps?.places?.AutocompleteSuggestion) {
          clearInterval(checkLoaded);          setIsScriptLoaded(true);        
}
      
}
, 100);    
}
;    script.onerror = () => {
      console.error("Failed to load Google Maps script");    
}
;    document.head.appendChild(script);  
}
, []);  // Initialize session token  useEffect(() => {
    if (isScriptLoaded && !sessionTokenRef.current) {
      const google = (window as any).google;      sessionTokenRef.current = new google.maps.places.AutocompleteSessionToken();    
}
  
}
, [isScriptLoaded]);  // Fetch autocomplete predictions  const fetchPredictions = async (input: string) => {
    if (!input || !isScriptLoaded || input.length < 3) {
      setPredictions([]);      setShowDropdown(false);      return;    
}
    try {
      const google = (window as any).google;      const request = {
        input,        includedRegionCodes: ["ca"],        sessionToken: sessionTokenRef.current,      
}
;      const {
 suggestions 
}
 = await google.maps.places.AutocompleteSuggestion.fetchAutocompleteSuggestions(request);            const placePredictions = suggestions        .filter((s: any) => s.placePrediction)        .map((s: any) => s.placePrediction);            setPredictions(placePredictions);      setShowDropdown(placePredictions.length > 0);    
}
 catch (error) {
      console.error("Error fetching predictions:", error);      setPredictions([]);      setShowDropdown(false);    
}
  
}
;  // Handle place selection  const handlePlaceSelect = async (prediction: any) => {
    try {
      const google = (window as any).google;      const place = prediction.toPlace();            await place.fetchFields({
        fields: ["addressComponents"],      
}
);      let streetNumber = "";      let route = "";      let newCity = "";      let newProvince = "";      let newZipCode = "";      let newCountry = "";      if (place.addressComponents) {
        place.addressComponents.forEach((component: any) => {
          const types = component.types;          if (types.includes("street_number")) {
            streetNumber = (component.longText || "").trim();          
}
          if (types.includes("route")) {
            route = (component.shortText || "").trim();          
}
          if (types.includes("locality")) {
            newCity = (component.longText || "").trim();          
}
          if (types.includes("administrative_area_level_1")) {
            newProvince = (component.shortText || "").trim();          
}
          if (types.includes("postal_code")) {
            newZipCode = (component.longText || "").trim();          
}
          if (types.includes("country")) {
            newCountry = (component.shortText || "").trim();          
}
        
}
);      
}
      const fullAddress = [streetNumber, route].filter(Boolean).join(" ").trim();      setAddress(fullAddress);      setInputValue(fullAddress);      setCity(newCity);      setProvince(newProvince);      setZipCode(newZipCode);      setCountry(newCountry);      setShowDropdown(false);      setPredictions([]);      setSelectedIndex(-1);      // Create new session token for next search      sessionTokenRef.current = new google.maps.places.AutocompleteSessionToken();      onAddressSelect({
        address: fullAddress,        city: newCity,        province: newProvince,        zipCode: newZipCode,        country: newCountry,      
}
);    
}
 catch (error) {
      console.error("Error fetching place details:", error);    
}
  
}
;  // Handle input change with debounce  useEffect(() => {
    // Don't fetch predictions if input matches current address (editing existing)    if (inputValue === address && inputValue.length > 0) {
      setPredictions([]);      setShowDropdown(false);      return;    
}
    const timeoutId = setTimeout(() => {
      fetchPredictions(inputValue);    
}
, 300);    return () => clearTimeout(timeoutId);    // eslint-disable-next-line react-hooks/exhaustive-deps  
}
, [inputValue]);  // Handle keyboard navigation  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showDropdown || predictions.length === 0) return;    switch (e.key) {
      case "ArrowDown":        e.preventDefault();        setSelectedIndex((prev) =>           prev < predictions.length - 1 ? prev + 1 : prev        );        break;      case "ArrowUp":        e.preventDefault();        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));        break;      case "Enter":        e.preventDefault();        if (selectedIndex >= 0) {
          handlePlaceSelect(predictions[selectedIndex]);        
}
        break;      case "Escape":        setShowDropdown(false);        setSelectedIndex(-1);        break;    
}
  
}
;  // Close dropdown when clicking outside  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (        dropdownRef.current &&        !dropdownRef.current.contains(event.target as Node) &&        inputRef.current &&        !inputRef.current.contains(event.target as Node)      ) {
        setShowDropdown(false);        setSelectedIndex(-1);      
}
    
}
;    document.addEventListener("mousedown", handleClickOutside);    return () => document.removeEventListener("mousedown", handleClickOutside);  
}
, []);  const provinces = [    {
 code: "AB", name: "Alberta" 
}
,    {
 code: "BC", name: "Colombie-Britannique" 
}
,    {
 code: "MB", name: "Manitoba" 
}
,    {
 code: "NB", name: "Nouveau-Brunswick" 
}
,    {
 code: "NL", name: "Terre-Neuve-et-Labrador" 
}
,    {
 code: "NS", name: "Nouvelle-Écosse" 
}
,    {
 code: "NT", name: "Territoires du Nord-Ouest" 
}
,    {
 code: "NU", name: "Nunavut" 
}
,    {
 code: "ON", name: "Ontario" 
}
,    {
 code: "PE", name: "Île-du-Prince-Édouard" 
}
,    {
 code: "QC", name: "Québec" 
}
,    {
 code: "SK", name: "Saskatchewan" 
}
,    {
 code: "YT", name: "Yukon" 
}
,  ];  return (    <div className="space-y-4">      {
/* Address field with custom autocomplete */
}
      <div className="relative" style={
{
 zIndex: 1 
}

}
>        <label htmlFor={
addressInputId
}
 className={
styles.label
}
>          Adresse        </label>        <input          ref={
inputRef
}
          id={
addressInputId
}
          type="text"          placeholder="Commencez à taper une adresse..."          value={
inputValue
}
          onChange={
(e) => setInputValue(e.target.value)
}
          onKeyDown={
handleKeyDown
}
          onFocus={
() => {
            if (predictions.length > 0) setShowDropdown(true);          
}

}
          required          disabled={
disabled
}
          className={
styles.input
}
        />                {
/* Dropdown with predictions */
}
        {
showDropdown && predictions.length > 0 && (          <div            ref={
dropdownRef
}
            className={
              variant === "profile"                ? "absolute z-[9999] w-full mt-1 max-h-60 overflow-auto rounded-xl border border-white/20 bg-slate-800 shadow-lg"                : "absolute z-[9999] w-full mt-1 max-h-60 overflow-auto rounded-md border border-gray-300 bg-white dark:bg-zinc-800 shadow-lg"            
}
            style={
{
 position: 'absolute' 
}

}
          >            {
predictions.map((prediction, index) => (              <div                key={
prediction.placeId
}
                className={
`px-4 py-3 cursor-pointer ${
                  index === selectedIndex                    ? variant === "profile"                      ? "bg-slate-700"                      : "bg-gray-100 dark:bg-zinc-700"                    : variant === "profile"                    ? "hover:bg-slate-700"                    : "hover:bg-gray-50 dark:hover:bg-zinc-700"                
}
 ${
                  variant === "profile"                    ? "text-slate-100"                    : "text-gray-900 dark:text-gray-100"                
}
`
}
                onClick={
() => handlePlaceSelect(prediction)
}
                onMouseEnter={
() => setSelectedIndex(index)
}
              >                <div className="font-medium">{
prediction.mainText?.text
}
</div>                <div                  className={
                    variant === "profile"                      ? "text-sm text-slate-400"                      : "text-sm text-gray-500 dark:text-gray-400"                  
}
                >                  {
prediction.secondaryText?.text
}
                </div>              </div>            ))
}
          </div>        )
}
                {
errors.address && (          <p className={
styles.error
}
>{
errors.address
}
</p>        )
}
      </div>      {
/* Manual fields */
}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">        <div>          <Input            label="Ville"            type="text"            placeholder="ex.: Montréal"            value={
city
}
            onChange={
(e) => {
              const newCity = e.target.value;              setCity(newCity);              onAddressSelect({
                address,                city: newCity,                province,                zipCode,                country,              
}
);            
}

}
            required            disabled={
disabled
}
            className={
styles.inputClass
}
          />          {
errors.city && (            <p className={
styles.error
}
>{
errors.city
}
</p>          )
}
        </div>        <div>          <Input            label="Code postal"            type="text"            placeholder="A1B 2C3"            value={
zipCode
}
            onChange={
(e) => {
              const newZipCode = e.target.value;              setZipCode(newZipCode);              onAddressSelect({
                address,                city,                province,                zipCode: newZipCode,                country,              
}
);            
}

}
            pattern="^[A-Za-z0-9\s-]+$"            title="Format canadien: A1B 2C3"            required            disabled={
disabled
}
            className={
styles.inputClass
}
          />          {
errors.zipCode && (            <p className={
styles.error
}
>{
errors.zipCode
}
</p>          )
}
        </div>      </div>      <div>        <label          htmlFor={
provinceId
}
          className={
styles.label
}
        >          Province        </label>        <select          id={
provinceId
}
          value={
province
}
          onChange={
(e) => {
            const newProvince = e.target.value;            setProvince(newProvince);            onAddressSelect({
              address,              city,              province: newProvince,              zipCode,              country,            
}
);          
}

}
          required          disabled={
disabled
}
          className={
styles.select
}
        >          <option value="">Sélectionner</option>          {
provinces.map((p) => (            <option key={
p.code
}
 value={
p.code
}
>              {
p.name
}
            </option>          ))
}
        </select>        {
errors.province && (          <p className={
styles.error
}
>{
errors.province
}
</p>        )
}
      </div>    </div>  );
}
