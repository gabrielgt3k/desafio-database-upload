import parse from 'csv-parse';
import fs from 'fs';
import Transaction from '../models/Transaction';
import CreateTransactionService from './CreateTransactionService';

interface CsvRowData {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}
class ImportTransactionsService {
  async execute(csvPath: string): Promise<Transaction[]> {
    return new Promise((resolve, reject) => {
      const importedTransactions: Transaction[] = [];
      const createTransactionService = new CreateTransactionService();

      const stream = fs.createReadStream(csvPath);
      const parser = parse(
        {
          columns: ['title', 'type', 'value', 'category'],
          from: 2,
          ltrim: true,
        },
        async (err, transactions: CsvRowData[]) => {
          try {
            for (const transaction of transactions) {
              const importedTransaction = await createTransactionService.execute(
                transaction,
              );
              importedTransactions.push(importedTransaction);
            }
            resolve(importedTransactions);
          } catch (error) {
            reject(error);
          }
        },
      );

      stream.pipe(parser);
    });
  }
}

export default ImportTransactionsService;
