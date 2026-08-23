import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../core/theme/app_colors.dart';
import '../../core/utils/currency.dart';
import '../../state/app_state.dart';
import '../../widgets/expense_tile.dart';
import '../../widgets/goal_progress_card.dart';
import '../../widgets/insight_card.dart';
import '../../widgets/quick_add_sheet.dart';

class DashboardScreen extends StatelessWidget {
  const DashboardScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final state = context.watch<AppState>();
    final recentExpenses = state.expenses.take(5).toList();
    final activeGoals = state.goals.where((g) => !g.isComplete).take(2).toList();
    final monthlyInsights = state.insights
        .monthlyInsights(
          expenses: state.expenses,
          goals: state.goals,
          profile: state.profile,
          categoryLabels: state.categoryLabels,
        )
        .take(2)
        .toList();

    return Scaffold(
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => QuickAddSheet.show(context),
        label: const Text('Registrar gasto'),
        icon: const Icon(Icons.add),
      ),
      body: SafeArea(
        child: RefreshIndicator(
          onRefresh: state.load,
          child: ListView(
            padding: const EdgeInsets.fromLTRB(20, 16, 20, 120),
            children: [
              Text(
                state.messages.greeting(tone: state.profile.tone, name: state.profile.name, now: DateTime.now()),
                style: Theme.of(context).textTheme.headlineSmall,
              ),
              const SizedBox(height: 20),
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(20),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('Gasto neste mês', style: Theme.of(context).textTheme.bodyMedium),
                      const SizedBox(height: 6),
                      Text(
                        formatCurrency(state.totalSpentThisMonth),
                        style: Theme.of(context).textTheme.displaySmall,
                      ),
                    ],
                  ),
                ),
              ),
              if (monthlyInsights.isNotEmpty) ...[
                const SizedBox(height: 24),
                Text('Para você perceber', style: Theme.of(context).textTheme.titleMedium),
                const SizedBox(height: 12),
                ...monthlyInsights.map(
                  (insight) => Padding(
                    padding: const EdgeInsets.only(bottom: 10),
                    child: InsightCard(insight: insight),
                  ),
                ),
              ],
              if (activeGoals.isNotEmpty) ...[
                const SizedBox(height: 24),
                Text('Suas metas', style: Theme.of(context).textTheme.titleMedium),
                const SizedBox(height: 12),
                ...activeGoals.map(
                  (goal) => Padding(
                    padding: const EdgeInsets.only(bottom: 10),
                    child: GoalProgressCard(goal: goal),
                  ),
                ),
              ],
              const SizedBox(height: 24),
              Text('Últimos gastos', style: Theme.of(context).textTheme.titleMedium),
              const SizedBox(height: 8),
              if (recentExpenses.isEmpty)
                Padding(
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  child: Text(
                    'Nenhum gasto registrado ainda. Toque em "Registrar gasto" para começar.',
                    style: Theme.of(context).textTheme.bodyMedium,
                  ),
                )
              else
                Card(
                  child: Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 12),
                    child: Column(
                      children: recentExpenses.map((expense) {
                        final category = state.categories.firstWhere(
                          (c) => c.id == expense.categoryId,
                          orElse: () => state.categories.last,
                        );
                        return ExpenseTile(
                          expense: expense,
                          categoryLabel: category.label,
                          categoryIcon: category.icon,
                          onLongPress: () => _confirmDelete(context, state, expense.id),
                        );
                      }).toList(),
                    ),
                  ),
                ),
            ],
          ),
        ),
      ),
    );
  }

  void _confirmDelete(BuildContext context, AppState state, String expenseId) {
    showDialog(
      context: context,
      builder: (_) => AlertDialog(
        title: const Text('Remover gasto'),
        content: const Text('Quer remover este registro?'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: const Text('Cancelar')),
          TextButton(
            onPressed: () {
              state.deleteExpense(expenseId);
              Navigator.pop(context);
            },
            style: TextButton.styleFrom(foregroundColor: AppColors.roseDeep),
            child: const Text('Remover'),
          ),
        ],
      ),
    );
  }
}
