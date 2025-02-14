import { OrderStatusEnum } from '@application/enumerations/orderStatusEnum';
import logger from '@common/logger';
import { OrderStatusType } from '@domain/types/orderStatusType';
import { prisma } from '@driven/infra/lib/prisma';
import { DataNotFoundException } from '@exceptions/dataNotFound';
import { Order } from '@models/order';
import {
	CreateOrderParams,
	GetOrderByIdParams,
	UpdateOrderParams,
} from '@ports/input/orders';
import { CreateOrderResponse, UpdateOrderResponse } from '@ports/output/orders';
import { OrderRepository } from '@ports/repository/orderRepository';

export class OrderRepositoryImpl implements OrderRepository {
	async getOrders(): Promise<Order[]> {
		const orders = await prisma.order.findMany({
			where: {
				status: {
					notIn: ['finished', 'canceled'],
				},
			},
			include: {
				items: {
					include: {
						product: {
							include: {
								category: true,
								images: true,
							},
						},
					},
				},
			},
		});

		logger.info(`Orders found: ${JSON.stringify(orders)}`);

		return orders;
	}

	async getOrderById({ id }: GetOrderByIdParams): Promise<Order> {
		const order = await prisma.order
			.findFirstOrThrow({
				include: {
					items: {
						include: {
							product: {
								include: {
									category: true,
									images: true,
								},
							},
						},
					},
				},
				where: {
					id,
				},
			})
			.catch(() => {
				throw new DataNotFoundException(`Order with id: ${id} not found`);
			});

		logger.info(`Order found: ${JSON.stringify(order)}`);

		return order;
	}

	async getOrderCreatedById({ id }: GetOrderByIdParams): Promise<Order> {
		const order = await prisma.order
			.findFirstOrThrow({
				include: {
					items: {
						include: {
							product: {
								include: {
									category: true,
									images: true,
								},
							},
						},
					},
				},
				where: {
					id,
					status: 'created',
				},
			})
			.catch(() => {
				throw new DataNotFoundException(
					`Order with id: ${id} and status 'created' not found`
				);
			});

		logger.info(`Order with status 'created' found: ${JSON.stringify(order)}`);

		return order;
	}

	async getOrdersByStatus(status: OrderStatusType): Promise<Order[]> {
		const orders = await prisma.order.findMany({
			where: {
				status,
			},
			include: {
				items: {
					include: {
						product: {
							include: {
								category: true,
								images: true,
							},
						},
					},
				},
			},
		});

		logger.info(`Orders found: ${JSON.stringify(orders)}`);

		return orders;
	}

	async createOrder(order: CreateOrderParams): Promise<CreateOrderResponse> {
		const createdOrder = await prisma.order.create({
			data: {
				customerId: order?.customerId || null,
			},
		});

		logger.info(`Order created: ${JSON.stringify(createdOrder)}`);

		return createdOrder;
	}

	async updateOrder(order: UpdateOrderParams): Promise<UpdateOrderResponse> {
		const updatedOrder = await prisma.order
			.update({
				where: {
					id: order.id,
				},
				data: {
					status: order.status,
					readableId: order.readableId,
				},
			})
			.catch(() => {
				throw new DataNotFoundException(`Order with id: ${order.id} not found`);
			});

		logger.info(`Order updated: ${JSON.stringify(updatedOrder)}`);

		return updatedOrder;
	}

	async getNumberOfValidOrdersToday(): Promise<number> {
		const startDate = new Date();
		startDate.setHours(0, 0, 0, 0);
		const endDate = new Date();
		endDate.setHours(23, 59, 59);

		const validOrders = await prisma.order.count({
			where: {
				createdAt: {
					gte: startDate,
					lte: endDate,
				},
				status: {
					notIn: [OrderStatusEnum.created],
				},
				readableId: {
					not: null,
				},
			},
		});

		return validOrders;
	}
}
