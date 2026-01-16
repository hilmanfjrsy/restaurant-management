import { Request, Response } from "express";

import { jest } from "@jest/globals";

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

  const res: any = {
    _getData: () => responseData,
    _getStatusCode: () => statusCode,
    status: (jest.fn() as any).mockImplementation((code: number) => {
      statusCode = code;
      return res;
    }),
    json: (jest.fn() as any).mockImplementation((data: any) => {
      responseData = data;
      return res;
    }),
    send: (jest.fn() as any).mockImplementation((data: any) => {
      responseData = data;
      return res;
    }),
  };

  return res;
};
