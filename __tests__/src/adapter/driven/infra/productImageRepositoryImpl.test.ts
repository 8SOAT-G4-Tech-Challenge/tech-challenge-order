import { ProductImageRepositoryImpl } from '@src/adapter/driven/infra';
import { prisma } from '@src/adapter/driven/infra/lib/prisma';
import { DataNotFoundException } from '@src/core/application/exceptions/dataNotFound';
import { ProductImageMockBuilder } from '@tests/mocks/product-image.mock-builder';

jest.useFakeTimers().setSystemTime(new Date('2020-01-01'));

describe('ProductImageRepositoryImpl -> Test', () => {
	let repository: ProductImageRepositoryImpl;

	beforeEach(() => {
		repository = new ProductImageRepositoryImpl();
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	describe('getProductImageById', () => {
		test('should get product image by ID', async () => {
			const productImage = new ProductImageMockBuilder()
				.withDefaultValues()
				.build();

			jest
				.spyOn(prisma.productImage, 'findFirstOrThrow')
				.mockResolvedValue(productImage as any);

			const response = await repository.getProductImageById(productImage);

			expect(response).toEqual(productImage);
		});

		test('should throw DataNotFoundException', async () => {
			const productImage = new ProductImageMockBuilder()
				.withDefaultValues()
				.build();

			jest
				.spyOn(prisma.productImage, 'findFirstOrThrow')
				.mockRejectedValue('error');

			const rejectedFunction = async () => {
				await repository.getProductImageById(productImage);
			};

			try {
				await rejectedFunction();
				fail('The function should have thrown a DataNotFoundException');
			} catch (error) {
				expect(error).toBeInstanceOf(DataNotFoundException);
				expect(error.message).toBe(
					`Product Image with id: ${productImage.id} not found`
				);
			}
		});
	});

	describe('createProductImage', () => {
		test('should create product image', async () => {
			const productImage = new ProductImageMockBuilder()
				.withDefaultValues()
				.build();

			jest
				.spyOn(prisma.productImage, 'create')
				.mockResolvedValue(productImage as any);

			const response = await repository.createProductImage(productImage);

			expect(response).toEqual(productImage);
		});

		test('should throw DataNotFoundException', async () => {
			const productImage = new ProductImageMockBuilder()
				.withDefaultValues()
				.build();

			jest.spyOn(prisma.productImage, 'create').mockRejectedValue('error');

			const rejectedFunction = async () => {
				await repository.createProductImage(productImage);
			};

			try {
				await rejectedFunction();
				fail('The function should have thrown a DataNotFoundException');
			} catch (error) {
				expect(error).toBeInstanceOf(DataNotFoundException);
				expect(error.message).toBe('Error creating product image');
			}
		});
	});

	describe('deleteProductImageByProductId', () => {
		test('should delete product images', async () => {
			const productImage = new ProductImageMockBuilder()
				.withDefaultValues()
				.build();

			jest
				.spyOn(prisma.productImage, 'deleteMany')
				.mockResolvedValue(productImage as any);

			const response = await repository.deleteProductImageByProductId(
				productImage.productId
			);

			expect(response).toEqual(undefined);
		});

		test('should throw DataNotFoundException', async () => {
			const productImage = new ProductImageMockBuilder()
				.withDefaultValues()
				.build();

			jest.spyOn(prisma.productImage, 'deleteMany').mockRejectedValue('error');

			const rejectedFunction = async () => {
				await repository.deleteProductImageByProductId(productImage.productId);
			};

			try {
				await rejectedFunction();
				fail('The function should have thrown a DataNotFoundException');
			} catch (error) {
				expect(error).toBeInstanceOf(DataNotFoundException);
				expect(error.message).toBe(
					`Product Image with productId: ${productImage.productId} not found`
				);
			}
		});
	});
});
