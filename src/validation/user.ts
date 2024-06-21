import * as Joi from "joi"
import { apiResponse } from '../common'
import { Request, Response } from 'express'

export const Signup = async (req: Request, res: Response, next: any) => {
    const schema = Joi.object({
        email: Joi.string().error(new Error('Email is invaild!')),
        password: Joi.string().error(new Error('password is invaild!')),
        userName: Joi.string().error(new Error('userName is invaild!')),
        type: Joi.number().error(new Error('type is invaild!')),
        deviceToken: Joi.string().error(new Error('deviceToken is invaild!'))
    })
    // console.log("------------------------req.body", req.body);
    schema.validateAsync(req.body).then(async result => {
        // console.log(result, "---------------------------result");
        return next()
    }).catch(async error => { res.status(400).json(await apiResponse(400, error.message, {}, {})) })
}


export const login = async (req: Request, res: Response, next: any) => {
    const schema = Joi.object({
        email: Joi.string().trim().email().error(new Error('Email is invaild!')),
        password: Joi.string().error(new Error('password is invaild!')),
        type: Joi.number().error(new Error('type is invaild!')),
        deviceToken: Joi.string().error(new Error('deviceToken is invaild!'))
    })
    // console.log("------------------------req.body", req.body);
    schema.validateAsync(req.body).then(async result => {
        // console.log(result, "---------------------------result");
        return next()
    }).catch(async error => { res.status(400).json(await apiResponse(400, error.message, {}, {})) })
}
export const forgot_password = async (req: Request, res: Response, next: any) => {
    const schema = Joi.object({
        email: Joi.string().trim().email().error(new Error('Email is invaild!')),
    })
    // console.log("------------------------req.body", req.body);
    schema.validateAsync(req.body).then(async result => {
        // console.log(result, "---------------------------result");
        return next()
    }).catch(async error => { res.status(400).json(await apiResponse(400, error.message, {}, {})) })
}

export const forgot_password_otp = async (req: Request, res: Response, next: any) => {
    const schema = Joi.object({
        email: Joi.string().trim().email().error(new Error('Email is invaild!')),
        otp: Joi.string().error(new Error('otp is invaild!')),
    })
    // console.log("------------------------req.body", req.body);
    schema.validateAsync(req.body).then(async result => {
        // console.log(result, "---------------------------result");
        return next()
    }).catch(async error => { res.status(400).json(await apiResponse(400, error.message, {}, {})) })
}
export const reset_password = async (req: Request, res: Response, next: any) => {
    const schema = Joi.object({
        email: Joi.string().trim().email().error(new Error('Email is invaild!')),
        password: Joi.string().error(new Error('password is invaild!')),
    })
    // console.log("------------------------req.body", req.body);
    schema.validateAsync(req.body).then(async result => {
        // console.log(result, "---------------------------result");
        return next()
    }).catch(async error => { res.status(400).json(await apiResponse(400, error.message, {}, {})) })
}
export const change_password = async (req: Request, res: Response, next: any) => {
    const schema = Joi.object({
        newPassword: Joi.string().trim().email().error(new Error('newPassword is invaild!')),
        oldPassword: Joi.string().error(new Error('oldPassword is invaild!')),
    })
    // console.log("------------------------req.body", req.body);
    schema.validateAsync(req.body).then(async result => {
        // console.log(result, "---------------------------result");
        return next()
    }).catch(async error => { res.status(400).json(await apiResponse(400, error.message, {}, {})) })
}
export const resend_otp = async (req: Request, res: Response, next: any) => {
    const schema = Joi.object({
        email: Joi.string().trim().email().error(new Error('Email is invaild!')),
    })
    // console.log("------------------------req.body", req.body);
    schema.validateAsync(req.body).then(async result => {
        // console.log(result, "---------------------------result");
        return next()
    }).catch(async error => { res.status(400).json(await apiResponse(400, error.message, {}, {})) })
}