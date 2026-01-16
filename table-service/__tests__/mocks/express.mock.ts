import { Request, Response } from "express";

export const createMockRequest = (
  overrides: Partial<Request> = {}
): Partial<Request> => ({
  query: {},
  params: {},
  body: {},
  headers: {},
  ...overrides,
});

export const createMockResponse = (): Partial<Response> & {
  _getData: () => any;
  _getStatusCode: () => number;
} => {
  let responseData: any = null;
  let statusCode: number = 200;

  const res: Partial<Response> & {
    _getData: () => any;
    _getStatusCode: () => number;
  } = {
    status: jest.fn().mockImplementation((code: number) => {
      statusCode = code;
      return res;
    }),
    json: jest.fn().mockImplementation((data: any) => {
      responseData = data;
      return res;
    }),
    send: jest.fn().mockImplementation((data: any) => {
      responseData = data;
      return res;
    }),
    _getData: () => responseData,
    _getStatusCode: () => statusCode,
  };

  return res;
};
