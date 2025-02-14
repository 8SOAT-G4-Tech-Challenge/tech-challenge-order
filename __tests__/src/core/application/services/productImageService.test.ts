import { InvalidProductImageException } from '@src/core/application/exceptions/invalidProductImageException';
import { ProductImageService } from '@src/core/application/services/productImageService';
import { ProductImageMockBuilder } from '@tests/mocks/product-image.mock-builder';

describe('ProductImageService -> Test', () => {
	let service: ProductImageService;
	let mockProductImageRepository: any;

	beforeEach(() => {
		mockProductImageRepository = {
			createProductImage: jest.fn(),
			getProductImageById: jest.fn(),
			deleteProductImageByProductId: jest.fn(),
		};

		service = new ProductImageService(mockProductImageRepository);
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	describe('getProductImageById', () => {
		test('should throw InvalidProductImageException', async () => {
			const rejectedFunction = async () => {
				// @ts-expect-error typescript
				await service.getProductImageById({ id: undefined });
			};

			try {
				await rejectedFunction();
				fail('The function should have thrown an InvalidProductImageException');
			} catch (error) {
				expect(error).toBeInstanceOf(InvalidProductImageException);
				expect(error.message).toBe(
					`Error listing product image by Id. Invalid Id: ${undefined}`
				);
			}
		});

		test('should get product image by ID', async () => {
			const productImage = new ProductImageMockBuilder()
				.withDefaultValues()
				.build();

			mockProductImageRepository.getProductImageById.mockResolvedValue(
				productImage
			);

			const response = await service.getProductImageById({
				id: productImage.id,
			});

			expect(
				mockProductImageRepository.getProductImageById
			).toHaveBeenCalledWith({
				id: productImage.id,
			});
			expect(response).toEqual(productImage);
		});
	});
});
