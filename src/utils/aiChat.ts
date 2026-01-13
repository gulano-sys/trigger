
export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export const initialMessages: Message[] = [
  {
    id: '1',
    role: 'assistant',
    content: 'Terminal de Inteligência Zero pronto. Aguardando requisição técnica...',
    timestamp: new Date()
  }
];

export const fetchAIChatResponse = async (userMessage: string, chatHistory: Message[], signal?: AbortSignal): Promise<string> => {
  try {
    const messages = [
      ...chatHistory.map(m => ({
        role: m.role,
        content: m.content
      })),
      { role: "user", content: userMessage }
    ];

    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ messages }),
      signal
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Backend Error Response:", errorText);
      return `Erro no servidor (${response.status}). Verifique se a sua API Key é válida ou se o prompt é muito longo.`;
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || "A IA não retornou um conteúdo válido.";
  } catch (error) {
    console.error("Fetch Error:", error);
    return "Não foi possível conectar ao servidor. Certifique-se de ter rodado 'node server.js' no terminal.";
  }
};
