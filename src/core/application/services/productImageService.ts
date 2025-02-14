import logger from '@common/logger';
import { getProductImageByIdSchema } from '@driver/schemas/productImageSchema';
import { InvalidProductImageException } from '@exceptions/invalidProductImageException';
import { ProductImage } from '@models/productImage';
import { GetProductImageByIdParams } from '@ports/input/productImage';
import { ProductImageRepository } from '@ports/repository/productImageRepository';

export class ProductImageService {
	private readonly productImageRepository;

	constructor(productImageRepository: ProductImageRepository) {
		this.productImageRepository = productImageRepository;
	}

	async getProductImageById({
		id,
	}: GetProductImageByIdParams): Promise<ProductImage> {
		const { success } = getProductImageByIdSchema.safeParse({ id });
		if (!success) {
			throw new InvalidProductImageException(
				`Error listing product image by Id. Invalid Id: ${id}`
			);
		}

		logger.info(`[PRODUCT IMAGE SERVICE] Searching product image by Id: ${id}`);

		const productImageFound =
			await this.productImageRepository.getProductImageById({ id });
		return productImageFound;
	}
}
