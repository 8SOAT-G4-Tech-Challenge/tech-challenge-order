import { FastifyReply, FastifyRequest } from 'fastify';
import { StatusCodes } from 'http-status-codes';

import logger from '@common/logger';
import { handleError } from '@driver/errorHandler';
import { Multipart } from '@fastify/multipart';
import {
	CreateProductParams,
	GetProducByIdParams,
	UpdateProductParams,
} from '@ports/input/products';
import { UpdateProductResponse } from '@ports/output/products';
import { Product } from '@prisma/client';
import { ProductService } from '@services/productService';

// Função auxiliar para definir os campos do objeto sem mutação direta
function setField<T, K extends keyof T>(obj: T, key: K, value: T[K]): T {
	return {
		...obj,
		[key]: key === 'value' ? Number(value) : value,
	};
}

export class ProductController {
	private readonly productService;

	constructor(productService: ProductService) {
		this.productService = productService;
	}

	async getProducts(req: FastifyRequest, reply: FastifyReply) {
		try {
			if (req.query && Object.keys(req.query).length > 0) {
				logger.info(
					`[PRODUCT CONTROLLER] Listing products with parameters: ${JSON.stringify(
						req.query
					)}`
				);
			} else {
				logger.info('[PRODUCT CONTROLLER] Listing products');
			}

			const response = await this.productService.getProducts(req.query);

			reply.code(StatusCodes.OK).send(response);
		} catch (error) {
			const errorMessage = 'Unexpected error when listing for products';
			logger.error(
				`${errorMessage}: ${JSON.stringify(error?.response?.message)}`
			);
			handleError(req, reply, error);
		}
	}

	async deleteProducts(
		req: FastifyRequest<{ Params: GetProducByIdParams }>,
		reply: FastifyReply
	): Promise<void> {
		const { id } = req.params;
		try {
			logger.info('[PRODUCT CONTROLLER] Deleting product');
			await this.productService.deleteProducts({ id });
			reply
				.code(StatusCodes.OK)
				.send({ message: 'Product successfully deleted' });
		} catch (error) {
			const errorMessage = 'Unexpected when deleting for product';
			logger.error(
				`${errorMessage}: ${JSON.stringify(error?.response?.message)}`
			);
			handleError(req, reply, error);
		}
	}

	async createProducts(
		req: FastifyRequest<{ Body: CreateProductParams; Files: Multipart[] }>,
		reply: FastifyReply
	) {
		try {
			const parts = req.parts();

			let data: CreateProductParams = {
				name: '',
				value: 0,
				description: '',
				categoryId: '',
				images: [],
			};

			for await (const part of parts) {
				if (part.type === 'file') {
					const fileBuffer = await part.toBuffer();
					data.images?.push({ ...part, buffer: fileBuffer });
				} else {
					data = setField(
						data,
						part.fieldname as keyof CreateProductParams,
						part.value as any
					);
				}
			}

			logger.info(
				`[PRODUCT CONTROLLER] Creating product: ${JSON.stringify(data.name)}`
			);

			const createdProduct = await this.productService.createProducts(data);
			reply.code(StatusCodes.CREATED).send(createdProduct);
		} catch (error) {
			const errorMessage = 'Unexpected when creating for product';
			logger.error(
				`${errorMessage}: ${JSON.stringify(error?.response?.message)}`
			);
			handleError(req, reply, error);
		}
	}

	async updateProducts(
		req: FastifyRequest<{
			Params: Pick<Product, 'id'>;
			Body: UpdateProductParams[];
			Files: Multipart[];
		}>,
		reply: FastifyReply
	) {
		try {
			logger.info(`[PRODUCT CONTROLLER] Updating product ${req?.params?.id}`);
			const parts = req.parts();
			let data: UpdateProductParams = {
				id: req?.params?.id,
				images: [],
			};

			for await (const part of parts) {
				if (part.type === 'file') {
					const fileBuffer = await part.toBuffer();
					data.images?.push({ ...part, buffer: fileBuffer });
				} else {
					data = setField(
						data,
						part.fieldname as keyof CreateProductParams,
						part.value as any
					);
				}
			}

			const product: UpdateProductResponse =
				await this.productService.updateProducts(data);
			reply.code(StatusCodes.OK).send(product);
		} catch (error) {
			logger.error(
				`Unexpected error when trying to update product: ${JSON.stringify(
					error
				)}`
			);
			handleError(req, reply, error);
		}
	}
}
