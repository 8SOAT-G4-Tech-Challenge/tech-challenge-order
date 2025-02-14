import { FastifyInstance } from 'fastify';

import {
	CartService,
	OrderService,
	ProductCategoryService,
	ProductService,
} from '@application/services';
import {
	CartRepositoryImpl,
	FileSystemStorageImpl,
	OrderRepositoryImpl,
	ProductCategoryRepositoryImpl,
	ProductImageRepositoryImpl,
	ProductRepositoryImpl,
} from '@driven/infra';
import {
	CartController,
	OrderController,
	ProductCategoryController,
	ProductController,
} from '@driver/controllers';
import { CustomerApiImpl } from '@src/adapter/driven/external/customerApiImpl';
import { PaymentOrderApiImpl } from '@src/adapter/driven/external/paymentOrderApiImpl';

const productRepository = new ProductRepositoryImpl();
const orderRepository = new OrderRepositoryImpl();
const productCategoryRepository = new ProductCategoryRepositoryImpl();
const productImageRepository = new ProductImageRepositoryImpl();
const fileSystemStorage = new FileSystemStorageImpl();
const cartRepository = new CartRepositoryImpl();
const customerApi = new CustomerApiImpl(process.env.CUSTOMER_BASE_URL || '');
const paymentOrderApi = new PaymentOrderApiImpl(
	process.env.PAYMENT_ORDER_BASE_URL || ''
);

const productCategoryService = new ProductCategoryService(
	productCategoryRepository
);
const productService = new ProductService(
	productCategoryService,
	productRepository,
	productImageRepository,
	fileSystemStorage
);

const orderService = new OrderService(
	orderRepository,
	cartRepository,
	customerApi,
	paymentOrderApi
);
const cartService = new CartService(
	cartRepository,
	orderRepository,
	productRepository
);

const productCategoryController = new ProductCategoryController(
	productCategoryService
);
const productController = new ProductController(productService);
const orderController = new OrderController(orderService);
const cartController = new CartController(cartService);

export const routes = async (fastify: FastifyInstance) => {
	fastify.get(
		'/totem/products',
		productController.getProducts.bind(productController)
	);
	fastify.post(
		'/admin/products',
		productController.createProducts.bind(productController)
	);
	fastify.put(
		'/admin/products/:id',
		productController.updateProducts.bind(productController)
	);
	fastify.delete(
		'/admin/products/:id',
		productController.deleteProducts.bind(productController)
	);
	fastify.post(
		'/admin/product-categories',
		productCategoryController.createProductCategory.bind(
			productCategoryController
		)
	);
	fastify.get(
		'/totem/product-categories',
		productCategoryController.getProductCategories.bind(
			productCategoryController
		)
	);
	fastify.put(
		'/admin/product-categories/:id',
		productCategoryController.updateProductCategories.bind(
			productCategoryController
		)
	);
	fastify.delete(
		'/admin/product-categories/:id',
		productCategoryController.deleteProductCategories.bind(
			productCategoryController
		)
	);
	fastify.get('/admin/orders', orderController.getOrders.bind(orderController));
	fastify.get(
		'/totem/orders/:id',
		orderController.getOrderById.bind(orderController)
	);
	fastify.post(
		'/totem/orders',
		orderController.createOrder.bind(orderController)
	);
	fastify.put(
		'/totem/orders/:id',
		orderController.updateOrder.bind(orderController)
	);
	fastify.get(
		'/totem/orders/valid-orders-today',
		orderController.getNumberOfValidOrdersToday.bind(orderController)
	);
	fastify.get(
		'/totem/order-items/:orderId',
		cartController.getAllCartItemsByOrderId.bind(cartController)
	);
	fastify.post(
		'/totem/order-items/:orderId',
		cartController.addItemToCart.bind(cartController)
	);
	fastify.put(
		'/totem/order-items/:id',
		cartController.updateCartItem.bind(cartController)
	);
	fastify.delete(
		'/totem/order-items/:id',
		cartController.deleteCartItem.bind(cartController)
	);
};
