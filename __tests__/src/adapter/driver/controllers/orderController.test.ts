import { OrderController } from '@src/adapter/driver/controllers/orderController';
import logger from '@src/core/common/logger';
import { OrderMockBuilder } from '@tests/mocks/order.mock-builder';

describe('OrderController -> Test', () => {
	let controller: OrderController;
	let orderService: any;

	beforeEach(() => {
		orderService = {
			getOrders: jest.fn(),
			getOrderById: jest.fn(),
			createOrder: jest.fn(),
			updateOrder: jest.fn(),
		};

		controller = new OrderController(orderService);
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	describe('getOrders', () => {
		test('should reply 200 and list all orders', async () => {
			const loggerSpy = jest.spyOn(logger, 'info');

			const order = new OrderMockBuilder().withDefaultValues().build();

			const req = {};
			const reply = { code: jest.fn().mockReturnThis(), send: jest.fn() };

			orderService.getOrders.mockResolvedValue([order]);

			await controller.getOrders(req as any, reply as any);

			expect(reply.code).toHaveBeenCalledWith(200);
			expect(reply.send).toHaveBeenCalledWith([order]);
			expect(loggerSpy).toHaveBeenCalledWith('Listing orders');
		});

		test('should fail to list orders', async () => {
			const loggerSpy = jest.spyOn(logger, 'error');

			const req = { url: '/get-orders-mock' };
			const reply = {
				send: jest.fn(),
				status: jest.fn().mockReturnThis(),
			};

			orderService.getOrders.mockRejectedValue({ message: 'error' });

			await controller.getOrders(req as any, reply as any);

			expect(loggerSpy).toHaveBeenCalledWith(
				'[❌ ERROR HANDLER] Unexpected error: {"message":"error"}'
			);
			expect(reply.status).toHaveBeenCalledWith(500);
			expect(reply.send).toHaveBeenCalledWith(
				JSON.stringify({
					path: '/get-orders-mock',
					status: 500,
					message: 'error',
				})
			);
		});
	});

	describe('getOrderById', () => {
		test('should reply 200 and list order by ID', async () => {
			const loggerSpy = jest.spyOn(logger, 'info');

			const order = new OrderMockBuilder().withDefaultValues().build();

			const req = { params: {} };
			const reply = { code: jest.fn().mockReturnThis(), send: jest.fn() };

			orderService.getOrderById.mockResolvedValue(order);

			await controller.getOrderById(req as any, reply as any);

			expect(reply.code).toHaveBeenCalledWith(200);
			expect(reply.send).toHaveBeenCalledWith(order);
			expect(loggerSpy).toHaveBeenCalledWith('Listing order by id');
		});

		test('should fail to list orders', async () => {
			const loggerSpy = jest.spyOn(logger, 'error');

			const req = { params: {}, url: '/get-orders-by-id-mock' };
			const reply = {
				send: jest.fn(),
				status: jest.fn().mockReturnThis(),
			};

			orderService.getOrderById.mockRejectedValue({ message: 'error' });

			await controller.getOrderById(req as any, reply as any);

			expect(loggerSpy).toHaveBeenCalledWith(
				'[❌ ERROR HANDLER] Unexpected error: {"message":"error"}'
			);
			expect(reply.status).toHaveBeenCalledWith(500);
			expect(reply.send).toHaveBeenCalledWith(
				JSON.stringify({
					path: '/get-orders-by-id-mock',
					status: 500,
					message: 'error',
				})
			);
		});
	});

	describe('createOrder', () => {
		test('should reply 201 and create order', async () => {
			const loggerSpy = jest.spyOn(logger, 'info');

			const order = new OrderMockBuilder().withDefaultValues().build();

			const req = { body: {} };
			const reply = { code: jest.fn().mockReturnThis(), send: jest.fn() };

			orderService.createOrder.mockResolvedValue(order);

			await controller.createOrder(req as any, reply as any);

			expect(reply.code).toHaveBeenCalledWith(201);
			expect(reply.send).toHaveBeenCalledWith(order);
			expect(loggerSpy).toHaveBeenCalledWith('Creating order');
		});

		test('should fail to create orders', async () => {
			const loggerSpy = jest.spyOn(logger, 'error');

			const req = { body: {}, url: '/create-order-mock' };
			const reply = {
				send: jest.fn(),
				status: jest.fn().mockReturnThis(),
			};

			orderService.createOrder.mockRejectedValue({ message: 'error' });

			await controller.createOrder(req as any, reply as any);

			expect(loggerSpy).toHaveBeenCalledWith(
				'[❌ ERROR HANDLER] Unexpected error: {"message":"error"}'
			);
			expect(reply.status).toHaveBeenCalledWith(500);
			expect(reply.send).toHaveBeenCalledWith(
				JSON.stringify({
					path: '/create-order-mock',
					status: 500,
					message: 'error',
				})
			);
		});
	});

	describe('updateOrder', () => {
		test('should reply 200 and create order', async () => {
			const loggerSpy = jest.spyOn(logger, 'info');

			const order = new OrderMockBuilder().withDefaultValues().build();

			const req = { params: { id: '1' }, body: {} };
			const reply = { code: jest.fn().mockReturnThis(), send: jest.fn() };

			orderService.updateOrder.mockResolvedValue(order);

			await controller.updateOrder(req as any, reply as any);

			expect(reply.code).toHaveBeenCalledWith(200);
			expect(reply.send).toHaveBeenCalledWith(order);
			expect(loggerSpy).toHaveBeenCalledWith('Updating order 1');
		});

		test('should fail to create orders', async () => {
			const loggerSpy = jest.spyOn(logger, 'error');

			const req = { params: { id: '1' }, body: {}, url: '/create-order-mock' };
			const reply = {
				send: jest.fn(),
				status: jest.fn().mockReturnThis(),
			};

			orderService.updateOrder.mockRejectedValue({ message: 'error' });

			await controller.updateOrder(req as any, reply as any);

			expect(loggerSpy).toHaveBeenCalledWith(
				'[❌ ERROR HANDLER] Unexpected error: {"message":"error"}'
			);
			expect(reply.status).toHaveBeenCalledWith(500);
			expect(reply.send).toHaveBeenCalledWith(
				JSON.stringify({
					path: '/create-order-mock',
					status: 500,
					message: 'error',
				})
			);
		});
	});
});
