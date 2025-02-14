import { InvalidProductCategoryException } from '@src/core/application/exceptions/invalidProductCategoryException';
import { ProductCategoryService } from '@src/core/application/services/productCategoryService';
import { ProductCategoryMockBuilder } from '@tests/mocks/product-category.mock-builder';

describe('ProductCategoryService -> Test', () => {
	let service: ProductCategoryService;
	let mockProductCategoryRepository: any;

	beforeEach(() => {
		mockProductCategoryRepository = {
			createProductCategory: jest.fn(),
			getProductCategories: jest.fn(),
			getProductCategoryByName: jest.fn(),
			getProductCategoryById: jest.fn(),
			getFirstProductByCategory: jest.fn(),
			deleteProductCategories: jest.fn(),
			updateProductCategory: jest.fn(),
		};

		service = new ProductCategoryService(mockProductCategoryRepository);
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	describe('getProductCategories', () => {
		test('should get all product categories', async () => {
			const productCategories = [
				new ProductCategoryMockBuilder().withDefaultValues().build(),
				new ProductCategoryMockBuilder().withDefaultValues().build(),
				new ProductCategoryMockBuilder().withDefaultValues().build(),
			];

			mockProductCategoryRepository.getProductCategories.mockResolvedValue(
				productCategories
			);

			const response = await service.getProductCategories();

			expect(
				mockProductCategoryRepository.getProductCategories
			).toHaveBeenCalled();
			expect(response).toEqual(productCategories);
		});
	});

	describe('getProductCategoryByName', () => {
		test('should get product categories by name', async () => {
			const productCategories = [
				new ProductCategoryMockBuilder().withDefaultValues().build(),
				new ProductCategoryMockBuilder().withDefaultValues().build(),
				new ProductCategoryMockBuilder().withDefaultValues().build(),
			];

			mockProductCategoryRepository.getProductCategoryByName.mockResolvedValue(
				productCategories
			);

			const response = await service.getProductCategoryByName('category');

			expect(
				mockProductCategoryRepository.getProductCategoryByName
			).toHaveBeenCalledWith('category');
			expect(response).toEqual(productCategories);
		});
	});

	describe('createProductCategory', () => {
		test('should create product category', async () => {
			const productCategory = new ProductCategoryMockBuilder()
				.withDefaultValues()
				.build();

			mockProductCategoryRepository.createProductCategory.mockResolvedValue(
				productCategory
			);

			const response = await service.createProductCategory(productCategory);

			expect(
				mockProductCategoryRepository.createProductCategory
			).toHaveBeenCalledWith(productCategory);
			expect(response).toEqual(productCategory);
		});
	});

	describe('updateProductCategory', () => {
		test('should throw InvalidProductCategoryException', async () => {
			const productCategory = new ProductCategoryMockBuilder()
				.withDefaultValues()
				.build();

			mockProductCategoryRepository.getProductCategoryById.mockResolvedValue(
				undefined
			);

			const rejectedFunction = async () => {
				await service.updateProductCategory(
					productCategory.id,
					productCategory
				);
			};

			try {
				await rejectedFunction();
				fail('Expected InvalidProductCategoryException to be thrown');
			} catch (error) {
				expect(error).toBeInstanceOf(InvalidProductCategoryException);
				expect(error.message).toBe(
					`Category Product with ID ${productCategory.id} not found.`
				);
			}
		});

		test('should update product category', async () => {
			const productCategory = new ProductCategoryMockBuilder()
				.withDefaultValues()
				.build();

			mockProductCategoryRepository.getProductCategoryById.mockResolvedValue(
				productCategory
			);
			mockProductCategoryRepository.updateProductCategory.mockResolvedValue(
				productCategory
			);

			const response = await service.updateProductCategory(
				productCategory.id,
				productCategory
			);

			expect(
				mockProductCategoryRepository.updateProductCategory
			).toHaveBeenCalledWith(productCategory.id, productCategory);
			expect(response).toEqual(productCategory);
		});
	});

	describe('deleteProductCategory', () => {
		test('should throw InvalidProductCategoryException', async () => {
			const productCategory = new ProductCategoryMockBuilder()
				.withDefaultValues()
				.build();

			mockProductCategoryRepository.getProductCategoryById.mockResolvedValue(
				undefined
			);

			const rejectedFunction = async () => {
				await service.deleteProductCategory({ id: productCategory.id });
			};

			try {
				await rejectedFunction();
				fail('Expected InvalidProductCategoryException to be thrown');
			} catch (error) {
				expect(error).toBeInstanceOf(InvalidProductCategoryException);
				expect(error.message).toBe(
					`Category Product with ID ${productCategory.id} not found.`
				);
			}
		});

		test('should not delete product category when it has at least one product associated to it', async () => {
			const productCategory = new ProductCategoryMockBuilder()
				.withDefaultValues()
				.build();

			mockProductCategoryRepository.getProductCategoryById.mockResolvedValue(
				productCategory
			);
			mockProductCategoryRepository.getFirstProductByCategory.mockResolvedValue(
				productCategory
			);

			const response = await service.deleteProductCategory({
				id: productCategory.id,
			});

			expect(
				mockProductCategoryRepository.deleteProductCategories
			).not.toHaveBeenCalledWith({ id: productCategory.id });
			expect(response).toEqual(productCategory);
		});

		test('should delete product category', async () => {
			const productCategory = new ProductCategoryMockBuilder()
				.withDefaultValues()
				.build();

			mockProductCategoryRepository.getProductCategoryById.mockResolvedValue(
				productCategory
			);
			mockProductCategoryRepository.getFirstProductByCategory.mockResolvedValue(
				undefined
			);

			await service.deleteProductCategory({
				id: productCategory.id,
			});

			expect(
				mockProductCategoryRepository.deleteProductCategories
			).toHaveBeenCalledWith({ id: productCategory.id });
		});
	});
});
