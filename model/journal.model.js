import mongoose from 'mongoose'

const journalSchema = new mongoose.Schema({
    title: String,
    content: String,
    tags: [String],
    summary: String,
    sentiment: String
})

const Journal = mongoose.model('Journal', journalSchema)

export default Journal