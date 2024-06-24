import { Router } from "express"
import { logOutHandler, signInHandler, signUpHandler, updateHandler } from "../controller/user.controller.js"
import authMiddleware from "../middleware/authMiddleware.js"

const userRouter = Router()

userRouter.post('/signup', signUpHandler)
userRouter.post('/login', signInHandler)
userRouter.post('/logout', logOutHandler)
userRouter.put('/update', authMiddleware, updateHandler)

export default userRouter