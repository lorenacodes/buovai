import '../data/models/expense.dart';
import '../data/models/goal.dart';
import '../data/models/user_profile.dart';
import 'message_engine.dart';

class Insight {
  final String message;
  final InsightSeverity severity;

  const Insight(this.message, this.severity);
}

enum InsightSeverity { info, attention, celebration }

/// Traduz dados brutos de gastos em interpretações com significado:
/// impacto em metas, comparação com padrão histórico e progresso percebido.
class InsightEngine {
  final MessageEngine _messages;

  InsightEngine(this._messages);

  /// Gera a mensagem imediata exibida logo após o registro de um gasto.
  String messageForNewExpense({
    required Expense expense,
    required String categoryLabel,
    required List<Goal> activeGoals,
    required UserProfile profile,
  }) {
    if (activeGoals.isNotEmpty && expense.amount > 0) {
      final closestGoal = activeGoals.reduce((a, b) => a.remaining < b.remaining ? a : b);
      if (closestGoal.remaining > 0) {
        final percentOfGoal = (expense.amount / closestGoal.remaining).clamp(0.0, 1.0);
        if (percentOfGoal >= 0.02) {
          return _messages.expenseAgainstGoal(
            tone: profile.tone,
            goalTitle: closestGoal.title,
            percentOfGoal: percentOfGoal,
          );
        }
      }
    }
    return _messages.neutralExpenseReflection(tone: profile.tone, categoryLabel: categoryLabel);
  }

  /// Compara o total de uma categoria neste mês com a média dos meses
  /// anteriores e retorna um insight quando o desvio for relevante.
  List<Insight> monthlyInsights({
    required List<Expense> expenses,
    required List<Goal> goals,
    required UserProfile profile,
    required Map<String, String> categoryLabels,
  }) {
    final insights = <Insight>[];
    final now = DateTime.now();
    final currentMonthExpenses = expenses.where(
      (e) => e.date.year == now.year && e.date.month == now.month,
    );

    final currentByCategory = <String, double>{};
    for (final e in currentMonthExpenses) {
      currentByCategory[e.categoryId] = (currentByCategory[e.categoryId] ?? 0) + e.amount;
    }

    final historicalByCategory = <String, List<double>>{};
    for (var monthsBack = 1; monthsBack <= 3; monthsBack++) {
      final target = DateTime(now.year, now.month - monthsBack);
      final monthTotal = <String, double>{};
      for (final e in expenses) {
        if (e.date.year == target.year && e.date.month == target.month) {
          monthTotal[e.categoryId] = (monthTotal[e.categoryId] ?? 0) + e.amount;
        }
      }
      monthTotal.forEach((key, value) {
        historicalByCategory.putIfAbsent(key, () => []).add(value);
      });
    }

    currentByCategory.forEach((categoryId, total) {
      final history = historicalByCategory[categoryId];
      if (history == null || history.isEmpty) return;
      final average = history.reduce((a, b) => a + b) / history.length;
      if (average <= 0) return;
      final deviation = (total - average) / average;
      if (deviation >= 0.3) {
        insights.add(Insight(
          _messages.categoryAboveAverage(
            tone: profile.tone,
            categoryLabel: categoryLabels[categoryId] ?? categoryId,
            percentAboveAverage: (deviation * 100).round(),
          ),
          InsightSeverity.attention,
        ));
      }
    });

    for (final goal in goals) {
      final percent = (goal.progress * 100).round();
      if (percent > 0 && percent % 25 == 0 && percent < 100) {
        insights.add(Insight(
          _messages.goalProgressCelebration(tone: profile.tone, goalTitle: goal.title, percent: percent),
          InsightSeverity.celebration,
        ));
      }
    }

    return insights;
  }
}
