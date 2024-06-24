import Journal from '../model/journal.model.js'
import axios from 'axios'
import 'dotenv/config'
import User from '../model/user.model.js'

async function querySummary(data, authStr) {
    try {
        const response = await axios.post(
            "https://api-inference.huggingface.co/models/facebook/bart-large-cnn",
            data,
            {
                headers: { Authorization: authStr },
                'Content-Type': 'application/json'
            }
        );
        return response.data
    } catch (error) {
        console.error('Error querying summary:', error)
        return { summary_text: '' }
    }
}

async function analyzeSentiment(summary, authStr) {
    try {
        const sentimentResult = await axios.post(
            'https://api-inference.huggingface.co/models/nlptown/bert-base-multilingual-uncased-sentiment',
            { text: summary },
            { headers: { Authorization: authStr } }
        )

        const highestScoreLabel = sentimentResult.data.reduce((prev, current) => {
            return (prev.score > current.score) ? prev : current
        }).label

        const sentimentMap = {
            '5 stars': 'Very happy',
            '4 stars': 'Good',
            '3 stars': 'Neutral',
            '2 stars': 'Not okay',
            '1 star': 'Very Sad'
        };

        return sentimentMap[highestScoreLabel]
    } catch (error) {
        console.error('Error analyzing sentiment:', error)
        return ''
    }
}

export const createJournalHandler = async (req, res) => {
    console.log('reached crHandler' + req.user.email)
    const user = await User.findOne({email: req.user.email})

    if (!user) {
        return res.status(400).json({message: 'user not logged in'})
    }

    const {title, content, tags } = req.body
    const authStr = `Bearer ${process.env.HUGGING_TOKEN}`
    
    let summary = ''
    let sentiment = ''

    const summaryResponse = await querySummary({ inputs: content }, authStr);
    if (summaryResponse && summaryResponse.summary_text) {
        summary = summaryResponse.summary_text
    }

    sentiment = await analyzeSentiment(summary, authStr)

    try {
        const newJournal = await Journal.create({
            title,
            content,
            tags,
            summary,
            sentiment
        });

        user.journals.push(newJournal._id.toString())
        await user.save()

        res.status(200).json({ message: 'Journal entry created successfully' })
    } catch (error) {
        console.error('Error creating journal entry:', error);
        res.status(500).json({ message: 'Failed to create journal entry' })
    }
}

export const readJournalHandler = async (req, res) => {
    const user = await User.findOne({email: req.user.email})
    try {
        if (!user) {
            return res.status(400).json({message: 'user not logged in'})
        }

        const journals = await Journal.find({ _id: { $in: user.journals } })

        return res.json( {journals} )
    } catch(err) {
        console.log('caught error ' + err)
        res.status(500).json({message: 'failed to fetch journals'})
    }
}

export const readOneJournalHandler = async (req, res) => {
    const user = await User.findOne({email: req.user.email})
    try {
        if (!user) {
            return res.status(400).json({message: 'user not logged in'})
        }

        const journal = await Journal.findById(req.params.journalId)

        return res.json( {journal} )
    } catch(err) {
        console.log('caught error ' + err)
        res.status(500).json({message: 'failed to fetch journals'})
    }
}

export const deleteJournalHandler = async (req, res) => {
    const user = await User.findOne({email: req.user.email})

    if (!user) {
        return res.status(400).json({message: 'user not logged in'})
    }

    const { journalId } = req.body
    try {
        await Journal.findByIdAndDelete(journalId)
        res.json({message: 'successfully deleted'})
    } catch(err) {
        console.log('caught error ' + err)
        res.json({message: 'could not delete'})
    }
}

export const updateJournalHandler = async (req, res) => {
    const user = await User.findOne({email: req.user.email})

    if (!user) {
        return res.status(400).json({message: 'user not logged in'})
    }

    const {journalId, title, content, tags} = req.body 

    try {
        await Journal.findByIdAndUpdate(journalId, {
            title,
            content,
            tags
        })
        res.json({message: 'successfully updated'})
    } catch (err) {
        console.log('caught error ' + err)
        res.json({message: 'could not update'})
    }
}