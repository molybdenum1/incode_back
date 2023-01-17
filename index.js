const express = require('express');
const mongoose = require('mongoose');
const { PORT, DB_USERNAME, DB_PASSWORD } = require('./config');
const authRouter = require('./routes/auth.route');

const PORT = PORT || 5000;
const app = express();

app.use(express.json());
app.use("/auth", authRouter);

const start = async() => {
    try {
        await mongoose.connect(`mongodb+srv://${DB_USERNAME}:${DB_PASSWORD}@cluster0.dwv8iyf.mongodb.net/?retryWrites=true&w=majority`)
        app.listen(PORT, () => console.log(`App running on ${PORT} port`))
    } catch (error) {
        console.log(error);
    }
}

start();