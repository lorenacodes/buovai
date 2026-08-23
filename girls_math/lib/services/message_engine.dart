import 'dart:math';

import '../data/models/user_profile.dart';

/// Gera frases variadas e adequadas ao tom escolhido pela usuária.
///
/// Nunca usamos uma única mensagem fixa por situação: cada chamada sorteia
/// entre variações para que o app não soe repetitivo nem robótico. O sorteio
/// é determinístico por [seed] (normalmente derivado da data e do contexto)
/// para que a mesma situação, no mesmo dia, não mude de frase a cada rebuild.
class MessageEngine {
  final Random _random;

  MessageEngine({int? seed}) : _random = Random(seed);

  String pick(List<String> options) => options[_random.nextInt(options.length)];

  /// Mensagem quando um gasto compete com uma meta específica.
  String expenseAgainstGoal({
    required ToneStyle tone,
    required String goalTitle,
    required double percentOfGoal,
  }) {
    final pct = (percentOfGoal * 100).round();
    switch (tone) {
      case ToneStyle.direto:
        return pick([
          'Esse gasto representa $pct% do que falta para "$goalTitle". Vale a pena nesse momento?',
          'Isso tira $pct% do caminho até "$goalTitle". Decisão sua, só deixando visível.',
          '$pct% de "$goalTitle" foi para essa compra. Anotado.',
        ]);
      case ToneStyle.leve:
        return pick([
          'Esse gasto parece pequeno agora, mas ele compete com "$goalTitle", algo que você disse que importa.',
          'Nada de errado em se presentear. Só um lembrete gentil: isso equivale a $pct% de "$goalTitle".',
          'Você está mais perto de "$goalTitle" do que imagina, e esse gasto adia um pouco esse caminho.',
        ]);
      case ToneStyle.motivador:
        return pick([
          'Cada escolha te aproxima ou afasta de "$goalTitle". Essa aqui custou $pct% do caminho, mas você ainda está no controle.',
          'Você já percorreu um trecho bonito até "$goalTitle". Esse gasto é pequeno perto do que você já construiu.',
          'Sua meta "$goalTitle" está viva porque você presta atenção nisso. Continue assim.',
        ]);
    }
  }

  /// Mensagem quando não há meta vinculada, apenas reflexão sobre o gasto.
  String neutralExpenseReflection({required ToneStyle tone, required String categoryLabel}) {
    switch (tone) {
      case ToneStyle.direto:
        return pick([
          'Gasto registrado em $categoryLabel. Sem julgamento, só dados.',
          'Mais um lançamento em $categoryLabel. Seu padrão está ficando mais claro.',
        ]);
      case ToneStyle.leve:
        return pick([
          'Anotado. $categoryLabel faz parte da sua rotina, e está tudo bem.',
          'Registrei esse gasto em $categoryLabel. Cada anotação te deixa mais próxima de entender seus padrões.',
        ]);
      case ToneStyle.motivador:
        return pick([
          'Ótimo, mais um registro. Entender para onde o dinheiro vai é o primeiro passo para decidir para onde ele deveria ir.',
          'Isso é consciência financeira acontecendo, mesmo em um gasto pequeno como esse.',
        ]);
    }
  }

  /// Alerta quando uma categoria está acima do padrão histórico da usuária.
  String categoryAboveAverage({
    required ToneStyle tone,
    required String categoryLabel,
    required int percentAboveAverage,
  }) {
    switch (tone) {
      case ToneStyle.direto:
        return pick([
          '$categoryLabel está $percentAboveAverage% acima do seu padrão neste mês.',
          'Seus gastos em $categoryLabel subiram $percentAboveAverage% comparado à sua média.',
        ]);
      case ToneStyle.leve:
        return pick([
          'Notei que $categoryLabel está um pouco mais presente esse mês, $percentAboveAverage% acima do seu costume. Só para você saber.',
          '$categoryLabel cresceu $percentAboveAverage% em relação ao que é comum para você. Talvez valha uma olhada.',
        ]);
      case ToneStyle.motivador:
        return pick([
          'Você está gastando mais em $categoryLabel esse mês ($percentAboveAverage% acima do normal). Perceber isso já é metade do caminho para ajustar.',
        ]);
    }
  }

  /// Reconhecimento de progresso em direção a uma meta.
  String goalProgressCelebration({required ToneStyle tone, required String goalTitle, required int percent}) {
    switch (tone) {
      case ToneStyle.direto:
        return pick([
          '$goalTitle está em $percent%. Progresso real.',
          'Faltam ${100 - percent}% para "$goalTitle".',
        ]);
      case ToneStyle.leve:
        return pick([
          'Você já chegou a $percent% de "$goalTitle". Devagar e com intenção.',
          '$percent% do caminho até "$goalTitle" já é seu.',
        ]);
      case ToneStyle.motivador:
        return pick([
          '$percent% de "$goalTitle" conquistado por você, uma decisão de cada vez.',
          'Isso não é sorte, é consistência: $percent% de "$goalTitle" já é realidade.',
        ]);
    }
  }

  /// Saudação inicial da tela principal, sensível ao horário do dia.
  String greeting({required ToneStyle tone, required String name, required DateTime now}) {
    final period = now.hour < 12
        ? 'Bom dia'
        : now.hour < 18
            ? 'Boa tarde'
            : 'Boa noite';
    final displayName = name.trim().isEmpty ? '' : ', $name';

    switch (tone) {
      case ToneStyle.direto:
        return '$period$displayName. Aqui está o seu panorama.';
      case ToneStyle.leve:
        return '$period$displayName. Vamos ver como está sua semana?';
      case ToneStyle.motivador:
        return '$period$displayName. Mais um dia para construir a vida financeira que você quer.';
    }
  }
}
