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


export const signUp = async (req: Request, res: Response) => {
    reqInfo(req)
    let body = req.body
    try {
        let isAlreadyExist: any
        isAlreadyExist = await userModel.findOne({ email: body.email, isActive: true })
        // console.log('isAlreadyExist :>> ', isAlreadyExist);
        if (isAlreadyExist) {
            return res.status(403).json(await apiResponse(403, responseMessage.alreadyUser, null, {}))
        }

        body.loginType = loginType.email;
        let salt = await bcryptjs.genSaltSync(8)
        let hashPassword = await bcryptjs.hash(body.password, salt)
        body.password = hashPassword
        let response: any = await new userModel(body).save()
        const token = jwt.sign({
            _id: response._id,
            status: "User Singup",
            deviceToken: body.deviceToken,
            generatedOn: (new Date().getTime())
        }, jwt_token_secret)
        const refresh_token = jwt.sign({
            _id: response._id,
            deviceToken: body.deviceToken,
            generatedOn: (new Date().getTime())
        }, refresh_jwt_token_secret)
        response = { response, token, refresh_token };
        // console.log('response :>> ', response);
        if (response) {
            return res.status(200).json(await apiResponse(200, responseMessage.signupSuccess, response, {}))
        }
        return res.status(406).json(await apiResponse(406, responseMessage.addDataError, null, {}))
    } catch (error) {
        console.log(error);
        return res.status(500).json(await apiResponse(500, responseMessage?.internalServerError, {}, error))

    }

}


export const login = async (req: Request, res: Response) => {
    reqInfo(req)
    let { email, password, type, deviceToken } = req.body;
    try {
        let response = await userModel.findOne({ email: email, isActive: true });

        if (!response) {
            return res.status(404).json(await apiResponse(404, responseMessage?.invalidEmail, null, {}));
        }

        const passwordMatch = await bcryptjs.compare(password, response.password);

        if (!passwordMatch) {
            return res.status(400).json(await apiResponse(400, responseMessage?.invalidUserPasswordEmail, null, {}));
        }

        const token = jwt.sign({
            _id: response._id,
            status: "User Login",
            deviceToken,
            generatedOn: (new Date().getTime())
        }, jwt_token_secret);

        const refresh_token = jwt.sign({
            _id: response._id,
            deviceToken,
            generatedOn: (new Date().getTime())
        }, refresh_jwt_token_secret);

        response = { response, token, refresh_token };
        return res.status(200).json(await apiResponse(200, responseMessage?.loginSuccess, response, {}));
    } catch (error) {
        console.log("error", error);
        return res.status(500).json(await apiResponse(500, responseMessage?.internalServerError, null, {}));
    }
}

export const resend_otp = async (req: Request, res: Response) => {
    reqInfo(req)
    let body = req.body
    try {
        let data: any = await userModel.findOne({ email: body.email, isActive: true })
        // console.log('data2', data)
        if (!data) return res.status(400).json(await apiResponse(400, responseMessage.invalidEmail, {}, {}));
        let otp = Math.floor(30000 + Math.random() * 50000),
            otpExpireTime = new Date(new Date().setMinutes(new Date().getMinutes() + 5))
        body.otp = otp
        body.otpExpireTime = otpExpireTime
        let response: any = await userModel.findOneAndUpdate({ email: body.email, isActive: true }, { otp: otp, otpExpireTime: otpExpireTime }, { new: true })
        if (response) {
            // var resend_otp_mail: any = await signUp_verification_mail({ email: data?.email, otp: otp, otpExpireTime: otpExpireTime })
            // console.log('response=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-?????', response)
            return res.status(200).send(await apiResponse(200, "otp send successfully!!", {}, {}))
        } else {
            return res.status(403).send(await apiResponse(403, responseMessage?.updateDataError("otp"), {}, {}))
        }
    } catch (error) {
        console.log(error)
        return res.status(500).json(await apiResponse(500, responseMessage.internalServerError, {}, {}))
    }
}

