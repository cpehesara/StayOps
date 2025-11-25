import 'package:flutter/material.dart';
import 'package:carousel_slider/carousel_slider.dart';
import '../models/room.dart';
import 'panorama_widget.dart';

class RoomDetailsWidget extends StatefulWidget {
  final Room room;
  final VoidCallback onConfirm;

  const RoomDetailsWidget({
    Key? key,
    required this.room,
    required this.onConfirm,
  }) : super(key: key);

  @override
  State<RoomDetailsWidget> createState() => _RoomDetailsWidgetState();
}

class _RoomDetailsWidgetState extends State<RoomDetailsWidget> {
  bool _show360 = false;
  int _currentImageIndex = 0;

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
          colors: [
            Color(0xFFfdfbf7),
            Color(0xFFf5f2ed),
          ],
        ),
      ),
      child: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                _buildToggleButton('Gallery', !_show360),
                const SizedBox(width: 12),
                if (widget.room.panoramaUrl != null && widget.room.panoramaUrl!.isNotEmpty)
                  _buildToggleButton('360° View', _show360),
              ],
            ),
            const SizedBox(height: 20),
            if (_show360 && widget.room.panoramaUrl != null && widget.room.panoramaUrl!.isNotEmpty)
              PanoramaWidget(imageUrl: widget.room.panoramaUrl!)
            else if (widget.room.galleryImages.isNotEmpty)
              Container(
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(12),
                  boxShadow: [
                    BoxShadow(
                      color: const Color(0xFFd4af37).withOpacity(0.15),
                      blurRadius: 20,
                      spreadRadius: 2,
                    ),
                  ],
                ),
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(12),
                  child: CarouselSlider(
                    options: CarouselOptions(
                      height: 320,
                      viewportFraction: 1.0,
                      enableInfiniteScroll: false,
                      onPageChanged: (index, reason) {
                        setState(() => _currentImageIndex = index);
                      },
                    ),
                    items: widget.room.galleryImages.map((url) {
                      return Image.network(
                        url,
                        width: double.infinity,
                        fit: BoxFit.cover,
                        loadingBuilder: (context, child, loadingProgress) {
                          if (loadingProgress == null) return child;
                          return Container(
                            color: const Color(0xFF1a1a1c),
                            child: Center(
                              child: CircularProgressIndicator(
                                value: loadingProgress.expectedTotalBytes != null
                                    ? loadingProgress.cumulativeBytesLoaded /
                                        loadingProgress.expectedTotalBytes!
                                    : null,
                                color: const Color(0xFFd4af37),
                                strokeWidth: 3,
                              ),
                            ),
                          );
                        },
                        errorBuilder: (_, __, ___) => Container(
                          color: const Color(0xFF2c2c2e),
                          child: const Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Icon(Icons.image_outlined, size: 48, color: Color(0xFFd4af37)),
                              SizedBox(height: 12),
                              Text(
                                'Image unavailable',
                                style: TextStyle(color: Colors.white70),
                              ),
                            ],
                          ),
                        ),
                      );
                    }).toList(),
                  ),
                ),
              ),
            if (!_show360 && widget.room.galleryImages.length > 1) ...[
              const SizedBox(height: 16),
              Center(
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                  decoration: BoxDecoration(
                    color: const Color(0xFF1a1a1c).withOpacity(0.8),
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(
                      color: const Color(0xFFd4af37).withOpacity(0.3),
                    ),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: List.generate(
                      widget.room.galleryImages.length.clamp(0, 10),
                      (index) {
                        final isActive = index == _currentImageIndex;
                        return AnimatedContainer(
                          duration: const Duration(milliseconds: 300),
                          margin: const EdgeInsets.symmetric(horizontal: 4),
                          height: 6,
                          width: isActive ? 24 : 6,
                          decoration: BoxDecoration(
                            color: isActive ? const Color(0xFFd4af37) : Colors.white54,
                            borderRadius: BorderRadius.circular(3),
                          ),
                        );
                      },
                    ),
                  ),
                ),
              ),
            ],
            const SizedBox(height: 28),
            Container(
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(
                  color: const Color(0xFFd4af37).withOpacity(0.3),
                  width: 1.5,
                ),
                boxShadow: [
                  BoxShadow(
                    color: const Color(0xFFd4af37).withOpacity(0.1),
                    blurRadius: 20,
                    spreadRadius: 2,
                  ),
                ],
              ),
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
                                fontSize: 28,
                                fontWeight: FontWeight.w600,
                                color: Color(0xFF1a1a1c),
                                letterSpacing: -0.5,
                              ),
                            ),
                            const SizedBox(height: 8),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                              decoration: BoxDecoration(
                                gradient: LinearGradient(
                                  colors: [
                                    const Color(0xFFd4af37).withOpacity(0.15),
                                    const Color(0xFFb8956a).withOpacity(0.15),
                                  ],
                                ),
                                borderRadius: BorderRadius.circular(8),
                                border: Border.all(
                                  color: const Color(0xFFd4af37).withOpacity(0.4),
                                ),
                              ),
                              child: Text(
                                widget.room.roomType,
                                style: const TextStyle(
                                  fontSize: 14,
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
                              fontSize: 32,
                              fontWeight: FontWeight.w700,
                              color: Color(0xFF1a1a1c),
                              letterSpacing: -0.5,
                            ),
                          ),
                          const Text(
                            '/night',
                            style: TextStyle(
                              fontSize: 14,
                              color: Color(0xFF8b8680),
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                  const SizedBox(height: 24),
                  Divider(color: const Color(0xFFd4af37).withOpacity(0.2), thickness: 1.5),
                  const SizedBox(height: 20),
                  _buildInfoGrid(),
                  if (widget.room.amenities.isNotEmpty) ...[
                    const SizedBox(height: 28),
                    Divider(color: const Color(0xFFd4af37).withOpacity(0.2), thickness: 1.5),
                    const SizedBox(height: 24),
                    Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.all(8),
                          decoration: BoxDecoration(
                            gradient: LinearGradient(
                              colors: [
                                const Color(0xFFd4af37).withOpacity(0.15),
                                const Color(0xFFb8956a).withOpacity(0.15),
                              ],
                            ),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: const Icon(
                            Icons.stars,
                            size: 20,
                            color: Color(0xFFd4af37),
                          ),
                        ),
                        const SizedBox(width: 12),
                        const Text(
                          'Amenities & Features',
                          style: TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.w600,
                            color: Color(0xFF1a1a1c),
                            letterSpacing: 0.3,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 16),
                    Wrap(
                      spacing: 10,
                      runSpacing: 10,
                      children: widget.room.amenities.map((amenity) {
                        return Container(
                          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                          decoration: BoxDecoration(
                            gradient: const LinearGradient(
                              colors: [
                                Color(0xFFfdfbf7),
                                Color(0xFFf5f2ed),
                              ],
                            ),
                            border: Border.all(
                              color: const Color(0xFFd4af37).withOpacity(0.3),
                            ),
                            borderRadius: BorderRadius.circular(10),
                            boxShadow: [
                              BoxShadow(
                                color: const Color(0xFFd4af37).withOpacity(0.08),
                                blurRadius: 8,
                                spreadRadius: 1,
                              ),
                            ],
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              const Icon(
                                Icons.check_circle,
                                size: 16,
                                color: Color(0xFFd4af37),
                              ),
                              const SizedBox(width: 8),
                              Text(
                                amenity,
                                style: const TextStyle(
                                  fontSize: 13,
                                  color: Color(0xFF1a1a1c),
                                  fontWeight: FontWeight.w500,
                                ),
                              ),
                            ],
                          ),
                        );
                      }).toList(),
                    ),
                  ],
                ],
              ),
            ),
            const SizedBox(height: 28),
            Container(
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [
                    Color(0xFF1a1a1c),
                    Color(0xFF2c2c2e),
                  ],
                ),
                borderRadius: BorderRadius.circular(16),
                boxShadow: [
                  BoxShadow(
                    color: const Color(0xFF1a1a1c).withOpacity(0.3),
                    blurRadius: 20,
                    spreadRadius: 2,
                    offset: const Offset(0, 4),
                  ),
                ],
              ),
              child: Material(
                color: Colors.transparent,
                child: InkWell(
                  onTap: widget.onConfirm,
                  borderRadius: BorderRadius.circular(16),
                  child: Container(
                    width: double.infinity,
                    height: 56,
                    alignment: Alignment.center,
                    child: const Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(
                          Icons.check_circle,
                          size: 24,
                          color: Color(0xFFd4af37),
                        ),
                        SizedBox(width: 12),
                        Text(
                          'Confirm This Room',
                          style: TextStyle(
                            fontSize: 17,
                            fontWeight: FontWeight.w600,
                            color: Colors.white,
                            letterSpacing: 0.5,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildToggleButton(String text, bool isActive) {
    return Expanded(
      child: InkWell(
        onTap: () => setState(() => _show360 = text == '360° View'),
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 250),
          padding: const EdgeInsets.symmetric(vertical: 14),
          decoration: BoxDecoration(
            gradient: isActive
                ? const LinearGradient(
                    colors: [Color(0xFF1a1a1c), Color(0xFF2c2c2e)],
                  )
                : null,
            color: isActive ? null : Colors.white,
            border: Border.all(
              color: isActive ? const Color(0xFFd4af37) : const Color(0xFFe8e3dc),
              width: isActive ? 2 : 1.5,
            ),
            borderRadius: BorderRadius.circular(12),
            boxShadow: isActive
                ? [
                    BoxShadow(
                      color: const Color(0xFFd4af37).withOpacity(0.3),
                      blurRadius: 12,
                      spreadRadius: 1,
                    ),
                  ]
                : [],
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(
                text == '360° View' ? Icons.panorama : Icons.photo_library,
                size: 18,
                color: isActive ? const Color(0xFFd4af37) : const Color(0xFF8b8680),
              ),
              const SizedBox(width: 8),
              Text(
                text,
                style: TextStyle(
                  fontSize: 14,
                  fontWeight: isActive ? FontWeight.w600 : FontWeight.w500,
                  color: isActive ? Colors.white : const Color(0xFF2c2c2e),
                  letterSpacing: 0.3,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildInfoGrid() {
    return Column(
      children: [
        _buildInfoRow(Icons.bed_outlined, 'Bed Type', widget.room.bedType ?? 'Standard'),
        const SizedBox(height: 16),
        _buildInfoRow(Icons.square_foot_outlined, 'Room Size', '${widget.room.squareFootage ?? 0} sq ft'),
        const SizedBox(height: 16),
        _buildInfoRow(Icons.visibility_outlined, 'View', widget.room.viewType ?? 'Standard'),
        const SizedBox(height: 16),
        _buildInfoRow(Icons.stairs_outlined, 'Floor', 'Floor ${widget.room.floorNumber ?? 0}'),
      ],
    );
  }

  Widget _buildInfoRow(IconData icon, String label, String value) {
    return Row(
      children: [
        Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            gradient: LinearGradient(
              colors: [
                const Color(0xFFd4af37).withOpacity(0.15),
                const Color(0xFFb8956a).withOpacity(0.15),
              ],
            ),
            borderRadius: BorderRadius.circular(10),
            border: Border.all(
              color: const Color(0xFFd4af37).withOpacity(0.3),
            ),
          ),
          child: Icon(icon, size: 22, color: const Color(0xFFd4af37)),
        ),
        const SizedBox(width: 14),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                label,
                style: TextStyle(
                  fontSize: 11,
                  color: Colors.grey[600],
                  fontWeight: FontWeight.w600,
                  letterSpacing: 0.5,
                ),
              ),
              const SizedBox(height: 4),
              Text(
                value,
                style: const TextStyle(
                  fontSize: 15,
                  fontWeight: FontWeight.w600,
                  color: Color(0xFF1a1a1c),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}