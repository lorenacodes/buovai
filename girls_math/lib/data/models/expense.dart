class Expense {
  final String id;
  final String categoryId;
  final double amount;
  final String note;
  final DateTime date;
  final String? linkedGoalId;

  const Expense({
    required this.id,
    required this.categoryId,
    required this.amount,
    required this.date,
    this.note = '',
    this.linkedGoalId,
  });

  Expense copyWith({
    String? categoryId,
    double? amount,
    String? note,
    DateTime? date,
    String? linkedGoalId,
  }) {
    return Expense(
      id: id,
      categoryId: categoryId ?? this.categoryId,
      amount: amount ?? this.amount,
      note: note ?? this.note,
      date: date ?? this.date,
      linkedGoalId: linkedGoalId ?? this.linkedGoalId,
    );
  }

  Map<String, Object?> toMap() => {
        'id': id,
        'category_id': categoryId,
        'amount': amount,
        'note': note,
        'date': date.toIso8601String(),
        'linked_goal_id': linkedGoalId,
      };

  factory Expense.fromMap(Map<String, Object?> map) => Expense(
        id: map['id'] as String,
        categoryId: map['category_id'] as String,
        amount: (map['amount'] as num).toDouble(),
        note: (map['note'] as String?) ?? '',
        date: DateTime.parse(map['date'] as String),
        linkedGoalId: map['linked_goal_id'] as String?,
      );
}
