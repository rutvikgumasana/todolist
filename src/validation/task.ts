"use strict"
import * as Joi from "joi"
import { apiResponse } from '../common'
import { isValidObjectId } from 'mongoose'
import { Request, Response } from 'express'

export const addTask = async (req: Request, res: Response, next: any) => {
    const schema = Joi.object({
        title: Joi.string().error(new Error('title is invaild!')),
        description: Joi.string().error(new Error('description is invaild!')),
        status: Joi.string().error(new Error('status is invalid!')),
    })
    schema.validateAsync(req.body).then(async result => {
        // console.log(result, "---------------------------result");
        return next()
    }).catch(async error => { res.status(400).json(await apiResponse(400, error.message, {}, {})) })
}

export const updateTask = async (req: Request, res: Response, next: any) => {
    const schema = Joi.object({
        id: Joi.string().error(new Error('id is invalid!')),
        title: Joi.string().error(new Error('title is invalid!')),
        description: Joi.string().error(new Error('description is invalid!')),
        status: Joi.string().error(new Error('status is invalid!')),
    })
    schema.validateAsync(req.body).then(async result => {
        // console.log(result, "---------------------------result");
        return next()
    }).catch(async error => { res.status(400).json(await apiResponse(400, error.message, {}, {})) })
}


