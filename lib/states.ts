import { HIGHLIGHT_STATES } from "./constants";

export type StateTax = {
  abbr: string;
  name: string;
  /** Approximate 2025/2026 top marginal (or flat) rate, percent. */
  topRate: number;
  flat?: boolean;
  noWageTax?: boolean;
  aggressiveness: number;
  highlight?: boolean;
  note?: string;
};

export const US_STATES: StateTax[] = [
  { abbr: "AL", name: "Alabama", topRate: 5.0, aggressiveness: 25 },
  { abbr: "AK", name: "Alaska", topRate: 0, noWageTax: true, aggressiveness: 10 },
  { abbr: "AZ", name: "Arizona", topRate: 2.5, flat: true, aggressiveness: 25 },
  { abbr: "AR", name: "Arkansas", topRate: 3.9, aggressiveness: 20 },
  { abbr: "CA", name: "California", topRate: 13.3, aggressiveness: 95, highlight: true, note: "FTB is among the most aggressive on former residents." },
  { abbr: "CO", name: "Colorado", topRate: 4.4, flat: true, aggressiveness: 30 },
  { abbr: "CT", name: "Connecticut", topRate: 6.99, aggressiveness: 50 },
  { abbr: "DE", name: "Delaware", topRate: 6.6, aggressiveness: 30 },
  { abbr: "DC", name: "District of Columbia", topRate: 10.75, aggressiveness: 55 },
  { abbr: "FL", name: "Florida", topRate: 0, noWageTax: true, aggressiveness: 15 },
  { abbr: "GA", name: "Georgia", topRate: 5.39, flat: true, aggressiveness: 30 },
  { abbr: "HI", name: "Hawaii", topRate: 11.0, aggressiveness: 40 },
  { abbr: "ID", name: "Idaho", topRate: 5.695, flat: true, aggressiveness: 20 },
  { abbr: "IL", name: "Illinois", topRate: 4.95, flat: true, aggressiveness: 75, highlight: true, note: "Flat rate, but domicile audits of leavers are common." },
  { abbr: "IN", name: "Indiana", topRate: 3.05, flat: true, aggressiveness: 20 },
  { abbr: "IA", name: "Iowa", topRate: 3.8, aggressiveness: 20 },
  { abbr: "KS", name: "Kansas", topRate: 5.58, aggressiveness: 25 },
  { abbr: "KY", name: "Kentucky", topRate: 4.0, flat: true, aggressiveness: 20 },
  { abbr: "LA", name: "Louisiana", topRate: 3.0, aggressiveness: 25 },
  { abbr: "ME", name: "Maine", topRate: 7.15, aggressiveness: 35 },
  { abbr: "MD", name: "Maryland", topRate: 5.75, aggressiveness: 45, note: "County piggyback tax not included." },
  { abbr: "MA", name: "Massachusetts", topRate: 9.0, aggressiveness: 65, highlight: true, note: "5% base; 4% surtax on income over $1M is included in the top rate." },
  { abbr: "MI", name: "Michigan", topRate: 4.25, flat: true, aggressiveness: 30 },
  { abbr: "MN", name: "Minnesota", topRate: 9.85, aggressiveness: 70, highlight: true },
  { abbr: "MS", name: "Mississippi", topRate: 4.4, aggressiveness: 15 },
  { abbr: "MO", name: "Missouri", topRate: 4.7, aggressiveness: 25 },
  { abbr: "MT", name: "Montana", topRate: 5.9, aggressiveness: 20 },
  { abbr: "NE", name: "Nebraska", topRate: 5.2, aggressiveness: 20 },
  { abbr: "NV", name: "Nevada", topRate: 0, noWageTax: true, aggressiveness: 15 },
  { abbr: "NH", name: "New Hampshire", topRate: 0, noWageTax: true, aggressiveness: 20, note: "No wage tax; interest/dividends tax is being phased out." },
  { abbr: "NJ", name: "New Jersey", topRate: 10.75, aggressiveness: 80, highlight: true },
  { abbr: "NM", name: "New Mexico", topRate: 5.9, aggressiveness: 25 },
  { abbr: "NY", name: "New York", topRate: 10.9, aggressiveness: 90, highlight: true, note: "NYC local tax is not included. Statutory residency is a separate 183-day test." },
  { abbr: "NC", name: "North Carolina", topRate: 4.25, flat: true, aggressiveness: 35 },
  { abbr: "ND", name: "North Dakota", topRate: 2.5, aggressiveness: 15 },
  { abbr: "OH", name: "Ohio", topRate: 3.5, aggressiveness: 30, note: "School-district and city taxes not included." },
  { abbr: "OK", name: "Oklahoma", topRate: 4.75, aggressiveness: 20 },
  { abbr: "OR", name: "Oregon", topRate: 9.9, aggressiveness: 50 },
  { abbr: "PA", name: "Pennsylvania", topRate: 3.07, flat: true, aggressiveness: 40 },
  { abbr: "RI", name: "Rhode Island", topRate: 5.99, aggressiveness: 30 },
  { abbr: "SC", name: "South Carolina", topRate: 6.2, aggressiveness: 30 },
  { abbr: "SD", name: "South Dakota", topRate: 0, noWageTax: true, aggressiveness: 20, note: "No wage tax. Virtual-mailbox domicile is under 2026 legislative, payroll, and DMV pressure." },
  { abbr: "TN", name: "Tennessee", topRate: 0, noWageTax: true, aggressiveness: 20 },
  { abbr: "TX", name: "Texas", topRate: 0, noWageTax: true, aggressiveness: 15 },
  { abbr: "UT", name: "Utah", topRate: 4.55, flat: true, aggressiveness: 20 },
  { abbr: "VT", name: "Vermont", topRate: 8.75, aggressiveness: 35 },
  { abbr: "VA", name: "Virginia", topRate: 5.75, aggressiveness: 35 },
  { abbr: "WA", name: "Washington", topRate: 0, noWageTax: true, aggressiveness: 25, note: "No wage tax. High-earner capital-gains tax is not modeled." },
  { abbr: "WV", name: "West Virginia", topRate: 4.82, aggressiveness: 20 },
  { abbr: "WI", name: "Wisconsin", topRate: 7.65, aggressiveness: 40 },
  { abbr: "WY", name: "Wyoming", topRate: 0, noWageTax: true, aggressiveness: 10 },
];

