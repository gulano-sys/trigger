import { DISCORD_CLIENT_ID, DISCORD_REDIRECT_URI } from '../_lib/auth.js';

export default function handler(req, res) {
    const url = `https://discord.com/api/oauth2/authorize?client_id=${DISCORD_CLIENT_ID}&redirect_uri=${encodeURIComponent(DISCORD_REDIRECT_URI)}&response_type=code&scope=identify%20guilds.members.read`;
    res.redirect(302, url);
}
