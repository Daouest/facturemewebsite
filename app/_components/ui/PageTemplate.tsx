/** * TEMPLATE FILE - Example page structure using standardized components *  * This is a reference template showing best practices for creating pages. * Copy the patterns below when creating new pages for consistent styling. *  * Replace placeholder content with your actual content and translation keys. *  * NOTE: This file is for REFERENCE ONLY. It's not meant to be imported or used directly. */"use client";// Import your icons (from lucide-react or custom)import {
 FileText, Plus 
}
 from "lucide-react";
import Card from "@/app/_components/ui/Card";
import Section from "@/app/_components/ui/Section";// import PageContainer from "@/app/_components/ui/PageContainer"; // Use if needed/** * Example page component structure * When creating a real page, add translation support: *  * import {
 useParams 
}
 from "next/navigation"; * import {
 createTranslator 
}
 from "@/app/_lib/utils/format"; * import {
 useLangageContext 
}
 from "@/app/_context/langageContext"; *  * const params = useParams(); * const lang = params?.lang as "fr" | "en"; * const {
 langage 
}
 = useLangageContext(); * const t = createTranslator(lang || langage); */export default function TemplatePage() {
  // This is a template - replace with your actual logic    return (    <div className="w-full space-y-6">      {
/* Page Title */
}
      <div className="flex items-center justify-between">        <h1 className="heading-page">Page Title</h1>                {
/* Optional: Action button */
}
        <button className="btn-primary inline-flex items-center gap-2">          <Plus className="w-4 h-4" />          Create New        </button>      </div>      {
/* Main Content Card */
}
      <Card>        <h2 className="heading-section mb-4 flex items-center gap-2">          <FileText className="w-5 h-5 text-sky-300" />          Section Title        </h2>                <p className="text-muted mb-6">          Section description goes here        </p>        {
/* Content here */
}
        <div className="space-y-4">          {
/* Your content */
}
        </div>      </Card>      {
/* Secondary Card with Gradient */
}
      <Card variant="gradient" padding="lg">        <h3 className="heading-section mb-3">          Highlighted Section        </h3>        <p className="text-slate-200">          Use gradient variant for featured or highlighted content        </p>      </Card>      {
/* Card with Sections (Form Example) */
}
      <Card>        <h2 className="heading-section mb-6">Form Title</h2>                <div className="space-y-6">          {
/* Form Section 1 */
}
          <Section            title="Basic Information"            icon={
<FileText className="w-4 h-4 text-sky-300" />
}
          >            {
/* Form fields here */
}
            <input              type="text"              className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-slate-200 placeholder-slate-400 focus:border-sky-400/50 focus:outline-none focus:ring-2 focus:ring-sky-400/20"              placeholder="Enter name"            />          </Section>          {
/* Form Section 2 */
}
          <Section            title="Additional Information"            icon={
<Plus className="w-4 h-4 text-emerald-300" />
}
            iconBgColor="bg-emerald-500/20 ring-emerald-400/30"          >            {
/* More fields */
}
            <p className="text-muted">Add more form fields here</p>          </Section>          {
/* Action Buttons */
}
          <div className="flex gap-3 justify-end pt-4">            <button className="btn-outline">              Cancel            </button>            <button className="btn-primary">              Save            </button>          </div>        </div>      </Card>      {
/* Interactive Cards Grid */
}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">        {
[1, 2, 3].map((item) => (          <Card key={
item
}
 className="card-interactive cursor-pointer">            <h3 className="font-semibold text-slate-100 mb-2">              Item {
item
}
            </h3>            <p className="text-muted text-sm">              Click to view details            </p>          </Card>        ))
}
      </div>      {
/* Loading State Example */
}
      {
/* <CardLoading message={
t("loading")
}
 /> */
}
      {
/* Error State Example */
}
      {
/* <CardError message={
t("errorOccurred")
}
 /> */
}
    </div>  );
}
/** * UTILITY CLASS REFERENCE: *  * Cards: * - glass-card              // Standard glass card * - glass-card-gradient     // Card with gradient * - card-interactive        // Interactive card with hover *  * Layout: * - page-bg                 // Page background gradient * - section-container       // Form section styling *  * Typography: * - heading-page            // Page title (3xl) * - heading-section         // Section title (xl) * - text-muted              // Muted text *  * Buttons: * - btn-primary             // Primary button * - btn-outline             // Secondary button *  * Icons: * - icon-badge              // Icon container * - icon-badge-sky          // Sky theme * - icon-badge-emerald      // Emerald theme * - icon-badge-violet       // Violet theme * - icon-badge-amber        // Amber theme */