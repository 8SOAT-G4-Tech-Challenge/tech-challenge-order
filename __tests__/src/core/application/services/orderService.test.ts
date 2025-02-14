import { InvalidOrderException } from '@src/core/application/exceptions/invalidOrderException';
import { InvalidOrderStatusException } from '@src/core/application/exceptions/invalidOrderStatusException';
import { OrderService } from '@src/core/application/services/orderService';
import logger from '@src/core/common/logger';
import { OrderItemMockBuilder } from '@tests/mocks/order-item.mock-builder';
import { OrderMockBuilder } from '@tests/mocks/order.mock-builder';

describe('OrderService -> Test', () => {
	let service: OrderService;
	let mockCartRepository: any;
	let mockOrderRepository: any;
	let customerApi: any;
	let paymentOrderApi: any;

	beforeEach(() => {
		mockCartRepository = {
			getAllCartItemsByOrderId: jest.fn(),
		};

		mockOrderRepository = {
			getOrders: jest.fn(),
			getOrderById: jest.fn(),
			getOrderCreatedById: jest.fn(),
			getOrdersByStatus: jest.fn(),
			createOrder: jest.fn(),
			updateOrder: jest.fn(),
			getNumberOfValidOrdersToday: jest.fn(),
		};

		customerApi = {
			getCustomers: jest.fn(),
			getCustomerByProperty: jest.fn(),
		};

		paymentOrderApi = {
			getPaymentOrders: jest.fn(),
			getPaymentOrderById: jest.fn(),
			getPaymentOrderByOrderId: jest.fn(),
		};

		service = new OrderService(
			mockOrderRepository,
			mockCartRepository,
			customerApi,
			paymentOrderApi
		);
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	describe('getOrders', () => {
		test('should throw InvalidOrderStatusException', async () => {
			const rejectedFunction = async () => {
				// @ts-expect-error typescript
				await service.getOrders({ status: 'status' });
			};

			try {
				await rejectedFunction();
				fail('Expected InvalidOrderStatusException but no error was thrown');
			} catch (error) {
				expect(error).toBeInstanceOf(InvalidOrderStatusException);
				expect(error.message).toBe(
					'Error listing orders by status. Invalid status: status'
				);
				expect(error.statusCode).toBe(400);
			}
		});

		test('should search all orders', async () => {
			const loggerSpy = jest.spyOn(logger, 'info');

			const orders = [
				new OrderMockBuilder().withDefaultValues().build(),
				new OrderMockBuilder().withDefaultValues().build(),
				// @ts-expect-error typescript
				new OrderMockBuilder().withDefaultValues().withStatus('status').build(),
				// @ts-expect-error typescript
				new OrderMockBuilder().withDefaultValues().withStatus('status').build(),
				// @ts-expect-error typescript
				new OrderMockBuilder().withDefaultValues().withStatus('status').build(),
			];

			(mockOrderRepository.getOrders as jest.Mock).mockResolvedValue(orders);

			const response = await service.getOrders({});

			expect(mockOrderRepository.getOrders).toHaveBeenCalledWith();
			expect(loggerSpy).toHaveBeenCalledWith('Searching all orders');
			expect(response).toEqual(orders);
		});
	});

	describe('getOrderById', () => {
		test('should throw InvalidOrderException', async () => {
			const rejectedFunction = async () => {
				await service.getOrderById({ id: undefined });
			};

			try {
				await rejectedFunction();
				fail('Expected InvalidOrderException but no error was thrown');
			} catch (error) {
				expect(error).toBeInstanceOf(InvalidOrderException);
				expect(error.message).toBe(
					'Error listing order by Id. Invalid Id: undefined'
				);
				expect(error.statusCode).toBe(400);
			}
		});

		test('should get order by ID', async () => {
			const id = 'd5d3b2e9-04f6-430f-8e7c-513ab394b7d9';

			const loggerSpy = jest.spyOn(logger, 'info');

			const order = new OrderMockBuilder().withDefaultValues().build();

			(mockOrderRepository.getOrderById as jest.Mock).mockResolvedValue(order);

			const response = await service.getOrderById({ id });

			expect(mockOrderRepository.getOrderById).toHaveBeenCalledWith({ id });
			expect(loggerSpy).toHaveBeenCalledWith(`Searching order by Id: ${id}`);
			expect(response).toEqual(order);
		});
	});

	describe('getOrderCreatedById', () => {
		test('should throw InvalidOrderException', async () => {
			const rejectedFunction = async () => {
				await service.getOrderCreatedById({ id: undefined });
			};

			try {
				await rejectedFunction();
				fail('Expected InvalidOrderException but no error was thrown');
			} catch (error) {
				expect(error).toBeInstanceOf(InvalidOrderException);
				expect(error.message).toBe(
					'Error listing order by Id. Invalid Id: undefined'
				);
				expect(error.statusCode).toBe(400);
			}
		});

		test('should get order created by ID', async () => {
			const id = 'd5d3b2e9-04f6-430f-8e7c-513ab394b7d9';

			const loggerSpy = jest.spyOn(logger, 'info');

			const order = new OrderMockBuilder().withDefaultValues().build();

			(mockOrderRepository.getOrderCreatedById as jest.Mock).mockResolvedValue(
				order
			);

			const response = await service.getOrderCreatedById({ id });

			expect(mockOrderRepository.getOrderCreatedById).toHaveBeenCalledWith({
				id,
			});
			expect(loggerSpy).toHaveBeenCalledWith(
				`Searching order created by Id: ${id}`
			);
			expect(response).toEqual(order);
		});
	});

	describe('createOrder', () => {
		test('should create order with customer ID', async () => {
			const loggerSpy = jest.spyOn(logger, 'info');

			const order = new OrderMockBuilder().withDefaultValues().build();

			(mockOrderRepository.createOrder as jest.Mock).mockResolvedValue(order);

			const response = await service.createOrder({
				...order,
				customerId: order.customerId!,
			});

			expect(mockOrderRepository.createOrder).toHaveBeenCalledWith(order);
			expect(loggerSpy).toHaveBeenCalledWith(
				`Creating order with customer: ${order?.customerId}`
			);
			expect(response).toEqual(order);
		});

		test('should create order without customer ID', async () => {
			const loggerSpy = jest.spyOn(logger, 'info');

			const order = new OrderMockBuilder()
				.withDefaultValues()
				.withCustomerId('')
				.build();

			(mockOrderRepository.createOrder as jest.Mock).mockResolvedValue(order);

			const response = await service.createOrder({
				...order,
				customerId: order.customerId!,
			});

			expect(mockOrderRepository.createOrder).toHaveBeenCalledWith(order);
			expect(loggerSpy).toHaveBeenCalledWith('Creating order..');
			expect(response).toEqual(order);
		});
	});

	describe('updateOrder', () => {
		test('should throw id related InvalidOrderException', async () => {
			const rejectedFunction = async () => {
				await service.updateOrder({ id: undefined });
			};

			try {
				await rejectedFunction();
				fail('Expected InvalidOrderException but no error was thrown');
			} catch (error) {
				expect(error).toBeInstanceOf(InvalidOrderException);
				expect(error.message).toBe(
					"Can't update order without providing an ID"
				);
				expect(error.statusCode).toBe(400);
			}
		});

		test('should throw status related InvalidOrderException', async () => {
			const rejectedFunction = async () => {
				await service.updateOrder({
					id: '6d8a2983-3c44-457b-83ab-5e78a53823c7',
					// @ts-expect-error typescript
					status: 'status',
				});
			};

			try {
				await rejectedFunction();
				fail('Expected InvalidOrderException but no error was thrown');
			} catch (error) {
				expect(error).toBeInstanceOf(InvalidOrderException);
				expect(error.message).toBe(
					"Can't update order without providing a valid status"
				);
				expect(error.statusCode).toBe(400);
			}
		});

		test('should update order successfully', async () => {
			const loggerSpy = jest.spyOn(logger, 'info');

			const order = new OrderMockBuilder().withDefaultValues().build();

			(mockOrderRepository.updateOrder as jest.Mock).mockResolvedValue(order);

			const response = await service.updateOrder(order as any);

			expect(mockOrderRepository.updateOrder).toHaveBeenCalledWith(order);
			expect(loggerSpy).toHaveBeenCalledWith(`Updating order: ${order.id}`);
			expect(response).toEqual(order);
		});
	});

	describe('getOrderTotalValueById', () => {
		test('should throw id related InvalidOrderException', async () => {
			const rejectedFunction = async () => {
				// @ts-expect-error typescript
				await service.getOrderTotalValueById();
			};

			try {
				await rejectedFunction();
				fail('Expected InvalidOrderException but no error was thrown');
			} catch (error) {
				expect(error).toBeInstanceOf(InvalidOrderException);
				expect(error.message).toBe(
					"Can't return order total value without providing a valid ID"
				);
				expect(error.statusCode).toBe(400);
			}
		});

		test('should throw status related InvalidOrderException', async () => {
			const cartItems: any[] = [];

			mockCartRepository.getAllCartItemsByOrderId.mockResolvedValue(cartItems);

			const rejectedFunction = async () => {
				await service.getOrderTotalValueById(
					'13b0bf5b-219e-4841-832a-df0d33e51274'
				);
			};

			try {
				await rejectedFunction();
				fail('Expected InvalidOrderException but no error was thrown');
			} catch (error) {
				expect(error).toBeInstanceOf(InvalidOrderException);
				expect(error.message).toBe(
					"Can't return order total value without order items"
				);
				expect(error.statusCode).toBe(400);
			}
		});

		test('should update order successfully', async () => {
			const loggerSpy = jest.spyOn(logger, 'info');

			const order = new OrderMockBuilder().withDefaultValues().build();
			const cartItems: any[] = [
				new OrderItemMockBuilder().withDefaultValues().build(),
			];

			mockCartRepository.getAllCartItemsByOrderId.mockResolvedValue(cartItems);

			const response = await service.getOrderTotalValueById(order.id);

			expect(mockCartRepository.getAllCartItemsByOrderId).toHaveBeenCalledWith(
				order.id
			);
			expect(loggerSpy).toHaveBeenCalledWith(
				`Total value from order ${order.id} is ${cartItems[0].value}`
			);
			expect(response).toEqual(cartItems[0].value);
		});
	});
});
