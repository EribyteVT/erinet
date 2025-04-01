import { NextResponse } from "next/server";

export function successResponse(data: any, status: number = 200) {
  return NextResponse.json(
    {
      response: "OKAY",
      data,
    },
    { status }
  );
}

export function errorResponse(
  message: string = "An error occurred",
  status: number = 500
) {
  return NextResponse.json(
    {
      response: "ERROR",
      message,
    },
    { status }
  );
}

export function forbiddenResponse(message: string = "Access denied") {
  return NextResponse.json(
    {
      response: "FORBIDDEN",
      message,
    },
    { status: 403 }
  );
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
