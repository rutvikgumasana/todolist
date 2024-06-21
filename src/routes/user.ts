import express from "express";
import { userController } from "../controller";
import { userJWT } from '../helper/jwt'
// import { uploadS3, } from '../helper'

import * as validation from '../validation'

const router = express.Router();

//----------- Auth -----
router.post('/login', validation.login, userController.login)
router.post('/signUp', validation.Signup, userController.signUp)

router.post('/forgotPassword', validation.forgot_password, userController.forgot_password)
router.post('/otpVerification', validation.forgot_password_otp, userController.forgot_password_otp_verification)
router.post('/resend_otp', validation.resend_otp, userController.resend_otp)
router.post('/resetPassword', validation.reset_password, userController.reset_password)

//----------- Social Login -----
router.post('/googleLogin', userController.googleLogin)
router.post('/appleLogin', userController.Apple_SL)

//  ------ Room Routes -------
router.get('/room', userJWT, userController.get_room)
router.get('/message/unreadcount', userJWT, userController.get_room_unread)
router.post('/room', userJWT, validation?.add_room, userController.add_room)

// -------  Massage Routes -------
router.get('/message', userJWT, userController.get_message)
router.get('/allmessagedelete/:id', userJWT, userController?.delete_message)
router.get('/messagedelete/:id', userJWT, userController?.onedelete_message)

//----------- Task Routes -----
router.post('/task', userJWT, validation.addTask, userController.addTask)
router.post('/getTask', userJWT, userController.getTaskWithPagination)
router.get('/task', userJWT, userController.getTask)
router.get('/task/:id', userJWT, userController.getTaskById)
router.put('/task', userJWT, validation.updateTask, userController.updateTask)
router.delete('/task/:id', userJWT, userController.deleteTask)

export const userRoutes = router;
