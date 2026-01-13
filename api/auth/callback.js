import {
    createToken,
    setAuthCookie,
    DISCORD_CLIENT_ID,
    DISCORD_CLIENT_SECRET,
    DISCORD_REDIRECT_URI,
    DISCORD_GUILD_ID,
    DISCORD_ROLE_ID
} from '../_lib/auth.js';

export default async function handler(req, res) {
    const { code } = req.query;

    if (!code) {
        return res.redirect(302, '/?error=no_code');
    }

    try {
        // 1. Trocar código por token
        const tokenResponse = await fetch('https://discord.com/api/oauth2/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                client_id: DISCORD_CLIENT_ID,
                client_secret: DISCORD_CLIENT_SECRET,
                grant_type: 'authorization_code',
                code,
                redirect_uri: DISCORD_REDIRECT_URI,
            })
        });

        if (!tokenResponse.ok) {
            console.error('Token exchange failed:', await tokenResponse.text());
            return res.redirect(302, '/?error=token_failed');
        }

        const tokenData = await tokenResponse.json();
        const accessToken = tokenData.access_token;

        // 2. Pegar info do usuário
        const userResponse = await fetch('https://discord.com/api/users/@me', {
            headers: { Authorization: `Bearer ${accessToken}` }
        });

        if (!userResponse.ok) {
            return res.redirect(302, '/?error=user_fetch_failed');
        }

        const user = await userResponse.json();

        // 3. Verificar cargo no servidor
        let hasRole = false;
        try {
            const memberResponse = await fetch(`https://discord.com/api/users/@me/guilds/${DISCORD_GUILD_ID}/member`, {
                headers: { Authorization: `Bearer ${accessToken}` }
            });

            if (memberResponse.ok) {
                const memberData = await memberResponse.json();
                hasRole = memberData.roles.includes(DISCORD_ROLE_ID);
            }
        } catch (e) {
            console.log('Usuário não é membro do servidor ou erro ao buscar member.');
        }

        // 4. Criar JWT e setar cookie
        const jwtPayload = {
            id: user.id,
            username: user.username,
            avatar: user.avatar,
            hasRole: hasRole
        };

        const token = createToken(jwtPayload);
        setAuthCookie(res, token);

        res.redirect(302, '/');
    } catch (error) {
        console.error('Erro no callback do Discord:', error);
        res.redirect(302, '/?error=auth_failed');
    }
}
