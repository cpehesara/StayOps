// This is a basic Flutter widget test.
//
// To perform an interaction with a widget in your test, use the WidgetTester
// utility in the flutter_test package. For example, you can send tap and scroll
// gestures. You can also use WidgetTester to find child widgets in the widget
// tree, read text, and verify that the values of widget properties are correct.

import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'package:stayops_tablet/main.dart';

void main() {
  testWidgets('shows login screen when not logged in', (WidgetTester tester) async {
    // Ensure SharedPreferences uses in-memory storage for tests with no token.
    SharedPreferences.setMockInitialValues({});

    // Build the app and settle animations/async.
    await tester.pumpWidget(const StayOpsApp());
    await tester.pumpAndSettle();

    // Expect to see the login button text.
    expect(find.text('Sign in'), findsOneWidget);
  });
}
