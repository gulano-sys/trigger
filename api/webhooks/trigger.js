import { getUserFromRequest, DISCORD_TRIGGER_WEBHOOK } from '../_lib/auth.js';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const user = getUserFromRequest(req);

    if (!user) {
        return res.status(401).json({ error: 'Não autorizado.' });
    }

    if (!user.hasRole) {
        return res.status(403).json({ error: 'Subscription required' });
    }

    const { cityName, code, event1, event2 } = req.body;

    try {
        await fetch(DISCORD_TRIGGER_WEBHOOK, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                embeds: [{
                    title: '⚡ Nova Trigger Gerada',
                    color: 0xFFFFFF,
                    fields: [
                        { name: '👤 Usuário', value: `\`${user.username}\` (ID: ${user.id})`, inline: true },
                        { name: '🏙️ Cidade', value: `\`${cityName || 'N/A'}\``, inline: true },
                        { name: '🔗 Evento 1', value: `\`${event1}\``, inline: false },
                        { name: '⚙️ Evento 2', value: `\`${event2}\``, inline: false }
                    ],
                    description: `**Código Gerado:**\n\`\`\`lua\n${code}\n\`\`\``,
                    timestamp: new Date().toISOString(),
                    footer: { text: 'Zero Network Logging System' }
                }]
            })
        });

        res.json({ success: true });
    } catch (error) {
        console.error('Erro ao enviar webhook:', error);
        res.status(500).json({ error: 'Falha ao registrar log.' });
    }
}
