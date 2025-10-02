import 'package:flutter/material.dart';
import 'package:stayops/services/auth_service.dart';
import 'package:stayops/models/login_response.dart';

class TestGuestEndpoint extends StatefulWidget {
  const TestGuestEndpoint({Key? key}) : super(key: key);

  @override
  State<TestGuestEndpoint> createState() => _TestGuestEndpointState();
}

class _TestGuestEndpointState extends State<TestGuestEndpoint> {
  String _results = '';
  bool _isTesting = false;

  void _addResult(String result) {
    setState(() {
      _results += '$result\n';
    });
    print(result);
  }

  Future<void> _testSpecificGuest() async {
    setState(() {
      _isTesting = true;
      _results = '';
    });

    const specificGuestId = 'ff469f4e-5d9b-4c05-b2e3-74aeb85596c8';

    _addResult('🔍 Testing specific guest endpoint...');
    _addResult('Guest ID: $specificGuestId');
    _addResult(
        'URL: http://10.203.254.101:8080/api/v1/guests/$specificGuestId');
    _addResult('');

    try {
      _addResult('📡 Fetching guest data...');

      final guestData = await AuthService.fetchGuestData(specificGuestId);

      if (guestData != null) {
        _addResult('✅ SUCCESS! Guest data received:');
        _addResult('');

        // Parse as Guest object
        final guest = Guest.fromJson(guestData);

        _addResult('👤 Guest Details:');
        _addResult('• ID: ${guest.guestId}');
        _addResult('• Name: ${guest.fullName}');
        _addResult('• Email: ${guest.email}');
        _addResult('• Phone: ${guest.phone}');
        _addResult('• Nationality: ${guest.nationality}');
        _addResult('• Identity Type: ${guest.identityType}');
        _addResult('• Identity Number: ${guest.identityNumber}');

        if (guest.imageUrl != null) {
          _addResult('• Has Profile Image: ✅');
        }

        if (guest.qrCodeBase64 != null) {
          _addResult('• Has QR Code: ✅');
        }
      } else {
        _addResult('❌ FAILED: No guest data received');
        _addResult('This could mean:');
        _addResult('• Guest ID not found in database');
        _addResult('• Server is not responding');
        _addResult('• Network connectivity issues');
      }
    } catch (e) {
      _addResult('❌ ERROR: $e');

      if (e.toString().contains('Connection refused')) {
        _addResult('🔧 Server appears to be down or unreachable');
      } else if (e.toString().contains('TimeoutException')) {
        _addResult('⏱️ Request timed out - server may be slow');
      }
    }

    setState(() {
      _isTesting = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Test Guest Endpoint'),
        backgroundColor: const Color(0xFF2563FF),
        foregroundColor: Colors.white,
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Guest Endpoint Test',
                      style: Theme.of(context).textTheme.headlineSmall,
                    ),
                    const SizedBox(height: 8),
                    const Text('Server: http://10.203.254.101:8080'),
                    const Text(
                        'Guest ID: ff469f4e-5d9b-4c05-b2e3-74aeb85596c8'),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 16),
            ElevatedButton(
              onPressed: _isTesting ? null : _testSpecificGuest,
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF2563FF),
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(vertical: 16),
              ),
              child: _isTesting
                  ? const Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        SizedBox(
                          height: 20,
                          width: 20,
                          child: CircularProgressIndicator(
                            strokeWidth: 2,
                            valueColor:
                                AlwaysStoppedAnimation<Color>(Colors.white),
                          ),
                        ),
                        SizedBox(width: 12),
                        Text('Testing...'),
                      ],
                    )
                  : const Text(
                      'Test Guest Endpoint',
                      style: TextStyle(fontSize: 16),
                    ),
            ),
            const SizedBox(height: 16),
            Expanded(
              child: Card(
                child: Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Test Results',
                        style: Theme.of(context).textTheme.titleMedium,
                      ),
                      const SizedBox(height: 8),
                      Expanded(
                        child: SingleChildScrollView(
                          child: Text(
                            _results.isEmpty
                                ? 'Press the button above to test the guest endpoint'
                                : _results,
                            style: const TextStyle(
                              fontFamily: 'monospace',
                              fontSize: 12,
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
