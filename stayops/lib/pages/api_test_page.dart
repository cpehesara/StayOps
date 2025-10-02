import 'package:flutter/material.dart';
import 'package:stayops/services/auth_service.dart';
import 'package:stayops/config/api_config.dart';

class ApiTestPage extends StatefulWidget {
  const ApiTestPage({Key? key}) : super(key: key);

  @override
  State<ApiTestPage> createState() => _ApiTestPageState();
}

class _ApiTestPageState extends State<ApiTestPage> {
  final TextEditingController _emailController = TextEditingController();
  final TextEditingController _passwordController = TextEditingController();
  String _testResults = '';
  bool _isTesting = false;

  @override
  void initState() {
    super.initState();
    // Pre-fill with test credentials
    _emailController.text = 'chanmunekp@gmail.com';
    _passwordController.text = 'Test@1234';
  }

  void _addResult(String message) {
    setState(() {
      _testResults +=
          '${DateTime.now().toString().substring(11, 19)}: $message\n';
    });
  }

  Future<void> _testConnection() async {
    setState(() {
      _isTesting = true;
      _testResults = '';
    });

    _addResult('Starting API connection test...');
    _addResult('API Base URL: ${ApiConfig.baseUrl}');
    _addResult(
        'Login Endpoint: ${ApiConfig.baseUrl}${ApiConfig.loginEndpoint}');

    try {
      _addResult('Testing connection...');
      final connectionOk = await AuthService.testConnection();

      if (connectionOk) {
        _addResult('✅ Connection successful!');
      } else {
        _addResult('❌ Connection failed - Server not reachable');
      }
    } catch (e) {
      _addResult('❌ Connection error: $e');
    }

    setState(() {
      _isTesting = false;
    });
  }

  Future<void> _testLogin() async {
    setState(() {
      _isTesting = true;
      _testResults = '';
    });

    final email = _emailController.text.trim();
    final password = _passwordController.text;

    _addResult('Starting login test...');
    _addResult('Email: $email');
    _addResult('API URL: ${ApiConfig.baseUrl}${ApiConfig.loginEndpoint}');

    try {
      _addResult('Attempting login...');
      final loginData = await AuthService.login(email, password);

      if (loginData != null) {
        _addResult('✅ Login successful!');
        _addResult(
            'Token: ${loginData['token']?.toString().substring(0, 20)}...');
        _addResult('Guest Name: ${loginData['guest']?['fullName']}');
        _addResult('Guest ID: ${loginData['guest']?['guestId']}');
      } else {
        _addResult('❌ Login failed - Invalid credentials or server error');
      }
    } catch (e) {
      _addResult('❌ Login error: $e');
    }

    setState(() {
      _isTesting = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('API Test & Debug'),
        backgroundColor: const Color(0xFF2563FF),
        foregroundColor: Colors.white,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => Navigator.pop(context),
        ),
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
                      'API Configuration',
                      style: Theme.of(context).textTheme.headlineSmall,
                    ),
                    const SizedBox(height: 8),
                    Text('Base URL: ${ApiConfig.baseUrl}'),
                    Text('Login Endpoint: ${ApiConfig.loginEndpoint}'),
                    Text(
                        'Connection Timeout: ${ApiConfig.connectionTimeout.inSeconds}s'),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 16),
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  children: [
                    TextField(
                      controller: _emailController,
                      decoration: const InputDecoration(
                        labelText: 'Email',
                        border: OutlineInputBorder(),
                      ),
                    ),
                    const SizedBox(height: 8),
                    TextField(
                      controller: _passwordController,
                      decoration: const InputDecoration(
                        labelText: 'Password',
                        border: OutlineInputBorder(),
                      ),
                      obscureText: true,
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 16),
            Row(
              children: [
                Expanded(
                  child: ElevatedButton(
                    onPressed: _isTesting ? null : _testConnection,
                    child: _isTesting
                        ? const SizedBox(
                            width: 20,
                            height: 20,
                            child: CircularProgressIndicator(strokeWidth: 2),
                          )
                        : const Text('Test Connection'),
                  ),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: ElevatedButton(
                    onPressed: _isTesting ? null : _testLogin,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF2563FF),
                      foregroundColor: Colors.white,
                    ),
                    child: _isTesting
                        ? const SizedBox(
                            width: 20,
                            height: 20,
                            child: CircularProgressIndicator(
                              strokeWidth: 2,
                              valueColor:
                                  AlwaysStoppedAnimation<Color>(Colors.white),
                            ),
                          )
                        : const Text('Test Login'),
                  ),
                ),
              ],
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
                        'Test Results:',
                        style: Theme.of(context).textTheme.titleMedium,
                      ),
                      const SizedBox(height: 8),
                      Expanded(
                        child: Container(
                          width: double.infinity,
                          padding: const EdgeInsets.all(8),
                          decoration: BoxDecoration(
                            color: Colors.grey[100],
                            borderRadius: BorderRadius.circular(4),
                          ),
                          child: SingleChildScrollView(
                            child: Text(
                              _testResults.isEmpty
                                  ? 'No test results yet. Click a button above to start testing.'
                                  : _testResults,
                              style: const TextStyle(
                                fontFamily: 'monospace',
                                fontSize: 12,
                              ),
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
