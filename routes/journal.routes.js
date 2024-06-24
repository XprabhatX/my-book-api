import { Router } from 'express'
import { createJournalHandler, deleteJournalHandler, readJournalHandler, readOneJournalHandler, updateJournalHandler } from '../controller/journal.controller.js'
import authMiddleware from '../middleware/authMiddleware.js'


const journalRouter = Router()

journalRouter.post('/create', authMiddleware, createJournalHandler)
journalRouter.get('/read', authMiddleware, readJournalHandler)
journalRouter.get('/read/:journalId', authMiddleware, readOneJournalHandler)
journalRouter.put('/update', authMiddleware, updateJournalHandler)
journalRouter.delete('/delete', authMiddleware, deleteJournalHandler)

export default journalRouter