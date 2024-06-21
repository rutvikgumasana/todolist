"use strict"
import { messageModel, roomModel } from '../../database'
import { apiResponse, } from '../../common'
import { Request, Response } from 'express'
import { responseMessage } from '../../helper/response'

const ObjectId = require('mongoose').Types.ObjectId

export const get_message = async (req: Request, res: Response) => {
    let user: any = req.header('user'), { roomId } = req.query
    try {
        let response = await messageModel.aggregate([
            { $match: { roomId: new ObjectId(roomId), isActive: true } },

            { $sort: { createdAt: -1 } },

            {
                $project: {
                    user: 1, message: 1, senderId: 1, receiverId: 1, status: 1, createdAt: 1, uistatus: 1, media: 1, extraid: 1
                }
            }
        ])
        await messageModel.updateMany({ roomId: new ObjectId(roomId), isActive: true, receiverId: new ObjectId(user?._id) }, { status: 2 })
        return res.status(200).json(await apiResponse(200, responseMessage?.getDataSuccess('message by roomId'), response, {}))
    } catch (error) {
        console.log(error);
        return res.status(500).json(await apiResponse(500, responseMessage?.internalServerError, {}, {}))
    }
}


export const delete_message = async (req: Request, res: Response) => {
    let id = (req.params.id)
    try {
        // if (req.body?.delete_all) {
        // await messageModel.updateMany({ createdBy: new ObjectId((req.header('user') as any)?._id), isActive: true }, { $set: { isActive: false } })
        let response = await messageModel.deleteMany({ isActive: true, roomId: new ObjectId(id) })
        let count: any = await roomModel.findOne({ _id: new ObjectId(id) })

        if (response) {

            await roomModel.findOneAndUpdate({ _id: new ObjectId(id) }, {
                count: {
                    [new ObjectId(count?.userIds[0])]: 0,
                    [new ObjectId(count?.userIds[1])]: 0,
                }
            })
            return res.status(200).json(await apiResponse(200, responseMessage?.allMessageDelete, {}, {}))
        }
        // }
        // else {
        //     await notificationModel.updateMany({ createdBy: await ObjectId((req.header('user') as any)?._id), isActive: true, _id: { $in: req.body?.notificationId } }, { $set: { isActive: false } })
        //     return res.status(200).json(await apiResponse(200, responseMessage?.selectedNotificationDelete, {}, {}))
        // }
    } catch (error) {
        console.log(error)
        return res.status(500).json(await apiResponse(500, responseMessage?.internalServerError, {}, error))
    }
}

export const onedelete_message = async (req: Request, res: Response) => {
    let id = (req.params.id), update_match: any
    try {
        // if (req.body?.delete_all) {
        // await messageModel.updateMany({ createdBy: new ObjectId((req.header('user') as any)?._id), isActive: true }, { $set: { isActive: false } })

        let eee = await messageModel.findOne({ _id: new ObjectId(id) })

        let response = await messageModel.deleteOne({ isActive: true, _id: new ObjectId(id) })

        if (response) {
            if (eee.status == 0) {
                // update_match[`$inc`] = { [`count.${ObjectId(eee?.receiverId)}`]: -1 }
                let extra = await roomModel.updateOne({ _id: new ObjectId(eee?.roomId), isActive: true, isBlock: false }, { $inc: { [`count.${ObjectId(eee?.receiverId)}`]: -1 } })

            }
            return res.status(200).json(await apiResponse(200, responseMessage?.allMessageDelete, {}, {}))

        }
        // }
        // else {
        //     await notificationModel.updateMany({ createdBy: new ObjectId((req.header('user') as any)?._id), isActive: true, _id: { $in: req.body?.notificationId } }, { $set: { isActive: false } })
        //     return res.status(200).json(new apiResponse(200, responseMessage?.selectedNotificationDelete, {}, {}))
        // }
    } catch (error) {
        console.log(error)
        return res.status(500).json(await apiResponse(500, responseMessage?.internalServerError, {}, error))
    }
}


