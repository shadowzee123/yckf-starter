// FILE: src/services/paymentValidation.ts
export const MIN_GHS = 50;
export const MAX_GHS = 100;
export const MIN_USD = 5;
export const MAX_USD = 10;


export function validateDonation(amount: number, currency: 'GHS'|'USD') {
if (currency === 'GHS') {
if (amount < MIN_GHS) return { allowed:false, reason: 'below_min' };
if (amount > MAX_GHS) return { allowed:false, reason: 'above_max' };
return { allowed:true };
}
if (currency === 'USD') {
if (amount < MIN_USD) return { allowed:false, reason:'below_min' };
if (amount > MAX_USD) return { allowed:false, reason:'above_max' };
return { allowed:true };
}
return { allowed:false, reason:'unsupported_currency' };
}
