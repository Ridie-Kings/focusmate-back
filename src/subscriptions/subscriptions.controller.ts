// import { Controller, Post, Body, Get, UseGuards, Req, RawBodyRequest } from '@nestjs/common';
// import { SubscriptionsService } from './subscriptions.service';
// import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
// import { Request } from 'express';
// import Stripe from 'stripe';
// import { ConfigService } from '@nestjs/config';
// import { GetUser } from 'src/users/decorators/get-user.decorator';
// import { User } from 'src/users/entities/user.entity';

// @Controller('subscriptions')
// export class SubscriptionsController {
//   constructor(
//     private readonly subscriptionsService: SubscriptionsService,
//     private readonly configService: ConfigService,
//   ) {}

//   @Post('create')
//   @UseGuards(JwtAuthGuard)
//   async createSubscription(
//     @Body('priceId') priceId: string,
//     @GetUser() user: User,
//   ) {
//     return this.subscriptionsService.createSubscription(user.id, priceId);
//   }

//   @Post('cancel')
//   @UseGuards(JwtAuthGuard)
//   async cancelSubscription(@GetUser() user: User) {
//     return this.subscriptionsService.cancelSubscription(user.id);
//   }

//   @Get('status')
//   @UseGuards(JwtAuthGuard)
//   async getSubscriptionStatus(@GetUser() user: User) {
//     return this.subscriptionsService.getSubscription(user.id);
//   }

//   @Post('webhook')
//   async handleWebhook(
//     @Req() req: RawBodyRequest<Request>,
//     @Body() rawBody: Buffer,
//   ) {
//     const signature = req.headers['stripe-signature'];
//     const webhookSecret = this.configService.get('STRIPE_WEBHOOK_SECRET');

//     try {
//       const event = Stripe.webhooks.constructEvent(
//         rawBody,
//         signature,
//         webhookSecret,
//       );
//       await this.subscriptionsService.handleWebhook(event);
//       return { received: true };
//     } catch (err) {
//       throw new Error(`Webhook Error: ${err.message}`);
//     }
//   }
// } 