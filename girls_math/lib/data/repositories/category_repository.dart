import '../local/database.dart';
import '../models/category.dart';

class CategoryRepository {
  Future<List<ExpenseCategory>> all() async {
    final db = await AppDatabase.instance.database;
    final rows = await db.query('categories', orderBy: 'is_custom ASC, label ASC');
    return rows.map(ExpenseCategory.fromMap).toList();
  }

  Future<void> add(ExpenseCategory category) async {
    final db = await AppDatabase.instance.database;
    await db.insert('categories', category.toMap());
  }

  Future<void> delete(String id) async {
    final db = await AppDatabase.instance.database;
    await db.delete('categories', where: 'id = ? AND is_custom = 1', whereArgs: [id]);
  }
}
