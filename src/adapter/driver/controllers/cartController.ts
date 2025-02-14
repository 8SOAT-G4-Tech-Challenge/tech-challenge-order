import { FastifyReply, FastifyRequest } from 'fastify';
import { StatusCodes } from 'http-status-codes';

import logger from '@common/logger';
import { handleError } from '@driver/errorHandler';
import { OrderItem } from '@models/orderItem';
import {
	AddItemToCartBody,
	UpdateCartItemBody,
	UpdateCartItemParams,
} from '@ports/input/cart';
import { CartService } from '@services/cartService';

export class CartController {
	private readonly cartService: CartService;

	constructor(cartService: CartService) {
		this.cartService = cartService;
	}

	async getAllCartItemsByOrderId(
		req: FastifyRequest<{
			Params: { orderId: string };
		}>,
		reply: FastifyReply
	) {
		try {
			logger.info(
				`[CART CONTROLLER] Getting all cart items by order ID: ${req?.params?.orderId}`
			);
			const orderItem: OrderItem[] =
				await this.cartService.getAllCartItemsByOrderId(req?.params?.orderId);
			reply.code(StatusCodes.CREATED).send(orderItem);
		} catch (error) {
			logger.error(
				`Unexpected error when trying to add product to cart: ${JSON.stringify(
					error
				)}`
			);
			handleError(req, reply, error);
		}
	}

	async addItemToCart(
		req: FastifyRequest<{
			Params: { orderId: string };
			Body: AddItemToCartBody;
		}>,
		reply: FastifyReply
	) {
		try {
			logger.info(
				`[CART CONTROLLER] Adding item to order: ${req?.params?.orderId}`
			);
			const orderItem: OrderItem = await this.cartService.addItemToCart({
				...req.body,
				orderId: req?.params?.orderId,
			});
			reply.code(StatusCodes.CREATED).send(orderItem);
		} catch (error) {
			logger.error(
				`Unexpected error when trying to add product to cart: ${JSON.stringify(
					error
				)}`
			);
			handleError(req, reply, error);
		}
	}

	async updateCartItem(
		req: FastifyRequest<{
			Params: UpdateCartItemParams;
			Body: UpdateCartItemBody;
		}>,
		reply: FastifyReply
	) {
		try {
			logger.info(`[CART CONTROLLER] Updating cart item ${req?.params?.id}`);
			const orderItem: OrderItem = await this.cartService.updateCartItem({
				...req.body,
				id: req?.params?.id,
			});
			reply.code(StatusCodes.OK).send(orderItem);
		} catch (error) {
			logger.error(
				`Unexpected error when trying to update cart: ${JSON.stringify(
					error?.response?.message
				)}`
			);
			handleError(req, reply, error);
		}
	}

	async deleteCartItem(
		req: FastifyRequest<{
			Params: { id: string };
		}>,
		reply: FastifyReply
	) {
		try {
			logger.info(`[CART CONTROLLER] Deleting cart item ${req?.params?.id}`);

			await this.cartService.deleteCartItem(req?.params?.id);

			reply.code(StatusCodes.OK).send();
		} catch (error) {
			logger.error(
				`Unexpected error when trying to delete cart: ${JSON.stringify(
					error?.response?.message
				)}`
			);
			handleError(req, reply, error);
		}
	}
}
