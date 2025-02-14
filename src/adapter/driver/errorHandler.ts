import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { StatusCodes } from 'http-status-codes';
import { ZodError } from 'zod';

import { BaseException } from '@exceptions/baseException';
import logger from '@src/core/common/logger';

type FastifyErrorHandler = FastifyInstance['errorHandler'];

export const errorHandler: FastifyErrorHandler = (error, request, reply) => {
	const responseError = {
		path: request.url,
		status: StatusCodes.INTERNAL_SERVER_ERROR,
		message: error?.message || 'Generic error',
	};

	if (error instanceof ZodError) {
		responseError.message = error.errors
			.map((err) => `${err.path.join('.')}: ${err?.message}`)
			.join(', ');
		responseError.status = StatusCodes.BAD_REQUEST;
	}

	if (error instanceof BaseException) {
		responseError.message = error?.message;
		responseError.status = error?.statusCode;
	}

	reply.status(responseError.status).send(JSON.stringify(responseError));
};

export function handleError(
	req: FastifyRequest,
	reply: FastifyReply,
	error: any,
	message?: string
): void {
	const responseError = {
		path: req.url,
		status: StatusCodes.INTERNAL_SERVER_ERROR,
		message: message || error?.message || 'Generic error',
	};

	if (error instanceof ZodError) {
		responseError.message = error.errors
			.map((err) => `${err.path.join('.')}: ${err?.message}`)
			.join(', ');
		responseError.status = StatusCodes.BAD_REQUEST;
	}

	if (error instanceof BaseException) {
		responseError.message = error?.message;
		responseError.status = error?.statusCode;
	}

	logger.error(`[❌ ERROR HANDLER] Unexpected error: ${JSON.stringify(error)}`);

	reply.status(responseError.status).send(JSON.stringify(responseError));
}
