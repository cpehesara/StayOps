import 'package:flutter/material.dart';
import '../services/api_service.dart';
import 'room_selection_screen.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({Key? key}) : super(key: key);

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final _apiService = ApiService();
  bool _isLoading = false;
  String _error = '';
  bool _showPassword = false;

  String getTimeBasedGreeting() {
    final hour = DateTime.now().hour;
    if (hour < 12) return 'Good Morning!';
    if (hour < 17) return 'Good Afternoon!';
    if (hour < 21) return 'Good Evening!';
    return 'Good Night!';
  }

  String getGreetingSubtitle() {
    final hour = DateTime.now().hour;
    if (hour < 12) return "Let's welcome our guests with a smile and ensure a smooth check-in experience.";
    if (hour < 17) return 'Keep up the excellent guest service and stay organized.';
    if (hour < 21) return "Let's make our guests' stay more comfortable and seamless.";
    return "Review today's reservations and prepare for a fresh start tomorrow.";
  }

  Future<void> _handleLogin() async {
    if (_emailController.text.isEmpty || _passwordController.text.isEmpty) {
      setState(() => _error = 'Please enter email and password');
      return;
    }

    setState(() {
      _isLoading = true;
      _error = '';
    });

    final success = await _apiService.login(
      _emailController.text,
      _passwordController.text,
    );

    setState(() => _isLoading = false);

    if (success && mounted) {
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(builder: (_) => const RoomSelectionScreen()),
      );
    } else {
      setState(() => _error = 'Invalid email or password. Please try again.');
    }
  }

  @override
  Widget build(BuildContext context) {
    final isWideScreen = MediaQuery.of(context).size.width > 968;

    return Scaffold(
      backgroundColor: const Color(0xFFfaf8f5),
      body: isWideScreen
          ? Row(
              children: [
                Expanded(flex: 1, child: _buildFormSection()),
                Expanded(flex: 2, child: _buildImageSection()),
              ],
            )
          : _buildFormSection(),
    );
  }

  Widget _buildFormSection() {
    return Center(
      child: SingleChildScrollView(
        padding: const EdgeInsets.all(32),
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 450),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _buildBranding(),
              const SizedBox(height: 32),
              _buildForm(),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildBranding() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          width: 48,
          height: 48,
          decoration: BoxDecoration(
            color: const Color(0xFF2c2c2e),
            borderRadius: BorderRadius.circular(8),
          ),
          child: Center(
            child: Container(
              width: 24,
              height: 24,
              decoration: BoxDecoration(
                border: Border.all(color: Colors.white, width: 3),
                borderRadius: BorderRadius.circular(4),
              ),
            ),
          ),
        ),
        const SizedBox(height: 24),
        Text(
          getTimeBasedGreeting(),
          style: const TextStyle(
            fontSize: 36,
            fontWeight: FontWeight.w300,
            color: Color(0xFF2c2c2e),
            letterSpacing: -0.5,
          ),
        ),
        const SizedBox(height: 4),
        Text(
          getGreetingSubtitle(),
          style: const TextStyle(
            fontSize: 14,
            color: Color(0xFF8b8680),
            height: 1.4,
          ),
        ),
        const SizedBox(height: 8),
        const Text(
          'Sign in to StayOps to continue.',
          style: TextStyle(
            fontSize: 11,
            color: Color(0xFF8b8680),
            letterSpacing: 0.5,
          ),
        ),
        const SizedBox(height: 16),
        Container(
          height: 1,
          color: const Color(0xFFe8e3dc),
        ),
      ],
    );
  }

  Widget _buildForm() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _buildTextField(
          label: 'Email address',
          controller: _emailController,
          keyboardType: TextInputType.emailAddress,
          obscureText: false,
        ),
        const SizedBox(height: 24),
        _buildTextField(
          label: 'Password',
          controller: _passwordController,
          keyboardType: TextInputType.text,
          obscureText: !_showPassword,
          isPassword: true,
        ),
        const SizedBox(height: 16),
        Align(
          alignment: Alignment.centerRight,
          child: TextButton(
            onPressed: () {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(
                  content: Text('Please contact the system administrator for password reset.'),
                ),
              );
            },
            style: TextButton.styleFrom(
              foregroundColor: const Color(0xFFb8956a),
              padding: EdgeInsets.zero,
            ),
            child: const Text(
              'Forgot password',
              style: TextStyle(fontSize: 11, letterSpacing: 0.5),
            ),
          ),
        ),
        if (_error.isNotEmpty) ...[
          const SizedBox(height: 16),
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: const Color(0xFFfaf5f2),
              border: Border.all(color: const Color(0xFFe8dcd5)),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Row(
              children: [
                const Icon(Icons.error_outline, color: Color(0xFFc17767), size: 20),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    _error,
                    style: const TextStyle(
                      fontSize: 13,
                      color: Color(0xFFc17767),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
        const SizedBox(height: 24),
        SizedBox(
          width: double.infinity,
          height: 48,
          child: ElevatedButton(
            onPressed: _isLoading ? null : _handleLogin,
            style: ElevatedButton.styleFrom(
              backgroundColor: _isLoading ? const Color(0xFFc4bbb0) : const Color(0xFF2c2c2e),
              foregroundColor: Colors.white,
              disabledBackgroundColor: const Color(0xFFc4bbb0),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
              elevation: 0,
            ),
            child: _isLoading
                ? const SizedBox(
                    height: 20,
                    width: 20,
                    child: CircularProgressIndicator(
                      strokeWidth: 2,
                      valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                    ),
                  )
                : const Text('Sign in', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w500)),
          ),
        ),
      ],
    );
  }

  Widget _buildTextField({
    required String label,
    required TextEditingController controller,
    required TextInputType keyboardType,
    required bool obscureText,
    bool isPassword = false,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: const TextStyle(
            fontSize: 11,
            fontWeight: FontWeight.w500,
            color: Color(0xFF8b8680),
            letterSpacing: 0.5,
          ),
        ),
        const SizedBox(height: 8),
        TextField(
          controller: controller,
          keyboardType: keyboardType,
          obscureText: obscureText,
          onChanged: (_) {
            if (_error.isNotEmpty) setState(() => _error = '');
          },
          decoration: InputDecoration(
            hintText: 'Enter your ${label.toLowerCase()}',
            hintStyle: const TextStyle(color: Color(0xFFc4bbb0)),
            filled: true,
            fillColor: Colors.white,
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(8),
              borderSide: BorderSide(
                color: _error.isNotEmpty ? const Color(0xFFc17767) : const Color(0xFFe8e3dc),
              ),
            ),
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(8),
              borderSide: BorderSide(
                color: _error.isNotEmpty ? const Color(0xFFc17767) : const Color(0xFFe8e3dc),
              ),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(8),
              borderSide: BorderSide(
                color: _error.isNotEmpty ? const Color(0xFFc17767) : const Color(0xFFb8956a),
                width: 1,
              ),
            ),
            contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            suffixIcon: isPassword
                ? IconButton(
                    icon: Icon(
                      _showPassword ? Icons.visibility : Icons.visibility_off,
                      color: const Color(0xFF8b8680),
                      size: 20,
                    ),
                    onPressed: () => setState(() => _showPassword = !_showPassword),
                  )
                : null,
          ),
          style: const TextStyle(fontSize: 13, color: Color(0xFF2c2c2e)),
        ),
      ],
    );
  }

  Widget _buildImageSection() {
    return Container(
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [Color(0xFF3d1f1f), Color(0xFF2c2c2e)],
        ),
      ),
      child: Stack(
        children: [
          _buildDecorativeCircles(),
          Center(
            child: Padding(
              padding: const EdgeInsets.all(30),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Container(
                    constraints: const BoxConstraints(maxWidth: 620),
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(color: const Color(0xFFb8956a).withOpacity(0.2), width: 3),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withOpacity(0.3),
                          blurRadius: 100,
                          spreadRadius: 10,
                        ),
                      ],
                    ),
                    child: ClipRRect(
                      borderRadius: BorderRadius.circular(17),
                      child: Image.network(
                        'https://res.cloudinary.com/di4v3fcqi/image/upload/v1759864036/-99170515271_92032625635_1730704593_n_s60h4d.jpg',
                        fit: BoxFit.cover,
                        errorBuilder: (_, __, ___) => Container(
                          color: Colors.grey[800],
                          height: 400,
                          child: const Icon(Icons.image, size: 48, color: Colors.white),
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(height: 24),
                  const Text(
                    'StayOps',
                    style: TextStyle(
                      fontSize: 48,
                      fontWeight: FontWeight.w400,
                      color: Colors.white,
                      letterSpacing: -0.5,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    'Streamline your hotel operations with intelligence and precision.',
                    style: TextStyle(
                      fontSize: 14,
                      color: Colors.white.withOpacity(0.9),
                      letterSpacing: 0.5,
                    ),
                  ),
                ],
              ),
            ),
          ),
          _buildContactStripe(),
        ],
      ),
    );
  }

  Widget _buildDecorativeCircles() {
    return Stack(
      children: [
        Positioned(
          top: 60,
          left: 60,
          child: Container(
            width: 250,
            height: 250,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              border: Border.all(color: const Color(0xFFb8956a).withOpacity(0.15), width: 2),
            ),
          ),
        ),
        Positioned(
          bottom: 80,
          right: 80,
          child: Container(
            width: 180,
            height: 180,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              border: Border.all(color: const Color(0xFFb8956a).withOpacity(0.15), width: 2),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildContactStripe() {
    return Positioned(
      top: 0,
      right: 20,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
        decoration: BoxDecoration(
          color: const Color(0xFFb8956a).withOpacity(0.9),
          borderRadius: const BorderRadius.only(
            bottomLeft: Radius.circular(12),
            bottomRight: Radius.circular(12),
          ),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.15),
              blurRadius: 20,
              spreadRadius: 4,
            ),
          ],
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(Icons.email, size: 14, color: Colors.white),
            const SizedBox(width: 6),
            const Text(
              'Support',
              style: TextStyle(fontSize: 11, fontWeight: FontWeight.w500, color: Colors.white),
            ),
            Container(
              width: 1,
              height: 14,
              margin: const EdgeInsets.symmetric(horizontal: 10),
              color: Colors.white.withOpacity(0.3),
            ),
            const Icon(Icons.phone, size: 14, color: Colors.white),
            const SizedBox(width: 6),
            const Text(
              '+94 91 225 0122',
              style: TextStyle(fontSize: 11, fontWeight: FontWeight.w500, color: Colors.white),
            ),
          ],
        ),
      ),
    );
  }

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }
}