import 'package:flutter/material.dart';
import 'package:panorama/panorama.dart';
import '../models/room.dart';

class RoomDetailsEnhanced extends StatefulWidget {
  final Room room;
  final int currentImageIndex;
  final Function(int) onImageIndexChanged;
  final VoidCallback onConfirm;

  const RoomDetailsEnhanced({
    Key? key,
    required this.room,
    required this.currentImageIndex,
    required this.onImageIndexChanged,
    required this.onConfirm,
  }) : super(key: key);

  @override
  State<RoomDetailsEnhanced> createState() => _RoomDetailsEnhancedState();
}

class _RoomDetailsEnhancedState extends State<RoomDetailsEnhanced> {
  final PageController _pageController = PageController();
  bool _show360 = false;
  bool _imageLoading = true;
  bool _panoramaLoading = true;
  bool _imageError = false;
  bool _panoramaError = false;
  int _imageRefreshKey = 0;
  int _panoramaRefreshKey = 0;

  @override
  void initState() {
    super.initState();
    _pageController.addListener(() {
      final page = _pageController.page?.round() ?? 0;
      if (page != widget.currentImageIndex) {
        widget.onImageIndexChanged(page);
        setState(() {
          _imageLoading = true;
          _imageError = false;
        });
      }
    });
  }

  @override
  void dispose() {
    _pageController.dispose();
    super.dispose();
  }

  void _refreshCurrentView() {
    setState(() {
      if (_show360) {
        _panoramaRefreshKey++;
        _panoramaLoading = true;
        _panoramaError = false;
      } else {
        _imageRefreshKey++;
        _imageLoading = true;
        _imageError = false;
      }
    });
  }

