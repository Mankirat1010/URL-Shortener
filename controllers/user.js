const User = require('../models/user');
const { setUser } = require('../service/auth');

const handleUserSignup = async (req, res) => {
    const { name, email, password } = req.body;

    try {
        await User.create({
            name,
            email,
            password,
        });

        return res.redirect('/login');
    } catch (error) {
        console.log(error);
        return res.status(400).send(error.message);
    }
};

const handleUserLogin = async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email, password });

    if (!user) {
        return res.render('login', {
            error: 'Invalid email or password',
        });
    }

    const token = setUser(user);

    res.cookie('uid', token);
    return res.redirect('/');
};

module.exports = {
    handleUserSignup,
    handleUserLogin,
};