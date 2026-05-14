"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import Image from "next/image"
import { Check, RotateCcw, X } from "lucide-react"

interface UndoToastData {
  id: string
  productName: string
  productImage?: string | null
  onUndo: () => void
}

interface UndoToastContextType {
  show: (data: Omit<UndoToastData, "id">) => void
}

const UndoToastContext = createContext<UndoToastContextType | null>(null)

const DURATION_MS = 4500

export function UndoToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<UndoToastData | null>(null)
  const [progress, setProgress] = useState(100)

  const show = (data: Omit<UndoToastData, "id">) => {
    setToast({ ...data, id: Date.now().toString() })
  }

  useEffect(() => {
    if (!toast) return
    setProgress(100)
    const start = Date.now()
    const interval = setInterval(() => {
      const elapsed = Date.now() - start
      const pct = Math.max(0, 100 - (elapsed / DURATION_MS) * 100)
      setProgress(pct)
      if (pct <= 0) {
        clearInterval(interval)
        setToast(null)
      }
    }, 50)
    return () => clearInterval(interval)
  }, [toast])

  return (
    <UndoToastContext.Provider value={{ show }}>
      {children}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[200] w-[calc(100%-2rem)] max-w-md animate-in slide-in-from-bottom-4 fade-in duration-200">
          <div className="bg-gray-900 text-white rounded-2xl shadow-2xl overflow-hidden">
            <div className="flex items-center gap-3 px-4 py-3">
              {/* Check icon verde */}
              <div className="h-9 w-9 rounded-full bg-emerald-500 flex items-center justify-center shrink-0">
                <Check className="h-5 w-5 text-white" strokeWidth={3} />
              </div>
              {/* Producto con imagen */}
              <div className="flex items-center gap-2.5 flex-1 min-w-0">
                {toast.productImage && (
                  <div className="relative h-10 w-10 rounded-lg bg-white shrink-0 overflow-hidden">
                    <Image src={toast.productImage} alt={toast.productName} fill sizes="40px" className="object-contain p-1" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Agregado</p>
                  <p className="text-sm font-bold truncate">{toast.productName}</p>
                </div>
              </div>
              {/* Botón deshacer */}
              <button
                onClick={() => { toast.onUndo(); setToast(null) }}
                className="shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-full bg-white/15 hover:bg-white/25 transition-colors text-[11px] font-black uppercase tracking-wider"
              >
                <RotateCcw className="h-3 w-3" />
                Deshacer
              </button>
              {/* Cerrar */}
              <button onClick={() => setToast(null)} className="shrink-0 text-white/50 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>
            {/* Barra de progreso */}
            <div className="h-0.5 bg-white/10">
              <div className="h-full bg-emerald-400 transition-all duration-75 ease-linear" style={{ width: `${progress}%` }} />
            </div>
          </div>
        </div>
      )}
    </UndoToastContext.Provider>
  )
}

export function useUndoToast() {
  const ctx = useContext(UndoToastContext)
  if (!ctx) throw new Error("useUndoToast must be used inside UndoToastProvider")
  return ctx
}
