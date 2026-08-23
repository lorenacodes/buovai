class ExpenseCategory {
  final String id;
  final String label;
  final String icon;
  final bool isCustom;

  const ExpenseCategory({
    required this.id,
    required this.label,
    required this.icon,
    this.isCustom = false,
  });

  Map<String, Object?> toMap() => {
        'id': id,
        'label': label,
        'icon': icon,
        'is_custom': isCustom ? 1 : 0,
      };

  factory ExpenseCategory.fromMap(Map<String, Object?> map) => ExpenseCategory(
        id: map['id'] as String,
        label: map['label'] as String,
        icon: map['icon'] as String,
        isCustom: (map['is_custom'] as int) == 1,
      );

  static const defaults = <ExpenseCategory>[
    ExpenseCategory(id: 'moradia', label: 'Moradia', icon: 'home'),
    ExpenseCategory(id: 'alimentacao', label: 'Alimentação', icon: 'restaurant'),
    ExpenseCategory(id: 'transporte', label: 'Transporte', icon: 'directions_car'),
    ExpenseCategory(id: 'lazer', label: 'Lazer', icon: 'local_cafe'),
    ExpenseCategory(id: 'beleza', label: 'Beleza e cuidado', icon: 'spa'),
    ExpenseCategory(id: 'roupas', label: 'Roupas e acessórios', icon: 'checkroom'),
    ExpenseCategory(id: 'assinaturas', label: 'Assinaturas', icon: 'subscriptions'),
    ExpenseCategory(id: 'saude', label: 'Saúde', icon: 'favorite'),
    ExpenseCategory(id: 'educacao', label: 'Educação', icon: 'school'),
    ExpenseCategory(id: 'outros', label: 'Outros', icon: 'more_horiz'),
  ];
}
