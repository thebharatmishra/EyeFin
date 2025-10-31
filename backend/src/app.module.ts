import { Module } from "@nestjs/common";
import { TransactionsController } from "./transactions/transactions.controller";
import { TransactionsService } from "./transactions/transactions.service";
import { FraudDetectionService } from "./fraud/fraud-detection.service";
import { TransactionsGateway } from "./ws/transactions.gateway";

@Module({
  imports: [],
  controllers: [TransactionsController],
  providers: [TransactionsService, FraudDetectionService, TransactionsGateway],
})
export class AppModule {}
