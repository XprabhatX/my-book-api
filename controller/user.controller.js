import User from '../model/user.model.js'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

export const signUpHandler = async (req, res) => {
    const {name, email, password} = req.body
    
    let user = await User.findOne({email})
    if (user) {
        return res.json({message: 'The email is already registered.\nTry to log in instead'})
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const arr = []

    user = await User.create({
        name,
        email,
        password: hashedPassword,
        journals : arr
    })

    const token = jwt.sign({ email: user.email }, process.env.JWT_SECRET, { expiresIn: '1d' })

        res.cookie('token', token, {
            httpOnly: true,
            expires: new Date(Date.now() + 1000 * 60 * 60 * 24),
        })

    return res.json({message: 'success', token})
}

export const signInHandler = async (req, res) => {
    const { email, password } = req.body;

    try {
        let user = await User.findOne({ email })
        if (!user) {
            return res.status(400).json({ message: 'The email is not registered. Try to sign up instead' })
        }

        const isPasswordValid = bcrypt.compare(password, user.password)
        if (!isPasswordValid) {
            return res.status(400).json({ message: 'Wrong password or email.' })
        }

        const token = jwt.sign({ email: user.email }, process.env.JWT_SECRET, { expiresIn: '1d' })

        res.cookie('token', token, {
            httpOnly: true,
            expires: new Date(Date.now() + 1000 * 60 * 60 * 24),
        })

        return res.json({ message: 'success', token})
    } catch (error) {
        return res.status(500).json({ message: 'An error occurred during sign in.' })
    }
}

export const updateHandler = async (req, res) => {
    const { name, password } = req.body

    const hashedPassword = await bcrypt.hash(password, 10)

    try {
        await User.updateOne({email:req.user.email}, {
            name,
            password: hashedPassword
        })
        return res.status(200).json({message: 'success'})
    } catch(err) {
        console.log('catch error ' + err)
        return res.status(500).json({message: 'An error in updating the data.'})
    }
}

export const logOutHandler = async (req, res) => {
    res.clearCookie('token')
    res.status(200).json({message: 'successfully logged out'})
}