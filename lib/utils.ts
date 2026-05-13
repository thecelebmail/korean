// lib/utils.ts
import { type ClassValue, clsx } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

export function formatPhone(phone: string): string {
  // Format South African numbers: 011 123 4567 or +27 11 123 4567
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.startsWith("27") && cleaned.length === 11) {
    return `+27 ${cleaned.slice(2, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7)}`;
  }
  if (cleaned.length === 10) {
    return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`;
  }
  return phone;
}

export function formatRating(rating: number | null): string {
  if (!rating) return "No reviews";
  return rating.toFixed(1);
}

export const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export function isOpenNow(
  hours: Array<{
    day_of_week: number;
    opens_at: string | null;
    closes_at: string | null;
    is_closed: boolean;
  }>
): boolean {
  const now = new Date();
  const day = now.getDay();
  const todayHours = hours.find((h) => h.day_of_week === day);
  if (!todayHours || todayHours.is_closed) return false;
  if (!todayHours.opens_at || !todayHours.closes_at) return false;

  const [openH, openM] = todayHours.opens_at.split(":").map(Number);
  const [closeH, closeM] = todayHours.closes_at.split(":").map(Number);
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const openMinutes = openH * 60 + openM;
  const closeMinutes = closeH * 60 + closeM;

  return currentMinutes >= openMinutes && currentMinutes < closeMinutes;
}

export const POPULAR_CITIES = [
  { name: "Johannesburg", slug: "johannesburg", province: "gauteng" },
  { name: "Pretoria", slug: "pretoria", province: "gauteng" },
  { name: "Durban", slug: "durban", province: "kwazulu-natal" },
  { name: "Cape Town", slug: "cape-town", province: "western-cape" },
  { name: "Polokwane", slug: "polokwane", province: "limpopo" },
  { name: "Bloemfontein", slug: "bloemfontein", province: "free-state" },
  { name: "Port Elizabeth", slug: "port-elizabeth", province: "eastern-cape" },
  { name: "East London", slug: "east-london", province: "eastern-cape" },
  { name: "Nelspruit", slug: "nelspruit", province: "mpumalanga" },
  { name: "Rustenburg", slug: "rustenburg", province: "north-west" },
];

export const POPULAR_CATEGORIES = [
  { name: "Toyota Spares", slug: "toyota-spares", icon: "🚗" },
  { name: "BMW Spares", slug: "bmw-spares", icon: "🚙" },
  { name: "Used Auto Parts", slug: "used-auto-parts", icon: "🔧" },
  { name: "Truck Spares", slug: "truck-spares", icon: "🚛" },
  { name: "Gearbox Specialists", slug: "gearbox-specialists", icon: "⚙️" },
  { name: "Engine Spares", slug: "engine-spares", icon: "🔩" },
  { name: "Auto Electrical", slug: "auto-electrical", icon: "⚡" },
  { name: "Scrapyards", slug: "scrapyards", icon: "🏭" },
];

export const ALL_PROVINCES = [
  { name: "Gauteng", slug: "gauteng" },
  { name: "KwaZulu-Natal", slug: "kwazulu-natal" },
  { name: "Western Cape", slug: "western-cape" },
  { name: "Eastern Cape", slug: "eastern-cape" },
  { name: "Limpopo", slug: "limpopo" },
  { name: "Mpumalanga", slug: "mpumalanga" },
  { name: "North West", slug: "north-west" },
  { name: "Free State", slug: "free-state" },
  { name: "Northern Cape", slug: "northern-cape" },
];