"use strict"
import http from 'http'
import { notification_template } from '../common';
import { messageModel, roomModel, userModel } from '../database';
import { notification_to_user } from './notification';

const ObjectId = require('mongoose').Types.ObjectId
let server: any, io: any
export const socketServer = (app) => {
    server = new http.Server(app);
    io = require('socket.io')(server, { cors: true, })
    ioEvents(io);
    return server;
}
let users = {}, roomMember = []
const channels = {};
const ioEvents = (io) => {
    // Rooms namespace
    io.of('/room').on('connection', (socket) => {

        // Create a new room

        socket.on('online', async ({ userId }) => {

            // Adding userId into JSON
            users[userId] = (socket.id);
            socket.on('join_room', async ({ roomId, userId }) => {
                roomMember.push(`${roomId}_${userId}`)
                await roomModel.findOneAndUpdate({ _id: new ObjectId(roomId), isActive: true, isBlock: false }, { [`count.${userId}`]: 0 })
                socket.join(`${roomId}`)

                socket.on('send_message', async (data) => {

                    let { roomId, senderId, receiverId, message, media } = data, status = 0, update_match: any = { isActive: true, }

                    if (roomMember.indexOf(`${roomId}_${receiverId}`) != -1) status = 2
                    if (users[`${receiverId}`] != null && status == 0) status = 1
                    if (status == 1 || status == 0) update_match[`$inc`] = { [`count.${receiverId}`]: 1 }
                    if (status == 2) update_match[`count.${receiverId}`] = 0
                    update_match.countFlag = 1

                    await roomModel.updateMany({ userIds: { $in: [new ObjectId(data.receiverId), new ObjectId(data.senderId)] }, isActive: true, isBlock: false }, { $set: { countFlag: 0 } })

                    await roomModel.updateOne({ _id: new ObjectId(data?.roomId), isActive: true, isBlock: false }, update_match)
                    let userData: any = await userModel.findOne({ _id: new ObjectId(data.receiverId), isActive: true, isBlock: false })
                    let userData1: any = await userModel.findOne({ _id: new ObjectId(data.senderId), isActive: true, isBlock: false })
                    userData1.message = message
                    userData1.media = media
                    userData1.roomId = roomId
                    let notification = await notification_template.message(userData1)

                    let messageData: any = await new messageModel({
                        receiverId: new ObjectId(receiverId),
                        senderId: new ObjectId(senderId), status,
                        message, media, roomId: new ObjectId(roomId),
                        uistatus: media.length > 0 ? 3 : 0


                    }).save()
                    let ext = await messageModel.findOne({ _id: new ObjectId(messageData._id) })

                    if (userData?.notification?.message && !userData?.notification?.all) {
                        await notification_to_user(userData || { deviceToken: [] }, notification?.data, notification?.template)

                    }
                    data = { senderId, receiverId, message, media, _id: messageData?._id, createdAt: messageData?.createdAt, status: messageData?.status }

                    io.to(socket?.id).emit('receive_message', data);
                    socket.to(`${roomId}`).emit('receive_message', data)

                    let ext1 = await messageModel.findOne({ _id: new ObjectId(messageData._id) })

                });
            });


        })
        socket.on('leave_room', async ({ roomId, userId, socketId }) => {


            roomMember = roomMember.filter(a => a !== `${roomId}_${userId}`)

            socket.leave(`${roomId}`)
            io.to(socketId).emit("leave_room_res", roomMember);


        })
        socket.on("disconnecting", () => {
            console.log(socket.rooms);
        });

        socket.on('disconnect', () => {
            // REMOVE FROM SOCKET USERS
            delete users[Object.keys(users)[`${Object.values(users).indexOf(socket.id)}`]]
            socket.disconnect(); // DISCONNECT SOCKET
        });


    })

}

