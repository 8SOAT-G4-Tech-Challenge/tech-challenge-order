import { InvalidProductException } from '@application/exceptions/invalidProductException';
import logger from '@common/logger';
import {
	addItemToCartSchema,
	updateCartItemSchema,
} from '@driver/schemas/cartSchema';
import { Order } from '@models/order';
import { OrderItem } from '@models/orderItem';
import { AddItemToCartProps, UpdateCartItemProps } from '@ports/input/cart';
import { CartRepository } from '@ports/repository/cartRepository';
import { OrderRepository } from '@ports/repository/orderRepository';
import { Product } from '@src/core/domain/models/product';

import { ProductRepository } from '../ports/repository/productRepository';

export class CartService {
	private readonly cartRepository: CartRepository;

	private readonly orderRepository: OrderRepository;

	private readonly productRepository: ProductRepository;

	private MAX_ITEMS_PER_PRODUCT: number = 99;

	constructor(
		cartRepository: CartRepository,
		orderRepository: OrderRepository,
		productRepository: ProductRepository
	) {
		this.cartRepository = cartRepository;
		this.orderRepository = orderRepository;
		this.productRepository = productRepository;
	}

	async getAllCartItemsByOrderId(orderId: string): Promise<OrderItem[]> {
		if (!orderId) {
			throw new InvalidProductException(
				'Must provide an order id to get order items'
			);
		}

		logger.info('[CART SERVICE] Searching all order items by order id');
		return this.cartRepository.getAllCartItemsByOrderId(orderId);
	}

	async addItemToCart(product: AddItemToCartProps): Promise<OrderItem> {
		const { success } = addItemToCartSchema.safeParse(product);
		if (!success) {
			throw new InvalidProductException(
				"There's a problem with parameters sent, check documentation"
			);
		}

		if (product.quantity > this.MAX_ITEMS_PER_PRODUCT) {
			throw new InvalidProductException(
				`The quantity must be equal or less than ${this.MAX_ITEMS_PER_PRODUCT}`
			);
		}

		const order: Order = await this.orderRepository.getOrderById({
			id: product.orderId,
		});

		const productItem: Product = await this.productRepository.getProductById(
			product.productId
		);

		logger.info(`[CART SERVICE] Adding item to order: ${order.id}`);
		return this.cartRepository.addItemToCart({
			...product,
			value: product.quantity * productItem.value,
		});
	}

	async updateCartItem(item: UpdateCartItemProps): Promise<OrderItem> {
		const { success } = updateCartItemSchema.safeParse(item);

		if (!success) {
			throw new InvalidProductException(
				"There's a problem with parameters sent, check documentation"
			);
		}

		if (item.quantity > this.MAX_ITEMS_PER_PRODUCT) {
			throw new InvalidProductException(
				`The quantity must be equal or less than ${this.MAX_ITEMS_PER_PRODUCT}`
			);
		}

		const cartItem: OrderItem = await this.cartRepository.getCartItemById(
			item.id
		);

		const productItem: Product = await this.productRepository.getProductById(
			cartItem.productId
		);

		logger.info(`[CART SERVICE] Updating cart item: ${item.id}`);
		return this.cartRepository.updateCartItem({
			...item,
			value: item.quantity * productItem.value,
		});
	}

	async deleteCartItem(id: string): Promise<void> {
		if (!id) {
			throw new InvalidProductException(
				'Must provide an id to delete cart item'
			);
		}

		logger.info(`[CART SERVICE] Deleting cart item: ${id}`);
		await this.cartRepository.deleteCartItem(id);
	}
}