export const TARGET_STATES: { abbr: "FL" | "TX" | "SD"; name: string; pitch: string }[] = [
  { abbr: "FL", name: "Florida", pitch: "Primary playbook. Broad banking acceptance, Declaration of Domicile, 30-day DL rule." },
  { abbr: "TX", name: "Texas", pitch: "Secondary playbook. Strong for Escapees / RV and business owners. No statewide declaration form." },
  { abbr: "SD", name: "South Dakota", pitch: "Use only with eyes open. 2026 payroll, DL, banking, and legislative risk." },
];

export function getState(abbr: string) {
  return US_STATES.find((s) => s.abbr === abbr);
}

export function stateName(abbr: string) {
  return getState(abbr)?.name ?? abbr;
}

export function isHighlight(abbr: string) {
  return (HIGHLIGHT_STATES as readonly string[]).includes(abbr);
}

export const FL_COUNTIES: { id: string; name: string; clerk: string; clerkUrl: string }[] = [
  { id: "miami-dade", name: "Miami-Dade", clerk: "Miami-Dade Clerk of Courts", clerkUrl: "https://www.miami-dadeclerk.com/" },
  { id: "broward", name: "Broward", clerk: "Broward County Clerk of Courts", clerkUrl: "https://www.browardclerk.org/" },
  { id: "palm-beach", name: "Palm Beach", clerk: "Palm Beach County Clerk", clerkUrl: "https://www.mypalmbeachclerk.com/" },
  { id: "orange", name: "Orange (Orlando)", clerk: "Orange County Comptroller / Clerk", clerkUrl: "https://www.occompt.com/" },
  { id: "hillsborough", name: "Hillsborough (Tampa)", clerk: "Hillsborough Clerk of Court", clerkUrl: "https://www.hillsclerk.com/" },
  { id: "pinellas", name: "Pinellas", clerk: "Pinellas County Clerk", clerkUrl: "https://www.pinellasclerk.gov/" },
  { id: "duval", name: "Duval (Jacksonville)", clerk: "Duval Clerk of Court", clerkUrl: "https://www.duvalclerk.com/" },
  { id: "lee", name: "Lee (Fort Myers)", clerk: "Lee County Clerk of Court", clerkUrl: "https://www.leeclerk.org/" },
  { id: "collier", name: "Collier (Naples)", clerk: "Collier County Clerk", clerkUrl: "https://www.collierclerk.com/" },
  { id: "sarasota", name: "Sarasota", clerk: "Sarasota County Clerk", clerkUrl: "https://www.sarasotaclerk.com/" },
  { id: "other", name: "Other Florida county", clerk: "Search your county clerk of court", clerkUrl: "https://www.flclerks.com/search/custom.asp?id=3153" },
];
