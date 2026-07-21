"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";
import { useRouter } from "next/navigation";
import { Capacitor } from "@capacitor/core";
import { GoogleAuth } from "@codetrix-studio/capacitor-google-auth";
import { useAuth } from "@/hooks/useAuth";
import { ApiError } from "@/lib/api";
import { Button } from "@/components/ui/button";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
          }) => void;
          renderButton: (parent: HTMLElement, options: Record<string, unknown>) => void;
        };
      };
    };
  }
}

// Dentro de un shell nativo de Capacitor no existe un browser real, así
// que Google Identity Services (el script `gsi/client`, pensado para
// correr client-side en un browser) no funciona — hace falta el flujo de
// Google Sign-In nativo del plugin (ver decisions/stack.md → Autenticación
// con Google). Este componente detecta la plataforma en runtime y
// renderiza uno de los dos flujos; ambos terminan llamando al mismo
// `loginWithGoogle(idToken)` de useAuth, que pega al mismo endpoint
// backend `/auth/google`.
type Platform = "unknown" | "web" | "native";

export function GoogleSignInButton({ onError }: { onError: (message: string) => void }) {
  const { loginWithGoogle } = useAuth();
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const [platform, setPlatform] = useState<Platform>("unknown");
  const [isSigningIn, setIsSigningIn] = useState(false);

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) {
      setPlatform("web");
      return;
    }

    setPlatform("native");
    // Client ID distinto al del flujo web a propósito: el client Android
    // (package+SHA-1 del APK) quedó registrado en el proyecto de Firebase,
    // y Google exige que el serverClientId nativo pertenezca a ese mismo
    // proyecto (confirmado en la doc oficial de Android Identity). El
    // backend acepta ambas audiencias al verificar el token — ver
    // GOOGLE_CLIENT_ID_ANDROID en decisions/stack.md.
    GoogleAuth.initialize({
      clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID_ANDROID ?? "",
      scopes: ["profile", "email"],
      grantOfflineAccess: false,
    }).catch(() => {
      // Si falla la inicialización (ej. Client ID vacío en un build mal
      // configurado), signIn() más adelante fallará con un error más
      // claro para el usuario — no hace falta cortar acá.
    });
  }, []);

  function handleScriptLoad() {
    if (!window.google || !containerRef.current) return;

    window.google.accounts.id.initialize({
      client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "",
      callback: async (response) => {
        try {
          await loginWithGoogle(response.credential);
          router.push("/");
        } catch (err) {
          onError(err instanceof ApiError ? err.message : "No se pudo iniciar sesión con Google.");
        }
      },
    });

    window.google.accounts.id.renderButton(containerRef.current, {
      type: "standard",
      theme: "outline",
      size: "large",
      width: 320,
      text: "continue_with",
      locale: "es",
    });
  }

  async function handleNativeSignIn() {
    setIsSigningIn(true);
    try {
      const googleUser = await GoogleAuth.signIn();
      await loginWithGoogle(googleUser.authentication.idToken);
      router.push("/");
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      if (message.toLowerCase().includes("cancel")) {
        // El usuario cerró el selector de cuenta — no es un error real,
        // no hace falta mostrarle nada.
        return;
      }
      onError(err instanceof ApiError ? err.message : "No se pudo iniciar sesión con Google.");
    } finally {
      setIsSigningIn(false);
    }
  }

  if (platform === "unknown") {
    // Evita renderizar el flujo equivocado (y, en nativo, evita cargar de
    // más el script externo de GSI) mientras todavía no se sabe en qué
    // shell está corriendo la app.
    return null;
  }

  if (platform === "native") {
    return (
      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={handleNativeSignIn}
        disabled={isSigningIn}
      >
        {isSigningIn ? "Conectando con Google..." : "Continuar con Google"}
      </Button>
    );
  }

  return (
    <>
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
        onLoad={handleScriptLoad}
      />
      <div ref={containerRef} className="flex justify-center" />
    </>
  );
}
