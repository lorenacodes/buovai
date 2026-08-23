import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../core/theme/app_colors.dart';
import '../core/utils/category_icons.dart';
import '../state/app_state.dart';

class QuickAddSheet extends StatefulWidget {
  const QuickAddSheet({super.key});

  static Future<void> show(BuildContext context) {
    return showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => const QuickAddSheet(),
    );
  }

  @override
  State<QuickAddSheet> createState() => _QuickAddSheetState();
}

class _QuickAddSheetState extends State<QuickAddSheet> {
  final _amountController = TextEditingController();
  final _noteController = TextEditingController();
  String? _selectedCategoryId;
  String? _linkedGoalId;

  @override
  void dispose() {
    _amountController.dispose();
    _noteController.dispose();
    super.dispose();
  }

  Future<void> _submit(AppState state) async {
    final amount = double.tryParse(_amountController.text.replaceAll(',', '.'));
    if (amount == null || amount <= 0) return;

    final message = await state.addExpense(
      amount: amount,
      note: _noteController.text.trim(),
      categoryId: _selectedCategoryId,
      linkedGoalId: _linkedGoalId,
    );

    if (!mounted) return;
    Navigator.of(context).pop();
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        behavior: SnackBarBehavior.floating,
        duration: const Duration(seconds: 4),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final state = context.watch<AppState>();
    final suggestedCategory = _noteController.text.isEmpty
        ? null
        : state.categorySuggestions.suggest(_noteController.text);
    final activeCategoryId = _selectedCategoryId ?? suggestedCategory;

    return Padding(
      padding: EdgeInsets.only(bottom: MediaQuery.of(context).viewInsets.bottom),
      child: Container(
        decoration: const BoxDecoration(
          color: AppColors.sand,
          borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
        ),
        padding: const EdgeInsets.fromLTRB(20, 12, 20, 24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Center(
              child: Container(
                width: 40,
                height: 4,
                margin: const EdgeInsets.only(bottom: 16),
                decoration: BoxDecoration(
                  color: AppColors.divider,
                  borderRadius: BorderRadius.circular(4),
                ),
              ),
            ),
            Text('Novo gasto', style: Theme.of(context).textTheme.headlineSmall),
            const SizedBox(height: 18),
            TextField(
              controller: _amountController,
              keyboardType: const TextInputType.numberWithOptions(decimal: true),
              autofocus: true,
              style: Theme.of(context).textTheme.displaySmall,
              decoration: const InputDecoration(
                prefixText: 'R\$ ',
                border: InputBorder.none,
                filled: false,
                hintText: '0,00',
              ),
            ),
            const Divider(),
            const SizedBox(height: 8),
            TextField(
              controller: _noteController,
              onChanged: (_) => setState(() {}),
              decoration: const InputDecoration(hintText: 'Com o quê? (ex: ifood, uber, salão)'),
            ),
            const SizedBox(height: 16),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: state.categories.map((category) {
                final isSelected = category.id == activeCategoryId;
                return ChoiceChip(
                  selected: isSelected,
                  label: Text(category.label),
                  avatar: Icon(iconForCategory(category.icon), size: 16),
                  onSelected: (_) => setState(() => _selectedCategoryId = category.id),
                  selectedColor: AppColors.roseMuted.withOpacity(0.35),
                );
              }).toList(),
            ),
            if (state.goals.where((g) => !g.isComplete).isNotEmpty) ...[
              const SizedBox(height: 16),
              Text('Vincular a uma meta (opcional)', style: Theme.of(context).textTheme.bodyMedium),
              const SizedBox(height: 8),
              Wrap(
                spacing: 8,
                runSpacing: 8,
                children: state.goals.where((g) => !g.isComplete).map((goal) {
                  final isSelected = goal.id == _linkedGoalId;
                  return ChoiceChip(
                    selected: isSelected,
                    label: Text(goal.title),
                    onSelected: (_) => setState(() => _linkedGoalId = isSelected ? null : goal.id),
                  );
                }).toList(),
              ),
            ],
            const SizedBox(height: 24),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: () => _submit(state),
                child: const Text('Registrar'),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
