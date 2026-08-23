import 'package:path/path.dart';
import 'package:sqflite/sqflite.dart';

import '../models/category.dart';

class AppDatabase {
  AppDatabase._internal();
  static final AppDatabase instance = AppDatabase._internal();

  Database? _db;

  Future<Database> get database async {
    _db ??= await _open();
    return _db!;
  }

  Future<Database> _open() async {
    final dbPath = await getDatabasesPath();
    final path = join(dbPath, 'girls_math.db');

    return openDatabase(
      path,
      version: 1,
      onCreate: (db, version) async {
        await db.execute('''
          CREATE TABLE categories (
            id TEXT PRIMARY KEY,
            label TEXT NOT NULL,
            icon TEXT NOT NULL,
            is_custom INTEGER NOT NULL DEFAULT 0
          )
        ''');

        await db.execute('''
          CREATE TABLE expenses (
            id TEXT PRIMARY KEY,
            category_id TEXT NOT NULL,
            amount REAL NOT NULL,
            note TEXT NOT NULL DEFAULT '',
            date TEXT NOT NULL,
            linked_goal_id TEXT,
            FOREIGN KEY (category_id) REFERENCES categories (id)
          )
        ''');

        await db.execute('''
          CREATE TABLE goals (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            target_amount REAL NOT NULL,
            saved_amount REAL NOT NULL DEFAULT 0,
            target_date TEXT,
            horizon TEXT NOT NULL,
            created_at TEXT NOT NULL
          )
        ''');

        final batch = db.batch();
        for (final category in ExpenseCategory.defaults) {
          batch.insert('categories', category.toMap());
        }
        await batch.commit(noResult: true);
      },
    );
  }
}
