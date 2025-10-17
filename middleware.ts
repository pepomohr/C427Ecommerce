// middleware.ts
import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

// Rutas que requieren ADMIN
const ADMIN_MATCH = [/^\/admin(?:\/|$)/, /^\/api\/admin(?:\/|$)/];

// Rutas públicas (no piden login)
const PUBLIC_ROUTES = [
    /^\/$/,
    /^\/catalogo(?:\/|$)/,
    /^\/nosotros(?:\/|$)/,
    /^\/contacto(?:\/|$)/,
    /^\/clubDelVino(?:\/|$)/,
    /^\/payment(?:\/|$)/,
    /^\/api\/create-payment$/,
    /^\/api\/checkout\/sync-profile$/,
    /^\/api\/webhooks(?:\/|$)/,      // webhooks deben quedar libres
    /^\/api\/public(?:\/|$)/,
    /^\/_next\//,
    /^\/favicon\.ico$/,
    /^\/fonts\//,
    /^\/images\//,
    /^\/public\//,
];

function isPublic(path: string) {
    return PUBLIC_ROUTES.some((re) => re.test(path));
}
function needsAdmin(path: string) {
    return ADMIN_MATCH.some((re) => re.test(path));
}

export async function middleware(req: NextRequest) {
    const url = req.nextUrl;
    const { pathname, searchParams } = url;

    // 1) Forzar HTTPS en prod si vino por http
    const proto = req.headers.get("x-forwarded-proto");
    if (process.env.NODE_ENV === "production" && proto === "http") {
        const httpsUrl = new URL(url);
        httpsUrl.protocol = "https:";
        return NextResponse.redirect(httpsUrl, 308);
    }

    // 2) Preparar respuesta y seteo de cookies (coupon/utm) por 30 días
    const res = NextResponse.next();
    const cookieOpts: Partial<Parameters<typeof res.cookies.set>[2]> = {
        httpOnly: false,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 60 * 60 * 24 * 30,
    };

    const coupon = searchParams.get("coupon") || searchParams.get("cupon") || searchParams.get("code");
    if (coupon) res.cookies.set("coupon", coupon, cookieOpts);

    ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"].forEach((k) => {
        const v = searchParams.get(k);
        if (v) res.cookies.set(k, v, cookieOpts);
    });

    // Helper para crear supabase server-side reutilizando cookies
    const makeSupabase = () =>
        createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    get: (name: string) => req.cookies.get(name)?.value,
                    set: (name: string, value: string, options: any) => {
                        res.cookies.set(name, value, options);
                    },
                    remove: (name: string, options: any) => {
                        res.cookies.set(name, "", { ...options, maxAge: 0 });
                    },
                },
            }
        );

    // 3) Guard para /admin y /api/admin/*
    if (needsAdmin(pathname)) {
        const supabase = makeSupabase();
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
            const login = new URL("/auth/login", url);
            login.searchParams.set("redirect", url.pathname + url.search);
            return NextResponse.redirect(login);
        }

        const { data: profile, error } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", session.user.id)
            .maybeSingle();

        if (error) return new NextResponse("Forbidden", { status: 403 });
        if (!profile || profile.role !== "ADMIN") {
            return new NextResponse("Unauthorized", { status: 401 });
        }
    }

    // 4) Si tenés páginas privadas (ej. /dashboard/*), pedí login salvo que sea pública
    if (!isPublic(pathname) && pathname.startsWith("/dashboard")) {
        const supabase = makeSupabase();
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            const login = new URL("/auth/login", url);
            login.searchParams.set("redirect", url.pathname + url.search);
            return NextResponse.redirect(login);
        }
    }

    return res;
}

// Aplica a todo menos assets estáticos y las imágenes optimizadas
export const config = {
    matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};