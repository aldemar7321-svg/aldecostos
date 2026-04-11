'use server';

import { ai } from '@/ai/genkit';

export async function askAccountingAI(prompt: string, contextData: any) {
  try {
    const dataContext = JSON.stringify(contextData);
    const systemPrompt = `Eres un talentoso y experimentado asistente de inteligencia artificial llamado ProdCost AI.
Estás integrado dentro de una aplicación de costos y manufactura llamada ProdCost Pro.
Tu objetivo principal es ayudar al usuario a entender sus costos, darle insights contables, sugerencias para optimizar recetas de manufactura, y responder a preguntas sobre su inventario.
Los datos actuales del sistema son los siguientes en formato JSON (analízalos detenidamente y utilízalos para tus respuestas):
${dataContext}

El usuario enviará un mensaje o pregunta. Responde de forma clara y directa. Utiliza un formato amigable. Si ves áreas donde se pueden reducir costos (por ejemplo, costos indirectos muy altos) menciónalo.`;

    const { text } = await ai.generate({
      model: 'googleai/gemini-2.5-flash',
      prompt: `${systemPrompt}\n\nMensaje del usuario: ${prompt}`
    });

    return { error: null, text };
  } catch (err: any) {
    if (err.message && (err.message.includes('API key') || err.message.includes('key'))) {
        return { error: 'Para usar la IA usa tu clave de Google Gemini. Crea un archivo .env.local en la carpeta root del proyecto con el contenido `GEMINI_API_KEY="tu_clave_aqui"` y reinicia el servidor local.', text: '' };
    }
    return { error: err.message || 'Error desconocido al contactar a la IA.', text: '' };
  }
}
