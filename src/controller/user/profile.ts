import { Request, Response } from "express";
import { apiResponse } from "../../common";
import { userModel } from "../../database";
import { responseMessage, reqInfo } from "../../helper";
import bcryptjs from "bcryptjs"
import config from 'config';
import jwt from "jsonwebtoken"
import { loginType } from "../../common";
import { close } from "fs";
import moment from "moment";
import axios from "axios";
// import axios from 'axios';

const jwt_token_secret = config.get('jwt_token_secret')
const refresh_jwt_token_secret = config.get('refresh_jwt_token_secret')
const ObjectId = require('mongoose').Types.ObjectId;



// =======================================User Profile =================================
export const getProfile = async (req: Request, res: Response) => {
    reqInfo(req)
    let { user }: any = req.headers
    try {
        let response = await userModel.aggregate([
            { $match: { _id: ObjectId(user._id), isActive: true } },
            {
                $lookup: {
                    from: "transactions",
                    let: { userId: '$_id' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ['$userId', '$$userId'] },
                                        { $eq: ['$isActive', true] },
                                    ],
                                },
                            }
                        },
                    ],
                    as: "transactionsData"
                }
            },
        ])
        if (response) { return res.status(200).send(await apiResponse(200, responseMessage?.getDataSuccess('Profile'), response, {})) }
    } catch (error) {
        console.log(error);

        return res.status(500).send(await apiResponse(500, responseMessage?.internalServerError, {}, {}))
    }
}

export const updateProfile = async (req: Request, res: Response) => {
    reqInfo(req)
    let { user }: any = req.headers
    let body = req.body
    try {
        let response = await userModel.findOneAndUpdate({ _id: ObjectId(user?._id), isActive: true }, body, { new: true });
        if (response) { return res.status(200).send(await apiResponse(200, responseMessage?.updateDataSuccess('Profile'), response, {})) }
    } catch (error) {
        console.log(error);

        return res.status(500).send(await apiResponse(500, responseMessage?.internalServerError, {}, {}))
    }
}
