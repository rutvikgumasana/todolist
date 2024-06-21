import gcm from 'node-gcm'
import config from 'config'
const sender = new gcm.Sender(config.get('fcmKey'))

export const notification_to_user = async (sender_user_data: any, data: any, notification: any) => {
    return new Promise(async (resolve, reject) => {
        try {
            notification.sound = 'default'
            if (sender_user_data && data && notification && sender_user_data?.deviceToken?.length != 0 && sender_user_data != undefined && sender_user_data != null) {
                let message = new gcm.Message({
                    data: data,
                    notification: notification,
                });
                sender.send(message, {
                    registrationTokens: sender_user_data
                }, function (err: any, response: any) {
                    if (err) {
                        console.log("error", err);
                        reject(err)
                    } else {
                        resolve(response)
                        console.log(response, "---------------------respio");
                    }
                })
            }
            else {
                resolve(true)
            }
        } catch (error) {
            console.log("error=-=-=>>", error);
            reject(error)
        }
    })
}