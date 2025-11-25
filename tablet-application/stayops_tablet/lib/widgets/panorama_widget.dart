import 'package:flutter/material.dart';
import 'package:panorama/panorama.dart';
import 'package:cached_network_image/cached_network_image.dart';

class PanoramaWidget extends StatefulWidget {
  final String imageUrl;

  const PanoramaWidget({Key? key, required this.imageUrl}) : super(key: key);

  @override
  State<PanoramaWidget> createState() => _PanoramaWidgetState();
}

class _PanoramaWidgetState extends State<PanoramaWidget> {
  bool _isLoading = true;
  bool _hasError = false;

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 400,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFFd4af37), width: 2),
        boxShadow: [
          BoxShadow(
            color: const Color(0xFFd4af37).withValues(alpha: 0.15),
            blurRadius: 20,
            spreadRadius: 2,
          ),
        ],
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(10),
        child: Stack(
          fit: StackFit.expand,
          children: [
            if (!_hasError)
              Panorama(
                sensitivity: 1.5,
                animSpeed: 1.0,
                onViewChanged: (longitude, latitude, tilt) {
                  // No-op; loading state is handled by Image.frameBuilder below.
                },
                child: Image(
                  image: CachedNetworkImageProvider(widget.imageUrl),
                  fit: BoxFit.cover,
                  // When the first frame arrives, consider loading complete.
                  frameBuilder: (context, child, frame, wasSynchronouslyLoaded) {
                    if (frame != null && _isLoading) {
                      WidgetsBinding.instance.addPostFrameCallback((_) {
                        if (mounted) setState(() => _isLoading = false);
                      });
                    }
                    return child;
                  },
                  errorBuilder: (context, error, stackTrace) {
                    WidgetsBinding.instance.addPostFrameCallback((_) {
                      if (mounted && !_hasError) {
                        setState(() {
                          _hasError = true;
                          _isLoading = false;
                        });
                      }
                    });
                    return const SizedBox.shrink();
                  },
                ),
              ),
            if (_isLoading)
              Container(
                decoration: const BoxDecoration(
                  gradient: LinearGradient(
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                    colors: [
                      Color(0xFF1a1a1c),
                      Color(0xFF2c2c2e),
                    ],
                  ),
                ),
                child: Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Container(
                        padding: const EdgeInsets.all(20),
                        decoration: BoxDecoration(
                          color: Colors.white.withValues(alpha: 0.1),
                          shape: BoxShape.circle,
                        ),
                        child: const CircularProgressIndicator(
                          color: Color(0xFFd4af37),
                          strokeWidth: 3,
                        ),
                      ),
                      const SizedBox(height: 24),
                      const Text(
                        'Loading 360° Experience',
                        style: TextStyle(
                          color: Color(0xFFd4af37),
                          fontSize: 16,
                          fontWeight: FontWeight.w500,
                          letterSpacing: 0.5,
                        ),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        'Please wait...',
                        style: TextStyle(
                          color: Colors.white.withValues(alpha: 0.7),
                          fontSize: 13,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            if (_hasError)
              Container(
                decoration: const BoxDecoration(
                  gradient: LinearGradient(
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                    colors: [
                      Color(0xFF1a1a1c),
                      Color(0xFF2c2c2e),
                    ],
                  ),
                ),
                child: Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Container(
                        padding: const EdgeInsets.all(20),
                        decoration: BoxDecoration(
                          color: Colors.white.withValues(alpha: 0.1),
                          shape: BoxShape.circle,
                        ),
                        child: const Icon(
                          Icons.panorama_outlined,
                          size: 48,
                          color: Color(0xFFd4af37),
                        ),
                      ),
                      const SizedBox(height: 20),
                      const Text(
                        '360° View Unavailable',
                        style: TextStyle(
                          color: Color(0xFFd4af37),
                          fontSize: 16,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        'Please check your connection',
                        style: TextStyle(
                          color: Colors.white.withValues(alpha: 0.6),
                          fontSize: 13,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            if (!_isLoading && !_hasError)
              Positioned(
                bottom: 20,
                left: 0,
                right: 0,
                child: Center(
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        colors: [
                          const Color(0xFF1a1a1c).withValues(alpha: 0.9),
                          const Color(0xFF2c2c2e).withValues(alpha: 0.9),
                        ],
                      ),
                      borderRadius: BorderRadius.circular(30),
                      border: Border.all(
                        color: const Color(0xFFd4af37).withValues(alpha: 0.5),
                        width: 1.5,
                      ),
                      boxShadow: [
                        BoxShadow(
                          color: const Color(0xFFd4af37).withValues(alpha: 0.3),
                          blurRadius: 12,
                          spreadRadius: 1,
                        ),
                      ],
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Icon(
                          Icons.touch_app,
                          size: 20,
                          color: Color(0xFFd4af37),
                        ),
                        const SizedBox(width: 10),
                        Text(
                          'Drag to explore 360° view',
                          style: TextStyle(
                            color: Colors.white.withValues(alpha: 0.95),
                            fontSize: 14,
                            fontWeight: FontWeight.w500,
                            letterSpacing: 0.3,
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