import userModel from '../models/user.model.js';
import * as userServices from '../services/user.service.js';
import { validationResult } from 'express-validator';
import redisClient from '../services/redis.service.js';

export const createUserController = async (req, res)=>{
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const user = await userServices.createuser(req.body);
        const token = user.generateJWT();

        delete user._doc.password; // Remove password from response
        res.status(201).json({user,token})
    
    }
     catch (error) {
        res.status(500).json({ error: error.message });
    }
}

export const loginController = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { email, password } = req.body;
        const user = await userModel.findOne({ email }).select('+password');
        
        if (!user) {
            return res.status(401).json({ error: 'User not found' });
        }

        const isMatch = await user.isValidPassword(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        const token = await user.generateJWT();
        delete user._doc.password;
        res.status(200).json({ user, token });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

export const profileController = async (req, res) => {
    console.log(req.user);
    res.status(200).json({
        user: {
            id: req.user.id,
            email: req.user.email
        }
    });
}

export const logoutController = async (req, res) => {
    try {
        const token = req.cookies.token || req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ error: "Unauthorization" });
        }

        // Invalidate the token in Redis
        await redisClient.set(token, 'logout','EX',60 * 60 * 24); // Set expiration as needed
        
        res.status(200).json({ message: "Logged out successfully" });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

export const getAllUsersController = async (req, res) => {
    try{
        const loggedINUser = await userModel.findOne({email: req.user.email});
        const allUsers = await userServices.getAllUsers({ userId: loggedINUser._id });

        return res.status(200).json({
            users: allUsers
        });
    }
    catch (error) {
        console.error(error);
        res.status(400).send(error.message);
    }
}