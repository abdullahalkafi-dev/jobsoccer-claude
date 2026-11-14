import { Response } from 'express';
import { requestContext } from '../logger/transport';
import { resolveLang, translateMessage } from '../i18n';

type IData<T> = {
  success: boolean;
  statusCode: number;
  message?: string;
  meta?: {
    page: number;
    limit: number;
    totalPage: number;
    total: number;
  };
  data?: T;
};

const sendResponse = <T>(res: Response, data: IData<T>) => {
  // Get requestId from async context
  const context = requestContext.getStore();
  const requestId = context?.requestId;

  const resData = {
    success: data.success,
    // The code writes English sentences; the user gets them in their language.
    message: data.message === undefined ? undefined : translateMessage(data.message, res.req?.lang ?? resolveLang(res.req ?? {})),
    meta: data.meta,
    data: data.data,
    ...(requestId && { requestId }), // Add requestId if available
  };
  res.status(data.statusCode).json(resData);
};

export default sendResponse;
