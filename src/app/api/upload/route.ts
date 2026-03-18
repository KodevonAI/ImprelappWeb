import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createServerSupabaseClient } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const productId = formData.get("productId") as string;

    if (!file) {
      return NextResponse.json({ error: "No se proporcionó archivo" }, { status: 400 });
    }

    const supabase = createServerSupabaseClient();
    const fileExt = file.name.split(".").pop();
    const fileName = `${productId || "temp"}/${Date.now()}.${fileExt}`;
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const { data, error } = await supabase.storage
      .from("products")
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: true,
      });

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from("products")
      .getPublicUrl(data.path);

    return NextResponse.json({ url: publicUrl });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error al subir la imagen" }, { status: 500 });
  }
}
