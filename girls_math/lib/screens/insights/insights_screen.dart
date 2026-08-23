import 'package:fl_chart/fl_chart.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../core/theme/app_colors.dart';
import '../../core/utils/currency.dart';
import '../../state/app_state.dart';
import '../../widgets/insight_card.dart';

class InsightsScreen extends StatelessWidget {
  const InsightsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final state = context.watch<AppState>();
    final now = DateTime.now();
    final monthExpenses = state.expenses.where(
      (e) => e.date.year == now.year && e.date.month == now.month,
    );

    final totalsByCategory = <String, double>{};
    for (final e in monthExpenses) {
      totalsByCategory[e.categoryId] = (totalsByCategory[e.categoryId] ?? 0) + e.amount;
    }
    final sortedEntries = totalsByCategory.entries.toList()
      ..sort((a, b) => b.value.compareTo(a.value));

    final insights = state.insights.monthlyInsights(
      expenses: state.expenses,
      goals: state.goals,
      profile: state.profile,
      categoryLabels: state.categoryLabels,
    );

    final palette = [
      AppColors.roseDeep,
      AppColors.gold,
      AppColors.sage,
      AppColors.roseMuted,
      AppColors.plum,
      AppColors.amberWarn,
    ];

    return Scaffold(
      appBar: AppBar(title: const Text('Seus padrões')),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(20, 16, 20, 100),
        children: [
          if (sortedEntries.isEmpty)
            Padding(
              padding: const EdgeInsets.symmetric(vertical: 24),
              child: Text(
                'Assim que você registrar alguns gastos, aqui vai aparecer para onde seu '
                'dinheiro está indo de verdade, não só o quanto.',
                style: Theme.of(context).textTheme.bodyLarge,
              ),
            )
          else ...[
            SizedBox(
              height: 200,
              child: PieChart(
                PieChartData(
                  sectionsSpace: 3,
                  centerSpaceRadius: 46,
                  sections: [
                    for (var i = 0; i < sortedEntries.length; i++)
                      PieChartSectionData(
                        value: sortedEntries[i].value,
                        color: palette[i % palette.length],
                        title: '',
                        radius: 46,
                      ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 16),
            ...List.generate(sortedEntries.length, (i) {
              final entry = sortedEntries[i];
              final label = state.categoryLabels[entry.key] ?? entry.key;
              return Padding(
                padding: const EdgeInsets.only(bottom: 8),
                child: Row(
                  children: [
                    Container(
                      width: 10,
                      height: 10,
                      decoration: BoxDecoration(
                        color: palette[i % palette.length],
                        shape: BoxShape.circle,
                      ),
                    ),
                    const SizedBox(width: 10),
                    Expanded(child: Text(label, style: Theme.of(context).textTheme.bodyLarge)),
                    Text(formatCurrency(entry.value), style: Theme.of(context).textTheme.titleMedium),
                  ],
                ),
              );
            }),
          ],
          const SizedBox(height: 28),
          Text('O que isso significa', style: Theme.of(context).textTheme.titleMedium),
          const SizedBox(height: 12),
          if (insights.isEmpty)
            Text(
              'Continue registrando. Depois de alguns meses, vamos te mostrar '
              'comparações reais entre seu padrão e o que você quer alcançar.',
              style: Theme.of(context).textTheme.bodyMedium,
            )
          else
            ...insights.map(
              (insight) => Padding(
                padding: const EdgeInsets.only(bottom: 10),
                child: InsightCard(insight: insight),
              ),
            ),
        ],
      ),
    );
  }
}
