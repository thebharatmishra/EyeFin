// src/transactions/transactions.controller.ts
import { Controller, Get, Post, Body, Query } from "@nestjs/common";
import { TransactionsService } from "./transactions.service";
import { TransactionsGateway } from "../ws/transactions.gateway";

@Controller("transactions")
export class TransactionsController {
  constructor(
    private readonly txService: TransactionsService,
    private readonly gateway: TransactionsGateway
  ) {}

  @Get()
  findAll(@Query("userId") userId?: string) {
    if (userId) return this.txService.findByUser(userId);
    return this.txService.findAll();
  }

  @Post()
  async create(@Body() payload: any) {
    // use the gateway to perform fraud evaluation and broadcasting
    return this.gateway.pushTransaction(payload);
  }
}
