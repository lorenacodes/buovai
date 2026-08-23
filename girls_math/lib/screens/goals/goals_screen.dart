import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../core/theme/app_colors.dart';
import '../../data/models/goal.dart';
import '../../state/app_state.dart';
import '../../widgets/goal_progress_card.dart';

class GoalsScreen extends StatelessWidget {
  const GoalsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final state = context.watch<AppState>();

    return Scaffold(
      appBar: AppBar(title: const Text('Suas metas')),
      floatingActionButton: FloatingActionButton(
        onPressed: () => _showAddGoalSheet(context),
        child: const Icon(Icons.add),
      ),
      body: state.goals.isEmpty
          ? Center(
              child: Padding(
                padding: const EdgeInsets.all(32),
                child: Text(
                  'Toda meta financeira começa com um número claro. '
                  'Crie a sua primeira e acompanhe o progresso aqui.',
                  textAlign: TextAlign.center,
                  style: Theme.of(context).textTheme.bodyLarge,
                ),
              ),
            )
          : ListView.separated(
              padding: const EdgeInsets.fromLTRB(20, 16, 20, 100),
              itemCount: state.goals.length,
              separatorBuilder: (_, __) => const SizedBox(height: 12),
              itemBuilder: (_, index) {
                final goal = state.goals[index];
                return GoalProgressCard(
                  goal: goal,
                  onTap: () => _showGoalOptions(context, state, goal),
                );
              },
            ),
    );
  }

  void _showGoalOptions(BuildContext context, AppState state, Goal goal) {
    showModalBottomSheet(
      context: context,
      builder: (_) => SafeArea(
        child: Wrap(
          children: [
            ListTile(
              leading: const Icon(Icons.add_circle_outline),
              title: const Text('Adicionar valor guardado'),
              onTap: () {
                Navigator.pop(context);
                _showContributeSheet(context, state, goal);
              },
            ),
            ListTile(
              leading: const Icon(Icons.delete_outline, color: AppColors.roseDeep),
              title: const Text('Excluir meta'),
              onTap: () {
                state.deleteGoal(goal.id);
                Navigator.pop(context);
              },
            ),
          ],
        ),
      ),
    );
  }

  void _showContributeSheet(BuildContext context, AppState state, Goal goal) {
    final controller = TextEditingController();
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      builder: (_) => Padding(
        padding: EdgeInsets.only(
          left: 20,
          right: 20,
          top: 20,
          bottom: MediaQuery.of(context).viewInsets.bottom + 20,
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Guardar para "${goal.title}"', style: Theme.of(context).textTheme.titleMedium),
            const SizedBox(height: 12),
            TextField(
              controller: controller,
              autofocus: true,
              keyboardType: const TextInputType.numberWithOptions(decimal: true),
              decoration: const InputDecoration(prefixText: 'R\$ '),
            ),
            const SizedBox(height: 16),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: () {
                  final amount = double.tryParse(controller.text.replaceAll(',', '.'));
                  if (amount != null && amount > 0) {
                    state.contributeToGoal(goal.id, amount);
                  }
                  Navigator.pop(context);
                },
                child: const Text('Guardar'),
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _showAddGoalSheet(BuildContext context) {
    final titleController = TextEditingController();
    final amountController = TextEditingController();
    GoalHorizon horizon = GoalHorizon.curtoPrazo;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      builder: (sheetContext) => StatefulBuilder(
        builder: (sheetContext, setState) {
          return Padding(
            padding: EdgeInsets.only(
              left: 20,
              right: 20,
              top: 20,
              bottom: MediaQuery.of(sheetContext).viewInsets.bottom + 20,
            ),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Nova meta', style: Theme.of(sheetContext).textTheme.headlineSmall),
                const SizedBox(height: 16),
                TextField(
                  controller: titleController,
                  decoration: const InputDecoration(hintText: 'Ex: Viagem, reserva de emergência...'),
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: amountController,
                  keyboardType: const TextInputType.numberWithOptions(decimal: true),
                  decoration: const InputDecoration(hintText: 'Valor total', prefixText: 'R\$ '),
                ),
                const SizedBox(height: 12),
                Wrap(
                  spacing: 8,
                  children: GoalHorizon.values.map((h) {
                    return ChoiceChip(
                      label: Text(h.label),
                      selected: horizon == h,
                      onSelected: (_) => setState(() => horizon = h),
                    );
                  }).toList(),
                ),
                const SizedBox(height: 20),
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: () {
                      final amount = double.tryParse(amountController.text.replaceAll(',', '.'));
                      final title = titleController.text.trim();
                      if (title.isEmpty || amount == null || amount <= 0) return;
                      context.read<AppState>().addGoal(
                            title: title,
                            targetAmount: amount,
                            horizon: horizon,
                          );
                      Navigator.pop(sheetContext);
                    },
                    child: const Text('Criar meta'),
                  ),
                ),
              ],
            ),
          );
        },
      ),
    );
  }
}
