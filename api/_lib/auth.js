import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'zero-network-jwt-secret-change-this';
const COOKIE_NAME = 'zero_auth';

export function createToken(user) {
    return jwt.sign(user, JWT_SECRET, { expiresIn: '24h' });
}

export function verifyToken(token) {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (e) {
        return null;
    }
}

export function getUserFromRequest(req) {
    const cookies = parseCookies(req.headers.cookie || '');
    const token = cookies[COOKIE_NAME];
    if (!token) return null;
    return verifyToken(token);
}

export function setAuthCookie(res, token) {
    res.setHeader('Set-Cookie', `${COOKIE_NAME}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=86400`);
}

export function clearAuthCookie(res) {
    res.setHeader('Set-Cookie', `${COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`);
}

function parseCookies(cookieHeader) {
    const cookies = {};
    if (!cookieHeader) return cookies;
    cookieHeader.split(';').forEach(cookie => {
        const [name, ...rest] = cookie.split('=');
        cookies[name.trim()] = rest.join('=').trim();
    });
    return cookies;
}

export const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID;
export const DISCORD_CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET;
export const DISCORD_REDIRECT_URI = process.env.REDIRECT_URI;
export const DISCORD_GUILD_ID = process.env.DISCORD_GUILD_ID;
export const DISCORD_ROLE_ID = process.env.DISCORD_ROLE_ID;
export const DISCORD_TRIGGER_WEBHOOK = process.env.DISCORD_TRIGGER_WEBHOOK;
export const GROQ_API_KEY = process.env.GROQ_API_KEY;
