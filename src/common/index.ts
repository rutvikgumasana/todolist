
export const apiResponse = async (status, message, data, error) => {
    return {
        status,
        message,
        data: await (data),
        error: Object.keys(error)?.length == 0 ? {} : await (error)
    }
}

export const userStatus = {
    user: 1,
    admin: 2
}

export const loginType = {
    email: 1,
    google: 2,
    apple: 3
}

export const notification_template = {
    message: async (data: any) => {
        return {
            template: {
                title: `Message Received`, body: `${data.firstName} ${data.lastName}: ${data.message}`
            },
            data: {
                type: 1, senderId: data?._id, roomId: data?.roomId, senderName: data?.firstName, senderImage: data?.image, click_action: "chat listing",
            }
        }
    }
}
