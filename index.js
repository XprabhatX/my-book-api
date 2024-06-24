import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import mongoose from 'mongoose'
import router from './routes/routes.js'
import cookieParser from 'cookie-parser'

const app = express()
const port = process.env.PORT

app.use(express.json())
app.use(cookieParser())
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}))

app.get('/', (req, res) => {
    res.send({message: '✅ servers are healthy'})
})
app.use(router)

const connect = async () => {
    await mongoose.connect(process.env.MONGO_URI, {dbName: 'mybook'})
    console.log('✅ connected to db')
}

app.listen(port, async () => {
    console.log('✅ server running at port ' + port)
    await connect()
})