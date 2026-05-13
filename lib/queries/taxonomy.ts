// lib/queries/taxonomy.ts
import { createClient } from "@/lib/supabase/server";
import type { Province, City, Category, Brand } from "@/types";

export async function getAllProvinces(): Promise<Province[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("provinces")
    .select("id, name, slug")
    .order("name");
  return (data ?? []) as Province[];
}

export async function getProvinceBySlug(slug: string): Promise<Province | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("provinces")
    .select("id, name, slug")
    .eq("slug", slug)
    .single();
  return data as Province | null;
}

export async function getCitiesByProvince(provinceSlug: string): Promise<City[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("cities")
    .select("id, name, slug, province_id, province:provinces(id, name, slug)")
    .eq("province.slug", provinceSlug)
    .order("name");
  return (data ?? []) as unknown as City[];
}

export async function getAllCities(): Promise<City[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("cities")
    .select("id, name, slug, province_id, province:provinces(id, name, slug)")
    .order("name");
  return (data ?? []) as unknown as City[];
}

export async function getCityBySlug(slug: string): Promise<City | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("cities")
    .select("id, name, slug, province_id, province:provinces(id, name, slug)")
    .eq("slug", slug)
    .single();
  return data as unknown as City | null;
}

export async function getAllCategories(): Promise<Category[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("categories")
    .select("id, name, slug")
    .order("name");
  return (data ?? []) as Category[];
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("categories")
    .select("id, name, slug")
    .eq("slug", slug)
    .single();
  return data as Category | null;
}

export async function getAllBrands(): Promise<Brand[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("brands")
    .select("id, name, slug")
    .order("name");
  return (data ?? []) as Brand[];
}

export async function getBrandBySlug(slug: string): Promise<Brand | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("brands")
    .select("id, name, slug")
    .eq("slug", slug)
    .single();
  return data as Brand | null;
}