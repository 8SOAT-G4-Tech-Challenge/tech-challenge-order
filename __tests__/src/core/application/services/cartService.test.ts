import { InvalidProductException } from '@src/core/application/exceptions/invalidProductException';
import { CartService } from '@src/core/application/services/cartService';
import logger from '@src/core/common/logger';
import { AddItemToCartMockBuilder } from '@tests/mocks/add-item-to-cart.mock-builder';
import { OrderItemMockBuilder } from '@tests/mocks/order-item.mock-builder';
import { OrderMockBuilder } from '@tests/mocks/order.mock-builder';
import { ProductMockBuilder } from '@tests/mocks/product.mock-builder';
import { UpdateCartItemMockBuilder } from '@tests/mocks/update-cart-item.mock-builder';

describe('CartService -> Test', () => {
	let service: CartService;
	let mockOrderRepository: any;
	let mockProductRepository: any;
	let mockCartRepository: any;

	beforeEach(() => {
		mockOrderRepository = {
			getOrderById: jest.fn(),
		};
		mockProductRepository = {
			getProductById: jest.fn(),
		};
		mockCartRepository = {
			addItemToCart: jest.fn(),
			updateCartItem: jest.fn(),
			deleteCartItem: jest.fn(),
			getCartItemById: jest.fn(),
			getAllCartItemsByOrderId: jest.fn(),
		};

		service = new CartService(
			mockCartRepository,
			mockOrderRepository,
			mockProductRepository
		);
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	describe('getAllCartItemsByOrderId', () => {
		test('should throw orderId related InvalidProductException', async () => {
			const rejectedFunction = async () => {
				// @ts-expect-error typescript
				await service.getAllCartItemsByOrderId();
			};

			try {
				await rejectedFunction();
			} catch (error) {
				expect(error).toBeInstanceOf(InvalidProductException);
				expect(error.message).toBe(
					'Must provide an order id to get order items'
				);
			}
		});

		test('should test success path', async () => {
			const product = new AddItemToCartMockBuilder()
				.withDefaultValues()
				.build();
			const result = [new OrderItemMockBuilder().withDefaultValues().build()];

			const loggerSpy = jest.spyOn(logger, 'info');

			(
				mockCartRepository.getAllCartItemsByOrderId as jest.Mock
			).mockResolvedValue(result);

			const response = await service.getAllCartItemsByOrderId(product.orderId);

			expect(mockCartRepository.getAllCartItemsByOrderId).toHaveBeenCalledWith(
				product.orderId
			);
			expect(response).toEqual(result);
			expect(loggerSpy).toHaveBeenCalledWith(
				'[CART SERVICE] Searching all order items by order id'
			);
		});
	});

	describe('addItemToCart', () => {
		test('should throw generic InvalidProductException', async () => {
			const product = new AddItemToCartMockBuilder()
				.withDefaultValues()
				// @ts-expect-error typescript
				.withOrderId(undefined)
				.build();

			const rejectedFunction = async () => {
				await service.addItemToCart(product);
			};

			try {
				await rejectedFunction();
			} catch (error) {
				expect(error).toBeInstanceOf(InvalidProductException);
				expect(error.message).toBe(
					"There's a problem with parameters sent, check documentation"
				);
			}
		});

		test('should throw quantity related InvalidProductException', async () => {
			const product = new AddItemToCartMockBuilder()
				.withDefaultValues()
				.withQuantity(200)
				.build();

			const rejectedFunction = async () => {
				await service.addItemToCart(product);
			};

			try {
				await rejectedFunction();
			} catch (error) {
				expect(error).toBeInstanceOf(InvalidProductException);
				expect(error.message).toBe(
					'The quantity must be equal or less than 99'
				);
			}
		});

		test('should test success path', async () => {
			const order = new OrderMockBuilder().withDefaultValues().build();
			const productItem = new ProductMockBuilder().withDefaultValues().build();
			const product = new AddItemToCartMockBuilder()
				.withDefaultValues()
				.build();
			const result = new OrderItemMockBuilder()
				.withDefaultValues()
				.withValue(productItem.value * 2)
				.build();

			const loggerSpy = jest.spyOn(logger, 'info');

			(mockOrderRepository.getOrderById as jest.Mock).mockResolvedValue(order);
			(mockProductRepository.getProductById as jest.Mock).mockResolvedValue(
				productItem
			);
			(mockCartRepository.addItemToCart as jest.Mock).mockResolvedValue(result);

			const response = await service.addItemToCart(product);

			expect(mockOrderRepository.getOrderById).toHaveBeenCalledWith({
				id: product.orderId,
			});
			expect(mockProductRepository.getProductById).toHaveBeenCalledWith(
				product.productId
			);
			expect(mockCartRepository.addItemToCart).toHaveBeenCalledWith({
				...product,
				value: product.quantity * productItem.value,
			});
			expect(response).toEqual(result);
			expect(loggerSpy).toHaveBeenCalledWith(
				`[CART SERVICE] Adding item to order: ${order.id}`
			);
		});
	});

	describe('updateCartItem', () => {
		test('should throw generic InvalidProductException', async () => {
			const product = new UpdateCartItemMockBuilder()
				.withDefaultValues()
				// @ts-expect-error typescript
				.withId(undefined)
				.build();

			const rejectedFunction = async () => {
				await service.updateCartItem(product);
			};

			try {
				await rejectedFunction();
			} catch (error) {
				expect(error).toBeInstanceOf(InvalidProductException);
				expect(error.message).toBe(
					"There's a problem with parameters sent, check documentation"
				);
			}
		});

		test('should throw quantity related InvalidProductException', async () => {
			const product = new UpdateCartItemMockBuilder()
				.withDefaultValues()
				.withQuantity(200)
				.build();

			const rejectedFunction = async () => {
				await service.updateCartItem(product);
			};

			try {
				await rejectedFunction();
			} catch (error) {
				expect(error).toBeInstanceOf(InvalidProductException);
				expect(error.message).toBe(
					'The quantity must be equal or less than 99'
				);
			}
		});

		test('should test success path', async () => {
			const productItem = new ProductMockBuilder().withDefaultValues().build();
			const item = new UpdateCartItemMockBuilder().withDefaultValues().build();
			const cartItem = new OrderItemMockBuilder().withDefaultValues().build();

			const result = {
				...item,
				value: item.quantity * productItem.value,
			};

			const loggerSpy = jest.spyOn(logger, 'info');

			(mockCartRepository.getCartItemById as jest.Mock).mockResolvedValue(
				cartItem
			);
			(mockProductRepository.getProductById as jest.Mock).mockResolvedValue(
				productItem
			);
			(mockCartRepository.updateCartItem as jest.Mock).mockResolvedValue(
				result
			);

			const response = await service.updateCartItem(item);

			expect(mockCartRepository.getCartItemById).toHaveBeenCalledWith(item.id);
			expect(mockProductRepository.getProductById).toHaveBeenCalledWith(
				cartItem.productId
			);
			expect(mockCartRepository.updateCartItem).toHaveBeenCalledWith({
				...item,
				value: item.quantity * productItem.value,
			});
			expect(response).toEqual(result);
			expect(loggerSpy).toHaveBeenCalledWith(
				`[CART SERVICE] Updating cart item: ${item.id}`
			);
		});
	});

	describe('deleteCartItem', () => {
		test('should throw id related InvalidProductException', async () => {
			const rejectedFunction = async () => {
				// @ts-expect-error typescript
				await service.deleteCartItem();
			};

			try {
				await rejectedFunction();
			} catch (error) {
				expect(error).toBeInstanceOf(InvalidProductException);
				expect(error.message).toBe('Must provide an id to delete cart item');
			}
		});

		test('should test success path', async () => {
			const id = 'a0baf395-db04-4312-a3af-874c4f2f19f9';

			const loggerSpy = jest.spyOn(logger, 'info');

			(mockCartRepository.deleteCartItem as jest.Mock).mockResolvedValue(() =>
				jest.fn()
			);

			const response = await service.deleteCartItem(id);

			expect(mockCartRepository.deleteCartItem).toHaveBeenCalledWith(id);
			expect(response).toEqual(undefined);
			expect(loggerSpy).toHaveBeenCalledWith(
				`[CART SERVICE] Deleting cart item: ${id}`
			);
		});
	});
});
