import 'package:flutter/foundation.dart';
import 'package:uuid/uuid.dart';

import '../data/models/category.dart';
import '../data/models/expense.dart';
import '../data/models/goal.dart';
import '../data/models/user_profile.dart';
import '../data/repositories/category_repository.dart';
import '../data/repositories/expense_repository.dart';
import '../data/repositories/goal_repository.dart';
import '../data/repositories/profile_repository.dart';
import '../services/category_suggestion_service.dart';
import '../services/insight_engine.dart';
import '../services/message_engine.dart';

/// Estado central do app: mantém dados carregados do banco local em memória
/// e expõe operações de alto nível para as telas, mantendo a lógica de
/// interpretação (insights, linguagem adaptativa) fora da camada de UI.
class AppState extends ChangeNotifier {
  final ExpenseRepository _expenseRepo = ExpenseRepository();
  final GoalRepository _goalRepo = GoalRepository();
  final CategoryRepository _categoryRepo = CategoryRepository();
  final ProfileRepository _profileRepo = ProfileRepository();
  final CategorySuggestionService _suggestionService = CategorySuggestionService();
  late final MessageEngine _messageEngine = MessageEngine(seed: DateTime.now().day);
  late final InsightEngine _insightEngine = InsightEngine(_messageEngine);
  static const _uuid = Uuid();

  UserProfile profile = const UserProfile();
  List<Expense> expenses = [];
  List<Goal> goals = [];
  List<ExpenseCategory> categories = [];
  bool isLoading = true;

  MessageEngine get messages => _messageEngine;
  InsightEngine get insights => _insightEngine;
  CategorySuggestionService get categorySuggestions => _suggestionService;

  Map<String, String> get categoryLabels => {
        for (final c in categories) c.id: c.label,
      };

  Future<void> load() async {
    isLoading = true;
    notifyListeners();

    profile = await _profileRepo.load();
    categories = await _categoryRepo.all();
    expenses = await _expenseRepo.all();
    goals = await _goalRepo.all();

    isLoading = false;
    notifyListeners();
  }

  Future<void> saveProfile(UserProfile updated) async {
    profile = updated;
    await _profileRepo.save(profile);
    notifyListeners();
  }

  Future<String> addExpense({
    required double amount,
    required String note,
    String? categoryId,
    String? linkedGoalId,
  }) async {
    final resolvedCategory = categoryId ?? _suggestionService.suggest(note);
    final expense = Expense(
      id: _uuid.v4(),
      categoryId: resolvedCategory,
      amount: amount,
      note: note,
      date: DateTime.now(),
      linkedGoalId: linkedGoalId,
    );
    await _expenseRepo.add(expense);
    expenses = [expense, ...expenses];

    if (linkedGoalId != null) {
      final goalIndex = goals.indexWhere((g) => g.id == linkedGoalId);
      if (goalIndex != -1) {
        final updatedGoal = goals[goalIndex].copyWith(
          savedAmount: goals[goalIndex].savedAmount + amount,
        );
        await _goalRepo.update(updatedGoal);
        goals[goalIndex] = updatedGoal;
      }
    }

    notifyListeners();

    final categoryLabel = categoryLabels[resolvedCategory] ?? resolvedCategory;
    return _insightEngine.messageForNewExpense(
      expense: expense,
      categoryLabel: categoryLabel,
      activeGoals: goals.where((g) => !g.isComplete).toList(),
      profile: profile,
    );
  }

  Future<void> deleteExpense(String id) async {
    await _expenseRepo.delete(id);
    expenses = expenses.where((e) => e.id != id).toList();
    notifyListeners();
  }

  Future<void> addGoal({
    required String title,
    required double targetAmount,
    required GoalHorizon horizon,
    DateTime? targetDate,
  }) async {
    final goal = Goal(
      id: _uuid.v4(),
      title: title,
      targetAmount: targetAmount,
      horizon: horizon,
      targetDate: targetDate,
      createdAt: DateTime.now(),
    );
    await _goalRepo.add(goal);
    goals = [...goals, goal];
    notifyListeners();
  }

  Future<void> contributeToGoal(String goalId, double amount) async {
    final index = goals.indexWhere((g) => g.id == goalId);
    if (index == -1) return;
    final updated = goals[index].copyWith(savedAmount: goals[index].savedAmount + amount);
    await _goalRepo.update(updated);
    goals[index] = updated;
    notifyListeners();
  }

  Future<void> deleteGoal(String id) async {
    await _goalRepo.delete(id);
    goals = goals.where((g) => g.id != id).toList();
    notifyListeners();
  }

  Future<void> addCustomCategory(String label, String icon) async {
    final category = ExpenseCategory(
      id: _uuid.v4(),
      label: label,
      icon: icon,
      isCustom: true,
    );
    await _categoryRepo.add(category);
    categories = [...categories, category];
    notifyListeners();
  }

  double get totalSpentThisMonth {
    final now = DateTime.now();
    return expenses
        .where((e) => e.date.year == now.year && e.date.month == now.month)
        .fold(0.0, (sum, e) => sum + e.amount);
  }

  double totalSpentForCategory(String categoryId) {
    final now = DateTime.now();
    return expenses
        .where((e) => e.categoryId == categoryId && e.date.year == now.year && e.date.month == now.month)
        .fold(0.0, (sum, e) => sum + e.amount);
  }
}
