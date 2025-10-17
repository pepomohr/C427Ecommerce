// middleware.ts
"use client"; // si usás next/image u otros hooks del cliente en el header

import { NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { createServerClient } from "@supabase/ssr";

const PUBLIC_ROUTES = [
  /^\/$/, /^\/auth\/login/, /^\/auth\/register/, /^\/_next\//, /^\/favicon\.ico$/, /^\/fonts\//, /^\/images\//, /^\/public\//
];

const ADMIN_ROUTES = [
  /^\/admin(?:\/|$)/, /^\/api\/admin(?:\/|$)/
];

const PRIVATE_ROUTES = [
  /^\/dashboard(?:\/|$)/
];

function isPublic(path: string) { return PUBLIC_ROUTES.some(r => r.test(path)) }
function isAdminRoute(path: string) { return ADMIN_ROUTES.some(r => r.test(path)) }
function isPrivateRoute(path: string) { return PRIVATE_ROUTES.some(r => r.test(path)) }

export async function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const pathname = url.pathname;

  try {
    console.log("[Middleware] Iniciado en ruta:", pathname);

    // 1️⃣ Actualizar sesión
    let res: NextResponse;
    try {
      res = await updateSession(req);
      console.log("[Middleware] Sesión actualizada");
    } catch (err) {
      console.error("[updateSession error]", err);
      return new NextResponse("Error en updateSession", { status: 500 });
    }

    // 2️⃣ Cookies de marketing
    const coupon = url.searchParams.get("coupon") || url.searchParams.get("cupon") || url.searchParams.get("code");
    if (coupon) res.cookies.set("coupon", coupon, { path: "/", maxAge: 60*60*24*30 });
    ["utm_source","utm_medium","utm_campaign","utm_term","utm_content"].forEach(k => {
      const v = url.searchParams.get(k);
      if(v) res.cookies.set(k,v,{ path: "/", maxAge: 60*60*24*30 });
    });

    // 3️⃣ Rutas públicas
    if (isPublic(pathname)) return res;

    // 4️⃣ Cliente Supabase server-side
    let supabase;
    try {
      supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
          cookies: {
            get: (name) => req.cookies.get(name)?.value,
            set: (name, value, opts) => res.cookies.set(name, value, opts),
            remove: (name, opts) => res.cookies.set(name, "", { ...opts, maxAge: 0 }),
          }
        }
      );
      console.log("[Middleware] Cliente Supabase creado");
    } catch (err) {
      console.error("[Supabase client error]", err);
      return new NextResponse("Error creando cliente Supabase", { status: 500 });
    }

    // 5️⃣ Obtener sesión
    const { data: { session } } = await supabase.auth.getSession();
    console.log("[Middleware] Sesión obtenida:", session?.user?.id);

    if (!session) {
      const loginUrl = new URL("/auth/login", url);
      loginUrl.searchParams.set("redirect", pathname + url.search);
      console.log("[Middleware] No hay sesión, redirigiendo a login");
      return NextResponse.redirect(loginUrl);
    }

    // 6️⃣ Rutas ADMIN
    if (isAdminRoute(pathname)) {
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", session.user.id)
        .maybeSingle();

      if (error) {
        console.error("[Admin route error]", error);
        return new NextResponse("Forbidden", { status: 403 });
      }

      if (!profile || profile.role !== "ADMIN") {
        console.log("[Middleware] Usuario no autorizado para ADMIN");
        return new NextResponse("Unauthorized", { status: 401 });
      }
    }

    // 7️⃣ Rutas privadas /dashboard
    if (isPrivateRoute(pathname)) {
      console.log("[Middleware] Usuario logueado accediendo a ruta privada");
      return res;
    }

    return res;

  } catch (error) {
    console.error("[Middleware General Error]", error);
    return new NextResponse("Middleware error", { status: 500 });
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
