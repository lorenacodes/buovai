import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

import '../core/theme/app_colors.dart';
import '../core/utils/category_icons.dart';
import '../core/utils/currency.dart';
import '../data/models/expense.dart';

class ExpenseTile extends StatelessWidget {
  final Expense expense;
  final String categoryLabel;
  final String categoryIcon;
  final VoidCallback? onLongPress;

  const ExpenseTile({
    super.key,
    required this.expense,
    required this.categoryLabel,
    required this.categoryIcon,
    this.onLongPress,
  });

  @override
  Widget build(BuildContext context) {
    return ListTile(
      onLongPress: onLongPress,
      contentPadding: EdgeInsets.zero,
      leading: CircleAvatar(
        backgroundColor: AppColors.blush,
        foregroundColor: AppColors.roseDeep,
        child: Icon(iconForCategory(categoryIcon), size: 20),
      ),
      title: Text(expense.note.isEmpty ? categoryLabel : expense.note),
      subtitle: Text(
        '$categoryLabel · ${DateFormat('d MMM, HH:mm', 'pt_BR').format(expense.date)}',
      ),
      trailing: Text(
        formatCurrency(expense.amount),
        style: Theme.of(context).textTheme.titleMedium,
      ),
    );
  }
}
