import 'package:flutter/material.dart';

import '../core/theme/app_colors.dart';
import '../core/utils/currency.dart';
import '../data/models/goal.dart';

class GoalProgressCard extends StatelessWidget {
  final Goal goal;
  final VoidCallback? onTap;

  const GoalProgressCard({super.key, required this.goal, this.onTap});

  @override
  Widget build(BuildContext context) {
    final percent = (goal.progress * 100).round();
    return Card(
      child: InkWell(
        borderRadius: BorderRadius.circular(20),
        onTap: onTap,
        child: Padding(
          padding: const EdgeInsets.all(18),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Expanded(
                    child: Text(goal.title, style: Theme.of(context).textTheme.titleMedium),
                  ),
                  Text(
                    goal.horizon.label,
                    style: Theme.of(context).textTheme.bodyMedium,
                  ),
                ],
              ),
              const SizedBox(height: 14),
              ClipRRect(
                borderRadius: BorderRadius.circular(8),
                child: LinearProgressIndicator(
                  value: goal.progress,
                  minHeight: 8,
                  backgroundColor: AppColors.blush,
                  valueColor: AlwaysStoppedAnimation(
                    goal.isComplete ? AppColors.sage : AppColors.roseDeep,
                  ),
                ),
              ),
              const SizedBox(height: 10),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    '${formatCurrency(goal.savedAmount)} de ${formatCurrency(goal.targetAmount)}',
                    style: Theme.of(context).textTheme.bodyMedium,
                  ),
                  Text(
                    '$percent%',
                    style: Theme.of(context).textTheme.titleMedium?.copyWith(color: AppColors.roseDeep),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}
