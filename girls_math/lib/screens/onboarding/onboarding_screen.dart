import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../core/theme/app_colors.dart';
import '../../data/models/user_profile.dart';
import '../../state/app_state.dart';

class OnboardingScreen extends StatefulWidget {
  final VoidCallback onDone;

  const OnboardingScreen({super.key, required this.onDone});

  @override
  State<OnboardingScreen> createState() => _OnboardingScreenState();
}

class _OnboardingScreenState extends State<OnboardingScreen> {
  final _pageController = PageController();
  final _nameController = TextEditingController();
  ToneStyle _tone = ToneStyle.leve;
  int _page = 0;

  static const _totalPages = 3;

  @override
  void dispose() {
    _pageController.dispose();
    _nameController.dispose();
    super.dispose();
  }

  Future<void> _finish() async {
    final state = context.read<AppState>();
    await state.saveProfile(
      state.profile.copyWith(
        name: _nameController.text.trim(),
        tone: _tone,
        onboardingComplete: true,
      ),
    );
    widget.onDone();
  }

  void _next() {
    if (_page == _totalPages - 1) {
      _finish();
      return;
    }
    _pageController.nextPage(duration: const Duration(milliseconds: 320), curve: Curves.easeOutCubic);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.sand,
      body: SafeArea(
        child: Column(
          children: [
            const SizedBox(height: 16),
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: List.generate(_totalPages, (index) {
                final active = index == _page;
                return AnimatedContainer(
                  duration: const Duration(milliseconds: 220),
                  margin: const EdgeInsets.symmetric(horizontal: 4),
                  width: active ? 22 : 8,
                  height: 8,
                  decoration: BoxDecoration(
                    color: active ? AppColors.roseDeep : AppColors.divider,
                    borderRadius: BorderRadius.circular(4),
                  ),
                );
              }),
            ),
            Expanded(
              child: PageView(
                controller: _pageController,
                onPageChanged: (i) => setState(() => _page = i),
                physics: const NeverScrollableScrollPhysics(),
                children: [
                  _WelcomePage(nameController: _nameController),
                  _TonePage(tone: _tone, onChanged: (t) => setState(() => _tone = t)),
                  const _PromisePage(),
                ],
              ),
            ),
            Padding(
              padding: const EdgeInsets.fromLTRB(24, 0, 24, 24),
              child: SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: _next,
                  child: Text(_page == _totalPages - 1 ? 'Começar' : 'Continuar'),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _WelcomePage extends StatelessWidget {
  final TextEditingController nameController;

  const _WelcomePage({required this.nameController});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(28),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Text('Girls Math', style: Theme.of(context).textTheme.displaySmall),
          const SizedBox(height: 12),
          Text(
            'Um espaço para entender seu dinheiro sem culpa e sem complicação. '
            'Como podemos te chamar?',
            style: Theme.of(context).textTheme.bodyLarge,
          ),
          const SizedBox(height: 24),
          TextField(
            controller: nameController,
            decoration: const InputDecoration(hintText: 'Seu nome'),
            textCapitalization: TextCapitalization.words,
          ),
        ],
      ),
    );
  }
}

class _TonePage extends StatelessWidget {
  final ToneStyle tone;
  final ValueChanged<ToneStyle> onChanged;

  const _TonePage({required this.tone, required this.onChanged});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(28),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Text('Como você quer ouvir isso de nós?', style: Theme.of(context).textTheme.headlineSmall),
          const SizedBox(height: 8),
          Text(
            'Vamos te dar retornos sobre seus gastos. Escolha o tom que combina com você — '
            'você pode mudar isso depois.',
            style: Theme.of(context).textTheme.bodyMedium,
          ),
          const SizedBox(height: 20),
          ...ToneStyle.values.map((t) {
            final descriptions = {
              ToneStyle.direto: 'Direto ao ponto, sem rodeios.',
              ToneStyle.leve: 'Gentil, com leveza no jeito de falar.',
              ToneStyle.motivador: 'Encorajador, focado no seu progresso.',
            };
            return Padding(
              padding: const EdgeInsets.only(bottom: 12),
              child: _ToneOption(
                title: t.label,
                description: descriptions[t]!,
                selected: t == tone,
                onTap: () => onChanged(t),
              ),
            );
          }),
        ],
      ),
    );
  }
}

class _ToneOption extends StatelessWidget {
  final String title;
  final String description;
  final bool selected;
  final VoidCallback onTap;

  const _ToneOption({
    required this.title,
    required this.description,
    required this.selected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(16),
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: selected ? AppColors.blush : AppColors.surface,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: selected ? AppColors.roseDeep : AppColors.divider),
        ),
        child: Row(
          children: [
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(title, style: Theme.of(context).textTheme.titleMedium),
                  const SizedBox(height: 4),
                  Text(description, style: Theme.of(context).textTheme.bodyMedium),
                ],
              ),
            ),
            if (selected) const Icon(Icons.check_circle, color: AppColors.roseDeep),
          ],
        ),
      ),
    );
  }
}

class _PromisePage extends StatelessWidget {
  const _PromisePage();

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(28),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Text('Antes de começar', style: Theme.of(context).textTheme.headlineSmall),
          const SizedBox(height: 12),
          Text(
            'Não estamos aqui para te dizer o que fazer com seu dinheiro. '
            'Estamos aqui para te mostrar o que suas escolhas realmente significam, '
            'para que as próximas sejam mais suas.',
            style: Theme.of(context).textTheme.bodyLarge,
          ),
          const SizedBox(height: 16),
          Text(
            'Você pode ajustar categorias, metas e o tom das mensagens a qualquer momento '
            'nas configurações.',
            style: Theme.of(context).textTheme.bodyMedium,
          ),
        ],
      ),
    );
  }
}
