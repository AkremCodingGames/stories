const path = require('path')
const express = require('express')
const dotenv = require('dotenv')
const morgan = require('morgan')
const exphbs = require('express-handlebars')
const passport = require('passport')
const session = require('express-session')
const MongoStore = require('connect-mongo') 
// instead of MongoStore = require('connect-mongo')(session)
const connectDB = require('./config/db')
const methodOverride = require('method-override')

// Load config
dotenv.config({ path: './config/config.env' })

const clientP = connectDB()

// Passport config
require('./config/passport')(passport)

const app = express()

// Body parser: https://stackoverflow.com/questions/38306569/what-does-body-parser-do-with-express
// body-parser extracts the entire body portion of an incoming request stream and exposes it on req.body.
// allow us to use req.body in index.js
app.use(express.urlencoded({ extended: false }))
app.use(express.json())

// method override
app.use(methodOverride(function (req, res) {
  if (req.body && typeof req.body === 'object' && '_method' in req.body) {
    // look in urlencoded POST bodies and delete it
    let method = req.body._method
    delete req.body._method
    return method
  }
}))

// Logging .. it shows HTTP methods, the response.. in the console
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'))
}

// Handlebars Helpers 
const { formatDate, stripTags, truncate, editIcon, select } = require('./helpers/hbs')

// Handlebars
app.engine('hbs', 
  exphbs({
    helpers: {
      formatDate,
      stripTags,
      truncate,
      editIcon,
      select
    },
    defaultLayout: 'main',
    extname: '.hbs'
  })) // main.hbs
app.set('view engine', 'hbs');

// Sessions (should be above Passport MW)
app.use(session({ // copy-paste
  secret: 'keyboard cat',
  resave: false, // no edit no save
  saveUninitialized: false, // don't create session unless smth is stored
  // cookie: { secure: true } // it only works with HTTPS
  // we could store option to add DB
  store: MongoStore.create({ clientPromise: clientP, mongoUrl: process.env.MONGO_URI })
  // replace: store: new MongoStore({ mongooseConnection: mongoose.connection })
}))

// Passport middleware
app.use(passport.initialize())
app.use(passport.session()) // express session already installed

app.use((req, res, next) => {
  res.locals.user = req.user || null
  next()
})

// Static folder
app.use(express.static(path.join(__dirname, 'public')))

// Routes
app.use('/', require('./routes/index'))
app.use('/auth', require('./routes/auth'))
app.use('/stories', require('./routes/stories'))

const PORT = process.env.PORT || 3000

app.listen(
    PORT,
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`)
)