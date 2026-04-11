'use client';

import { useState } from 'react';
import { useAppData } from '@/app/layout';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Bot, User, Send, Sparkles } from 'lucide-react';
import { askAccountingAI } from '@/app/actions/ai';

export default function AiAssistantPage() {
  const data = useAppData();
  const [messages, setMessages] = useState<{ role: 'ai' | 'user', text: string }[]>([
    { role: 'ai', text: '¡Hola! Soy ProdCost AI, tu asistente contable inteligente. Puedo analizar tus recetas, costos indirectos y de mano de obra para darte insights sobre la rentabilidad de tu operación. ¿En qué te ayudo hoy?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    setMessages(prev => [...prev, { role: 'user', text: input }]);
    const currentInput = input;
    setInput('');
    setLoading(true);

    const { error, text } = await askAccountingAI(currentInput, {
      products: data.products,
      inventory: data.inventory,
      laborSettings: data.laborSettings,
      overhead: data.overhead,
      packaging: data.packaging,
      finishedProducts: data.finishedProducts,
    });

    if (error) {
      setMessages(prev => [...prev, { role: 'ai', text: `⚠️ Atención: ${error}` }]);
    } else {
      setMessages(prev => [...prev, { role: 'ai', text: text }]);
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <PageHeader 
        title="Asistente de Contabilidad IA" 
        description="Analiza tus costos, maximiza tus ganancias y recibe consejos de optimización personalizados en base a tu información actual."
      />

      <Card className="flex-1 flex flex-col mt-4 overflow-hidden shadow-sm">
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 bg-zinc-50/50">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.role === 'ai' && (
                <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center shrink-0">
                  <Bot className="w-5 h-5 text-white" />
                </div>
              )}
              <div 
                className={`p-4 max-w-[85%] md:max-w-[70%] rounded-2xl ${
                  msg.role === 'user' 
                    ? 'bg-zinc-900 text-white rounded-br-none' 
                    : 'bg-white border rounded-bl-none shadow-sm'
                }`}
              >
                <div className="whitespace-pre-wrap text-[15px] leading-relaxed">
                  {msg.text}
                </div>
              </div>
              {msg.role === 'user' && (
                <div className="w-8 h-8 rounded-full bg-zinc-200 flex items-center justify-center shrink-0">
                  <User className="w-5 h-5 text-zinc-600" />
                </div>
              )}
            </div>
          ))}
          {loading && (
            <div className="flex gap-3 justify-start">
               <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center shrink-0">
                  <Sparkles className="w-4 h-4 text-white animate-pulse" />
                </div>
                <div className="px-4 py-3 bg-white border rounded-2xl rounded-bl-none shadow-sm text-zinc-400 text-sm italic">
                  Analizando finanzas...
                </div>
            </div>
          )}
        </div>
        <div className="p-4 border-t bg-white">
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSend(); }}
            className="flex gap-3 max-w-4xl mx-auto"
          >
            <Input 
              value={input} 
              onChange={e => setInput(e.target.value)} 
              placeholder="Pregúntame sobre la rentabilidad de una receta, tus costos indirectos..." 
              className="flex-1 rounded-xl bg-zinc-50 border-zinc-200 focus-visible:ring-indigo-600"
              disabled={loading}
              autoFocus
            />
            <Button 
              type="submit" 
              disabled={loading || !input.trim()} 
              className="rounded-xl px-6 bg-indigo-600 hover:bg-indigo-700"
            >
              <Send className="w-4 h-4 ml-1" />
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
}
