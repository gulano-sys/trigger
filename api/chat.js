import { getUserFromRequest, GROQ_API_KEY } from './_lib/auth.js';

const SYSTEM_PROMPT = `
Você é a "Inteligência Zero", um Programador Sênior e Arquiteto de Software de elite. Sua comunicação é puramente técnica, direta e ultra-minimalista.

REGRAS DE CONDUTA:
1. SEM FLOREIOS: Proibido saudações (olá, bom dia), despedidas ou frases de cortesia.
2. DIRETO AO PONTO: Se pedirem uma alteração, faça a alteração e descreva brevemente:
   - "O que foi alterado"
   - "Onde foi alterado"
3. FOCO NO CÓDIGO: O código é a prioridade. Explicações devem ser curtas e objetivas.
4. INTELIGÊNCIA: Entenda o contexto imediatamente. Se o usuário mandar um código e pedir uma mudança, retorne o código corrigido e a explicação mínima necessária.

PROTOCOLO DE RESPOSTA:
1. <think>: Planejamento técnico interno (obrigatório).
2. RESPOSTA: Apenas código e a descrição técnica concisa das mudanças. Use markdown técnico.

EXEMPLO DE RESPOSTA IDEAL:
## Alteração Realizada
- Adicionado verificação de permissão na linha 42.
- Otimizado loop de busca para reduzir latência.

\`\`\`lua
-- [Código aqui]
\`\`\`
`;

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const user = getUserFromRequest(req);

    if (!user) {
        return res.status(401).json({ error: 'Não autorizado.' });
    }

    if (!user.hasRole) {
        return res.status(403).json({
            error: 'Subscription required',
            message: 'Se inscreva em nosso canal para ter acesso ao gerador de trigger canal: https://www.youtube.com/@gulanoyt'
        });
    }

    try {
        const { messages } = req.body;

        if (!messages) {
            return res.status(400).json({ error: 'Mensagens não fornecidas.' });
        }

        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${GROQ_API_KEY.trim()}`
            },
            body: JSON.stringify({
                model: 'llama-3.3-70b-versatile',
                messages: [
                    { role: 'system', content: SYSTEM_PROMPT },
                    ...messages
                ],
                temperature: 0.7,
                max_tokens: 1024
            })
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('Erro da Groq:', data);
            return res.status(response.status).json(data);
        }

        res.json(data);
    } catch (error) {
        console.error('Erro no chat:', error);
        res.status(500).json({ error: 'Erro interno no servidor ao processar o chat.' });
    }
}