  void _showFullscreenGallery() {
    Navigator.of(context).push(
      MaterialPageRoute(
        builder: (context) => _FullscreenGallery(
          images: widget.room.galleryImages,
          initialIndex: widget.currentImageIndex,
          roomNumber: widget.room.roomNumber,
        ),
        fullscreenDialog: true,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final images = widget.room.galleryImages;
    final hasImages = images.isNotEmpty;
    final has360 = widget.room.panoramaUrl != null && widget.room.panoramaUrl!.isNotEmpty;

    return Container(
      color: Colors.white,
      child: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // View Toggle Tabs
            Container(
              padding: const EdgeInsets.fromLTRB(24, 20, 24, 16),
              decoration: const BoxDecoration(
                color: Colors.white,
                border: Border(bottom: BorderSide(color: Color(0xFFe8e3dc), width: 1)),
              ),
              child: Row(
                children: [
                  _buildViewToggle('Gallery', !_show360, hasImages, () {
                    setState(() {
                      _show360 = false;
                      _imageLoading = true;
                      _imageError = false;
                    });
                  }),
                  const SizedBox(width: 12),
                  if (has360)
                    _buildViewToggle('360° View', _show360, true, () {
                      setState(() {
                        _show360 = true;
                        _panoramaLoading = true;
                        _panoramaError = false;
                      });
                    }),
                  const Spacer(),
                  // Refresh Button
                  Material(
                    color: const Color(0xFFfaf8f5),
                    borderRadius: BorderRadius.circular(8),
                    child: InkWell(
                      onTap: _refreshCurrentView,
                      borderRadius: BorderRadius.circular(8),
                      child: Container(
                        padding: const EdgeInsets.all(10),
                        child: const Icon(
                          Icons.refresh,
                          size: 22,
                          color: Color(0xFF2c2c2e),
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),

            // Large Image/360 Section
            Container(
              height: MediaQuery.of(context).size.height * 0.5,
              width: double.infinity,
              decoration: const BoxDecoration(
                color: Colors.black,
              ),
              clipBehavior: Clip.hardEdge,
              child: Stack(
                fit: StackFit.expand,
                children: [
                  // Main content
                  ClipRect(
                    child: _show360 && has360
                        ? _build360View()
                        : hasImages
                            ? _buildGalleryView(images)
                            : _buildNoImageView(),
                  ),

                  // Loading Indicator
                  if ((_show360 && _panoramaLoading) || (!_show360 && _imageLoading))
                    Container(
                      color: Colors.black.withOpacity(0.7),
                      child: const Center(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            CircularProgressIndicator(
                              color: Colors.white,
                              strokeWidth: 3,
                            ),
                            SizedBox(height: 16),
                            Text(
                              'Loading...',
                              style: TextStyle(color: Colors.white, fontSize: 16),
                            ),
                          ],
                        ),
                      ),
                    ),

                  // Error Overlay
                  if ((_show360 && _panoramaError) || (!_show360 && _imageError))
                    Container(
                      color: Colors.black.withOpacity(0.9),
                      child: Center(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            const Icon(Icons.error_outline, size: 64, color: Colors.white70),
                            const SizedBox(height: 16),
                            const Text(
                              'Failed to load content',
                              style: TextStyle(color: Colors.white, fontSize: 18),
                            ),
                            const SizedBox(height: 24),
                            ElevatedButton.icon(
                              onPressed: _refreshCurrentView,
                              icon: const Icon(Icons.refresh),
                              label: const Text('Retry'),
                              style: ElevatedButton.styleFrom(
                                backgroundColor: Colors.white,
                                foregroundColor: Colors.black,
                                padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(8),
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),

                  // Gallery Controls (only when not loading/error)
                  if (!_show360 && hasImages && !_imageLoading && !_imageError) ...[
                    // Image Counter
                    Positioned(
                      top: 16,
                      right: 16,
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                        decoration: BoxDecoration(
                          color: Colors.black.withOpacity(0.75),
                          borderRadius: BorderRadius.circular(24),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            const Icon(Icons.image, size: 18, color: Colors.white),
                            const SizedBox(width: 8),
                            Text(
                              '${widget.currentImageIndex + 1}/${images.length}',
                              style: const TextStyle(
                                color: Colors.white,
                                fontSize: 14,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),

                    // Fullscreen Button
                    Positioned(
                      bottom: 20,
                      right: 20,
                      child: Material(
                        color: const Color(0xFF2c2c2e).withOpacity(0.85),
                        borderRadius: BorderRadius.circular(10),
                        elevation: 4,
                        child: InkWell(
                          onTap: _showFullscreenGallery,
                          borderRadius: BorderRadius.circular(10),
                          child: Container(
                            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                            child: const Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Icon(Icons.fullscreen, size: 22, color: Colors.white),
                                SizedBox(width: 8),
                                Text(
                                  'Fullscreen',
                                  style: TextStyle(
                                    color: Colors.white,
                                    fontSize: 14,
                                    fontWeight: FontWeight.w500,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                      ),
                    ),

                    // Navigation Arrows
                    if (images.length > 1) ...[
                      Positioned(
                        left: 20,
                        top: 0,
                        bottom: 0,
                        child: Center(
                          child: Material(
                            color: Colors.black.withOpacity(0.6),
                            shape: const CircleBorder(),
                            elevation: 4,
                            child: InkWell(
                              onTap: () {
                                if (widget.currentImageIndex > 0) {
                                  _pageController.previousPage(
                                    duration: const Duration(milliseconds: 350),
                                    curve: Curves.easeInOut,
                                  );
                                }
                              },
                              customBorder: const CircleBorder(),
                              child: Container(
                                padding: const EdgeInsets.all(14),
                                child: const Icon(
                                  Icons.chevron_left,
                                  color: Colors.white,
                                  size: 32,
                                ),
                              ),
                            ),
                          ),
                        ),
                      ),
                      Positioned(
                        right: 20,
                        top: 0,
                        bottom: 0,
                        child: Center(
                          child: Material(
                            color: Colors.black.withOpacity(0.6),
                            shape: const CircleBorder(),
                            elevation: 4,
                            child: InkWell(
                              onTap: () {
                                if (widget.currentImageIndex < images.length - 1) {
                                  _pageController.nextPage(
                                    duration: const Duration(milliseconds: 350),
                                    curve: Curves.easeInOut,
                                  );
                                }
                              },
                              customBorder: const CircleBorder(),
                              child: Container(
                                padding: const EdgeInsets.all(14),
                                child: const Icon(
                                  Icons.chevron_right,
                                  color: Colors.white,
                                  size: 32,
                                ),
                              ),
                            ),
                          ),
                        ),
                      ),
                    ],

                    // Dots Indicator
                    if (images.length > 1)
                      Positioned(
                        bottom: 20,
                        left: 0,
                        right: 0,
                        child: Center(
                          child: Container(
                            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                            decoration: BoxDecoration(
                              color: Colors.black.withOpacity(0.6),
                              borderRadius: BorderRadius.circular(24),
                            ),
                            child: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: List.generate(
                                images.length > 10 ? 10 : images.length,
                                (index) {
                                  final isActive = index == widget.currentImageIndex;
                                  return AnimatedContainer(
                                    duration: const Duration(milliseconds: 300),
                                    margin: const EdgeInsets.symmetric(horizontal: 4),
                                    height: 8,
                                    width: isActive ? 28 : 8,
                                    decoration: BoxDecoration(
                                      color: isActive ? Colors.white : Colors.white54,
                                      borderRadius: BorderRadius.circular(4),
                                    ),
                                  );
                                },
                              ),
                            ),
                          ),
                        ),
                      ),
                  ],

                  // 360 View Hint
                  if (_show360 && has360 && !_panoramaLoading && !_panoramaError)
                    Positioned(
                      bottom: 20,
                      left: 0,
                      right: 0,
                      child: Center(
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                          decoration: BoxDecoration(
                            color: const Color(0xFF2c2c2e).withOpacity(0.85),
                            borderRadius: BorderRadius.circular(28),
                          ),
                          child: const Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Icon(Icons.touch_app, size: 20, color: Colors.white),
                              SizedBox(width: 10),
                              Text(
                                'Drag to explore 360° view',
                                style: TextStyle(
                                  color: Colors.white,
                                  fontSize: 14,
                                  fontWeight: FontWeight.w500,
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

            // Thumbnail Gallery
            if (!_show360 && images.length > 1)
              Container(
                height: 110,
                margin: const EdgeInsets.symmetric(vertical: 20),
                decoration: const BoxDecoration(
                  color: Color(0xFFfaf8f5),
                ),
                child: ListView.builder(
                  scrollDirection: Axis.horizontal,
                  padding: const EdgeInsets.symmetric(horizontal: 20),
                  itemCount: images.length,
                  itemBuilder: (context, index) {
                    final isSelected = index == widget.currentImageIndex;
                    return GestureDetector(
                      onTap: () {
                        _pageController.animateToPage(
                          index,
                          duration: const Duration(milliseconds: 350),
                          curve: Curves.easeInOut,
                        );
                      },
                      child: AnimatedContainer(
                        duration: const Duration(milliseconds: 250),
                        margin: const EdgeInsets.only(right: 14),
                        width: 140,
                        decoration: BoxDecoration(
                          border: Border.all(
                            color: isSelected
                                ? const Color(0xFF2c2c2e)
                                : const Color(0xFFe8e3dc),
                            width: isSelected ? 3 : 2,
                          ),
                          borderRadius: BorderRadius.circular(10),
                          boxShadow: isSelected
                              ? [
                                  BoxShadow(
                                    color: const Color(0xFF2c2c2e).withOpacity(0.2),
                                    blurRadius: 8,
                                    spreadRadius: 1,
                                  )
                                ]
                              : [],
                        ),
                        child: ClipRRect(
                          borderRadius: BorderRadius.circular(8),
                          child: Image.network(
                            images[index],
                            fit: BoxFit.cover,
                            loadingBuilder: (context, child, loadingProgress) {
                              if (loadingProgress == null) return child;
                              return Container(
                                color: Colors.grey[300],
                                child: const Center(
                                  child: CircularProgressIndicator(strokeWidth: 2),
                                ),
                              );
                            },
                            errorBuilder: (_, __, ___) => Container(
                              color: Colors.grey[300],
                              child: const Icon(Icons.broken_image, size: 36),
                            ),
                          ),
                        ),
                      ),
                    );
                  },
                ),
              ),

            // Room Details Section
            Container(
              color: Colors.white,
              padding: const EdgeInsets.all(28),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Room ${widget.room.roomNumber}',
                              style: const TextStyle(
                                fontSize: 32,
                                fontWeight: FontWeight.w500,
                                color: Color(0xFF2c2c2e),
                                letterSpacing: -0.5,
                              ),
                            ),
                            const SizedBox(height: 8),
                            Container(
                              padding: const EdgeInsets.symmetric(
                                horizontal: 14,
                                vertical: 8,
                              ),
                              decoration: BoxDecoration(
                                color: const Color(0xFFb8956a).withOpacity(0.12),
                                borderRadius: BorderRadius.circular(8),
                                border: Border.all(
                                  color: const Color(0xFFb8956a).withOpacity(0.4),
                                ),
                              ),
                              child: Text(
                                widget.room.roomType,
                                style: const TextStyle(
                                  fontSize: 15,
                                  fontWeight: FontWeight.w600,
                                  color: Color(0xFFb8956a),
                                  letterSpacing: 0.3,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.end,
                        children: [
                          Text(
                            '\$${widget.room.pricePerNight}',
                            style: const TextStyle(
                              fontSize: 36,
                              fontWeight: FontWeight.w600,
                              color: Color(0xFF2c2c2e),
                              letterSpacing: -0.5,
                            ),
                          ),
                          const Text(
                            '/night',
                            style: TextStyle(
                              fontSize: 15,
                              color: Color(0xFF8b8680),
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                  const SizedBox(height: 28),
                  const Divider(color: Color(0xFFe8e3dc), thickness: 1),
                  const SizedBox(height: 28),
                  _buildInfoGrid(),
                  if (widget.room.amenities.isNotEmpty) ...[
                    const SizedBox(height: 36),
                    const Text(
                      'Amenities & Features',
                      style: TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.w600,
                        color: Color(0xFF2c2c2e),
                      ),
                    ),
                    const SizedBox(height: 18),
                    Wrap(
                      spacing: 14,
                      runSpacing: 14,
                      children: widget.room.amenities.map((amenity) {
                        return Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 18,
                            vertical: 12,
                          ),
                          decoration: BoxDecoration(
                            color: const Color(0xFFfaf8f5),
                            border: Border.all(color: const Color(0xFFe8e3dc)),
                            borderRadius: BorderRadius.circular(10),
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              const Icon(
                                Icons.check_circle,
                                size: 18,
                                color: Color(0xFF6b8e23),
                              ),
                              const SizedBox(width: 10),
                              Text(
                                amenity,
                                style: const TextStyle(
                                  fontSize: 14,
                                  color: Color(0xFF2c2c2e),
                                  fontWeight: FontWeight.w500,
                                ),
                              ),
                            ],
                          ),
                        );
                      }).toList(),
                    ),
                  ],
                  const SizedBox(height: 36),
                  const Divider(color: Color(0xFFe8e3dc), thickness: 1),
                  const SizedBox(height: 28),
                  SizedBox(
                    width: double.infinity,
                    height: 60,
                    child: ElevatedButton(
                      onPressed: widget.onConfirm,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF2c2c2e),
                        foregroundColor: Colors.white,
                        elevation: 0,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(14),
                        ),
                      ),
                      child: const Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(Icons.check_circle, size: 24),
                          SizedBox(width: 14),
                          Text(
                            'Confirm This Room',
                            style: TextStyle(
                              fontSize: 17,
                              fontWeight: FontWeight.w600,
                              letterSpacing: 0.3,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 20),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildViewToggle(String label, bool isActive, bool enabled, VoidCallback onTap) {
    return Opacity(
      opacity: enabled ? 1.0 : 0.5,
      child: InkWell(
        onTap: enabled ? onTap : null,
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 200),
          padding: const EdgeInsets.symmetric(horizontal: 22, vertical: 12),
          decoration: BoxDecoration(
            color: isActive ? const Color(0xFF2c2c2e) : Colors.white,
            border: Border.all(
              color: isActive
                  ? const Color(0xFF2c2c2e)
                  : const Color(0xFFe8e3dc),
              width: 2,
            ),
            borderRadius: BorderRadius.circular(10),
            boxShadow: isActive
                ? [
                    BoxShadow(
                      color: const Color(0xFF2c2c2e).withOpacity(0.2),
                      blurRadius: 8,
                      spreadRadius: 1,
                    )
                  ]
                : [],
          ),
          child: Text(
            label,
            style: TextStyle(
              fontSize: 15,
              fontWeight: isActive ? FontWeight.w600 : FontWeight.w500,
              color: isActive ? Colors.white : const Color(0xFF2c2c2e),
              letterSpacing: 0.3,
            ),
          ),
        ),
      ),
    );
  }

  Widget _build360View() {
    return Container(
      width: double.infinity,
      height: double.infinity,
      color: Colors.black,
      child: ClipRect(
        child: Panorama(
          key: Key('panorama_$_panoramaRefreshKey'),
          sensitivity: 1.5,
          animSpeed: 1.0,
          onViewChanged: (longitude, latitude, tilt) {
            if (_panoramaLoading) {
              Future.microtask(() {
                if (mounted) {
                  setState(() => _panoramaLoading = false);
                }
              });
            }
          },
          child: Image.network(
            widget.room.panoramaUrl!,
            fit: BoxFit.cover,
            frameBuilder: (context, child, frame, wasSynchronouslyLoaded) {
              if (frame != null) {
                Future.microtask(() {
                  if (mounted && _panoramaLoading) {
                    setState(() => _panoramaLoading = false);
                  }
                });
                return child;
              }
              return const SizedBox.shrink();
            },
            errorBuilder: (context, error, stackTrace) {
              Future.microtask(() {
                if (mounted && !_panoramaError) {
                  setState(() {
                    _panoramaError = true;
                    _panoramaLoading = false;
                  });
                }
              });
              return const SizedBox.shrink();
            },
          ),
        ),
      ),
    );
  }

  Widget _buildGalleryView(List<String> images) {
    return PageView.builder(
      controller: _pageController,
      itemCount: images.length,
      itemBuilder: (context, index) {
        return GestureDetector(
          onTap: _showFullscreenGallery,
          child: Hero(
            tag: 'room_image_$index',
            child: Image.network(
              key: Key('image_${index}_$_imageRefreshKey'),
              images[index],
              fit: BoxFit.contain,
              loadingBuilder: (context, child, loadingProgress) {
                if (loadingProgress == null) {
                  WidgetsBinding.instance.addPostFrameCallback((_) {
                    if (mounted && _imageLoading && index == widget.currentImageIndex) {
                      setState(() => _imageLoading = false);
                    }
                  });
                  return child;
                }
                return const SizedBox.shrink();
              },
              errorBuilder: (_, __, ___) {
                WidgetsBinding.instance.addPostFrameCallback((_) {
                  if (mounted && !_imageError && index == widget.currentImageIndex) {
                    setState(() {
                      _imageError = true;
                      _imageLoading = false;
                    });
                  }
                });
                return const SizedBox.shrink();
              },
            ),
          ),
        );
      },
    );
  }

  Widget _buildNoImageView() {
    return Container(
      color: Colors.grey[850],
      child: const Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.image_not_supported, size: 72, color: Colors.white54),
            SizedBox(height: 20),
            Text(
              'No images available',
              style: TextStyle(color: Colors.white70, fontSize: 18),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildInfoGrid() {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: const Color(0xFFfaf8f5),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: const Color(0xFFe8e3dc), width: 1.5),
      ),
      child: Column(
        children: [
          _buildInfoRow(
            Icons.bed_outlined,
            'Bed Type',
            widget.room.bedType ?? 'Standard',
          ),
          const Divider(height: 28, color: Color(0xFFe8e3dc), thickness: 1),
          _buildInfoRow(
            Icons.square_foot_outlined,
            'Room Size',
            '${widget.room.squareFootage ?? 0} sq ft',
          ),
          const Divider(height: 28, color: Color(0xFFe8e3dc), thickness: 1),
          _buildInfoRow(
            Icons.visibility_outlined,
            'View Type',
            widget.room.viewType ?? 'Standard View',
          ),
          const Divider(height: 28, color: Color(0xFFe8e3dc), thickness: 1),
          _buildInfoRow(
            Icons.stairs_outlined,
            'Floor',
            'Floor ${widget.room.floorNumber ?? 0}',
          ),
        ],
      ),
    );
  }

  Widget _buildInfoRow(IconData icon, String label, String value) {
    return Row(
      children: [
        Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(10),
            border: Border.all(color: const Color(0xFFe8e3dc)),
          ),
          child: Icon(icon, size: 24, color: const Color(0xFF2c2c2e)),
        ),
        const SizedBox(width: 18),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                label,
                style: const TextStyle(
                  fontSize: 12,
                  color: Color(0xFF8b8680),
                  fontWeight: FontWeight.w600,
                  letterSpacing: 0.5,
                ),
              ),
              const SizedBox(height: 5),
              Text(
                value,
                style: const TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w600,
                  color: Color(0xFF2c2c2e),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}

// Fullscreen Gallery
class _FullscreenGallery extends StatefulWidget {
  final List<String> images;
  final int initialIndex;
  final String roomNumber;

  const _FullscreenGallery({
    required this.images,
    required this.initialIndex,
    required this.roomNumber,
  });

  @override
  State<_FullscreenGallery> createState() => _FullscreenGalleryState();
}

class _FullscreenGalleryState extends State<_FullscreenGallery> {
  late PageController _controller;
  late int _currentIndex;

  @override
  void initState() {
    super.initState();
    _currentIndex = widget.initialIndex;
    _controller = PageController(initialPage: widget.initialIndex);
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      appBar: AppBar(
        backgroundColor: Colors.black,
        foregroundColor: Colors.white,
        title: Text('Room ${widget.roomNumber} - Gallery'),
        actions: [
          Padding(
            padding: const EdgeInsets.only(right: 16),
            child: Center(
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                decoration: BoxDecoration(
                  color: Colors.white.withOpacity(0.2),
                  borderRadius: BorderRadius.circular(16),
                ),
                child: Text(
                  '${_currentIndex + 1}/${widget.images.length}',
                  style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
                ),
              ),
            ),
          ),
        ],
      ),
      body: PageView.builder(
        controller: _controller,
        itemCount: widget.images.length,
        onPageChanged: (index) {
          setState(() => _currentIndex = index);
        },
        itemBuilder: (context, index) {
          return Hero(
            tag: 'room_image_$index',
            child: InteractiveViewer(
              minScale: 0.5,
              maxScale: 5.0,
              child: Center(
                child: Image.network(
                  widget.images[index],
                  fit: BoxFit.contain,
                  loadingBuilder: (context, child, loadingProgress) {
                    if (loadingProgress == null) return child;
                    return const Center(
                      child: CircularProgressIndicator(color: Colors.white),
                    );
                  },
                  errorBuilder: (_, __, ___) => const Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.broken_image, size: 72, color: Colors.white54),
                      SizedBox(height: 16),
                      Text(
                        'Failed to load image',
                        style: TextStyle(color: Colors.white70, fontSize: 16),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          );
        },
      ),
    );
  }
}