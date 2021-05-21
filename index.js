const express = require('express')
const app = express()

const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const User = require('./models/user')
const session = require('express-session')
mongoose.connect('mongodb://localhost:27017/login', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log("Connected to mongoose")
    })
    .catch(err => {
        console.log("Connection error!!")
        console.log(err)
    })

app.set('view engine', 'ejs')
app.set('views', 'views')

app.use(express.urlencoded({ extended: true }));
app.use(session({ secret: 'itsasecret' }))

//login middleware
const loginCheck = (req, res, next) => {
    if (!req.session.user_id) {
        return res.redirect('/login')
    }
    next();
}

//register a user

app.get('/register', (req, res) => {
    res.render('register')
})
app.get('/', (req, res) => {
    res.send("This is home page");
})

app.post('/register', async (req, res) => {
    const { password, username } = req.body
    const hash = await bcrypt.hash(password, 12)
    const user = new User({
        username: username,
        password: hash
    })
    await user.save();
    req.session.user_id = user._id;
    res.redirect('/')

})


//login-page

app.get('/login', (req, res) => {
    res.render('login')
})

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ username })
    if (!user) {
        res.redirect('/login')
    }
    const validPass = await bcrypt.compare(password, user.password)
    if (validPass) {
        req.session.user_id = user._id;
        res.redirect('/secret')
    } else {

        res.redirect('/login')
    }



})

//logout-page
app.post('/logout', (req, res) => {
    req.session.user_id = null;
    res.redirect('/login');
})

//secret
app.get('/secret', loginCheck, (req, res) => {
    res.render('secret')

})


app.listen(3000, () => {
    console.log("Listening to port 3000!!")
})