export const forgot_password = async (req: Request, res: Response) => {
    reqInfo(req)
    let body = req.body
    try {
        let data: any = await userModel.findOne({ email: body.email, isActive: true })
        if (!data) return res.status(400).json(await apiResponse(400, responseMessage.customMessage("You have entered an invalid email!"), {}, {}));
        let otp = Math.floor(30000 + Math.random() * 50000),
            otpExpireTime = new Date(new Date().setMinutes(new Date().getMinutes() + 5))
        body.otp = otp
        body.otpExpireTime = otpExpireTime

        let response: any = await userModel.findOneAndUpdate({ email: body.email, isActive: true }, { otp: otp, otpExpireTime: otpExpireTime }, { new: true })
        if (response) {
            // var resend_otp_mail: any = await signUp_verification_mail({ email: data?.email, otp: otp, otpExpireTime: otpExpireTime })
            // console.log('response=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-?????', response)
            return res.status(200).send(await apiResponse(200, "otp send successfully!!", {}, {}))
        } else {
            return res.status(403).send(await apiResponse(403, responseMessage?.updateDataError("otp"), {}, {}))
        }
    } catch (error) {
        console.log(error)
        return res.status(500).json(await apiResponse(500, responseMessage.internalServerError, {}, {}))
    }
}

export const forgot_password_otp_verification = async (req: Request, res: Response) => {
    reqInfo(req)
    let body = req.body
    try {
        let response: any = await userModel.findOne({ email: body.email, isActive: true })
        // console.log('response :>> ', response);
        if (!response) {
            return res.status(404).json(await apiResponse(404, responseMessage.errorMail, null, {}))
        } else {
            let otpVerify = await userModel.findOne({ email: response.email, otp: body.otp, isActive: true })
            if (otpVerify) {
                let timeDiff = new Date().getTime() - new Date(response.otpExpireTime).getTime()
                if (timeDiff > 0) {
                    return res.status(206).json(await apiResponse(206, responseMessage.expireOTP, null, {}))
                }
                let d = await userModel.findOneAndUpdate({ email: body.email, isActive: true }, { otp: null, otpExpireTime: null }, { new: true })
                // console.log('d-================================-=-=--=-=-=-=-=--=->>>', d)
                return res.status(200).json(await apiResponse(200, responseMessage.OTPverified, response, {}))
            } else {
                return res.status(404).json(await apiResponse(404, responseMessage.invalidOTP, null, {}))
            }
        }
    } catch (error) {
        console.log("error", error)
        return res.status(500).json(await apiResponse(500, responseMessage.internalServerError, {}, error))
    }
}

export const change_password = async (req: Request, res: Response) => {
    reqInfo(req)
    let { user }: any = req.headers
        , { oldPassword, newPassword } = req.body
    try {
        let data = await userModel.findOne({ _id: ObjectId(user?._id), isActive: true })
        // console.log('data :>> ', data);
        const passwordIsCorrect = await bcryptjs.compare(oldPassword, data.password)
        console.log('passwordIsCorrect :>> ', passwordIsCorrect);
        if (!passwordIsCorrect) return res.status(400).json(await apiResponse(400, responseMessage?.invalidOldPassword, {}, {}))
        const hashPassword = await bcryptjs.hash(newPassword, await bcryptjs.genSaltSync(8))
        let d = await userModel.updateOne({ _id: ObjectId(user?._id), isActive: true }, { password: hashPassword })
        // console.log('d :>> ', d);
        return res.status(200).json(await apiResponse(200, responseMessage?.passwordChangeSuccess, {}, {}))
    } catch (error) {
        console.log(error)
        return res.status(500).json(await apiResponse(500, responseMessage?.internalServerError, {}, error))
    }
}

export const reset_password = async (req: Request, res: Response) => {
    reqInfo(req)
    let body = req.body
    try {
        const salt = await bcryptjs.genSaltSync(10)
        const hashPassword = await bcryptjs.hash(body.password, salt)
        body.password = hashPassword

        let response = await userModel.findOneAndUpdate({ email: body.email, isActive: true }, body, { new: true })
        // console.log("-----------------", response);
        if (response) {
            return res.status(200).json(await apiResponse(200, responseMessage?.resetPasswordSuccess, { action: "please go to login page" }, {}))
        }
        else return res.status(501).json(await apiResponse(501, responseMessage?.resetPasswordError, response, {}))
    } catch (error) {
        console.log("error", error)
        return res.status(500).json(await apiResponse(500, responseMessage.internalServerError, {}, error));
    }
}

