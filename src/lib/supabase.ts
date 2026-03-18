import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Server-side client with service role for uploads
export function createServerSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function uploadProductImage(file: File, productId: string): Promise<string> {
  const fileExt = file.name.split(".").pop();
  const fileName = `${productId}/${Date.now()}.${fileExt}`;

  const { data, error } = await supabase.storage
    .from("products")
    .upload(fileName, file, { upsert: true });

  if (error) throw error;

  const { data: { publicUrl } } = supabase.storage
    .from("products")
    .getPublicUrl(data.path);

  return publicUrl;
}
