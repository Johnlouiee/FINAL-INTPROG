async function authenticate(req, res, next) {
    try {
        const { email, password } = req.body;
        const ipAddress = req.ip;
        const account = await accountService.authenticate({ email, password, ipAddress });
        setTokenCookie(res, account.refreshToken);
        res.json(account);
    } catch (error) {
        console.error('Authentication error:', error);
        res.status(401).json({ message: error });
    }
} 