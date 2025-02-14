import { FastifyReply, FastifyRequest } from 'fastify';
import { StatusCodes } from 'http-status-codes';

import logger from '@common/logger';
import { handleError } from '@driver/errorHandler';
import { ProductCategoryService } from '@services/productCategoryService';
import {
	DeleteProductCategoryParams,
	UpdateProductCategoryParams,
} from '@src/core/application/ports/input/productCategory';

export class ProductCategoryController {
	private readonly productCategoryService;

	constructor(productCategoryService: ProductCategoryService) {
		this.productCategoryService = productCategoryService;
	}

	async getProductCategories(req: FastifyRequest, reply: FastifyReply) {
		try {
			logger.info('[PRODUCT CATEGORY CONTROLLER] Listing product categories');

			const response = await this.productCategoryService.getProductCategories();

			reply.code(StatusCodes.OK).send(response);
		} catch (error) {
			const errorMessage =
				'Unexpected error when listing for product categories';
			logger.error(
				`${errorMessage}: ${JSON.stringify(error?.response?.message)}`
			);
			handleError(req, reply, error);
		}
	}

	async createProductCategory(req: FastifyRequest, reply: FastifyReply) {
		try {
			logger.info(
				`[PRODUCT CATEGORY CONTROLLER] Creating product category: ${JSON.stringify(
					req.body
				)}`
			);
			const productCategory =
				await this.productCategoryService.createProductCategory(req.body);
			reply.code(StatusCodes.CREATED).send(productCategory);
		} catch (error) {
			const errorMessage = 'Unexpected when creating for product category';
			logger.error(
				`${errorMessage}: ${JSON.stringify(error?.response?.message)}`
			);
			handleError(req, reply, error);
		}
	}

	async updateProductCategories(
		req: FastifyRequest<{
			Body: UpdateProductCategoryParams;
			Params: { id: string };
		}>,
		reply: FastifyReply
	): Promise<void> {
		const { id } = req.params;
		const productCategoryData = req.body;

		try {
			logger.info(
				`[PRODUCT CATEGORY CONTROLLER] Updating product category with ID: ${id}`
			);

			const updatedProductCategory =
				await this.productCategoryService.updateProductCategory(
					id,
					productCategoryData
				);

			reply.code(StatusCodes.OK).send(updatedProductCategory);
		} catch (error) {
			const errorMessage = 'Unexpected error when updating product category';
			logger.error(
				`${errorMessage}: ${JSON.stringify(error?.response?.message)}`
			);
			handleError(req, reply, error);
		}
	}

	async deleteProductCategories(
		req: FastifyRequest<{ Body: DeleteProductCategoryParams }>,
		reply: FastifyReply
	): Promise<void> {
		const { id } = req.params as { id: string };

		try {
			logger.info('[PRODUCT CATEGORY CONTROLLER] Deleting product category');
			const response = await this.productCategoryService.deleteProductCategory({
				id,
			});
			if (response) {
				reply.code(StatusCodes.CONFLICT).send({
					error: 'Conflict',
					message: 'Product category has products associated',
				});
			}
			reply
				.code(StatusCodes.NO_CONTENT)
				.send({ message: 'Product category successfully deleted' });
		} catch (error) {
			const errorMessage = 'Unexpected when deleting for product category';
			logger.error(
				`${errorMessage}: ${JSON.stringify(error?.response?.message)}`
			);
			handleError(req, reply, error);
		}
	}
}
