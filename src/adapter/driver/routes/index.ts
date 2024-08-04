import { FastifyInstance } from 'fastify';

import {
	CustomerService,
	OrderService,
	PaymentOrderService,
	ProductCategoryService,
	ProductService,
	UserService,
} from '@application/services';
import {
	CustomerRepositoryImpl,
	OrderRepositoryImpl,
	ProductCategoryRepositoryImpl,
	ProductRepositoryImpl,
	UserRepositoryImpl,
} from '@driven/infra';
import {
	CustomerController,
	OrderController,
	ProductCategoryController,
	ProductController,
	UserController,
} from '@driver/controllers';
import { PaymentOrderRepositoryImpl } from '@src/adapter/driven/infra/paymentOrderRepositoryImpl';

import { PaymentOrderController } from '../controllers/paymentOrderController';
import {
	SwaggerCreateCustomers,
	SwaggerDeleteCustomers,
	SwaggerGetCustomers,
	SwaggerGetCustomersProperty,
} from './doc/customer';
import {
	SwaggerCreateOrder,
	SwaggerGetOrders,
	SwaggerGetOrdersById,
	SwaggerUpdateOrder,
} from './doc/order';
import {
	SwaggerGetPaymentOrderById,
	SwaggerGetPaymentOrderByOrderId,
	SwaggerGetPaymentOrders,
	SwaggerPaymentOrderMakePayment,
} from './doc/paymentOrders';
import {
	SwaggerGetProducts,
	SwaggerCreateProducts,
	SwaggerDeleteProducts,
	SwaggerUpdateProducts,
	/* 	SwaggerUpdateProducts, */
} from './doc/product';
import {
	SwaggerCreateProductCategories,
	SwaggerGetProductCategories,
} from './doc/productCategory';
import { SwaggerGetUsers } from './doc/user';

const userRepository = new UserRepositoryImpl();
const customerRepository = new CustomerRepositoryImpl();
const productRepository = new ProductRepositoryImpl();
const orderRepository = new OrderRepositoryImpl();
const paymentOrderRepository = new PaymentOrderRepositoryImpl();
const productCategoryRepository = new ProductCategoryRepositoryImpl();

const userService = new UserService(userRepository);
const customerService = new CustomerService(customerRepository);
const productCategoryService = new ProductCategoryService(
	productCategoryRepository
);
const productService = new ProductService(
	productCategoryService,
	productRepository
);
const orderService = new OrderService(orderRepository);
const paymentOrderService = new PaymentOrderService(
	paymentOrderRepository,
	orderRepository
);

const userController = new UserController(userService);
const customerController = new CustomerController(customerService);
const productCategoryController = new ProductCategoryController(
	productCategoryService
);
const productController = new ProductController(productService);
const orderController = new OrderController(orderService);
const paymentOrderController = new PaymentOrderController(paymentOrderService);

// Usem esse site para gerar o swagger a partir do JSON -> https://roger13.github.io/SwagDefGen/
export const routes = async (fastify: FastifyInstance) => {
	fastify.get(
		'/users',
		SwaggerGetUsers,
		userController.getUsers.bind(userController)
	);
	fastify.get(
		'/customers',
		SwaggerGetCustomers,
		customerController.getCustomers.bind(customerController)
	);
	fastify.get(
		'/customers/property',
		SwaggerGetCustomersProperty,
		customerController.getCustomerByProperty.bind(customerController)
	);
	fastify.post(
		'/customers',
		SwaggerCreateCustomers,
		customerController.createCustomer.bind(customerController)
	);
	fastify.delete(
		'/customers/:id',
		SwaggerDeleteCustomers,
		customerController.deleteCustomer.bind(customerController)
	);
	fastify.get(
		'/products',
		SwaggerGetProducts,
		productController.getProducts.bind(productController)
	);
	fastify.post(
		'/products',
		SwaggerCreateProducts,
		productController.createProducts.bind(productController)
	);
	fastify.put(
		'/products/:id',
		SwaggerUpdateProducts,
		productController.updateProducts.bind(productController)
	);
	fastify.delete(
		'/products/:id',
		SwaggerDeleteProducts,
		productController.deleteProducts.bind(productController)
	);
	fastify.post(
		'/product-categories',
		SwaggerCreateProductCategories,
		productCategoryController.createProductCategory.bind(
			productCategoryController
		)
	);
	fastify.get(
		'/product-categories',
		SwaggerGetProductCategories,
		productCategoryController.getProductCategories.bind(
			productCategoryController
		)
	);
	fastify.get(
		'/orders',
		SwaggerGetOrders,
		orderController.getOrders.bind(orderController)
	);
	fastify.get(
		'/orders/:id',
		SwaggerGetOrdersById,
		orderController.getOrderById.bind(orderController)
	);
	fastify.post(
		'/orders',
		SwaggerCreateOrder,
		orderController.createOrder.bind(orderController)
	);
	fastify.put(
		'/orders/:id',
		SwaggerUpdateOrder,
		orderController.updateOrder.bind(orderController)
	);
	fastify.get(
		'/payment-orders',
		SwaggerGetPaymentOrders,
		paymentOrderController.getPaymentOrders.bind(paymentOrderController)
	);
	fastify.get(
		'/payment-orders/:id',
		SwaggerGetPaymentOrderById,
		paymentOrderController.getPaymentOrderById.bind(paymentOrderController)
	);
	fastify.get(
		'/orders/:orderId/payment-orders',
		SwaggerGetPaymentOrderByOrderId,
		paymentOrderController.getPaymentOrderByOrderId.bind(paymentOrderController)
	);
	fastify.post(
		'/payment-orders/make-payment',
		SwaggerPaymentOrderMakePayment,
		paymentOrderController.makePayment.bind(paymentOrderController)
	);
};
