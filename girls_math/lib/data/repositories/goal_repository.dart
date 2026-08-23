import '../local/database.dart';
import '../models/goal.dart';

class GoalRepository {
  Future<List<Goal>> all() async {
    final db = await AppDatabase.instance.database;
    final rows = await db.query('goals', orderBy: 'created_at ASC');
    return rows.map(Goal.fromMap).toList();
  }

  Future<void> add(Goal goal) async {
    final db = await AppDatabase.instance.database;
    await db.insert('goals', goal.toMap());
  }

  Future<void> update(Goal goal) async {
    final db = await AppDatabase.instance.database;
    await db.update('goals', goal.toMap(), where: 'id = ?', whereArgs: [goal.id]);
  }

  Future<void> delete(String id) async {
    final db = await AppDatabase.instance.database;
    await db.delete('goals', where: 'id = ?', whereArgs: [id]);
  }
}
