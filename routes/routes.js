import { Router } from "express"
import userRouter from "./user.routes.js"
import journalRouter from "./journal.routes.js"

const router = Router()

router.use('/user', userRouter)
router.use('/journal', journalRouter)

export default router