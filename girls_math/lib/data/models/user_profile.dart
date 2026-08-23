enum ToneStyle { direto, leve, motivador }

extension ToneStyleLabel on ToneStyle {
  String get label {
    switch (this) {
      case ToneStyle.direto:
        return 'Direto';
      case ToneStyle.leve:
        return 'Leve';
      case ToneStyle.motivador:
        return 'Motivador';
    }
  }
}

class UserProfile {
  final String name;
  final ToneStyle tone;
  final bool alertsEnabled;
  final bool weeklySummaryEnabled;
  final bool onboardingComplete;

  const UserProfile({
    this.name = '',
    this.tone = ToneStyle.leve,
    this.alertsEnabled = true,
    this.weeklySummaryEnabled = true,
    this.onboardingComplete = false,
  });

  UserProfile copyWith({
    String? name,
    ToneStyle? tone,
    bool? alertsEnabled,
    bool? weeklySummaryEnabled,
    bool? onboardingComplete,
  }) {
    return UserProfile(
      name: name ?? this.name,
      tone: tone ?? this.tone,
      alertsEnabled: alertsEnabled ?? this.alertsEnabled,
      weeklySummaryEnabled: weeklySummaryEnabled ?? this.weeklySummaryEnabled,
      onboardingComplete: onboardingComplete ?? this.onboardingComplete,
    );
  }
}