export const logOut = async (req: Request, res: Response) => {
    reqInfo(req)
    let { user }: any = req.headers
    try {
        let response = await userModel.updateOne({ _id: ObjectId(req.body._id), isActive: true }, { $pull: { deviceToken: req.body.deviceToken } });
        console.log('response logout:>> ', response);
        if (response) { return res.status(200).send(await apiResponse(200, responseMessage?.logout, { response }, {})) }
    } catch (error) {
        console.log(error);

        return res.status(500).send(await apiResponse(500, responseMessage?.internalServerError, {}, {}))
    }
}




// =================================== Social Login =================================

export const googleLogin = async (req: Request, res: Response) => {
    let { accessToken, idToken, deviceToken, email, name, type } = req.body
    console.log('req.body :>> ', req.body);
    try {

        if (accessToken && idToken) {
            let verificationAPI = `https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=${accessToken}`,
                idAPI = `https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`;

            let access_token: any = await axios
                .get(verificationAPI)
                .then((result) => {
                    return result.data;
                })
                .catch((error) => {
                    return false;
                });
            let id_token: any = await axios
                .get(idAPI)
                .then((result) => {
                    return result.data;
                })
                .catch((error) => {
                    return false;
                });
            // console.log(access_token, id_token, "sdfsdfsdf");
            // if (!accessToken && !idToken) {

            // }
            if (
                access_token.email == id_token.email &&
                access_token.verified_email == true
            ) {
                const isUser = await userModel.findOneAndUpdate(
                    {
                        email: id_token.email,
                        isActive: true,
                    },
                    { $set: { type: type } }
                );
                if (!isUser) {
                    let name = id_token.given_name + " " + id_token.family_name
                    let email = id_token.email


                    for (let flag = 0; flag < 1;) {
                        var authToken = await Math.round(Math.random() * 1000000);
                        if (authToken.toString().length == 6) {
                            flag++;
                        }
                    }
                    return new userModel({
                        email: id_token.email,
                        name: id_token.given_name + " " + id_token.family_name,
                        userName: id_token.given_name + " " + id_token.family_name,
                        loginType: loginType.google,
                        deviceToken: [deviceToken],
                        authToken,
                        type
                    })
                        .save()
                        .then(async (response) => {
                            const token = jwt.sign(
                                {
                                    _id: response._id,
                                    status: "Login",
                                    deviceToken,
                                    generatedOn: new Date().getTime(),
                                },
                                jwt_token_secret
                            );

                            console.log('token1 :>> ', token);
                            let return_response = {
                                _id: response._id,
                                email: response?.email,
                                userName: response?.userName,
                                type: response?.type,
                                token,
                                deviceToken: [deviceToken]
                            };
                            return res
                                .status(200)
                                .json(
                                    await apiResponse(
                                        200,
                                        responseMessage.loginSuccess,
                                        return_response,
                                        {}
                                    )
                                );
                        });
                } else {
                    isUser.deviceToken = [deviceToken];
                    const token = jwt.sign(
                        {
                            _id: isUser._id,
                            status: "Login",
                            deviceToken,
                            generatedOn: new Date().getTime(),
                        },
                        jwt_token_secret
                    );
                    console.log('token2 :>> ', token);
                    let response = {
                        _id: isUser._id,
                        email: isUser.email,
                        userName: isUser?.userName,
                        type: isUser?.type,
                        token,
                        deviceToken: [deviceToken]
                    };
                    await isUser.save()

                    return res
                        .status(200)
                        .json(
                            await apiResponse(
                                200,
                                responseMessage?.loginSuccess,
                                response,
                                {}
                            )
                        );
                }
            }
            return res
                .status(401)
                .json(
                    await apiResponse(
                        401,
                        responseMessage.invalidUserPasswordEmail,
                        {},
                        {}
                    )
                );
        } else {
            const isUser = await userModel.findOneAndUpdate(
                {
                    email,
                    isActive: true,
                },
                { $set: { type: type } }
            );
            console.log('isUser :>> ', isUser);
            if (!isUser) {
                for (let flag = 0; flag < 1;) {
                    var authToken = await Math.round(Math.random() * 1000000);
                    if (authToken.toString().length == 6) {
                        flag++;
                    }
                }
                return new userModel({
                    email,
                    name,
                    userName: name,
                    loginType: loginType.google,
                    deviceToken: [deviceToken],
                    authToken,
                    type
                })
                    .save()
                    .then(async (response) => {
                        const token = jwt.sign(
                            {
                                _id: response._id,
                                status: "Login",
                                deviceToken,
                                generatedOn: new Date().getTime(),
                            },
                            jwt_token_secret
                        );
                        console.log('token3 :>> ', token);
                        let return_response = {
                            _id: response._id,
                            email: response?.email,
                            userName: response?.userName,
                            type: response?.type,
                            token,
                            deviceToken: [deviceToken]
                        };
                        return res
                            .status(200)
                            .json(
                                await apiResponse(
                                    200,
                                    responseMessage.loginSuccess,
                                    return_response,
                                    {}
                                )
                            );
                    });
            } else {
                isUser.deviceToken = [deviceToken];
                const token = jwt.sign(
                    {
                        _id: isUser._id,
                        status: "Login",
                        deviceToken,
                        generatedOn: new Date().getTime(),
                    },
                    jwt_token_secret
                );
                console.log('token4 :>> ', token);
                let response = {
                    _id: isUser._id,
                    email: isUser.email,
                    userName: isUser?.name,
                    type: isUser.type,
                    token,
                    deviceToken: [deviceToken]
                };
                await isUser.save()

                return res
                    .status(200)
                    .json(
                        await apiResponse(
                            200,
                            responseMessage?.loginSuccess,
                            response,
                            {}
                        )
                    );
            }
        }
    } catch (error) {
        console.log('error :>> ', error);
        return res.status(500).send(await apiResponse(500, responseMessage?.internalServerError, {}, {}))
    }
}

