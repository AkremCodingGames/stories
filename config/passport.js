const GoogleStrategy = require('passport-google-oauth20').Strategy
const User = require('../models/User')

module.exports = (passport) => {
    passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: '/auth/google/callback'
    },
    async (accessToken, refreshToken, profile, done) => {
        // console.log(profile)
        const newUser = {
            googleId: profile.id,
            displayName: profile.displayName,
            firstName: profile.name.givenName,
            lastName: profile.name.familyName,
            image: profile.photos[0].value
        }

        try { // could be done with findOrCreate()
            let user = await User.findOne({ googleId: profile.id })
            if(user) { //  login
                done(null, user) // now we can access req.user
            } else { // sign up
                user = await User.create(newUser)
                done(null, user)
            }
        }
        catch (err) {
            console.error(err)
        }
    }
    ))
    // https://stackoverflow.com/questions/27637609/understanding-passport-serialize-deserialize
    passport.serializeUser((user, done) => { // deal with cookies (copy-paste)
        done(null, user.id)
    })

    passport.deserializeUser((id, done) => {
        User.findById(id, (err, user) => done(err, user))
    })

}