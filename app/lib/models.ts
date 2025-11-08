import 'server-only'
import mongoose, { Schema, Model, InferSchemaType } from "mongoose";

function getModel<T>(name: string, schema: Schema<T>): Model<T> {
    return (mongoose.models?.[name] as Model<T>) || mongoose.model<T>(name, schema)
}

const objetFactureSchema = new Schema({
    idFacture: { type: Number, required: [true, "Facture ID is required"] },
    idColumn: { type: Number, required: [true, "Column ID is required"] },
    productName: { type: String, required: [true, "Product name is required"] },
    description: { type: String, required: [true, "Description is required"] },
    quantity: { type: Number, required: [true, "Quantity is required"], min: [1, "Quantity must be at least 1"] },
    pricePerUnit: { type: Number, required: [true, "Price per unit is required"] },
    productPhoto: { type: String, required: [true, "Product photo is required"] }
}, { collection: 'facturesObjets' });

export const DbObjetFacture = getModel('ObjetFacture', objetFactureSchema);

const TauxHoraireFactureSchema = new Schema({
    idFacture: { type: Number, required: [true, "Facture ID is required"] },
    idColumn: { type: Number, required: [true, "Column ID is required"] },
    workPosition: { type: String, required: [true, "Work position is required"] },
    hourlyRate: { type: Number, required: [true, "Hourly rate is required"] },
    workingDate: { type: Date, required: [true, "Working date is required"] },
    startTime: { type: Date, required: [true, "Start time is required"] },
    endTime: { type: Date, required: [true, "End time is required"] },
    lunchTimeInMinutes: { type: Number, required: [true, "Lunch time is required"] }
}, { collection: 'facturesHoraires' });

export const DbTauxHoraireFacture = getModel('TauxHoraireFacture', TauxHoraireFactureSchema);

const factureHoraireSchema = new Schema({
    idFacture: { type: Number, required: [true, "Facture ID is required"], unique: true },
    idUser: { type: Number, required: [true, "User ID is required"] },
    workPosition: { type: String, required: [true, "Work position is required"] },
    hourlyRate: { type: Number, required: [true, "Hourly rate is required"] },
    workDate: { type: Date, required: [true, "Work date is required"] },
    startTime: { type: Date, required: [true, "Start time is required"] },
    endTime: { type: Date, required: [true, "End time is required"] },
    lunchTimeInMinutes: { type: Number, required: [true, "Lunch time in minutes is required"], min: [0, "Lunch time cannot be negative"] }
}, { collection: 'facturesHoraires' });

export const DbFactureHoraire = getModel('FactureHoraire', factureHoraireSchema);

const objetSchema = new Schema({
    idObjet: { type: Number },
    idUser: { type: Number },
    productName: { type: String, required: [true, "Le nom du produit est nécéssaire"] },
    description: { type: String, required: [true, "La description est nécéssaire"] },
    price: { type: Number, required: [true, "Le prix est nécéssaire"] },
    productPhoto: { type: String },
    enforcementDate: { type: Date },
    idParent: { type: Number }
}, { collection: 'objetsUnitaires' });

export const DbObjet = getModel('Objet', objetSchema);


const ticketSchema = new Schema({
    _id: { type: String},
    idClient: { type: Number },
    message: { type: String },
    isCompleted: { type: Boolean},
    date: { type: Date },
    nomClient:{type:String}
}, { collection: 'tickets_client' });
export const DbTicket = getModel('Ticket', ticketSchema);

const tauxHoraireSchema = new Schema({
    idObjet: { type: Number },
    idUser: { type: Number },
    clientName: { type: String },
    workPosition: { type: String },
    hourlyRate: { type: Number },
    enforcmentDate: { type: Date },
    idParent: { type: Number }
}, { collection: 'objetsTauxHoraire' });

export const DbTauxHoraire = getModel('TauxHoraire', tauxHoraireSchema);

