import { OrderRepositoryImpl } from '@src/adapter/driven/infra';
import { prisma } from '@src/adapter/driven/infra/lib/prisma';
import { DataNotFoundException } from '@src/core/application/exceptions/dataNotFound';
import logger from '@src/core/common/logger';
import { OrderMockBuilder } from '@tests/mocks/order.mock-builder';

jest.useFakeTimers().setSystemTime(new Date('2020-01-01'));

describe('OrderRepositoryImpl -> Test', () => {
	let repository: OrderRepositoryImpl;

	beforeEach(() => {
		repository = new OrderRepositoryImpl();
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	describe('getOrders', () => {
		test('should get orders', async () => {
			const loggerSpy = jest.spyOn(logger, 'info');

			const orders = [new OrderMockBuilder().withDefaultValues().build()];

			jest.spyOn(prisma.order, 'findMany').mockResolvedValue(orders);

			const response = await repository.getOrders();

			expect(response).toEqual(orders);
			expect(loggerSpy).toHaveBeenCalledWith(
				`Orders found: ${JSON.stringify(orders)}`
			);
		});
	});

	describe('getOrderById', () => {
		test('should get order by ID', async () => {
			const loggerSpy = jest.spyOn(logger, 'info');

			const order = new OrderMockBuilder().withDefaultValues().build();

			jest.spyOn(prisma.order, 'findFirstOrThrow').mockResolvedValue(order);

			const response = await repository.getOrderById({ id: order.id });

			expect(response).toEqual(order);
			expect(loggerSpy).toHaveBeenCalledWith(
				`Order found: ${JSON.stringify(order)}`
			);
		});

		test('should throw DataNotFoundException', async () => {
			const order = new OrderMockBuilder().withDefaultValues().build();

			jest.spyOn(prisma.order, 'findFirstOrThrow').mockRejectedValue('error');

			const rejectedFunction = async () => {
				await repository.getOrderById({ id: order.id });
			};

			try {
				await rejectedFunction();
				fail('The function should have thrown a DataNotFoundException');
			} catch (error) {
				expect(error).toBeInstanceOf(DataNotFoundException);
				expect(error.message).toBe(`Order with id: ${order.id} not found`);
			}
		});
	});

	describe('getOrderCreatedById', () => {
		test('should get order created by ID', async () => {
			const loggerSpy = jest.spyOn(logger, 'info');

			const order = new OrderMockBuilder()
				.withDefaultValues()
				.withStatus('created')
				.build();

			jest.spyOn(prisma.order, 'findFirstOrThrow').mockResolvedValue(order);

			const response = await repository.getOrderCreatedById({ id: order.id });

			expect(response).toEqual(order);
			expect(loggerSpy).toHaveBeenCalledWith(
				`Order with status 'created' found: ${JSON.stringify(order)}`
			);
		});

		test('should throw DataNotFoundException', async () => {
			const order = new OrderMockBuilder().withDefaultValues().build();

			jest.spyOn(prisma.order, 'findFirstOrThrow').mockRejectedValue('error');

			const rejectedFunction = async () => {
				await repository.getOrderCreatedById({ id: order.id });
			};

			try {
				await rejectedFunction();
				fail(`Order with id: ${order.id} and status 'created' not found`);
			} catch (error) {
				expect(error).toBeInstanceOf(DataNotFoundException);
				expect(error.message).toBe(
					`Order with id: ${order.id} and status 'created' not found`
				);
			}
		});
	});

	describe('getOrdersByStatus', () => {
		test('should get order by status', async () => {
			const loggerSpy = jest.spyOn(logger, 'info');

			const order = new OrderMockBuilder().withDefaultValues().build();
			const orders = [new OrderMockBuilder().withDefaultValues().build()];

			jest.spyOn(prisma.order, 'findMany').mockResolvedValue(orders);

			const response = await repository.getOrdersByStatus(order.status as any);

			expect(response).toEqual(orders);
			expect(loggerSpy).toHaveBeenCalledWith(
				`Orders found: ${JSON.stringify(orders)}`
			);
		});
	});

	describe('createOrder', () => {
		test('should create order', async () => {
			const loggerSpy = jest.spyOn(logger, 'info');

			const createdOrder = new OrderMockBuilder().withDefaultValues().build();

			jest.spyOn(prisma.order, 'create').mockResolvedValue(createdOrder);

			const response = await repository.createOrder(createdOrder as any);

			expect(response).toEqual(createdOrder);
			expect(loggerSpy).toHaveBeenCalledWith(
				`Order created: ${JSON.stringify(createdOrder)}`
			);
		});
	});

	describe('update', () => {
		test('should update order', async () => {
			const loggerSpy = jest.spyOn(logger, 'info');

			const updatedOrder = new OrderMockBuilder().withDefaultValues().build();

			jest.spyOn(prisma.order, 'update').mockResolvedValue(updatedOrder);

			const response = await repository.updateOrder({ id: updatedOrder.id });

			expect(response).toEqual(updatedOrder);
			expect(loggerSpy).toHaveBeenCalledWith(
				`Order updated: ${JSON.stringify(updatedOrder)}`
			);
		});

		test('should throw DataNotFoundException', async () => {
			const order = new OrderMockBuilder().withDefaultValues().build();

			jest.spyOn(prisma.order, 'update').mockRejectedValue('error');

			const rejectedFunction = async () => {
				await repository.updateOrder({ id: order.id });
			};

			try {
				await rejectedFunction();
				fail('The function should have thrown a DataNotFoundException');
			} catch (error) {
				expect(error).toBeInstanceOf(DataNotFoundException);
				expect(error.message).toBe(`Order with id: ${order.id} not found`);
			}
		});
	});

	describe('getNumberOfValidOrdersToday', () => {
		test('should update order', async () => {
			jest.spyOn(prisma.order, 'count').mockResolvedValue(2);

			const response = await repository.getNumberOfValidOrdersToday();

			expect(response).toEqual(2);
		});
	});
});
