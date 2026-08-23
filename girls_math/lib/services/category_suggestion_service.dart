/// Sugere uma categoria a partir do texto digitado pela usuária,
/// reduzindo a necessidade de seleção manual em cada lançamento.
class CategorySuggestionService {
  static const Map<String, List<String>> _keywords = {
    'moradia': ['aluguel', 'condominio', 'condomínio', 'luz', 'agua', 'água', 'internet', 'gas', 'gás'],
    'alimentacao': ['mercado', 'ifood', 'restaurante', 'lanche', 'padaria', 'almoco', 'almoço', 'jantar', 'cafe', 'café'],
    'transporte': ['uber', '99', 'gasolina', 'combustivel', 'combustível', 'onibus', 'ônibus', 'metro', 'metrô', 'estacionamento'],
    'lazer': ['cinema', 'show', 'bar', 'viagem', 'balada', 'festa', 'streaming'],
    'beleza': ['salao', 'salão', 'unha', 'cabelo', 'skincare', 'maquiagem', 'estetica', 'estética'],
    'roupas': ['roupa', 'sapato', 'bolsa', 'loja', 'shein', 'zara', 'renner'],
    'assinaturas': ['netflix', 'spotify', 'amazon prime', 'academia', 'assinatura'],
    'saude': ['farmacia', 'farmácia', 'remedio', 'remédio', 'consulta', 'plano de saude', 'plano de saúde'],
    'educacao': ['curso', 'faculdade', 'livro', 'mensalidade'],
  };

  String suggest(String rawText) {
    final text = rawText.toLowerCase();
    for (final entry in _keywords.entries) {
      for (final keyword in entry.value) {
        if (text.contains(keyword)) {
          return entry.key;
        }
      }
    }
    return 'outros';
  }
}
