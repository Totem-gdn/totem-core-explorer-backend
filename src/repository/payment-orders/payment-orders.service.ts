import { randomUUID } from 'node:crypto';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PaymentOrderData } from './payment-orders.interface';
import { PaymentOrder, PaymentOrderDocument } from './schemas';

@Injectable()
export class PaymentOrdersService {
  constructor(@InjectModel(PaymentOrder.name) private readonly paymentOrderModel: Model<PaymentOrderDocument>) {}

  async create(orderData: PaymentOrderData): Promise<string> {
    const orderId = randomUUID();
    await this.paymentOrderModel.create({
      _id: orderId,
      ...orderData,
    });
    return orderId;
  }

  async update(orderId: string, orderData: Partial<PaymentOrderData>) {
    await this.paymentOrderModel.findByIdAndUpdate(orderId, { $set: { ...orderData } });
  }
}
