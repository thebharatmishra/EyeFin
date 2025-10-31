// src/fraud/fraud-detection.service.ts
import { Injectable } from "@nestjs/common";
import { TransactionsService } from "../transactions/transactions.service";
import { Transaction } from "../types/transaction";

@Injectable()
export class FraudDetectionService {
  constructor(private readonly txService: TransactionsService) {}

  evaluate(tx: Transaction): { flagged: boolean; reasons: string[] } {
    const reasons: string[] = [];

    // rule: large transaction
    if (tx.amount >= 2000) reasons.push("Large amount");

    // rule: foreign transaction (assuming user normally in IN)
    if (tx.country && tx.country !== "IN") reasons.push("Foreign country");

    // rule: suspicious merchant keywords
    const suspicious = ["casino", "gambl", "suspicious-merchant"];
    if (suspicious.some((k) => tx.merchant.toLowerCase().includes(k)))
      reasons.push("Suspicious merchant");

    // rule: rapid fire - check previous transactions for user in last 5 minutes
    const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000);
    const recent = this.txService
      .findByUser(tx.userId, 50)
      .filter((t) => new Date(t.timestamp) > fiveMinAgo);
    if (recent.length >= 3) reasons.push("Multiple transactions in short time");

    const flagged = reasons.length > 0;
    return { flagged, reasons };
  }
}
