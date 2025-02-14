import logger from '@common/logger';
import {
	getProductByIdSchema,
	productFilterSchema,
	productSchema,
	updateProductSchema,
} from '@driver/schemas/productSchema';
import { InvalidProductException } from '@exceptions/invalidProductException';
import { MultipartFile } from '@fastify/multipart';
import { Product, ProductWithDetails } from '@models/product';
import {
	CreateProductParams,
	GetProducByIdParams,
	UpdateProductParams,
} from '@ports/input/products';
import { FileSystemStorage } from '@ports/output/fileSystemStorage';
import { ProductImageRepository } from '@ports/repository/productImageRepository';
import { ProductRepository } from '@ports/repository/productRepository';
import { ProductCategoryService } from '@services/productCategoryService';

import { DataNotFoundException } from '../exceptions/dataNotFound';

export class ProductService {
	private readonly productCategoryService;

	private readonly productRepository;

	private readonly productImageRepository;

	private readonly fileStorage;

	constructor(
		productCategoryService: ProductCategoryService,
		productRepository: ProductRepository,
		productImageRepository: ProductImageRepository,
		fileStorage: FileSystemStorage
	) {
		this.productCategoryService = productCategoryService;
		this.productRepository = productRepository;
		this.productImageRepository = productImageRepository;
		this.fileStorage = fileStorage;
	}

	async getProducts(filters: any): Promise<Product[]> {
		productFilterSchema.parse(filters);
		if (filters.category) {
			logger.info(
				`[PRODUCT SERVICE] Searching category by name: ${filters.category}`
			);
			const productCategory =
				await this.productCategoryService.getProductCategoryByName(
					filters.category
				);
			if (productCategory) {
				logger.info(
					`[PRODUCT SERVICE] Success search product category ${JSON.stringify(
						productCategory
					)}`
				);
				return this.productRepository.getProductsByCategory(productCategory.id);
			}
			return [];
		}
		return this.productRepository.getProducts();
	}

	async getProductById(id: string): Promise<ProductWithDetails> {
		const paymentOrder: ProductWithDetails | null =
			await this.productRepository.getProductById(id);

		return paymentOrder;
	}

	async deleteProducts({ id }: GetProducByIdParams): Promise<void> {
		const { success } = getProductByIdSchema.safeParse({ id });
		if (!success) {
			throw new InvalidProductException(
				`Error deleting product by Id. Invalid Id: ${id}`
			);
		}

		try {
			const product = await this.productRepository.getProductById(id);
			if (!product) {
				throw new InvalidProductException(`Product with id: ${id} not found`);
			}
			await this.productRepository.deleteProducts(id);

			const uploadDir = `uploads/${id}`;
			await this.fileStorage.deleteDirectory(uploadDir);

			logger.info(
				`[PRODUCT SERVICE] Directory for product ${id} has been removed.`
			);
		} catch (error) {
			throw new Error('An unexpected error occurred while deleting');
		}
	}

	async createProducts(
		productDto: CreateProductParams
	): Promise<ProductWithDetails> {
		const { success } = productSchema.safeParse(productDto);
		if (!success) {
			throw new InvalidProductException(
				"There's a problem with parameters sent, check documentation"
			);
		}

		const createdProduct = await this.productRepository.createProducts(
			productDto
		);

		if (productDto.images && productDto.images.length > 0) {
			await Promise.all(
				productDto.images.map(async (image) => {
					const imageUrl = await this.fileStorage.saveFile(
						image,
						createdProduct.id
					);
					return this.productImageRepository.createProductImage({
						url: imageUrl,
						productId: createdProduct.id,
					});
				})
			);
		}

		return createdProduct;
	}

	async updateProducts(
		product: UpdateProductParams
	): Promise<ProductWithDetails> {
		const { success } = updateProductSchema.safeParse(product);
		if (!success) {
			throw new InvalidProductException(
				"There's a problem with parameters sent, check documentation"
			);
		}

		const productExists = await this.productRepository.getProductById(
			product.id
		);

		if (!productExists) {
			throw new DataNotFoundException(
				`Product with id ${product.id} does not exist`
			);
		}

		const hasFilesToSave = product.images?.some(
			(image) => image.filename.trim().length > 0
		);
		const hasExistingImages =
			productExists.images && productExists.images.length > 0;

		if (hasFilesToSave || hasExistingImages) {
			await this.handleImageUpdates(product);
		}

		logger.info(`[PRODUCT SERVICE] Updating product: ${product.id}`);
		return this.productRepository.updateProducts(product);
	}

	async handleImageUpdates(product: UpdateProductParams) {
		const imageFolderPath = `uploads/${product.id}`;

		if (!product.images || product.images.length === 0) {
			await this.deleteAllImages(imageFolderPath, product.id);
		} else {
			await this.deleteAllImages(imageFolderPath, product.id);
			await this.saveNewImages(product.images, product.id);
		}
	}

	async deleteAllImages(imageFolderPath: string, productId: string) {
		await this.fileStorage.deleteDirectory(imageFolderPath);
		await this.productImageRepository.deleteProductImageByProductId(productId);
	}

	async saveNewImages(images: MultipartFile[], productId: string) {
		await Promise.all(
			images.map(async (image) => {
				const imageUrl = await this.fileStorage.saveFile(image, productId);
				return this.productImageRepository.createProductImage({
					url: imageUrl,
					productId,
				});
			})
		);
	}
}
