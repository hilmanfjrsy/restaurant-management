import { Response } from "express";


export function successResponse<T>(res: Response, data: T, message: string = 'Success', statusCode: number = 200) {
  return res.status(statusCode).json({
    status: 'success',
    message,
    data,
  })
}

export function errorResponse<T>(res: Response, data: T, message: string = 'Error', statusCode: number = 500) {
  return res.status(statusCode).json({
    status: 'error',
    message,
    data,
  })
}