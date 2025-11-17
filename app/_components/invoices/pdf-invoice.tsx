"use client";

import React, { useEffect, useState, useRef, useMemo } from "react";
import {
  PDFDownloadLink,
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
  pdf,
} from "@react-pdf/renderer";
import { Lightbulb } from "lucide-react";

const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#F1F5F9", // slate-100 for subtle background
    padding: 30,
    fontSize: 10,
  },
  // Decorative header bar with brand color
  headerAccent: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 8,
    backgroundColor: "#0EA5E9", // sky-500 brand accent
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 15,
    marginTop: 15,
    borderBottomWidth: 2,
    borderBottomColor: "#0EA5E9", // sky-500 brand accent
    borderBottomStyle: "solid",
    paddingBottom: 10,
  },
  headerLeft: {
    flexDirection: "column",
  },
  headerRight: {
    flexDirection: "column",
    alignItems: "flex-end",
    backgroundColor: "#E0F2FE", // sky-100 subtle highlight
    padding: 8,
  },
  logo: {
    width: 60,
    height: 60,
    objectFit: "contain",
    marginBottom: 5,
  },  title: {
     fontSize: 22,     marginBottom: 5,    color: "#0F172A", // slate-900 - professional dark    letterSpacing: 0.5,  
}
,  section: {
     margin: 5,     padding: 10,    backgroundColor: "#FFFFFF",    borderWidth: 1,    borderColor: "#CBD5E1", // slate-300    borderStyle: "solid",  
}
,  addressBlock: {
     marginBottom: 10,    padding: 8,    backgroundColor: "#FFFFFF",    borderLeftWidth: 3,    borderLeftColor: "#0EA5E9", // sky-500 accent bar    borderLeftStyle: "solid",  
}
,  addressTitle: {
     fontSize: 12,     marginBottom: 4,    color: "#1E293B", // slate-800  
}
,  boldText: {
     fontSize: 11,    color: "#0EA5E9", // sky-500 for labels    marginBottom: 4,  
}
,  label: {
    fontSize: 9,    color: "#64748B", // slate-500 for labels    marginBottom: 2,  
}
,  table: {
     marginTop: 10,    marginBottom: 10,  
}
,  tableRow: {
    flexDirection: "row",    paddingTop: 6,    paddingBottom: 6,    paddingLeft: 8,    paddingRight: 8,    backgroundColor: "#FFFFFF",    marginBottom: 2,    borderLeftWidth: 2,    borderLeftColor: "#E0F2FE", // sky-100 subtle accent    borderLeftStyle: "solid",  
}
,  tableHeader: {
     flexDirection: "row",    backgroundColor: "#0EA5E9", // sky-500 brand color    marginBottom: 5,    paddingTop: 8,    paddingBottom: 8,    paddingLeft: 8,    paddingRight: 8,    borderLeftWidth: 0,  
}
,  tableHeaderText: {
     fontSize: 10,    color: "#FFFFFF", // white text on brand color    letterSpacing: 0.3,  
}
,  tableCell: {
     flex: 1,     padding: 2,     fontSize: 9,    color: "#334155", // slate-700  
}
,  summary: {
     marginTop: 15,     alignItems: "flex-end",    padding: 12,    backgroundColor: "#FFFFFF",    borderWidth: 2,    borderColor: "#E0F2FE", // sky-100    borderStyle: "solid",  
}
,  summaryRow: {
    flexDirection: "row",    justifyContent: "space-between",    width: 200,    marginBottom: 5,    color: "#475569", // slate-600  
}
,  totalRow: {
    flexDirection: "row",    justifyContent: "space-between",    width: 200,    borderTopWidth: 2,    borderTopColor: "#0EA5E9", // sky-500 accent for emphasis    borderTopStyle: "solid",    paddingTop: 8,    marginTop: 8,    backgroundColor: "#E0F2FE", // sky-100 highlight    padding: 8,  
}
,  totalText: {
    fontSize: 13,    color: "#0C4A6E", // sky-900 - strong emphasis  
}
,  footer: {
    position: "absolute",    bottom: 20,    left: 30,    right: 30,    textAlign: "center",    fontSize: 8,    color: "#64748B", // slate-500    borderTopWidth: 2,    borderTopColor: "#0EA5E9", // sky-500 brand accent    borderTopStyle: "solid",    paddingTop: 8,    flexDirection: "row",    justifyContent: "space-between",    alignItems: "center",  
}
,  footerText: {
    fontSize: 8,    color: "#64748B",  
}
,  pageNumber: {
    fontSize: 8,    color: "#64748B",  
}
,  brandWatermark: {
    position: "absolute",    bottom: 50,    right: 30,    fontSize: 7,    color: "#CBD5E1", // slate-300 subtle    opacity: 0.5,  
}
,
}
);interface InvoiceData {
  user?: {
    name?: string;    address?: string;    city?: string;    province?: string;    zipCode?: string;    logo?: string;  
}
;  client?: {
    name?: string;    address?: string;    city?: string;    province?: string;    zipCode?: string;  
}
;  facture?: {
    date?: string;    factureNumber?: string;    colonnesHoraire?: Array<{
      workPosition?: string;      hourlyRate?: number;      totalHours?: number;      total?: number;    
}
>;    colonnesUnitaires?: Array<{
      productName?: string;      description?: string;      quantity?: number;      pricePerUnit?: number;      total?: number;    
}
>;    sousTotal?: number;    taxes?: Array<{
 name?: string; rate?: number; amount?: number 
}
>;    taxesNumbers?: Array<{
 taxName?: string; taxNumber?: string 
}
>;    total?: number;  
}
;
}
interface PDFInvoiceProps {
  invoiceId: number;  language?: "fr" | "en";
}
async function fetchInvoiceData(factureId: number): Promise<InvoiceData> {
  // Use relative URLs so client will send cookies for the same origin  if (factureId !== -1) {
    await fetch("/api/set-facture", {
      method: "POST",      headers: {
 "Content-Type": "application/json" 
}
,      credentials: "include",      body: JSON.stringify({
 factureId 
}
),    
}
);  
}
  const resp = await fetch("/api/previsualisation", {
    method: "GET",    credentials: "include",  
}
);  if (!resp.ok) {
    const text = await resp.text().catch(() => "");    throw new Error(`Failed to fetch previsualisation: ${
resp.status
}
 ${
text
}
`);  
}
  return (await resp.json()) as InvoiceData;
}
const calculateTotalWithTaxes = (  sousTotal = 0,  taxes: Array<{
 amount?: number 
}
> = []) => {
  const taxAmount = taxes.reduce((sum, tax) => sum + (tax.amount || 0), 0);  return sousTotal + taxAmount;
}
;
const InvoiceDocument = ({
   invoiceData,  translations
}
: {
   invoiceData: InvoiceData;  translations: {
    invoiceTitle: string;    from: string;    to: string;    hourlyServices: string;    position: string;    ratePerHour: string;    hours: string;    total: string;    productsServices: string;    product: string;    description: string;    quantity: string;    unitPrice: string;    subtotal: string;    footerText: string;  
}
;
}
) => (  <Document>    <Page size="A4" style={
styles.page
}
>      {
/* Decorative top bar */
}
      <View style={
styles.headerAccent
}
 fixed />            <View style={
styles.header
}
>        <View style={
styles.headerLeft
}
>          {
invoiceData.user?.logo && (            <Image              src={
invoiceData.user.logo
}
              style={
styles.logo
}
            />          )
}
          <Text style={
styles.title
}
>{
translations.invoiceTitle
}
</Text>        </View>        <View style={
styles.headerRight
}
>          <Text style={
{
 fontSize: 9, color: "#0C4A6E" 
}

}
>No: {
invoiceData.facture?.factureNumber
}
</Text>          <Text style={
{
 fontSize: 9, color: "#475569" 
}

}
>Date: {
invoiceData.facture?.date
}
</Text>        </View>      </View>      {
/* From and To sections side by side */
}
      <View style={
{
 flexDirection: "row", gap: 10, marginBottom: 10 
}

}
>        {
invoiceData.user && (          <View style={
[styles.addressBlock, {
 flex: 1 
}
]
}
>            <Text style={
styles.boldText
}
>{
translations.from
}
</Text>            <Text style={
{
 fontSize: 10, color: "#334155" 
}

}
>{
invoiceData.user.name
}
</Text>            <Text style={
{
 fontSize: 9, color: "#64748B" 
}

}
>{
invoiceData.user.address
}
</Text>            <Text style={
{
 fontSize: 9, color: "#64748B" 
}

}
>              {
invoiceData.user.city
}
, {
invoiceData.user.province
}
{
" "
}
              {
invoiceData.user.zipCode
}
            </Text>            {
invoiceData.facture?.taxesNumbers?.map((tax, i) => (              <Text key={
i
}
 style={
{
 fontSize: 8, color: "#64748B" 
}

}
>                {
tax.taxName
}
: {
tax.taxNumber
}
              </Text>            ))
}
          </View>        )
}
        {
invoiceData.client && (          <View style={
[styles.addressBlock, {
 flex: 1 
}
]
}
>            <Text style={
styles.boldText
}
>{
translations.to
}
</Text>            <Text style={
{
 fontSize: 10, color: "#334155" 
}

}
>{
invoiceData.client.name
}
</Text>            <Text style={
{
 fontSize: 9, color: "#64748B" 
}

}
>{
invoiceData.client.address
}
</Text>            <Text style={
{
 fontSize: 9, color: "#64748B" 
}

}
>              {
invoiceData.client.city
}
, {
invoiceData.client.province
}
{
" "
}
              {
invoiceData.client.zipCode
}
            </Text>          </View>        )
}
      </View>      {
invoiceData.facture?.colonnesHoraire &&        invoiceData.facture.colonnesHoraire.length > 0 && (          <View style={
styles.table
}
>            <Text style={
[styles.boldText, {
 marginBottom: 6, fontSize: 12 
}
]
}
>              {
translations.hourlyServices
}
            </Text>            <View style={
[styles.tableRow, styles.tableHeader]
}
>              <Text style={
[styles.tableCell, styles.tableHeaderText]
}
>{
translations.position
}
</Text>              <Text style={
[styles.tableCell, styles.tableHeaderText]
}
>{
translations.ratePerHour
}
</Text>              <Text style={
[styles.tableCell, styles.tableHeaderText]
}
>{
translations.hours
}
</Text>              <Text style={
[styles.tableCell, styles.tableHeaderText]
}
>{
translations.total
}
</Text>            </View>            {
invoiceData.facture.colonnesHoraire.map((item, idx) => (              <View key={
idx
}
 style={
styles.tableRow
}
>                <Text style={
styles.tableCell
}
>{
item.workPosition
}
</Text>                <Text style={
styles.tableCell
}
>                  ${
(item.hourlyRate ?? 0).toFixed(2)
}
                </Text>                <Text style={
styles.tableCell
}
>{
item.totalHours
}
</Text>                <Text style={
styles.tableCell
}
>                  ${
(item.total ?? 0).toFixed(2)
}
                </Text>              </View>            ))
}
          </View>        )
}
      {
invoiceData.facture?.colonnesUnitaires &&        invoiceData.facture.colonnesUnitaires.length > 0 && (          <View style={
styles.table
}
>            <Text style={
[styles.boldText, {
 marginBottom: 6, fontSize: 12 
}
]
}
>              {
translations.productsServices
}
            </Text>            <View style={
[styles.tableRow, styles.tableHeader]
}
>              <Text style={
[styles.tableCell, styles.tableHeaderText]
}
>{
translations.product
}
</Text>              <Text style={
[styles.tableCell, styles.tableHeaderText]
}
>{
translations.description
}
</Text>              <Text style={
[styles.tableCell, styles.tableHeaderText]
}
>{
translations.quantity
}
</Text>              <Text style={
[styles.tableCell, styles.tableHeaderText]
}
>{
translations.unitPrice
}
</Text>              <Text style={
[styles.tableCell, styles.tableHeaderText]
}
>{
translations.total
}
</Text>            </View>            {
invoiceData.facture.colonnesUnitaires.map((item, idx) => (              <View key={
idx
}
 style={
styles.tableRow
}
>                <Text style={
styles.tableCell
}
>{
item.productName
}
</Text>                <Text style={
styles.tableCell
}
>{
item.description
}
</Text>                <Text style={
styles.tableCell
}
>{
item.quantity
}
</Text>                <Text style={
styles.tableCell
}
>                  ${
(item.pricePerUnit ?? 0).toFixed(2)
}
                </Text>                <Text style={
styles.tableCell
}
>                  ${
(item.total ?? 0).toFixed(2)
}
                </Text>              </View>            ))
}
          </View>        )
}
      <View style={
styles.summary
}
>        <View style={
styles.summaryRow
}
>          <Text>{
translations.subtotal
}
:</Text>          <Text>${
(invoiceData.facture?.sousTotal ?? 0).toFixed(2)
}
</Text>        </View>        {
invoiceData.facture?.taxes?.map((tax, idx) => (          <View key={
idx
}
 style={
styles.summaryRow
}
>            <Text>              {
tax.name
}
 ({
tax.rate
}
%):            </Text>            <Text>${
(tax.amount ?? 0).toFixed(2)
}
</Text>          </View>        ))
}
        <View style={
styles.totalRow
}
>          <Text style={
styles.totalText
}
>{
translations.total
}
:</Text>          <Text style={
styles.totalText
}
>            $            {
calculateTotalWithTaxes(              invoiceData.facture?.sousTotal ?? 0,              invoiceData.facture?.taxes ?? []            ).toFixed(2)
}
          </Text>        </View>      </View>      {
/* Footer with page numbers */
}
      <View style={
styles.footer
}
 fixed>        <Text style={
styles.footerText
}
>{
translations.footerText
}
</Text>        <Text           style={
styles.pageNumber
}
          render={
({
 pageNumber, totalPages 
}
) => `${
pageNumber
}
 / ${
totalPages
}
`
      </View>
    </Page>
  </Document>
);

export default function PDFInvoice({
  invoiceId,
  language = "fr",
}: PDFInvoiceProps) {
  const [invoiceData, setInvoiceData] = useState<InvoiceData | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(true);
  const [showDownloadHelp, setShowDownloadHelp] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  // Translations based on language (memoized)
  const translations = useMemo(
    () => ({
      invoiceTitle: language === "fr" ? "FACTURE" : "INVOICE",
      from: language === "fr" ? "De" : "From",
      to: language === "fr" ? "À" : "To",
      hourlyServices: language === "fr" ? "Services horaires" : "Hourly Services",
      position: language === "fr" ? "Position" : "Position",
      ratePerHour: language === "fr" ? "Taux/h" : "Rate/h",
      hours: language === "fr" ? "Heures" : "Hours",
      total: language === "fr" ? "Total" : "Total",
      productsServices:
        language === "fr" ? "Produits/Services" : "Products/Services",
      product: language === "fr" ? "Produit" : "Product",
      description: language === "fr" ? "Description" : "Description",
      quantity: language === "fr" ? "Qté" : "Qty",
      unitPrice: language === "fr" ? "Prix unit." : "Unit Price",
      subtotal: language === "fr" ? "Sous-total" : "Subtotal",
      footerText:
        language === "fr"
          ? "Facture générée par FactureMe"
          : "Invoice generated by FactureMe",
    }),
    [language]
  );

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        setIsGenerating(true);
        const data = await fetchInvoiceData(invoiceId);
        if (!mounted) return;
        setInvoiceData(data);
        // generate blob
        const blob = await pdf(
          <InvoiceDocument invoiceData={data} translations={translations} />
        ).toBlob();
        if (!mounted) return;
        const url = URL.createObjectURL(blob);
        setPdfUrl(url);
      } catch (err: any) {
        console.error(err);
        setError(
          err?.message ?? "Erreur lors de la récupération de la facture"
        );
      } finally {
        if (mounted) setIsGenerating(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [invoiceId, translations]);

  const handlePrint = () => {
    if (iframeRef.current) {
      try {
        const iframeWindow = iframeRef.current.contentWindow;
        if (iframeWindow) {
          iframeWindow.print();
          return;
        }
      } catch (err) {
        // ignore and fallback
      }
    }
    if (pdfUrl) {
      const w = window.open(pdfUrl, "_blank");
      if (w) {
        w.onload = () => w.print();
      }
    }
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "p") {
        e.preventDefault();
        e.stopPropagation();
        handlePrint();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [pdfUrl]);

  useEffect(() => {
    if (pdfUrl && !isGenerating) {
      setTimeout(() => handlePrint(), 1200);
    }
  }, [pdfUrl, isGenerating]);

  if (error) {
    return (
      <div style={{ padding: 20, color: "red" }}>Erreur: {error}</div>
    );
  }

  return (    <div style={
{
       width: "100vw",       height: "100vh",       position: "relative",      background: "linear-gradient(to bottom right, #0f172a, #1e293b, #0f172a)",    
}

}
>      {
!isGenerating && invoiceData && (        <>          {
/* Download, help, and back buttons - bottom */
}
          <div            style={
{
              position: "absolute",              bottom: 20,              left: 20,              right: 20,              zIndex: 1000,              display: "flex",              justifyContent: "space-between",              alignItems: "center",            
}

}
          >            {
/* Back button - bottom left */
}
            <button              onClick={
() => window.history.back()
}
              style={
{
                padding: "10px 20px",                backgroundColor: "rgba(255, 255, 255, 0.05)",                color: "#e2e8f0",                border: "1px solid rgba(255, 255, 255, 0.1)",                borderRadius: "8px",                fontSize: "14px",                fontWeight: "500",                cursor: "pointer",                display: "flex",                alignItems: "center",                gap: "8px",                transition: "all 0.2s",                backdropFilter: "blur(8px)",              
}

}
              onMouseEnter={
(e) => {
                e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.1)";                e.currentTarget.style.borderColor = "#0ea5e9";              
}

}
              onMouseLeave={
(e) => {
                e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.05)";                e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.1)";              
}

}
            >              <span>←</span>              <span>{
language === "fr" ? "Retour" : "Back"
}
</span>            </button>            {
/* Download and help buttons - bottom right */
}
            <div              style={
{
                display: "flex",                gap: "10px",                alignItems: "center",              
}

}
            >              <div                style={
{
                  position: "relative",                  display: "flex",                  alignItems: "center",                  gap: "8px",                
}

}
              >              <PDFDownloadLink                document={
<InvoiceDocument invoiceData={
invoiceData
}
 translations={
translations
}
 />
}
                fileName={
`facture-${
                  invoiceData.facture?.factureNumber || "invoice"                
}
.pdf`
}
                style={
{
                  padding: "12px 24px",                  backgroundColor: "#0ea5e9",                  color: "white",                  textDecoration: "none",                  borderRadius: "8px",                  fontSize: "14px",                  fontWeight: "600",                  display: "inline-flex",                  alignItems: "center",                  gap: "8px",                  border: "1px solid rgba(255, 255, 255, 0.2)",                  boxShadow: "0 4px 12px rgba(14, 165, 233, 0.3)",                  transition: "all 0.2s",                
}

}
                onMouseEnter={
(e: any) => {
                  e.target.style.backgroundColor = "#38bdf8";                  e.target.style.transform = "translateY(-2px)";                  e.target.style.boxShadow = "0 6px 16px rgba(14, 165, 233, 0.4)";                
}

}
                onMouseLeave={
(e: any) => {
                  e.target.style.backgroundColor = "#0ea5e9";                  e.target.style.transform = "translateY(0)";                  e.target.style.boxShadow = "0 4px 12px rgba(14, 165, 233, 0.3)";                
}

}
              >                {
({
 loading 
}
) =>                  loading ? (                    <>                      <span>⏳</span>                      <span>{
language === "fr" ? "Génération..." : "Generating..."
}
</span>                    </>                  ) : (                    <>                      <span>📥</span>                      <span>{
language === "fr" ? "Télécharger" : "Download"
}
</span>                    </>                  )                
}
              </PDFDownloadLink>              <button                onClick={
() => setShowDownloadHelp(!showDownloadHelp)
}
                style={
{
                  background: "rgba(255, 255, 255, 0.05)",                  border: "1px solid rgba(255, 255, 255, 0.1)",                  borderRadius: "50%",                  width: 32,                  height: 32,                  color: "#94a3b8",                  fontSize: 14,                  cursor: "pointer",                  backdropFilter: "blur(8px)",                  transition: "all 0.2s",                
}

}
                onMouseEnter={
(e) => {
                  e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.1)";                  e.currentTarget.style.borderColor = "#0ea5e9";                  e.currentTarget.style.color = "#0ea5e9";                
}

}
                onMouseLeave={
(e) => {
                  e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.05)";                  e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.1)";                  e.currentTarget.style.color = "#94a3b8";                
}

}
                title={
language === "fr" ? "Aide pour le téléchargement" : "Download help"
}
              >                ?              </button>              {
showDownloadHelp && (                <div                  style={
{
                    position: "absolute",                    bottom: "100%",                    right: 0,                    marginBottom: 10,                    backgroundColor: "rgba(30, 41, 59, 0.95)",                    border: "1px solid rgba(255, 255, 255, 0.1)",                    borderRadius: 12,                    padding: 20,                    width: 320,                    boxShadow: "0 10px 30px rgba(0, 0, 0, 0.6)",                    fontSize: 13,                    zIndex: 1001,                    backdropFilter: "blur(12px)",                    color: "#e2e8f0",                  
}

}
                >                  <button                    onClick={
() => setShowDownloadHelp(false)
}
                    style={
{
                      position: "absolute",                      top: 12,                      right: 12,                      background: "none",                      border: "none",                      fontSize: 20,                      cursor: "pointer",                      color: "#94a3b8",                      transition: "color 0.2s",                    
}

}
                    onMouseEnter={
(e) => {
                      e.currentTarget.style.color = "#0ea5e9";                    
}

}
                    onMouseLeave={
(e) => {
                      e.currentTarget.style.color = "#94a3b8";                    
}

}
                  >                    ×                  </button>                  <div                    style={
{
                      marginBottom: 12,                      display: "flex",                      alignItems: "center",                      gap: "8px",                    
}

}
                  >                    <Lightbulb                      style={
{
 width: 20, height: 20, color: "#0ea5e9" 
}

}
                    />                    <strong style={
{
 color: "#0ea5e9" 
}

}
>                      {
language === "fr" ? "Choisir l'emplacement de sauvegarde" : "Choose save location"
}
                    </strong>                  </div>                  <div style={
{
 color: "#cbd5e1", lineHeight: "1.5" 
}

}
>                    {
language === "fr"                       ? "Par défaut, le fichier sera téléchargé dans votre dossier Téléchargements."                      : "By default, the file will be downloaded to your Downloads folder."
}
                  </div>                </div>              )
}
            </div>          </div>        </div>        </>      )
}
      {
pdfUrl && (        <iframe          ref={
iframeRef
}
          src={
pdfUrl
}
          style={
{
 width: "100%", height: "100%", border: "none" 
}

}
          title="Invoice PDF"        />      )
}
      {
isGenerating && (        <div          style={
{
            position: "absolute",            top: "50%",            left: "50%",            transform: "translate(-50%, -50%)",            backgroundColor: "rgba(15, 23, 42, 0.95)",            color: "#e2e8f0",            padding: 40,            borderRadius: 16,            zIndex: 2000,            textAlign: "center",            fontSize: 16,            border: "1px solid rgba(14, 165, 233, 0.3)",            boxShadow: "0 20px 60px rgba(0, 0, 0, 0.8)",            backdropFilter: "blur(12px)",          
}

}
        >          <div style={
{
 marginBottom: 16, fontSize: 32 
}

}
>⏳</div>          <div style={
{
 fontSize: 18, fontWeight: 600, marginBottom: 8, color: "#0ea5e9" 
}

}
>            {
language === "fr" ? "Génération du PDF..." : "Generating PDF..."
}
          </div>          <div style={
{
 fontSize: 13, opacity: 0.7, color: "#cbd5e1" 
}

}
>            {
language === "fr"               ? "L'impression s'ouvrira automatiquement"              : "Print dialog will open automatically"
}
          </div>        </div>      )
}
    </div>  );
}
