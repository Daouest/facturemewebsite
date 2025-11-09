"use client";

import React, { useEffect, useState, useRef } from "react";
import {
  PDFDownloadLink,
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  pdf,
} from "@react-pdf/renderer";
import { Lightbulb } from "lucide-react";

const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#FFFFFF",
    padding: 30,
    fontSize: 12,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
    borderBottom: 1,
    borderBottomColor: "#000000",
    paddingBottom: 10,
  },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 10 },
  section: { margin: 10, padding: 10 },
  addressBlock: { marginBottom: 15 },
  addressTitle: { fontSize: 14, fontWeight: "bold", marginBottom: 5 },
  table: { marginVertical: 10 },
  tableRow: {
    flexDirection: "row",
    borderBottom: 1,
    borderBottomColor: "#CCCCCC",
    paddingVertical: 5,
  },
  tableHeader: { backgroundColor: "#F0F0F0", fontWeight: "bold" },
  tableCell: { flex: 1, padding: 3, fontSize: 10 },
  summary: { marginTop: 20, alignItems: "flex-end" },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: 200,
    marginBottom: 5,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: 200,
    borderTop: 1,
    borderTopColor: "#000000",
    paddingTop: 5,
    fontWeight: "bold",
  },
});

interface InvoiceData {
  user?: {
    name?: string;
    address?: string;
    city?: string;
    province?: string;
    zipCode?: string;
  };
  client?: {
    name?: string;
    address?: string;
    city?: string;
    province?: string;
    zipCode?: string;
  };
  facture?: {
    date?: string;
    time?: string;
    factureNumber?: string;
    colonnesHoraire?: Array<{
      workPosition?: string;
      hourlyRate?: number;
      totalHours?: number;
      total?: number;
    }>;
    colonnesUnitaires?: Array<{
      productName?: string;
      description?: string;
      quantity?: number;
      pricePerUnit?: number;
      total?: number;
    }>;
    sousTotal?: number;
    taxes?: Array<{ name?: string; rate?: number; amount?: number }>;
    taxesNumbers?: Array<{ taxName?: string; taxNumber?: string }>;
    total?: number;
  };
}

interface PDFInvoiceProps {
  invoiceId: number;
}

async function fetchInvoiceData(factureId: number): Promise<InvoiceData> {
  // Use relative URLs so client will send cookies for the same origin
  if (factureId !== -1) {
    await fetch("/api/set-facture", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ factureId }),
    });
  }

  const resp = await fetch("/api/previsualisation", {
    method: "GET",
    credentials: "include",
  });
  if (!resp.ok) {
    const text = await resp.text().catch(() => "");
    throw new Error(`Failed to fetch previsualisation: ${resp.status} ${text}`);
  }
  return (await resp.json()) as InvoiceData;
}

const calculateTotalWithTaxes = (
  sousTotal = 0,
  taxes: Array<{ amount?: number }> = []
) => {
  const taxAmount = taxes.reduce((sum, tax) => sum + (tax.amount || 0), 0);
  return sousTotal + taxAmount;
};

const InvoiceDocument = ({ invoiceData }: { invoiceData: InvoiceData }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.title}>FACTURE</Text>
        <View>
          <Text>No: {invoiceData.facture?.factureNumber}</Text>
          <Text>Date: {invoiceData.facture?.date}</Text>
          <Text>Heure: {invoiceData.facture?.time}</Text>
        </View>
      </View>

      {invoiceData.user && (
        <View style={styles.addressBlock}>
          <Text style={styles.addressTitle}>De:</Text>
          <Text>{invoiceData.user.name}</Text>
          <Text>{invoiceData.user.address}</Text>
          <Text>
            {invoiceData.user.city}, {invoiceData.user.province}{" "}
            {invoiceData.user.zipCode}
          </Text>
          {invoiceData.facture?.taxesNumbers?.map((tax, i) => (
            <Text key={i}>
              {tax.taxName}: {tax.taxNumber}
            </Text>
          ))}
        </View>
      )}

      {invoiceData.client && (
        <View style={styles.addressBlock}>
          <Text style={styles.addressTitle}>À:</Text>
          <Text>{invoiceData.client.name}</Text>
          <Text>{invoiceData.client.address}</Text>
          <Text>
            {invoiceData.client.city}, {invoiceData.client.province}{" "}
            {invoiceData.client.zipCode}
          </Text>
        </View>
      )}

      {invoiceData.facture?.colonnesHoraire &&
        invoiceData.facture.colonnesHoraire.length > 0 && (
          <View style={styles.table}>
            <Text style={[styles.addressTitle, { marginBottom: 10 }]}>
              Services horaires:
            </Text>
            <View style={[styles.tableRow, styles.tableHeader]}>
              <Text style={styles.tableCell}>Position</Text>
              <Text style={styles.tableCell}>Taux/h</Text>
              <Text style={styles.tableCell}>Heures</Text>
              <Text style={styles.tableCell}>Total</Text>
            </View>
            {invoiceData.facture.colonnesHoraire.map((item, idx) => (
              <View key={idx} style={styles.tableRow}>
                <Text style={styles.tableCell}>{item.workPosition}</Text>
                <Text style={styles.tableCell}>
                  ${(item.hourlyRate ?? 0).toFixed(2)}
                </Text>
                <Text style={styles.tableCell}>{item.totalHours}</Text>
                <Text style={styles.tableCell}>
                  ${(item.total ?? 0).toFixed(2)}
                </Text>
              </View>
            ))}
          </View>
        )}

      {invoiceData.facture?.colonnesUnitaires &&
        invoiceData.facture.colonnesUnitaires.length > 0 && (
          <View style={styles.table}>
            <Text style={[styles.addressTitle, { marginBottom: 10 }]}>
              Produits/Services:
            </Text>
            <View style={[styles.tableRow, styles.tableHeader]}>
              <Text style={styles.tableCell}>Produit</Text>
              <Text style={styles.tableCell}>Description</Text>
              <Text style={styles.tableCell}>Qté</Text>
              <Text style={styles.tableCell}>Prix unit.</Text>
              <Text style={styles.tableCell}>Total</Text>
            </View>
            {invoiceData.facture.colonnesUnitaires.map((item, idx) => (
              <View key={idx} style={styles.tableRow}>
                <Text style={styles.tableCell}>{item.productName}</Text>
                <Text style={styles.tableCell}>{item.description}</Text>
                <Text style={styles.tableCell}>{item.quantity}</Text>
                <Text style={styles.tableCell}>
                  ${(item.pricePerUnit ?? 0).toFixed(2)}
                </Text>
                <Text style={styles.tableCell}>
                  ${(item.total ?? 0).toFixed(2)}
                </Text>
              </View>
            ))}
          </View>
        )}

      <View style={styles.summary}>
        <View style={styles.summaryRow}>
          <Text>Sous-total:</Text>
          <Text>${(invoiceData.facture?.sousTotal ?? 0).toFixed(2)}</Text>
        </View>

        {invoiceData.facture?.taxes?.map((tax, idx) => (
          <View key={idx} style={styles.summaryRow}>
            <Text>
              {tax.name} ({tax.rate}%):
            </Text>
            <Text>${(tax.amount ?? 0).toFixed(2)}</Text>
          </View>
        ))}

        <View style={styles.totalRow}>
          <Text>Total:</Text>
          <Text>
            $
            {calculateTotalWithTaxes(
              invoiceData.facture?.sousTotal ?? 0,
              invoiceData.facture?.taxes ?? []
            ).toFixed(2)}
          </Text>
        </View>
      </View>
    </Page>
  </Document>
);

