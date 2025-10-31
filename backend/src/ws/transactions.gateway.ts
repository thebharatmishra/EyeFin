// src/ws/transactions.gateway.ts
import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
} from "@nestjs/websockets";
import { Server } from "socket.io";
import { Injectable } from "@nestjs/common";
import { TransactionsService } from "../transactions/transactions.service";
import { FraudDetectionService } from "../fraud/fraud-detection.service";
import { Transaction } from "../types/transaction";

@WebSocketGateway({ cors: true })
@Injectable()
export class TransactionsGateway implements OnGatewayInit {
  @WebSocketServer() server!: Server;

  constructor(
    private readonly txService: TransactionsService,
    private readonly fraud: FraudDetectionService
  ) {}

  afterInit(server: Server) {
    // optional: you can perform additional setup here
  }

  async pushTransaction(
    txPayload: Omit<Transaction, "id" | "timestamp" | "isFlagged" | "flags">
  ) {
    // create transaction
    const tx = await this.txService.create(txPayload);
    const result = this.fraud.evaluate(tx);
    if (result.flagged) {
      tx.isFlagged = true;
      tx.flags = result.reasons;
      this.txService.update(tx);
      // emit flagged event to all clients
      this.server.emit("flaggedTransaction", tx);
    } else {
      // still emit newTransaction if you want UI to show incoming ones
      this.server.emit("newTransaction", tx);
    }
    return tx;
  }
}