const businessSchema = new Schema({
    idBusiness: { type: Number },
    businessName: { type: String },
    businessLogo: { type: String },
    idAddress: { type: Number },
    businessNumber: { type: String },
    TVSnumber: { type: String, default: null },
    TVQnumber: { type: String, default: null },
    TVPnumber: { type: String, default: null },
    TVHnumber: { type: String, default: null }
}, { collection: 'businesses' });

export const DbBusiness = getModel('Business', businessSchema);

const factureSchema = new Schema({
    idFacture: { type: Number, required: [true, "Facture ID is required"], unique: true },
    idUser: { type: Number, required: [true, "User ID is required"] },
    dateFacture: { type: Date, required: [true, "Date is required"] },
    typeFacture: { type: String, required: [true, "Type is required"], enum: { values: ['U', 'T', 'P'], message: "Type must be 'U' or 'T'" } },
    factureNumber: { type: Number, required: [true, "Invoice number is required"] },
    includesTaxes: { type: Boolean, required: [true, "Includes taxes is required"] },
    isActive: { type: Boolean, required: [true, "Active status is required"] },
    isPaid: { type: Boolean, required: [true, "Paid status is required"] },
    isBusinessInvoice: { type: Boolean, required: [true, "Business invoice status is required"] },
    idClient: { type: Number, required: [true, "Client ID is required"] },

}, { collection: 'factures_users' });

export const DbFacture = getModel('Facture', factureSchema);

const clientSchema = new Schema({
    idClient: { type: Number },
    idUser: { type: Number },
    nomClient: { type: String },
    idAddress: { type: Number }
}, { collection: 'clients' });

export const DbClient = getModel('Client', clientSchema);

const addressSchema = new Schema({
    idAddress: { type: Number },
    address: { type: String },
    province: { type: String },
    zipCode: { type: String },
    country: { type: String },
    city: { type: String }
}, { collection: 'addresses' });

export const DbAddress = getModel('Address', addressSchema);

///////////////US 14//////////////////
//----> je vais faire une facture horaire, les donnees vont differer, donc a voir avec toi ce que tu choisis -Sabrina

// const tauxHoraireFactureSchema = new Schema({
//     idFacture: {
//         type: Number,
//         required: true,
//         unique: true
//     },
//     idUser: {
//         type: Number,
//         required: true
//     },
//     dateFacture: {
//         type: Date,
//         required: true
//     },
//     typeFacture: {
//         type: String,
//         required: true,
//         enum: ['U', 'T', 'P']
//     },
//     factureNumber: {
//         type: Number,
//         required: true
//     },
//     includesTaxes: {
//         type: Boolean,
//         required: true
//     },
//     isActive: {
//         type: Boolean,
//         required: true
//     },
//     isPaid: {
//         type: Boolean,
//         required: true
//     },
//     isBusinessInvoice: {
//         type: Boolean,
//         required: true
//     }
// }, { collection: 'facturesHoraires' });

// export const TauxHoraireFacture = model('TauxHoraireFacture', tauxHoraireFactureSchema);

//fix pour le lowercase avec les username/email
//le index c'est pour le data racing
const UserSchema = new mongoose.Schema({
    idUser: { type: Number, required: true, unique: true },
    email: { type: String, required: true, unique: true, index: true, trim: true, lowercase: true },
    username: { type: String, required: true, unique: true, index: true, trim: true, lowercase: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    password: { type: String, required: true },
    idAddress: { type: String, default: null },
    idBusiness: { type: Number, default: null },
    isActive: { type: Boolean, default: true },
    isAdmin: { type: Boolean, default: false },
    isOnline: { type: Boolean, default: false },
    paidAcces: { type: Boolean, default: false }
}, { collection: 'users' });

//pour fix les erreurs de TS avec les cookies
export type UserDoc = InferSchemaType<typeof UserSchema>

export const DbUsers: Model<UserDoc> = getModel<UserDoc>('User', UserSchema);