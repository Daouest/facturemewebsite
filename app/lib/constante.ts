
const fr = {
        ticket:"Tickets",
  hello: "Bonjour",
  home: "Accueil",
  info: "FAQs",
  users: "Utilisateurs",
  admin_section:"Séction admin",
  historicInvoices: " Historique des factures",
  sortByDate: "Date",
  sortByPaidInvoice: "Non payée",
  sortByNumber: "Numéro",
  archivedInvoices: "Factures actives",
  creationItem: "Création d'un produit",
  seeItems: "Voir mes produits",
  noData: "Aucune donnée disponible",
  noItems: "Vous n'avez aucun produit pour l'instant!",
  clientName: "Nom du client",
  factureNumber: "Numéro de facture",
  dateFacture: "Date de la facture",
  typeFacture: "Type de facture",
  description: "Description",
  price: "Prix",
  image: "Image",
  productName: "Nom du produit",
  noFacture: "Vous n'avez aucune facture pour l'instant",
  welcome: "Bienvenue",
  dashboard: "Vite fait, bien fait!",
  delete: "Supprimer",
  update: "Modifier",
  formSentWithSucces: "Formulaire envoyé avec succès.",

  // Sidebar
  invoices: "Mes factures",
  createItem: "Créer un produit",
  newInvoice: "Nouvelle facture",
  catalogue: "Mes produits",
  profile: "Profil",
  myClients: "Mes clients",
  newClient: "Nouveau client",

  // HourlyRate
  creationHourlyRate: "Ajouter un taux horaire",
  hourlyRatePage: "Mes Taux Horaire",
  hourlyRateClient: "Client",
  hourlyRateWorkPosition: "Poste de travail",
  hourlyRateRate: "Taux horaire",
  seeHourlyRates: "Retourner aux taux horaire",
  hourlyRateDetails: "Détails",
  hourlyRateReturn: "Retour",
  hourlyRateError: "Erreur pendant le chargement du taux horaire",

  // Dropdown
  dropdownTitle: "Next.js Exemple de menu déroulant",
  chooseOption: "Choisissez une option :",
  selectPlaceholder: "Sélectionnez une option",
  languageFrench: "Français",
  languageEnglish: "Anglais",

  invoice: "Facture",
  // Factures
  recentInvoices: "Vos factures récentes",
  loading: "Chargement...",
  // Nouveautés
  news: "Nouveautés",
  exportPDF: "Exporter en PDF",
  onlinePayment: "Paiement en ligne",
  clientManagement: "Mes clients",
  calendar: "Calendrier",

  today: "Aujourd'hui",

  //LANGAGE
  chooseLanguage: "choisir une langue",

  // 404 Page
  pageNotFound: "Page non trouvée",
  pageNotFoundMessage: "Cette page n'existe pas! Avez-vous le bon lien?",
  backToHome: "Retour à l'accueil",

  // Filters
  filters: "Filtres"
} as const;


