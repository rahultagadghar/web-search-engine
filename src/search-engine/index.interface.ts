import { Response } from "express";
export interface ExpressResponse extends Response {

    finish: (obj?: object, msg?: string, httpStatus?: number, errors?: object) => void

}
