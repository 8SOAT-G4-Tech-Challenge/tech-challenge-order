import { FastifyReply, FastifyRequest } from 'fastify';
import { StatusCodes } from 'http-status-codes';

import { OrderService } from '@application/services';
import logger from '@common/logger';
import { handleError } from '@driver/errorHandler';
import { Order } from '@models/order';
import {
	CreateOrderParams,
	GetOrderByIdParams,
	GetOrderByIdQueryParams,
	GetOrderQueryParams,
	UpdateOrderParams,
} from '@ports/input/orders';
import { CreateOrderResponse } from '@ports/output/orders';

export class OrderController {
	private readonly orderService: OrderService;

	constructor(orderService: OrderService) {
		this.orderService = orderService;
	}

	async getOrders(
		req: FastifyRequest<{ Querystring: GetOrderQueryParams }>,
		reply: FastifyReply
	) {
		try {
			logger.info('Listing orders');
			const orders: Order[] = await this.orderService.getOrders(req.query);
			reply.code(StatusCodes.OK).send(orders);
		} catch (error) {
			logger.error(
				`Unexpected error when trying to get orders: ${JSON.stringify(
					error?.response?.message
				)}`
			);
			handleError(req, reply, error);
		}
	}

	async getOrderById(
		req: FastifyRequest<{
			Params: GetOrderByIdParams;
			Query: GetOrderByIdQueryParams;
		}>,
		reply: FastifyReply
	) {
		try {
			logger.info('Listing order by id');
			const order: CreateOrderResponse = await this.orderService.getOrderById({
				...req?.params,
				// @ts-expect-error typescript
				...req?.query,
			});
			reply.code(StatusCodes.OK).send(order);
		} catch (error) {
			logger.error(
				`Unexpected error when trying to list order by id: ${JSON.stringify(
					error
				)}`
			);
			handleError(req, reply, error);
		}
	}

	async createOrder(
		req: FastifyRequest<{ Body: CreateOrderParams }>,
		reply: FastifyReply
	) {
		try {
			logger.info('Creating order');
			const order: CreateOrderResponse = await this.orderService.createOrder(
				req.body
			);
			reply.code(StatusCodes.CREATED).send(order);
		} catch (error) {
			logger.error(
				`Unexpected error when trying to create order: ${JSON.stringify(
					error?.response?.message
				)}`
			);
			handleError(req, reply, error);
		}
	}

	async updateOrder(
		req: FastifyRequest<{ Params: Pick<Order, 'id'>; Body: UpdateOrderParams }>,
		reply: FastifyReply
	) {
		try {
			logger.info(`Updating order ${req?.params?.id}`);
			const order: CreateOrderResponse = await this.orderService.updateOrder({
				...req.body,
				id: req?.params?.id,
			});
			reply.code(StatusCodes.OK).send(order);
		} catch (error) {
			logger.error(
				`Unexpected error when trying to update order: ${JSON.stringify(
					error?.response?.message
				)}`
			);
			handleError(req, reply, error);
		}
	}

	async getNumberOfValidOrdersToday(req: FastifyRequest, reply: FastifyReply) {
		try {
			logger.info('[ORDER CONTROLLER] Getting number of valid orders today');
			const numberValidOrders: number =
				await this.orderService.getNumberOfValidOrdersToday();
			reply.code(StatusCodes.OK).send(numberValidOrders);
		} catch (error) {
			handleError(req, reply, error);
		}
	}
}
