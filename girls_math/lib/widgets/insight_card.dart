import 'package:flutter/material.dart';

import '../core/theme/app_colors.dart';
import '../services/insight_engine.dart';

class InsightCard extends StatelessWidget {
  final Insight insight;

  const InsightCard({super.key, required this.insight});

  Color get _accent {
    switch (insight.severity) {
      case InsightSeverity.attention:
        return AppColors.amberWarn;
      case InsightSeverity.celebration:
        return AppColors.sage;
      case InsightSeverity.info:
        return AppColors.roseDeep;
    }
  }

  IconData get _icon {
    switch (insight.severity) {
      case InsightSeverity.attention:
        return Icons.insights_outlined;
      case InsightSeverity.celebration:
        return Icons.auto_awesome_outlined;
      case InsightSeverity.info:
        return Icons.lightbulb_outline;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Icon(_icon, color: _accent, size: 22),
            const SizedBox(width: 12),
            Expanded(
              child: Text(insight.message, style: Theme.of(context).textTheme.bodyLarge),
            ),
          ],
        ),
      ),
    );
  }
}
