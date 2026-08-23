import 'package:intl/intl.dart';

final _currencyFormatter = NumberFormat.currency(locale: 'pt_BR', symbol: 'R\$');

String formatCurrency(double value) => _currencyFormatter.format(value);
