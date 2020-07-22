import { getCustomRepository, getRepository } from 'typeorm';
import AppError from '../errors/AppError';

import Transaction from '../models/Transaction';
import Category from '../models/Category';
import TransactionsRepository from '../repositories/TransactionsRepository';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category: categoryTitle,
  }: Request): Promise<Transaction> {
    const transactionsRepository = getCustomRepository(TransactionsRepository);
    const categoryRepository = getRepository(Category);
    const { total } = await transactionsRepository.getBalance();

    if (type === 'outcome' && total - value < 0) {
      throw new AppError('insufficient balance for this transaction');
    }

    const categoryWithSameType = await categoryRepository.findOne({
      where: { title: categoryTitle },
    });

    if (categoryWithSameType) {
      const transaction = transactionsRepository.create({
        title,
        value,
        type,
        category_id: categoryWithSameType.id,
      });

      await transactionsRepository.save(transaction);

      return transaction;
    }

    const category = categoryRepository.create({ title: categoryTitle });
    await categoryRepository.save(category);

    const transaction = transactionsRepository.create({
      title,
      value,
      type,
      category_id: category.id,
    });

    await transactionsRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
