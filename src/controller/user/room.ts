"use strict"
import { messageModel, roomModel } from '../../database'
import { apiResponse, } from '../../common'
import { Request, Response } from 'express'
import { responseMessage } from '../../helper/response'

const ObjectId = require('mongoose').Types.ObjectId

export const add_room = async (req: Request, res: Response) => {

    let user: any = req.header('user'), body = req.body
    try {
        body.userIds = [new ObjectId(body?.userIds[0])]
        body.userIds.push(new ObjectId(user?._id))


        let roomAlreadyExist = await roomModel.findOne({ isActive: true, isBlock: false, userIds: { $size: 2, $all: body.userIds } })
        if (roomAlreadyExist)
            return res.status(200).json(await apiResponse(200, responseMessage?.addDataSuccess('room'), { response: roomAlreadyExist }, {}))
        body.isActive = true
        body.isBlock = false
        body.count = {
            [`${user?._id}`]: 0,
            [new ObjectId(body?.userIds[0])]: 0,
        }
        body.createdBy = new ObjectId(user?._id)
        let response = await roomModel.findOneAndUpdate(body, body, { upsert: true, new: true })
        return res.status(200).json(await apiResponse(200, responseMessage?.addDataSuccess('room'), { response }, {}))
    } catch (error) {
        console.log('error', error);
        return res.status(500).json(await apiResponse(500, responseMessage?.internalServerError, {}, {}))
    }
}

export const get_room = async (req: Request, res: Response) => {

    let user: any = req.header('user'), body = req.body
    let blocklist = req.header('blocklist') as any
    try {

        let response = await roomModel.aggregate([
            { $match: { userIds: { $in: [new ObjectId(user?._id)], $nin: blocklist }, isActive: true, isBlock: false, } },
            {
                $lookup: {
                    from: "messages",
                    let: { createdBy: "$_id" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        // { $eq: ["$receiverId", "$$createdBy"] },
                                        // { $ne: ["$_id",new ObjectId(user?._id)] },
                                        { $eq: ["$roomId", "$$createdBy"] },
                                    ]
                                }
                            }
                        },
                        { $sort: { createdAt: - 1 } },
                        { $limit: 1 },
                        {
                            $project: {
                                message: 1, status: 1, receiverId: 1, createdAt: 1
                            }
                        }
                    ],
                    as: "mes"
                }
            },
            // {
            //     $unwind: {
            //         path: "$user"
            //     }
            // },
            {
                $lookup: {
                    from: "users",
                    let: { userIds: "$userIds" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $in: ["$_id", "$$userIds"] },
                                        { $ne: ["$_id", new ObjectId(user?._id)] },
                                        { $eq: ["$isActive", true] },
                                    ]
                                }
                            }
                        },
                        {
                            $project: {
                                username: 1, image: 1
                            }
                        }
                    ],
                    as: "user"
                }
            },
            {
                $unwind: {
                    path: "$user"
                }
            },
            {
                $addFields: {
                    latestMessageDate: { $arrayElemAt: ["$mes.createdAt", 0] }
                }
            },
            {
                $sort: {
                    latestMessageDate: -1,
                    countFlag: -1
                }
            },
            {
                $project: {
                    count: 1, user: 1, mes: 1, countFlag: 1, unread: {
                        $size: {
                            $filter: {
                                input: "$mes",
                                as: "mes",
                                cond: { $eq: ["$$mes.status", 0] }
                            }
                        }
                    },
                    latestMessageDate: 1
                }
            },

        ])
        return res.status(200).json(await apiResponse(200, responseMessage?.getDataSuccess('room'), response, {}))
    } catch (error) {
        console.log(error);
        return res.status(500).json(await apiResponse(500, responseMessage?.internalServerError, {}, {}))
    }
}

// cond: {  $and: [{$$eq: [ "$$mes.status", 0 ]},{$$eq: [ "$$mes.receiverId",new ObjectId(user?._id) ]} ]}


export const get_room_unread = async (req: Request, res: Response) => {

    let user: any = req.header('user'), body = req.body
    try {
        let response = await messageModel.find({ receiverId: new ObjectId(user?._id), isActive: true, status: 0 }).countDocuments()
        return res.status(200).json(await apiResponse(200, responseMessage?.getDataSuccess('room'), response, {}))
    } catch (error) {
        console.log(error);
        return res.status(500).json(await apiResponse(500, responseMessage?.internalServerError, {}, {}))
    }
}