const en = {
        ticket:"Tickets",
  users: "Users",

  hello: "Hi",
  home: "Home",
  info: "FAQs",
  admin_section:"Admin section",
  historicInvoices: "Invoice histories",
  sortByDate: "Sort by date",
  sortByNumber: "Sort by facture number",
  sortByPaidInvoice: "Sort by status",
  archivedInvoices: " Actives Invoices ",
  creationItem: "Creation of item",
  seeItems: "See my items",
  noData: "No data available",
  noItems: "You don't have any products yet!",
  clientName: "Client Name",
  factureNumber: "Facture Number",
  dateFacture: "Date of the facture",
  typeFacture: "Type of the facture",
  description: "Description",
  price: "Price",
  image: "Image",
  productName: "Product Name",
  noFacture: "Nothing to see here yet!",
  delete: "Delete",
  update: "Update",
  formSentWithSucces: "Form was sent with success.",

  welcome: "Welcome",
  dashboard: "Nice and easy!",

  // Sidebar
  invoices: "My invoices",
  createItem: "Create a product",
  newInvoice: "New invoice",
  catalogue: "My products",
  profile: "Profile",
  myClients: "My clients",
  newClient: "New client",

  // HourlyRate
  creationHourlyRate: "Add an hourly rate",
  hourlyRatePage: "My Hourly Rates",
  hourlyRateClient: "Client",
  hourlyRateWorkPosition: "Work position",
  hourlyRateRate: "Hourly Rate",
  seeHourlyRates: "See my hourly rates",
  hourlyRateDetails: "Details",
  hourlyRateReturn: "Return",
  hourlyRateError: "Error while loading data",

  // Dropdown
  dropdownTitle: "Next.js Select Dropdown Example",
  chooseOption: "Choose an option:",
  selectPlaceholder: "Select an option",
  languageFrench: "French",
  languageEnglish: "English",

  // Invoices
  recentInvoices: "Your recent invoices",
  loading: "Loading...",

  // News
  news: "News",
  exportPDF: "Export to PDF",
  onlinePayment: "Online payment",
  clientManagement: "My clients",
  calendar: "Calendar",

  today: "Today",

  invoice: "Invoice",
  //langage
  chooseLanguage: "Choose a language",

  // 404 Page
  pageNotFound: "Page Not Found",
  pageNotFoundMessage: "This page doesn't exist! Do you have the right link?",
  backToHome: "Back to Home",

  // Filters
  filters: "Filters"
}

type TranslationKey = keyof typeof fr;
export const translations: Record<"fr" | "en", Record<TranslationKey, string>> = {
  fr,
  en,
}


export const refreshSeconds = {
  seconds: 9000,
  staleTime: 8000
}

export const CommentsData = [
  {
    name: "Sebastin Lajoie",
    comment: "FactureMe m'a permis de mieux gérer mes factures avec efficacité.",
    profil: "/comment_avatar1.jpg",
    stars: 5,
  },
  {
    name: "Xavier Bouchard",
    comment: "L’interface est intuitive et m’a fait gagner un temps fou dans le suivi de mes paiements.",
    profil: "/comment_avatar2.jpg",
    stars: 5,
  },
  {
    name: "Jean-François Tremblay",
    comment: "Grâce à FactureMe, je peux enfin centraliser mes factures sans m’y perdre. Un vrai plus pour mon entreprise.",
    profil: "/comment_avatar3.jpg",
    stars: 4,
  },
  {
    name: "Amina El-Mansouri",
    comment: "J’apprécie les rappels automatiques et la clarté du tableau de bord. Très utile au quotidien.",
    profil: "/comment_avatar4.jpg",

    stars: 5,
  },
  {
    name: "Marc-André Gagnon",
    comment: "Un outil simple mais puissant. La gestion des factures n’a jamais été aussi fluide.",
    profil: "/default_user.png",

    stars: 5,
  }

]

export const data = [
  {
    nom: "Marie L.",
    texte: "Une application super intuitive, je l’utilise tous les jours !",
  },
  {
    nom: "Thomas B.",
    texte: "Simple, rapide et efficace. Je recommande à 100%.",
  },
  {
    nom: "Sophie K.",
    texte: "Le design est magnifique et l’expérience utilisateur est top.",
  },
  {
    nom: "Julien R.",
    texte: "Enfin une solution qui me fait gagner du temps au quotidien.",
  },
  {
    nom: "Claire D.",
    texte: "L’interface est claire et agréable, bravo à l’équipe !",
  },
  {
    nom: "Nicolas M.",
    texte: "Très pratique pour gérer mes factures sans stress.",
  },
  {
    nom: "Élodie F.",
    texte: "Un outil indispensable pour les indépendants comme moi.",
  },
  {
    nom: "Antoine G.",
    texte: "Support client réactif et fonctionnalités bien pensées.",
  },
  {
    nom: "Camille T.",
    texte: "Je ne pourrais plus m’en passer, tout est si simple.",
  },
  {
    nom: "Hugo P.",
    texte: "Une vraie révolution dans ma gestion administrative.",
  },
  {
    nom: "Laura V.",
    texte: "Chaque mise à jour apporte des améliorations utiles.",
  },
  {
    nom: "Romain C.",
    texte: "Je recommande vivement, c’est devenu mon outil préféré.",
  },
];