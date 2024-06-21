import { taskModel, userModel } from '../../database'
import { apiResponse, } from '../../common'
import { Request, Response } from 'express'
import { responseMessage } from '../../helper/response'

const ObjectId = require('mongoose').Types.ObjectId


export const addTask = async (req: Request, res: Response) => {
    let user = req.header('user') as any, body = req.body
    try {
        body.userId = ObjectId(user._id)
        let response = await new taskModel(body).save()
        if (response) return res.status(200).json(await apiResponse(200, responseMessage?.addDataSuccess('Task'), response, {}));
        else return res.status(400).json(await apiResponse(400, responseMessage?.addDataError, {}, {}));
    } catch (error) {
        console.log('error :>> ', error);
        return res.status(500).json(await apiResponse(500, responseMessage?.internalServerError, {}, error))
    }
}


export const getTaskWithPagination = async (req: Request, res: Response) => {
    let { limit, page, search, type } = req.body,
        user = req.header('user') as any,
        skip: number,
        match: any = { isActive: true, },
        response: any, count: number
    limit = parseInt(limit)
    skip = ((parseInt(page) - 1) * parseInt(limit))

    try {
        if (search && search != "") {
            let titleArray: Array<any> = []
            search = search.split(" ")
            await search.forEach(data => {
                titleArray.push({ title: { $regex: data, $options: 'si' } })
            })
            match.$or = [{ $and: titleArray }];
        }
        response = await taskModel.aggregate([
            { $match: match },
            { $sort: { createdAt: -1 } },
            { $skip: skip },
            { $limit: limit },
            { $project: { createdBy: 0, createdAt: 0, updatedAt: 0, __v: 0, isActive: 0, isBlock: 0 } },
        ])
        count = await taskModel.countDocuments(match)
        return res.status(200).json(await apiResponse(200, responseMessage?.getDataSuccess('Task'), {
            response,
            state: {
                page,
                limit,
                page_limit: Math.ceil(count / limit), data_count: count
            }
        }, {}))
    } catch (error) {
        console.log('error :>> ', error);
        return res.status(500).json(await apiResponse(500, responseMessage?.internalServerError, {}, error))
    }
}


export const getTask = async (req: Request, res: Response) => {
    let user = req.header('user') as any
    try {
        let response = await taskModel.find({ isActive: true, userId: user._id })
        if (response) return res.status(200).json(await apiResponse(200, responseMessage?.getDataSuccess('Task'), {}, {}));
        else return res.status(400).json(await apiResponse(400, responseMessage?.getDataNotFound('Task'), {}, {}));
    } catch (error) {
        console.log('error :>> ', error);
        return res.status(500).json(await apiResponse(500, responseMessage?.internalServerError, {}, error))
    }
}


export const getTaskById = async (req: Request, res: Response) => {
    let id = req.params.id
    try {
        let response = await taskModel.findOne({ _id: ObjectId(id), isActive: true })
        if (response) return res.status(200).json(await apiResponse(200, responseMessage?.getDataSuccess('Task'), {}, {}));
        else return res.status(400).json(await apiResponse(400, responseMessage?.getDataNotFound('Task'), {}, {}));
    } catch (error) {
        console.log('error :>> ', error);
        return res.status(500).json(await apiResponse(500, responseMessage?.internalServerError, {}, error))
    }
}


export const updateTask = async (req: Request, res: Response) => {
    let body = req.body;
    try {
        let response = await taskModel.findOneAndUpdate({ _id: ObjectId(body.id), isActive: true }, body, { new: true })
        if (response) return res.status(200).json(await apiResponse(200, responseMessage?.updateDataSuccess('Task'), {}, {}));
        else return res.status(400).json(await apiResponse(400, responseMessage?.updateDataError('Task'), {}, {}));
    } catch (error) {
        console.log('error :>> ', error);
        return res.status(500).json(await apiResponse(500, responseMessage?.internalServerError, {}, error))
    }
}


export const deleteTask = async (req: Request, res: Response) => {
    let id = req.params.id
    try {
        let response = await taskModel.findOneAndUpdate({ _id: ObjectId(id), isActive: true }, { isActive: false }, { new: true })
        if (response) return res.status(200).json(await apiResponse(200, responseMessage?.deleteDataSuccess('Task'), {}, {}));
        else return res.status(400).json(await apiResponse(400, responseMessage?.deleteDataNotSuccess('Task'), {}, {}));
    } catch (error) {
        console.log('error :>> ', error);
        return res.status(500).json(await apiResponse(500, responseMessage?.internalServerError, {}, error))
    }
}