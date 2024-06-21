import { Request, Router, Response } from 'express'
import { userStatus } from '../common'
import { userRoutes } from './user'

const router = Router()
const accessControl = (req: Request, res: Response, next: any) => {
    req.headers.userType = userStatus[req.originalUrl.split('/')[1]]
    next()
}

router.use('/user', accessControl, userRoutes)

export { router }   