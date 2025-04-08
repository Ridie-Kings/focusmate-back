// import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
// import { InjectModel } from '@nestjs/mongoose';
// import mongoose, { Model } from 'mongoose';
// import { Subscription, SubscriptionTier } from './entities/subscription.entity';
// import { ConfigService } from '@nestjs/config';
// import Stripe from 'stripe';
// import { UsersService } from '../users/users.service';

// @Injectable()
// export class SubscriptionsService {
//   private stripe: Stripe;

//   constructor(
//     @InjectModel(Subscription.name) private subscriptionModel: Model<Subscription>,
//     private configService: ConfigService,
//     private usersService: UsersService,
//   ) {
//     this.stripe = new Stripe(this.configService.get('STRIPE_SECRET_KEY'), {
//       apiVersion: '2023-10-16',
//     });
//   }

//   async createSubscription(userId: mongoose.Types.ObjectId, priceId: string): Promise<Subscription> {
//     const user = await this.usersService.findOne(userId.toString());
//     if (!user) {
//       throw new NotFoundException('User not found');
//     }

//     // Create or retrieve Stripe customer
//     let customerId = user.stripeCustomerId;
//     if (!customerId) {
//       const customer = await this.stripe.customers.create({
//         email: user.email,
//         metadata: {
//           userId: userId.toString(),
//         },
//       });
//       customerId = customer.id;
//       await this.usersService.update(userId.toString(), { stripeCustomerId: customerId });
//     }

//     // Create subscription
//     const subscription = await this.stripe.subscriptions.create({
//       customer: customerId,
//       items: [{ price: priceId }],
//       payment_behavior: 'default_incomplete',
//       payment_settings: { save_default_payment_method: 'on_subscription' },
//       expand: ['latest_invoice.payment_intent'],
//     });

//     // Create subscription in database
//     const newSubscription = await this.subscriptionModel.create({
//       userId,
//       tier: SubscriptionTier.PREMIUM,
//       stripeCustomerId: customerId,
//       stripeSubscriptionId: subscription.id,
//       currentPeriodStart: new Date(subscription.current_period_start * 1000),
//       currentPeriodEnd: new Date(subscription.current_period_end * 1000),
//       isActive: subscription.status === 'active',
//     });

//     return newSubscription;
//   }

//   async cancelSubscription(userId: string): Promise<Subscription> {
//     const subscription = await this.subscriptionModel.findOne({ userId });
//     if (!subscription) {
//       throw new NotFoundException('Subscription not found');
//     }

//     if (subscription.stripeSubscriptionId) {
//       await this.stripe.subscriptions.cancel(subscription.stripeSubscriptionId);
//     }

//     subscription.isActive = false;
//     subscription.cancelAtPeriodEnd = subscription.currentPeriodEnd;
//     return subscription.save();
//   }

//   async getSubscription(userId: string): Promise<Subscription> {
//     const subscription = await this.subscriptionModel.findOne({ userId });
//     if (!subscription) {
//       throw new NotFoundException('Subscription not found');
//     }
//     return subscription;
//   }

//   async handleWebhook(event: Stripe.Event): Promise<void> {
//     switch (event.type) {
//       case 'customer.subscription.updated':
//         const subscription = event.data.object as Stripe.Subscription;
//         const data = subscription.object;
//         await this.subscriptionModel.findOneAndUpdate(
//           { stripeSubscriptionId: subscription.id },
//           {
//             currentPeriodStart: new Date(data.current_period_start * 1000),
//             currentPeriodEnd: new Date(data.current_period_end * 1000),
//             isActive: subscription.status === 'active',
//             tier: subscription.status === 'active' ? SubscriptionTier.PREMIUM : SubscriptionTier.FREE,
//           },
//         );
//         break;

//       case 'customer.subscription.deleted':
//         const deletedSubscription = event.data.object as Stripe.Subscription;
//         await this.subscriptionModel.findOneAndUpdate(
//           { stripeSubscriptionId: deletedSubscription.id },
//           {
//             isActive: false,
//             tier: SubscriptionTier.FREE,
//           },
//         );
//         break;
//     }
//   }

//   // Feature access control methods
//   async canAccessFeature(userId: string, feature: string): Promise<boolean> {
//     const subscription = await this.getSubscription(userId);
    
//     // Define feature access based on subscription tier
//     const featureAccess = {
//       'unlimited_habits': [SubscriptionTier.PREMIUM, SubscriptionTier.ENTERPRISE],
//       'advanced_analytics': [SubscriptionTier.PREMIUM, SubscriptionTier.ENTERPRISE],
//       'custom_reminders': [SubscriptionTier.PREMIUM, SubscriptionTier.ENTERPRISE],
//       'priority_support': [SubscriptionTier.ENTERPRISE],
//       'team_collaboration': [SubscriptionTier.ENTERPRISE],
//       // Add more features as needed
//     };

//     return featureAccess[feature]?.includes(subscription.tier) || false;
//   }
// } 