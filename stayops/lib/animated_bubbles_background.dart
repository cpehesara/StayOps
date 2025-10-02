import 'package:flutter/material.dart';
import 'dart:math';

/// Animated background with floating bubbles for a playful effect.
class AnimatedBubblesBackground extends StatefulWidget {
  const AnimatedBubblesBackground({super.key});

  @override
  State<AnimatedBubblesBackground> createState() =>
      _AnimatedBubblesBackgroundState();
}

class _AnimatedBubblesBackgroundState extends State<AnimatedBubblesBackground>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  final List<_Bubble> _bubbles = [];
  final int _bubbleCount = 24;
  final Random _random = Random();

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 16),
    )..repeat();
    _initBubbles();
  }

  void _initBubbles() {
    _bubbles.clear();
    for (int i = 0; i < _bubbleCount; i++) {
      _bubbles.add(_Bubble(
        x: _random.nextDouble(),
        y: _random.nextDouble(),
        radius: 16.0 + _random.nextDouble() * 24.0,
        speed: 0.1 + _random.nextDouble() * 0.3,
        color: Color.lerp(
          const Color(0xFF2563FF).withOpacity(0.18),
          const Color(0xFF00C6FB).withOpacity(0.18),
          _random.nextDouble(),
        )!,
      ));
    }
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _controller,
      builder: (context, child) {
        return CustomPaint(
          painter: _BubblesPainter(_bubbles, _controller.value),
          child: Container(),
        );
      },
    );
  }
}

class _Bubble {
  double x;
  double y;
  double radius;
  double speed;
  Color color;
  _Bubble({
    required this.x,
    required this.y,
    required this.radius,
    required this.speed,
    required this.color,
  });
}

class _BubblesPainter extends CustomPainter {
  final List<_Bubble> bubbles;
  final double progress;
  _BubblesPainter(this.bubbles, this.progress);

  @override
  void paint(Canvas canvas, Size size) {
    for (final bubble in bubbles) {
      final double dy = (bubble.y * size.height -
              (progress * bubble.speed * size.height * 2)) %
          size.height;
      final double dx =
          bubble.x * size.width + sin(progress * 2 * pi + bubble.x * 10) * 12;
      final Paint paint = Paint()..color = bubble.color;
      canvas.drawCircle(Offset(dx, dy), bubble.radius, paint);
    }
  }

  @override
  bool shouldRepaint(covariant _BubblesPainter oldDelegate) => true;
}
