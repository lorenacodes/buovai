import 'package:shared_preferences/shared_preferences.dart';

import '../models/user_profile.dart';

class ProfileRepository {
  static const _keyName = 'profile_name';
  static const _keyTone = 'profile_tone';
  static const _keyAlerts = 'profile_alerts';
  static const _keyWeekly = 'profile_weekly';
  static const _keyOnboarding = 'profile_onboarding_complete';

  Future<UserProfile> load() async {
    final prefs = await SharedPreferences.getInstance();
    final toneName = prefs.getString(_keyTone);
    return UserProfile(
      name: prefs.getString(_keyName) ?? '',
      tone: ToneStyle.values.firstWhere(
        (t) => t.name == toneName,
        orElse: () => ToneStyle.leve,
      ),
      alertsEnabled: prefs.getBool(_keyAlerts) ?? true,
      weeklySummaryEnabled: prefs.getBool(_keyWeekly) ?? true,
      onboardingComplete: prefs.getBool(_keyOnboarding) ?? false,
    );
  }

  Future<void> save(UserProfile profile) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_keyName, profile.name);
    await prefs.setString(_keyTone, profile.tone.name);
    await prefs.setBool(_keyAlerts, profile.alertsEnabled);
    await prefs.setBool(_keyWeekly, profile.weeklySummaryEnabled);
    await prefs.setBool(_keyOnboarding, profile.onboardingComplete);
  }
}
