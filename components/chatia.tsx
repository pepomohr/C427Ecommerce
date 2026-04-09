'use client';
import { useState, useRef, useEffect } from 'react';
import { Sparkles, X, Send, Bot } from 'lucide-react';

export default function ChatIA() {
  const [open, setOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  // Mensajes iniciales: Usamos JSX para las negritas reales
  const [messages] = useState([
    {
      id: 'welcome',
      role: 'assistant',
      content: (
        <span>
          ¡Hola! Soy <strong className="font-extrabold text-[#936c43]">Consul</strong>, 
          tu asistente virtual de <strong className="font-extrabold text-[#936c43]">C427</strong>. 
          En este momento me encuentro estudiando para que en el futuro pueda 
          asesorarte de forma experta con tu compra. ¡Muy pronto estaré lista 
          para chatear con vos!
        </span>
      )
    }
  ]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [open]);

  // Función para abrir desde otros componentes (Hero, Header, etc)
  useEffect(() => {
    const handleOpenChat = () => setOpen(true);
    window.addEventListener('openAuraChat', handleOpenChat); // Mantenemos el nombre del evento para no romper los otros botones
    return () => window.removeEventListener('openAuraChat', handleOpenChat);
  }, []);

  return (
    <div className="fixed bottom-28 right-6 z-[9999] flex flex-col items-end text-black">
      {open && (
        <div className="bg-white border-2 border-[#936c43] mb-4 w-[350px] h-[450px] max-h-[70vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
          
          {/* Header del Chat */}
          <div className="bg-[#936c43] p-4 flex items-center justify-between text-white shrink-0">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              <div>
                <h3 className="font-bold uppercase tracking-widest text-xs">Consul IA</h3>
                <p className="text-[10px] text-white/80">Asistente en formación</p>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="hover:bg-white/20 p-1.5 rounded-full transition-colors">
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Cuerpo del Chat */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#fdfcfb]">
            {messages.map((m) => (
              <div key={m.id} className="flex items-start gap-2">
                <div className="shrink-0 p-1.5 rounded-full bg-[#936c43]/10 text-[#936c43]">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="max-w-[85%] p-3 rounded-2xl text-xs leading-relaxed bg-white border border-[#936c43]/20 text-gray-800 rounded-tl-none shadow-sm">
                  {m.content}
                </div>
              </div>
            ))}
          </div>

          {/* Input Deshabilitado */}
          <div className="p-4 bg-white border-t flex gap-2 opacity-50">
            <input
              disabled
              type="text"
              placeholder="Chat temporalmente deshabilitado..."
              className="flex-1 bg-gray-50 border-none rounded-full px-4 py-2 text-xs outline-none"
            />
            <button disabled className="bg-[#936c43] text-white p-2 rounded-full">
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
      
      {/* Botón Flotante */}
      <button 
        onClick={() => setOpen(!open)} 
        className="flex h-14 w-14 items-center justify-center rounded-full bg-[#936c43] text-white shadow-lg active:scale-95 transition-all"
      >
        {open ? <X className="h-7 w-7" /> : <Sparkles className="h-7 w-7 animate-pulse" />}
      </button>
    </div>
  );
}