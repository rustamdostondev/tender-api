import { IApiResponse } from '@common/interfaces/api-response.interface';
import { HttpStatus } from '@nestjs/common';

export class CustomApiResponse {
  static success<T>(
    data: T,
    statusCode: number = HttpStatus.OK,
    message = 'Operation successful',
  ): IApiResponse<T> {
    return {
      success: true,
      statusCode,
      message,
      data,
      error: null,
      meta: {
        timestamp: new Date().toISOString(),
      },
    };
  }

  static error(
    message: string,
    statusCode: number = HttpStatus.INTERNAL_SERVER_ERROR,
    details?: Record<string, any>,
    errorCode?: string,
  ): IApiResponse<null> {
    return {
      success: false,
      statusCode,
      message,
      data: null,
      error: {
        code: errorCode || 'ERROR',
        details: details ? JSON.stringify(details) : message,
      },
      meta: {
        timestamp: new Date().toISOString(),
      },
    };
  }

  static paginated<T>(
    data: T[],
    page: number,
    limit: number,
    total: number,
    message = 'Operation successful',
  ): IApiResponse<T[]> {
    const lastPage = Math.ceil(total / limit);
    const currentPage = page;

    return {
      success: true,
      statusCode: HttpStatus.OK,
      message,
      data,
      error: null,
      meta: {
        timestamp: new Date().toISOString(),
        pagination: {
          total,
          page: currentPage,
          limit,
          lastPage,
        },
      },
    };
  }
}
