import { createFileRoute, Link } from "@tanstack/react-router";

// La fuente que usas en el resto de la app
const fuenteApple = { fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif' };

export const Route = createFileRoute('/privacidad')({
  component: PaginaPrivacidad,
})

function PaginaPrivacidad() {
  return (
    <div className="min-h-screen bg-lienzo pb-28" style={fuenteApple}>
      {/* Cabecera con botón de volver */}
      <header 
        className="fixed inset-x-0 top-0 z-20 bg-lienzo/95 backdrop-blur" 
        style={{ paddingTop: "env(safe-area-inset-top)" }}
      >
        <div className="mx-auto flex h-14 max-w-[520px] items-center px-5">
          <Link 
            to="/" 
            className="flex items-center text-[15px] font-medium tracking-tight text-ink transition-opacity hover:opacity-70 active:opacity-40"
          >
            ← Volver
          </Link>
        </div>
      </header>

      {/* Contenido de la política */}
      <main className="mx-auto max-w-[520px] px-5 pt-24 text-ink">
        <h1 className="mb-8 text-[28px] font-bold tracking-tight">Política de Privacidad</h1>
        
        <div className="space-y-6 text-[15px] leading-relaxed text-ink/80">
          
          <section>
            <h2 className="mb-2 text-[17px] font-semibold text-ink">1. Datos recopilados</h2>
            <p>
              Para poder iniciar sesión se utiliza una cuenta de Google (o de la USAL). De la información proporcionada por el servicio de autenticación, solo se recopila y utiliza la dirección de correo electrónico y el nombre público para identificar al usuario. Aunque el sistema recibe por defecto el enlace a la foto de perfil asociada a la cuenta, la aplicación no descarga, no procesa y no muestra dicha imagen en ningún momento.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-[17px] font-semibold text-ink">2. Uso de la información</h2>
            <p>
              No se comparte ni vende ningún dato. 
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-[17px] font-semibold text-ink">3. Almacenamiento y seguridad</h2>
            <p>
                La base de datos se aloja en Supabase.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-[17px] font-semibold text-ink">4. Eliminación de la cuenta</h2>
            <p>
              Si el usuario quiere eliminar la cuenta, que me avise.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-[17px] font-semibold text-ink">5. Cumplimiento Legal (RGPD / GDPR)</h2>
            <p className="text-sutil">
              A efectos del Reglamento General de Protección de Datos (RGPD) europeo: El responsable del tratamiento de los datos es <strong>alotofprojects@googlegroups.com</strong>. La base legal para tratar estos datos es el consentimiento expreso del usuario al iniciar sesión en la plataforma. Los datos se conservarán mientras el usuario mantenga su perfil activo. El usuario tiene pleno derecho a solicitar el acceso, rectificación, portabilidad, limitación u oposición al tratamiento de sus datos personales, así como el derecho al olvido (cancelación), contactando al responsable mediante el correo indicado o a través de la propia plataforma.
            </p>
          </section>

        </div>
      </main>
    </div>
  );
}