const mongoose = require('mongoose')

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            // options to stop some warnings in the console
            useNewUrlParser: true, // alt way mongoose.set('useNewUrlParser', true);
            useUnifiedTopology: true,
            useFindAndModify: false
        })
        // const mongoose_connection = conn.connection
        console.log(`MongoDB connected: ${conn.connection.host}`)
        // added from solution of "connect-mongo" problem
        return conn.connection.getClient();
        
    } catch (err) {
        console.error(err)
        process.exit(1)
    }
}

module.exports = connectDB