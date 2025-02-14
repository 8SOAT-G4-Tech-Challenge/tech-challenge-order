import { DataNotFoundException } from '@src/core/application/exceptions/dataNotFound';
import { InvalidProductException } from '@src/core/application/exceptions/invalidProductException';
import { ProductService } from '@src/core/application/services/productService';
import logger from '@src/core/common/logger';
import { CreateProductMockBuilder } from '@tests/mocks/create-product.mock-builder';
import { ProductCategoryMockBuilder } from '@tests/mocks/product-category.mock-builder';
import { ProductMockBuilder } from '@tests/mocks/product.mock-builder';

describe('ProductService -> Test', () => {
	let service: ProductService;
	let productCategoryService: any;
	let productRepository: any;
	let productImageRepository: any;
	let fileStorage: any;

	beforeEach(() => {
		productCategoryService = {
			getProductCategoryByName: jest.fn(),
		};

		productRepository = {
			getProducts: jest.fn(),
			getProductById: jest.fn(),
			getProductsByCategory: jest.fn(),
			deleteProducts: jest.fn(),
			createProducts: jest.fn(),
			updateProducts: jest.fn(),
		};

		productImageRepository = {
			deleteProductImageByProductId: jest.fn(),
			createProductImage: jest.fn(),
		};

		fileStorage = {
			saveFile: jest.fn(),
			deleteDirectory: jest.fn(),
		};

		service = new ProductService(
			productCategoryService,
			productRepository,
			productImageRepository,
			fileStorage
		);
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	describe('getProducts', () => {
		test('should get all products', async () => {
			const products = [new ProductMockBuilder().withDefaultValues().build()];

			productRepository.getProducts.mockResolvedValue(products);

			const response = await service.getProducts({});

			expect(productRepository.getProducts).toHaveBeenCalled();
			expect(response).toEqual(products);
		});

		test('should not get products by product category', async () => {
			productCategoryService.getProductCategoryByName.mockResolvedValue(
				undefined
			);

			const response = await service.getProducts({ category: 'Pizzas' });

			expect(
				productCategoryService.getProductCategoryByName
			).toHaveBeenCalledWith('Pizzas');
			expect(response).toEqual([]);
		});

		test('should get products by product category', async () => {
			const loggerSpy = jest.spyOn(logger, 'info');

			const productCategory = new ProductCategoryMockBuilder()
				.withDefaultValues()
				.build();
			const products = [new ProductMockBuilder().withDefaultValues().build()];

			productCategoryService.getProductCategoryByName.mockResolvedValue(
				productCategory
			);
			productRepository.getProductsByCategory.mockResolvedValue(products);

			const response = await service.getProducts({ category: 'Pizzas' });

			expect(
				productCategoryService.getProductCategoryByName
			).toHaveBeenCalledWith('Pizzas');
			expect(productRepository.getProductsByCategory).toHaveBeenCalled();
			expect(response).toEqual(products);
			expect(loggerSpy).toHaveBeenCalledWith(
				`[PRODUCT SERVICE] Success search product category ${JSON.stringify(
					productCategory
				)}`
			);
		});
	});

	describe('getProductById', () => {
		test('should get product by ID', async () => {
			const product = new ProductMockBuilder().withDefaultValues().build();

			productRepository.getProductById.mockResolvedValue(product);

			const response = await service.getProductById(product.id);

			expect(productRepository.getProductById).toHaveBeenCalledWith(product.id);
			expect(response).toEqual(product);
		});
	});

	describe('deleteProducts', () => {
		test('should throw InvalidProductException', async () => {
			const rejectedFunction = async () => {
				// @ts-expect-error typescript
				await service.deleteProducts({ id: undefined });
			};

			try {
				await rejectedFunction();
				fail('The function should have thrown an InvalidProductException');
			} catch (error) {
				expect(error).toBeInstanceOf(InvalidProductException);
				expect(error.message).toBe(
					'Error deleting product by Id. Invalid Id: undefined'
				);
			}
		});

		test('should throw InvalidProductException when product is not found', async () => {
			const product = new ProductMockBuilder().withDefaultValues().build();

			productRepository.getProductById.mockResolvedValue(undefined);

			const rejectedFunction = async () => {
				await service.deleteProducts({ id: product.id });
			};

			try {
				await rejectedFunction();
				fail('The function should have thrown an error');
			} catch (error) {
				expect(error).toBeInstanceOf(Error);
				expect(error.message).toBe(
					'An unexpected error occurred while deleting'
				);
			}
		});

		test('should delete product succesfully', async () => {
			const loggerSpy = jest.spyOn(logger, 'info');

			const product = new ProductMockBuilder().withDefaultValues().build();

			productRepository.getProductById.mockResolvedValue(product);
			productRepository.deleteProducts.mockResolvedValue();
			fileStorage.deleteDirectory.mockResolvedValue();

			await service.deleteProducts({ id: product.id });

			expect(loggerSpy).toHaveBeenCalledWith(
				`[PRODUCT SERVICE] Directory for product ${product.id} has been removed.`
			);
		});
	});

	describe('createProducts', () => {
		test('should throw InvalidProductException', async () => {
			const createProduct = new CreateProductMockBuilder()
				.withDefaultValues()
				.build();

			const rejectedFunction = async () => {
				await service.createProducts({
					...createProduct,
					// @ts-expect-error typescript
					categoryId: undefined,
				});
			};

			try {
				await rejectedFunction();
				fail('The function should have thrown an InvalidProductException');
			} catch (error) {
				expect(error).toBeInstanceOf(InvalidProductException);
				expect(error.message).toBe(
					"There's a problem with parameters sent, check documentation"
				);
			}
		});

		test('should create product without image', async () => {
			const createProduct = new CreateProductMockBuilder()
				.withDefaultValues()
				.withImages([])
				.build();
			const product = new ProductMockBuilder().withDefaultValues().build();

			productRepository.createProducts.mockResolvedValue(product);

			const result = await service.createProducts(createProduct);

			expect(result).toEqual(product);
		});

		test('should create product with image', async () => {
			const createProduct = new CreateProductMockBuilder()
				.withDefaultValues()
				.build();
			const product = new ProductMockBuilder().withDefaultValues().build();

			productRepository.createProducts.mockResolvedValue(product);

			const result = await service.createProducts(createProduct);

			expect(result).toEqual(product);
		});
	});

	describe('updateProducts', () => {
		test('should throw InvalidProductException', async () => {
			const product = new CreateProductMockBuilder()
				.withDefaultValues()
				.withImages([])
				.build();

			const rejectedFunction = async () => {
				await service.updateProducts({
					...product,
					// @ts-expect-error typescript
					id: undefined,
				});
			};

			try {
				await rejectedFunction();
				fail('The function should have thrown an InvalidProductException');
			} catch (error) {
				expect(error).toBeInstanceOf(InvalidProductException);
				expect(error.message).toBe(
					"There's a problem with parameters sent, check documentation"
				);
			}
		});

		test('should throw DataNotFoundException when product is not found', async () => {
			const product = new CreateProductMockBuilder()
				.withDefaultValues()
				.build();

			productRepository.getProductById.mockResolvedValue();

			const rejectedFunction = async () => {
				// @ts-expect-error typescript
				await service.updateProducts({
					...product,
				});
			};

			try {
				await rejectedFunction();
				fail('The function should have thrown a DataNotFoundException');
			} catch (error) {
				expect(error).toBeInstanceOf(DataNotFoundException);
				expect(error.message).toBe(
					`Product with id ${product.id} does not exist`
				);
			}
		});

		test('should update product', async () => {
			const product = new ProductMockBuilder().withDefaultValues().build();

			productRepository.updateProducts.mockResolvedValue(product);
			productRepository.getProductById.mockResolvedValue(product);

			const result = await service.updateProducts(product);

			expect(result).toEqual(product);
			expect(productRepository.updateProducts).toHaveBeenCalledWith(product);
		});

		test('should update product with image', async () => {
			const createProduct = new CreateProductMockBuilder()
				.withDefaultValues()
				.build();
			const product = new ProductMockBuilder().withDefaultValues().build();

			productRepository.getProductById.mockResolvedValue(createProduct);
			productRepository.updateProducts.mockResolvedValue(product);
			fileStorage.deleteDirectory.mockResolvedValue();
			productImageRepository.deleteProductImageByProductId.mockResolvedValue();

			// @ts-expect-error typescript
			const result = await service.updateProducts(createProduct);

			expect(result).toEqual(product);
		});

		test('should update product without image', async () => {
			const createProduct = new CreateProductMockBuilder()
				.withDefaultValues()
				.build();
			const product = new CreateProductMockBuilder()
				.withDefaultValues()
				.withImages([])
				.build();

			productRepository.getProductById.mockResolvedValue(createProduct);
			productRepository.updateProducts.mockResolvedValue(product);
			fileStorage.deleteDirectory.mockResolvedValue();
			productImageRepository.deleteProductImageByProductId.mockResolvedValue();

			// @ts-expect-error typescript
			const result = await service.updateProducts(product);

			expect(result).toEqual(product);
		});
	});
});
