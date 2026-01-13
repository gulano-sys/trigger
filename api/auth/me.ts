import { getUserFromRequest } from '../_lib/auth.js';

export default function handler(req, res) {
    const user = getUserFromRequest(req);
    res.json(user);
}
