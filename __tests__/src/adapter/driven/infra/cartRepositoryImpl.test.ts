import { CartRepositoryImpl } from '@src/adapter/driven/infra';
import { prisma } from '@src/adapter/driven/infra/lib/prisma';
import { DataNotFoundException } from '@src/core/application/exceptions/dataNotFound';
import logger from '@src/core/common/logger';
import { AddItemToCartMockBuilder } from '@tests/mocks/add-item-to-cart.mock-builder';
import { OrderItemMockBuilder } from '@tests/mocks/order-item.mock-builder';

jest.useFakeTimers().setSystemTime(new Date('2020-01-01'));

describe('CartRepositoryImpl -> Test', () => {
	let repository: CartRepositoryImpl;

	beforeEach(() => {
		repository = new CartRepositoryImpl();
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	describe('addItemToCart', () => {
		test('should add item to cart', async () => {
			const loggerSpy = jest.spyOn(logger, 'info');

			const addItemToCart = {
				...new AddItemToCartMockBuilder().withDefaultValues().build(),
				value: 200,
			};

			const product = new OrderItemMockBuilder()
				.withDefaultValues()
				.withValue(200)
				.build();

			jest.spyOn(prisma.orderItem, 'create').mockResolvedValue(product as any);

			const response = await repository.addItemToCart(addItemToCart);

			expect(response).toEqual(product);
			expect(loggerSpy).toHaveBeenCalledWith(
				`Item added: ${JSON.stringify(product)}`
			);
		});
	});

	describe('updateCartItem', () => {
		test('should update cart item', async () => {
			const loggerSpy = jest.spyOn(logger, 'info');

			const addItemToCart = {
				...new AddItemToCartMockBuilder().withDefaultValues().build(),
				value: 200,
				id: '1',
			};

			const product = new OrderItemMockBuilder()
				.withDefaultValues()
				.withValue(200)
				.build();

			jest.spyOn(prisma.orderItem, 'update').mockResolvedValue(product as any);

			const response = await repository.updateCartItem(addItemToCart);

			expect(response).toEqual(product);
			expect(loggerSpy).toHaveBeenCalledWith(
				`Order item updated: ${JSON.stringify(product)}`
			);
		});

		test('should throw DataNotFoundException', async () => {
			const addItemToCart = {
				...new AddItemToCartMockBuilder().withDefaultValues().build(),
				value: 200,
				id: '1',
			};

			jest.spyOn(prisma.orderItem, 'update').mockRejectedValue('error');

			const rejectedFunction = async () => {
				await repository.updateCartItem(addItemToCart);
			};

			try {
				await rejectedFunction();
				fail('The function should have thrown a DataNotFoundException');
			} catch (error) {
				expect(error).toBeInstanceOf(DataNotFoundException);
				expect(error.message).toBe(
					`Order item with id: ${addItemToCart.id} not found`
				);
			}
		});
	});

	describe('deleteCartItem', () => {
		test('should delete cart item', async () => {
			const loggerSpy = jest.spyOn(logger, 'info');

			const id = '1';

			jest.spyOn(prisma.orderItem, 'delete').mockResolvedValue({} as any);

			await repository.deleteCartItem(id);

			expect(loggerSpy).toHaveBeenCalledWith(
				`Order item deleted: ${JSON.stringify(id)}`
			);
		});

		test('should throw DataNotFoundException', async () => {
			const id = '1';

			jest.spyOn(prisma.orderItem, 'delete').mockRejectedValue('error');

			const rejectedFunction = async () => {
				await repository.deleteCartItem(id);
			};

			try {
				await rejectedFunction();
				fail('The function should have thrown a DataNotFoundException');
			} catch (error) {
				expect(error).toBeInstanceOf(DataNotFoundException);
				expect(error.message).toBe(`Order item with id: ${id} not found`);
			}
		});
	});

	describe('getCartItemById', () => {
		test('should get cart item by ID', async () => {
			const loggerSpy = jest.spyOn(logger, 'info');

			const id = '1';
			const product = new OrderItemMockBuilder()
				.withDefaultValues()
				.withValue(200)
				.build();

			jest
				.spyOn(prisma.orderItem, 'findFirstOrThrow')
				.mockResolvedValue(product as any);

			const response = await repository.getCartItemById(id);

			expect(response).toEqual(product);
			expect(loggerSpy).toHaveBeenCalledWith(
				`Order item found: ${JSON.stringify(product)}`
			);
		});

		test('should throw DataNotFoundException', async () => {
			const id = '1';

			jest
				.spyOn(prisma.orderItem, 'findFirstOrThrow')
				.mockRejectedValue('error');

			const rejectedFunction = async () => {
				await repository.getCartItemById(id);
			};

			try {
				await rejectedFunction();
				fail('The function should have thrown a DataNotFoundException');
			} catch (error) {
				expect(error).toBeInstanceOf(DataNotFoundException);
				expect(error.message).toBe(`Order item with id: ${id} not found`);
			}
		});
	});

	describe('getAllCartItemsByOrderId', () => {
		test('should get all cart items by order ID', async () => {
			const loggerSpy = jest.spyOn(logger, 'info');

			const orderId = '1';
			const products = [
				new OrderItemMockBuilder().withDefaultValues().withValue(200).build(),
			];

			jest
				.spyOn(prisma.orderItem, 'findMany')
				.mockResolvedValue(products as any);

			const response = await repository.getAllCartItemsByOrderId(orderId);

			expect(response).toEqual(products);
			expect(loggerSpy).toHaveBeenCalledWith(
				`Cart items found: ${JSON.stringify(products)}`
			);
		});
	});
});
