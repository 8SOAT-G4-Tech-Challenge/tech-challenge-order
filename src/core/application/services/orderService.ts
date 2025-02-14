import { OrderStatusEnum } from '@application/enumerations/orderStatusEnum';
import logger from '@common/logger';
import { getOrderByIdSchema, updateOrderSchema } from '@driver/schemas/orders';
import { InvalidOrderException } from '@exceptions/invalidOrderException';
import { InvalidOrderStatusException } from '@exceptions/invalidOrderStatusException';
import { Order } from '@models/order';
import {
	GetOrderQueryParams,
	CreateOrderParams,
	GetOrderByIdParams,
	UpdateOrderParams,
	GetOrderByIdQueryParams,
} from '@ports/input/orders';
import { CreateOrderResponse } from '@ports/output/orders';
import { CartRepository } from '@ports/repository/cartRepository';
import { OrderRepository } from '@ports/repository/orderRepository';
import { CustomerApi } from '@src/core/application/ports/repository/customerApiRepository';
import { PaymentOrderApi } from '@src/core/application/ports/repository/paymentOrderApiRepository';
import { OrderStatusType } from '@src/core/domain/types/orderStatusType';

export class OrderService {
	private readonly orderRepository: OrderRepository;

	private readonly cartRepository: CartRepository;

	private readonly customerApi: CustomerApi;

	private readonly paymentOrderApi: PaymentOrderApi;

	constructor(
		orderRepository: OrderRepository,
		cartRepository: CartRepository,
		customerApi: CustomerApi,
		paymentOrderApi: PaymentOrderApi
	) {
		this.orderRepository = orderRepository;
		this.cartRepository = cartRepository;
		this.customerApi = customerApi;
		this.paymentOrderApi = paymentOrderApi;
	}

	async getOrders({ status }: GetOrderQueryParams): Promise<Order[]> {
		if (status && Object.values(OrderStatusEnum).includes(status)) {
			logger.info(`Searching orders by status: ${status}`);
			const orders = await this.orderRepository.getOrdersByStatus(status);

			const customers = await this.customerApi.getCustomers();
			const paymentOrders = await this.paymentOrderApi.getPaymentOrders();

			const joinedData = orders?.map((order) => ({
				...order,
				customer: customers?.find(
					(customer) => customer.id === order.customerId
				),
				payment: paymentOrders?.find(
					(paymentOrder) => paymentOrder.orderId === order.id
				),
			}));

			return joinedData;
		}

		if (status && !Object.values(OrderStatusEnum).includes(status)) {
			throw new InvalidOrderStatusException(
				`Error listing orders by status. Invalid status: ${status}`
			);
		}

		logger.info('Searching all orders');
		const orders = await this.orderRepository.getOrders();

		const customers = await this.customerApi.getCustomers();
		const paymentOrders = await this.paymentOrderApi.getPaymentOrders();

		const joinedData = orders?.map((order) => ({
			...order,
			customer: customers?.find((customer) => customer.id === order.customerId),
			payment: paymentOrders?.find(
				(paymentOrder) => paymentOrder.orderId === order.id
			),
		}));

		return this.sortOrdersByStatus(joinedData);
	}

	async getOrderById({
		id,
		withCustomer,
		withPayment,
	}: GetOrderByIdParams & GetOrderByIdQueryParams): Promise<Order> {
		const { success } = getOrderByIdSchema.safeParse({ id });

		if (!success) {
			throw new InvalidOrderException(
				`Error listing order by Id. Invalid Id: ${id}`
			);
		}

		logger.info(`Searching order by Id: ${id}`);
		const orderFound = await this.orderRepository.getOrderById({ id });

		if (withCustomer && orderFound.customerId) {
			logger.info(`Searching customer in order: ${orderFound.customerId}`);
			const customer = await this.customerApi.getCustomerByProperty({
				id: orderFound.customerId,
			});

			Object.assign(orderFound, { customer });
		}

		if (withPayment) {
			logger.info(`Searching payment order in order: ${orderFound.id}`);
			const paymentOrder = await this.paymentOrderApi.getPaymentOrderByOrderId({
				orderId: orderFound.id,
			});

			if (paymentOrder && Object.values(paymentOrder).length) {
				Object.assign(orderFound, { payment: paymentOrder });
			}
		}

		return orderFound;
	}

	async getOrderCreatedById({ id }: GetOrderByIdParams): Promise<Order> {
		const { success } = getOrderByIdSchema.safeParse({ id });

		if (!success) {
			throw new InvalidOrderException(
				`Error listing order by Id. Invalid Id: ${id}`
			);
		}

		logger.info(`Searching order created by Id: ${id}`);
		const orderFound = await this.orderRepository.getOrderCreatedById({ id });

		if (orderFound.customerId) {
			const customer = await this.customerApi.getCustomerByProperty({
				id: orderFound.customerId,
			});

			Object.assign(orderFound, { customer });
		}

		const paymentOrder = await this.paymentOrderApi.getPaymentOrderByOrderId({
			orderId: orderFound.id,
		});

		if (paymentOrder) {
			Object.assign(orderFound, { payment: paymentOrder });
		}

		return orderFound;
	}

	async createOrder(order: CreateOrderParams): Promise<CreateOrderResponse> {
		if (order?.customerId) {
			logger.info(`Creating order with customer: ${order?.customerId}`);
		} else {
			logger.info('Creating order..');
		}

		return this.orderRepository.createOrder(order);
	}

	async updateOrder(order: UpdateOrderParams): Promise<CreateOrderResponse> {
		const { success } = updateOrderSchema.safeParse(order);

		if (!success && !order?.id) {
			throw new InvalidOrderException(
				"Can't update order without providing an ID"
			);
		}

		if (!success) {
			throw new InvalidOrderException(
				"Can't update order without providing a valid status"
			);
		}

		logger.info(`Updating order: ${order.id}`);
		return this.orderRepository.updateOrder(order);
	}

	async getOrderTotalValueById(id: string): Promise<number> {
		if (!id) {
			throw new InvalidOrderException(
				"Can't return order total value without providing a valid ID"
			);
		}

		const productItems = await this.cartRepository.getAllCartItemsByOrderId(id);

		if (!productItems.length) {
			throw new InvalidOrderException(
				"Can't return order total value without order items"
			);
		}

		const totalValue = productItems.reduce(
			(acc, productItem) => acc + productItem.value,
			0
		);

		logger.info(`Total value from order ${id} is ${totalValue}`);
		return totalValue;
	}

	private sortOrdersByStatus(orders: Order[]): Order[] {
		const statusPriority: OrderStatusType[] = [
			'ready',
			'preparation',
			'received',
			'created',
		];

		const priorityMap = new Map(
			statusPriority.map((status, index) => [status, index])
		);

		return orders.sort((a, b) => {
			const priorityA =
				priorityMap.get(a.status as OrderStatusType) ?? Infinity;
			const priorityB =
				priorityMap.get(b.status as OrderStatusType) ?? Infinity;
			return priorityA - priorityB;
		});
	}

	async getNumberOfValidOrdersToday(): Promise<number> {
		logger.info('[ORDER SERVICE] Getting number of valid orders today');
		const numberOrdersToday =
			await this.orderRepository.getNumberOfValidOrdersToday();

		logger.info(`[ORDER SERVICE] Valid orders today: ${numberOrdersToday}`);

		return numberOrdersToday;
	}
}