export const Apple_SL = async (req: Request, res: Response) => {
    let { deviceToken, email, lastName, firstName, appleAuthCode, type } = req.body,
        match: any = {};
    reqInfo(req);
    try {
        if (email && appleAuthCode.length != 0)
            match = { $or: [{ email }, { appleAuthCode }], isActive: true };
        if (!email && appleAuthCode.length != 0)
            match = { isActive: true, appleAuthCode };
        let userExist = await userModel.findOneAndUpdate(
            match,
            {
                $addToSet: {
                    ...(appleAuthCode.length != 0 && { appleAuthCode }),
                },
                $set: { type: type }
            },
            { new: true }
        );
        // console.log('userExist :>> ', userExist);
        if (!userExist) {
            if (!email || !lastName || !firstName)
                return res
                    .status(400)
                    .json(
                        await apiResponse(400, responseMessage?.appleAccountError, {}, {})
                    );
            for (let flag = 0; flag < 1;) {
                var authToken = await Math.round(Math.random() * 1000000);
                if (authToken.toString().length == 6) {
                    flag++;
                }
            }
            let name = firstName + " " + lastName

            return new userModel({
                email: email,
                name: firstName + " " + lastName,
                loginType: loginType.apple,
                deviceToken: [deviceToken],
                appleAuthCode: appleAuthCode,
                type
            })
                .save()
                .then(async (response) => {

                    const token = jwt.sign(
                        {
                            _id: response._id,
                            status: "Login",
                            deviceToken,
                            generatedOn: new Date().getTime(),
                        },
                        jwt_token_secret
                    );

                    let return_response = {
                        _id: response._id,
                        email: response?.email,
                        userName: response?.userName,
                        name: response?.name,
                        type: response?.type,
                        token,
                        deviceToken: [deviceToken]
                    };
                    return res
                        .status(200)
                        .json(
                            await apiResponse(
                                200,
                                responseMessage?.loginSuccess,
                                return_response,
                                {}
                            )
                        );
                });
        } else {
            userExist.deviceToken = [deviceToken];


            const token = jwt.sign(
                {
                    _id: userExist._id,
                    status: "Login",
                    deviceToken,
                    generatedOn: new Date().getTime(),
                },
                jwt_token_secret
            );


            let response = {
                _id: userExist._id,
                email: userExist.email,
                userName: userExist?.userName,
                name: userExist?.name,
                type: userExist?.type,
                token,
                deviceToken: [deviceToken]
            };
            await userExist.save()

            // console.log('response :>> ', response);
            return res
                .status(200)
                .json(
                    await apiResponse(200, responseMessage?.loginSuccess, response, {})
                );
        }
    } catch (error) {
        console.log('error :>> ', error);
        return res
            .status(500)
            .json(
                await apiResponse(500, responseMessage?.internalServerError, {}, error)
            );
    }
};
