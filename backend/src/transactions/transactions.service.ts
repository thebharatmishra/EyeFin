// src/transactions/transactions.service.ts
import { Injectable } from "@nestjs/common";
import { Transaction } from "../types/transaction";

@Injectable()
export class TransactionsService {
  private transactions: Transaction[] = [];

  // seed some data
  constructor() {
    // optionally seed
  }

  async create(
    txPartial: Omit<Transaction, "id" | "timestamp" | "isFlagged" | "flags">
  ) {
    const { v4: uuid } = await import("uuid");
    const tx: Transaction = {
      id: uuid(),
      timestamp: new Date().toISOString(),
      ...txPartial,
      isFlagged: false,
      flags: [],
    };
    this.transactions.unshift(tx); // newest first
    return tx;
  }

  findAll(limit = 100) {
    return this.transactions.slice(0, limit);
  }

  // get transactions for a user
  findByUser(userId: string, limit = 100) {
    return this.transactions.filter((t) => t.userId === userId).slice(0, limit);
  }

  update(tx: Transaction) {
    const idx = this.transactions.findIndex((t) => t.id === tx.id);
    if (idx >= 0) this.transactions[idx] = tx;
    return tx;
  }
}
