import { NextResponse } from "next/server";

export interface NormalizedResponse<T = any> {
  success: boolean;
  data: T | null;
  message: string;
}

export function successResponse(data: any, message: string) {
  return {
    success: true,
    data,
    message,
  };
}

export function errorResponse(message: string = "An error occurred") {
  return {
    success: false,
    data: null,
    message,
  };
}

export function notFoundResponse(message: string = "Resource not found") {
  return NextResponse.json(
    {
      response: "NOT_FOUND",
      message,
    },
    { status: 404 }
  );
}

export function badRequestResponse(
  message: string = "Invalid request parameters"
) {
  return NextResponse.json(
    {
      response: "BAD_REQUEST",
      message,
    },
    { status: 400 }
  );
}

export function withErrorHandling(handler: Function) {
  return async (...args: any[]) => {
    try {
      return await handler(...args);
    } catch (error) {
      console.error("API error:", error);
      const message =
        error instanceof Error ? error.message : "An unexpected error occurred";
      return errorResponse(message);
    }
  };
}

export function extractParams(
  params: Record<string, any>,
  requiredParams: string[]
): Record<string, any> | null {
  const result: Record<string, any> = {};

  for (const param of requiredParams) {
    if (params[param] === undefined || params[param] === null) {
      return null;
    }
    result[param] = params[param];
  }

  return result;
}
