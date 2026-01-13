import { clearAuthCookie } from '../_lib/auth.js';

export default function handler(req, res) {
    clearAuthCookie(res);
    res.json({ success: true });
}
