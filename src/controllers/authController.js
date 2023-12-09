const authService = require('../services/authService');


async function login(req, res) {
    try {
        const { username, password } = req.body;

        const user = await authService.getUserByUsername(username);

        if (user) {

            // If user found in my database, still password check needs to be done
            res.status(200).json({ message: 'Login successful', user });

        } else {

            // If user was not found in my database auth against codeforces server
            const codeforcesUser = await authService.authenticateCodeforcesUser(username, password);
            await authService.saveUser(codeforcesUser);
            res.status(200).json({ message: 'Login successful', user: codeforcesUser });

        }
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}


module.exports = {
    login
};
