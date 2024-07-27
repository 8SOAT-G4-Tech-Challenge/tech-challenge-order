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
				customer: true,
				payment: true,
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
					customer: true,
					payment: true,
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
				customer: true,
				payment: true,
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
				},
			})
			.catch(() => {
				throw new DataNotFoundException(`Order with id: ${order.id} not found`);
			});

		logger.info(`Order updated: ${JSON.stringify(updatedOrder)}`);

		return updatedOrder;
	}
}
