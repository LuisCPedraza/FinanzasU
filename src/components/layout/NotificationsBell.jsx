import { useEffect, useRef, useState } from 'react'
import { Bell, CheckCheck, Loader2 } from 'lucide-react'
import { useNotificaciones } from '../../hooks/useNotificaciones'

function formatearFecha(fecha) {
  return new Date(fecha).toLocaleString('es-CO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export default function NotificationsBell({ onNavigate }) {
  const {
    notificaciones,
    noLeidas,
    cargando,
    error,
    cargarNotificaciones,
    marcarLeida,
    marcarTodasLeidas
  } = useNotificaciones()
  const [open, setOpen] = useState(false)
  const containerRef = useRef(null)

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (!containerRef.current?.contains(event.target)) {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handleOutsideClick)
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [])

  const handleOpen = async () => {
    const nextOpen = !open
    setOpen(nextOpen)
    if (nextOpen && notificaciones.length === 0 && !cargando) {
      await cargarNotificaciones()
    }
  }

  const handleNotificationClick = async (notificacion) => {
    if (!notificacion.leida) {
      await marcarLeida(notificacion.id)
    }

    setOpen(false)

    if (notificacion.ruta_destino && onNavigate) {
      onNavigate(notificacion.ruta_destino)
    }
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={handleOpen}
        aria-label="Abrir notificaciones"
        className="relative inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[#c5c5d4]/30 bg-white text-[#24389c] shadow-sm transition-colors hover:bg-[#f5f7ff]"
      >
        <Bell className="h-5 w-5" />
        {noLeidas > 0 && (
          <span className="absolute -right-1 -top-1 inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-[#ba1a1a] px-1 text-[10px] font-bold text-white">
            {noLeidas > 99 ? '99+' : noLeidas}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-[min(92vw,380px)] overflow-hidden rounded-2xl border border-[#d9dcec]/80 bg-white shadow-2xl">
          <div className="flex items-center justify-between border-b border-[#eef1f8] px-4 py-3">
            <div>
              <p className="text-sm font-bold text-[#1f2f86]">Notificaciones</p>
              <p className="text-xs text-[#61657a]">{noLeidas} sin leer</p>
            </div>
            <button
              type="button"
              onClick={marcarTodasLeidas}
              disabled={noLeidas === 0}
              className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-[#24389c] transition-colors hover:bg-[#eef1ff] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <CheckCheck className="h-3.5 w-3.5" /> Marcar todas
            </button>
          </div>

          <div className="max-h-[420px] overflow-auto p-2">
            {cargando ? (
              <div className="flex items-center justify-center gap-2 py-12 text-sm text-[#61657a]">
                <Loader2 className="h-4 w-4 animate-spin" /> Cargando notificaciones...
              </div>
            ) : error ? (
              <div className="space-y-3 rounded-xl border border-[#ffd3cf] bg-[#fff6f5] p-4 text-sm text-[#a33a30]">
                <p>No fue posible cargar tus notificaciones.</p>
                <button
                  type="button"
                  onClick={cargarNotificaciones}
                  className="rounded-lg bg-white px-3 py-1.5 text-xs font-semibold"
                >
                  Reintentar
                </button>
              </div>
            ) : notificaciones.length === 0 ? (
              <div className="py-12 text-center text-sm text-[#61657a]">
                <p className="font-semibold">Aun no tienes notificaciones</p>
                <p className="mt-1 text-xs">Cuando ocurra un evento importante, lo veras aqui.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {notificaciones.map((notificacion) => (
                  <button
                    key={notificacion.id}
                    type="button"
                    onClick={() => handleNotificationClick(notificacion)}
                    className={[
                      'w-full rounded-xl border px-3 py-3 text-left transition-colors',
                      notificacion.leida
                        ? 'border-[#eef1f8] bg-white hover:bg-[#f8faff]'
                        : 'border-[#d9dffc] bg-[#f2f5ff] hover:bg-[#eaf0ff]'
                    ].join(' ')}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-semibold text-[#1f2f86]">{notificacion.titulo}</p>
                      {!notificacion.leida && <span className="mt-1 h-2 w-2 rounded-full bg-[#24389c]" />}
                    </div>
                    <p className="mt-1 text-xs text-[#454652]">{notificacion.mensaje}</p>
                    <div className="mt-2 flex items-center justify-between text-[11px] text-[#757684]">
                      <span className="uppercase tracking-wide">{notificacion.modulo_origen}</span>
                      <span>{formatearFecha(notificacion.created_at)}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}