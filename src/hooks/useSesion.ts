import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Usuario } from "./useMercado";

const ADMIN_HANDLE = "jose.luefer";

function generarHashUsuario(id: string): string {
  // Genera un identificador hash corto y único basado en el ID del usuario
  return `user_${id.replace(/-/g, "").slice(0, 8)}`;
}

function aUsuario(id: string, email: string | null | undefined): Usuario {
  const correo = email ?? "";
  const handle = correo.split("@")[0]?.toLowerCase() ?? "";
  return {
    id: id,
    nombre: generarHashUsuario(id),
    esAdmin: handle === ADMIN_HANDLE,
  };
}

export function useSesion() {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setUsuario(
        session?.user
          ? aUsuario(session.user.id, session.user.email)
          : null,
      );
      setCargando(false);
    });
    
    supabase.auth.getSession().then(({ data }) => {
      setUsuario(
        data.session?.user
          ? aUsuario(
              data.session.user.id,
              data.session.user.email,
            )
          : null,
      );
      setCargando(false);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const entrarConGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin,
      },
    });
  };

  const salir = async () => {
    await supabase.auth.signOut();
  };

  return { usuario, cargando, entrarConGoogle, salir };
}