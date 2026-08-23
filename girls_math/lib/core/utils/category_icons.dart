import 'package:flutter/material.dart';

IconData iconForCategory(String iconKey) {
  switch (iconKey) {
    case 'home':
      return Icons.home_outlined;
    case 'restaurant':
      return Icons.restaurant_outlined;
    case 'directions_car':
      return Icons.directions_car_outlined;
    case 'local_cafe':
      return Icons.local_cafe_outlined;
    case 'spa':
      return Icons.spa_outlined;
    case 'checkroom':
      return Icons.checkroom_outlined;
    case 'subscriptions':
      return Icons.subscriptions_outlined;
    case 'favorite':
      return Icons.favorite_outline;
    case 'school':
      return Icons.school_outlined;
    default:
      return Icons.more_horiz;
  }
}
