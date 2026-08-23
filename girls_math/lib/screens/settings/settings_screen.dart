import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../core/theme/app_colors.dart';
import '../../data/models/user_profile.dart';
import '../../state/app_state.dart';

class SettingsScreen extends StatelessWidget {
  const SettingsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final state = context.watch<AppState>();
    final profile = state.profile;

    return Scaffold(
      appBar: AppBar(title: const Text('Configurações')),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(20, 16, 20, 100),
        children: [
          Text('Como você quer ser chamada', style: Theme.of(context).textTheme.titleMedium),
          const SizedBox(height: 8),
          TextFormField(
            initialValue: profile.name,
            decoration: const InputDecoration(hintText: 'Seu nome'),
            onFieldSubmitted: (value) => state.saveProfile(profile.copyWith(name: value)),
          ),
          const SizedBox(height: 28),
          Text('Tom das mensagens', style: Theme.of(context).textTheme.titleMedium),
          const SizedBox(height: 8),
          ...ToneStyle.values.map((tone) {
            return RadioListTile<ToneStyle>(
              contentPadding: EdgeInsets.zero,
              value: tone,
              groupValue: profile.tone,
              activeColor: AppColors.roseDeep,
              title: Text(tone.label),
              onChanged: (value) {
                if (value != null) state.saveProfile(profile.copyWith(tone: value));
              },
            );
          }),
          const SizedBox(height: 20),
          const Divider(),
          const SizedBox(height: 8),
          Text('Alertas', style: Theme.of(context).textTheme.titleMedium),
          SwitchListTile(
            contentPadding: EdgeInsets.zero,
            activeColor: AppColors.roseDeep,
            title: const Text('Alertas de padrão de gasto'),
            subtitle: const Text('Avisos quando uma categoria foge do seu costume'),
            value: profile.alertsEnabled,
            onChanged: (value) => state.saveProfile(profile.copyWith(alertsEnabled: value)),
          ),
          SwitchListTile(
            contentPadding: EdgeInsets.zero,
            activeColor: AppColors.roseDeep,
            title: const Text('Resumo semanal'),
            subtitle: const Text('Um panorama leve da sua semana financeira'),
            value: profile.weeklySummaryEnabled,
            onChanged: (value) => state.saveProfile(profile.copyWith(weeklySummaryEnabled: value)),
          ),
          const SizedBox(height: 20),
          const Divider(),
          const SizedBox(height: 8),
          Text('Categorias personalizadas', style: Theme.of(context).textTheme.titleMedium),
          const SizedBox(height: 8),
          ...state.categories.where((c) => c.isCustom).map(
                (c) => ListTile(
                  contentPadding: EdgeInsets.zero,
                  title: Text(c.label),
                  trailing: IconButton(
                    icon: const Icon(Icons.close, size: 18),
                    onPressed: () => state.addCustomCategory(c.label, c.icon),
                  ),
                ),
              ),
          TextButton.icon(
            onPressed: () => _showAddCategoryDialog(context, state),
            icon: const Icon(Icons.add),
            label: const Text('Adicionar categoria'),
          ),
        ],
      ),
    );
  }

  void _showAddCategoryDialog(BuildContext context, AppState state) {
    final controller = TextEditingController();
    showDialog(
      context: context,
      builder: (_) => AlertDialog(
        title: const Text('Nova categoria'),
        content: TextField(controller: controller, autofocus: true),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: const Text('Cancelar')),
          TextButton(
            onPressed: () {
              final label = controller.text.trim();
              if (label.isNotEmpty) {
                state.addCustomCategory(label, 'more_horiz');
              }
              Navigator.pop(context);
            },
            child: const Text('Adicionar'),
          ),
        ],
      ),
    );
  }
}
