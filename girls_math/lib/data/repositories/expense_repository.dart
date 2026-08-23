import '../local/database.dart';
import '../models/expense.dart';

class ExpenseRepository {
  Future<List<Expense>> all() async {
    final db = await AppDatabase.instance.database;
    final rows = await db.query('expenses', orderBy: 'date DESC');
    return rows.map(Expense.fromMap).toList();
  }

  Future<void> add(Expense expense) async {
    final db = await AppDatabase.instance.database;
    await db.insert('expenses', expense.toMap());
  }

  Future<void> update(Expense expense) async {
    final db = await AppDatabase.instance.database;
    await db.update('expenses', expense.toMap(), where: 'id = ?', whereArgs: [expense.id]);
  }

  Future<void> delete(String id) async {
    final db = await AppDatabase.instance.database;
    await db.delete('expenses', where: 'id = ?', whereArgs: [id]);
  }
}
