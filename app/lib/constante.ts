
const fr = {
  hello: "Bonjour",
  home: "Accueil",
  info: "FAQs",
  historicInvoices: " Historique des factures",
  sortByDate: "Date",
  sortByPaidInvoice: "Non payée",
  sortByNumber: "Numéro",
  archivedInvoices: "Factures actives",
  creationItem: "Création d'item",
  seeItems: "Voir mes items",
  noData: "Vous n'avez aucune facture active!",
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
  // Sidebar
  invoices: "Mes factures",
  createItem: "Créer un item",
  newInvoice: "Nouvelle facture",
  catalogue: "Mes produits",
  profile: "Profil",
  myClients: "Mes clients",
  newClient: "Nouveau client",

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
  chooseLanguage: "choisir une langue"
} as const;


const en = {
  hello: "Hi",
  home: "Home",
  info: "FAQs",
  historicInvoices: "Invoice histories",
  sortByDate: "Sort by date",
  sortByNumber: "Sort by facture number",
  sortByPaidInvoice: "Sort by status",
  archivedInvoices: " Actives Invoices ",
  creationItem: "Creation of item",
  seeItems: "See my items",
  noData: "Nothing to see here yet!",
  clientName: "Client Name",
  factureNumber: "Facture Number",
  dateFacture: "Date of the facture",
  typeFacture: "Type of the facture",
  description: "Description",
  price: "Price",
  image: "Image",
  productName: "Product Name",
  noFacture: "Nothing to see here yet!",

  welcome: "Welcome",
  dashboard: "Nice and easy!",

  // Sidebar
  invoices: "My invoices",
  createItem: "Create an item",
  newInvoice: "New invoice",
  catalogue: "My items",
  profile: "Profile",
  myClients: "My clients",
  newClient: "New client",

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
  chooseLanguage: "Choose a language"
}

type TranslationKey = keyof typeof fr;
export const translations: Record<"fr" | "en", Record<TranslationKey, string>> = {
  fr,
  en,
}


export const refreshSeconds = {
  seconds: 3600000,
  staleTime: 3600000
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