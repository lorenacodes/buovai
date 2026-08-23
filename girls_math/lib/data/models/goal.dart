enum GoalHorizon { curtoPrazo, medioPrazo, longoPrazo }

extension GoalHorizonLabel on GoalHorizon {
  String get label {
    switch (this) {
      case GoalHorizon.curtoPrazo:
        return 'Curto prazo';
      case GoalHorizon.medioPrazo:
        return 'Médio prazo';
      case GoalHorizon.longoPrazo:
        return 'Longo prazo';
    }
  }
}

class Goal {
  final String id;
  final String title;
  final double targetAmount;
  final double savedAmount;
  final DateTime? targetDate;
  final GoalHorizon horizon;
  final DateTime createdAt;

  const Goal({
    required this.id,
    required this.title,
    required this.targetAmount,
    required this.horizon,
    required this.createdAt,
    this.savedAmount = 0,
    this.targetDate,
  });

  double get progress => targetAmount <= 0 ? 0 : (savedAmount / targetAmount).clamp(0, 1);
  double get remaining => (targetAmount - savedAmount).clamp(0, double.infinity);
  bool get isComplete => savedAmount >= targetAmount;

  Goal copyWith({
    String? title,
    double? targetAmount,
    double? savedAmount,
    DateTime? targetDate,
    GoalHorizon? horizon,
  }) {
    return Goal(
      id: id,
      title: title ?? this.title,
      targetAmount: targetAmount ?? this.targetAmount,
      savedAmount: savedAmount ?? this.savedAmount,
      targetDate: targetDate ?? this.targetDate,
      horizon: horizon ?? this.horizon,
      createdAt: createdAt,
    );
  }

  Map<String, Object?> toMap() => {
        'id': id,
        'title': title,
        'target_amount': targetAmount,
        'saved_amount': savedAmount,
        'target_date': targetDate?.toIso8601String(),
        'horizon': horizon.name,
        'created_at': createdAt.toIso8601String(),
      };

  factory Goal.fromMap(Map<String, Object?> map) => Goal(
        id: map['id'] as String,
        title: map['title'] as String,
        targetAmount: (map['target_amount'] as num).toDouble(),
        savedAmount: (map['saved_amount'] as num).toDouble(),
        targetDate: map['target_date'] != null ? DateTime.parse(map['target_date'] as String) : null,
        horizon: GoalHorizon.values.firstWhere((h) => h.name == map['horizon']),
        createdAt: DateTime.parse(map['created_at'] as String),
      );
}
