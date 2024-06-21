"use strict"
import * as Joi from "joi"
import { apiResponse } from '../common'
import { isValidObjectId } from 'mongoose'
import { Request, Response } from 'express'

export const add_room = async (req: Request, res: Response, next: any) => {
    const schema = Joi.object({
        userIds: Joi.array().error(new Error('userIds is array!')),
    })
    schema.validateAsync(req.body).then(async result => {
        // console.log(result, "---------------------------result");
        return next()
    }).catch(async error => { res.status(400).json(await apiResponse(400, error.message, {}, {})) })
}