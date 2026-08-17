import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Usuario } from "./useMercado";

const ADMIN_HANDLE = "jose.luefer";

function aUsuario(id: string, email: string | null | undefined, nombre?: string | null): Usuario {
  const correo = email ?? "";
  const handle = correo.split("@")[0]?.toLowerCase() ?? "";
  return {
    id: id,
    nombre: nombre || correo,
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
          ? aUsuario(session.user.id, session.user.email, session.user.user_metadata?.["full_name"] as string)
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
              data.session.user.user_metadata?.["full_name"] as string,
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