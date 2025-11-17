/** * Format user data for public API response * Removes sensitive fields like password */ export function formatUserPublic(
  u: any,
) {
  return {
    idUser: u.idUser,
    username: u.username,
    email: u.email,
    firstName: u.firstName,
    lastName: u.lastName,
    __v: u.__v,
  };
}
/** * Format business data for public API response * Combines business and address data */ export function formatBusinessPublic(
  bizz: any,
  address: any,
) {
  return {
    idBusiness: bizz.idBusiness,
    name: bizz.businessName,
    businessNumber: bizz.businessNumber,
    idAddress: bizz.idAddress,
    address: address.address,
    city: address.city,
    zipCode: address.zipCode,
    province: address.province,
    country: address.country,
    logo: bizz.businessLogo,
    TVP: bizz.TVPnumber,
    TVQ: bizz.TVQnumber,
    TVH: bizz.TVHnumber,
    TVS: bizz.TVSnumber,
  };
}