export default function PDFInvoice({ invoiceId }: PDFInvoiceProps) {
  const [invoiceData, setInvoiceData] = useState<InvoiceData | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(true);
  const [showDownloadHelp, setShowDownloadHelp] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        setIsGenerating(true);
        const data = await fetchInvoiceData(invoiceId);
        if (!mounted) return;
        setInvoiceData(data);

        // generate blob
        const blob = await pdf(<InvoiceDocument invoiceData={data} />).toBlob();
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
  }, [invoiceId]);

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
    return <div style={{ padding: 20, color: "red" }}>Erreur: {error}</div>;
  }

  return (
    <div style={{ width: "100vw", height: "100vh", position: "relative" }}>
      {!isGenerating && invoiceData && (
        <div
          style={{
            position: "absolute",
            bottom: 20,
            right: 20,
            zIndex: 1000,
            display: "flex",
            gap: "10px",
            alignItems: "center",
          }}
        >
          <div
            style={{
              position: "relative",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <PDFDownloadLink
              document={<InvoiceDocument invoiceData={invoiceData} />}
              fileName={`facture-${
                invoiceData.facture?.factureNumber || "invoice"
              }.pdf`}
              style={{
                padding: "10px 20px",
                backgroundColor: "#007bff",
                color: "white",
                textDecoration: "none",
                borderRadius: "5px",
                fontSize: "14px",
                fontWeight: "bold",
                display: "inline-block",
              }}
            >
              {({ loading }) =>
                loading ? "⏳ Génération..." : "📥 Télécharger"
              }
            </PDFDownloadLink>

            <button
              onClick={() => setShowDownloadHelp(!showDownloadHelp)}
              style={{
                background: "#6c757d",
                border: "none",
                borderRadius: "50%",
                width: 24,
                height: 24,
                color: "white",
                fontSize: 12,
                cursor: "pointer",
              }}
              title="Aide pour le téléchargement"
            >
              ?
            </button>

            {showDownloadHelp && (
              <div
                style={{
                  position: "absolute",
                  bottom: "100%",
                  right: 0,
                  marginBottom: 10,
                  backgroundColor: "white",
                  border: "1px solid #ddd",
                  borderRadius: 8,
                  padding: 16,
                  width: 320,
                  boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                  fontSize: 13,
                  zIndex: 1001,
                }}
              >
                <button
                  onClick={() => setShowDownloadHelp(false)}
                  style={{
                    position: "absolute",
                    top: 8,
                    right: 8,
                    background: "none",
                    border: "none",
                    fontSize: 16,
                    cursor: "pointer",
                    color: "#666",
                  }}
                >
                  ×
                </button>
                <div
                  style={{
                    marginBottom: 12,
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <Lightbulb
                    style={{ width: 20, height: 20, color: "#2c5aa0" }}
                  />
                  <strong style={{ color: "#2c5aa0" }}>
                    Choisir l'emplacement de sauvegarde
                  </strong>
                </div>
                <div style={{ marginBottom: 8, color: "#555" }}>
                  Par défaut, le fichier sera téléchargé dans votre dossier
                  Téléchargements.
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {pdfUrl && (
        <iframe
          ref={iframeRef}
          src={pdfUrl}
          style={{ width: "100%", height: "100%", border: "none" }}
          title="Invoice PDF"
        />
      )}

      {isGenerating && (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            backgroundColor: "rgba(0,0,0,0.9)",
            color: "white",
            padding: 30,
            borderRadius: 10,
            zIndex: 2000,
            textAlign: "center",
            fontSize: 16,
          }}
        >
          <div style={{ marginBottom: 10 }}>⏳</div>
          <div>Génération du PDF...</div>
          <div style={{ fontSize: 12, marginTop: 10, opacity: 0.8 }}>
            L'impression s'ouvrira automatiquement
          </div>
        </div>
      )}
    </div>
  );
}
