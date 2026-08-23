import 'package:flutter_test/flutter_test.dart';
import 'package:girls_math/data/models/expense.dart';
import 'package:girls_math/data/models/goal.dart';
import 'package:girls_math/data/models/user_profile.dart';
import 'package:girls_math/services/insight_engine.dart';
import 'package:girls_math/services/message_engine.dart';

void main() {
  group('InsightEngine', () {
    test('mensagem menciona a meta quando o gasto compete com ela', () {
      final engine = InsightEngine(MessageEngine(seed: 1));
      final goal = Goal(
        id: 'g1',
        title: 'Viagem',
        targetAmount: 1000,
        savedAmount: 100,
        horizon: GoalHorizon.curtoPrazo,
        createdAt: DateTime(2026, 1, 1),
      );
      final expense = Expense(
        id: 'e1',
        categoryId: 'lazer',
        amount: 300,
        date: DateTime(2026, 1, 2),
      );

      final message = engine.messageForNewExpense(
        expense: expense,
        categoryLabel: 'Lazer',
        activeGoals: [goal],
        profile: const UserProfile(tone: ToneStyle.leve),
      );

      expect(message, contains('Viagem'));
    });

    test('reflexão neutra quando não há meta ativa', () {
      final engine = InsightEngine(MessageEngine(seed: 1));
      final expense = Expense(
        id: 'e2',
        categoryId: 'alimentacao',
        amount: 40,
        date: DateTime(2026, 1, 2),
      );

      final message = engine.messageForNewExpense(
        expense: expense,
        categoryLabel: 'Alimentação',
        activeGoals: const [],
        profile: const UserProfile(tone: ToneStyle.direto),
      );

      expect(message, isNotEmpty);
    });

    test('detecta categoria acima da média histórica', () {
      final engine = InsightEngine(MessageEngine(seed: 1));
      final now = DateTime.now();
      DateTime monthsAgo(int months) => DateTime(now.year, now.month - months, 5);

      final expenses = [
        Expense(id: '1', categoryId: 'lazer', amount: 100, date: monthsAgo(1)),
        Expense(id: '2', categoryId: 'lazer', amount: 100, date: monthsAgo(2)),
        Expense(id: '3', categoryId: 'lazer', amount: 100, date: monthsAgo(3)),
        Expense(id: '4', categoryId: 'lazer', amount: 250, date: now),
      ];

      final insights = engine.monthlyInsights(
        expenses: expenses,
        goals: const [],
        profile: const UserProfile(),
        categoryLabels: const {'lazer': 'Lazer'},
      );

      expect(insights.any((i) => i.severity == InsightSeverity.attention), isTrue);
    });
  });
}
