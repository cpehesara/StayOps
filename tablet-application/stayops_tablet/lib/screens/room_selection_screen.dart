import 'dart:async';
import 'package:flutter/material.dart';
import '../models/room.dart';
import '../models/room_filter.dart';
import '../services/api_service.dart';
import '../widgets/room_card.dart';
import '../widgets/room_details_enhanced.dart';
import 'login_screen.dart';

class RoomSelectionScreen extends StatefulWidget {
  const RoomSelectionScreen({Key? key}) : super(key: key);

  @override
  State<RoomSelectionScreen> createState() => _RoomSelectionScreenState();
}

class _RoomSelectionScreenState extends State<RoomSelectionScreen> {
  final _apiService = ApiService();
  List<Room> _rooms = [];
  Room? _selectedRoom;
  bool _isLoading = true;
  int _currentImageIndex = 0;
  bool _sidebarExpanded = true;
  RoomFilter? _currentFilter;
  Timer? _refreshTimer;

  @override
  void initState() {
    super.initState();
    _loadRooms();
    _startAutoRefresh();
  }

  @override
  void dispose() {
    _refreshTimer?.cancel();
    super.dispose();
  }

  void _startAutoRefresh() {
    _refreshTimer = Timer.periodic(const Duration(seconds: 3), (timer) {
      _loadRooms(silent: true);
    });
  }

  Future<void> _loadRooms({bool silent = false}) async {
    if (!silent) {
      setState(() => _isLoading = true);
    }

    final rooms = await _apiService.getAvailableRooms();
    final filter = await _apiService.getCurrentFilterCriteria();

    if (mounted) {
      setState(() {
        _rooms = rooms;
        _currentFilter = filter;
        if (_selectedRoom == null && rooms.isNotEmpty) {
          _selectedRoom = rooms.first;
        } else if (_selectedRoom != null) {
          // Check if selected room is still in the list
          final stillExists = rooms.any((r) => r.roomId == _selectedRoom!.roomId);
          if (!stillExists && rooms.isNotEmpty) {
            _selectedRoom = rooms.first;
            _currentImageIndex = 0;
          }
        }
        if (!silent) {
          _isLoading = false;
        }
      });
    }
  }

  Future<void> _handleLogout() async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        title: const Text('Logout'),
        content: const Text('Are you sure you want to logout?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () => Navigator.pop(context, true),
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF2c2c2e),
            ),
            child: const Text('Logout'),
          ),
        ],
      ),
    );

    if (confirm == true) {
      await _apiService.logout();
      if (mounted) {
        Navigator.pushReplacement(
          context,
          MaterialPageRoute(builder: (_) => const LoginScreen()),
        );
      }
    }
  }

  Future<void> _confirmRoom() async {
    if (_selectedRoom == null) return;

    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        title: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: const Color(0xFF2c2c2e).withOpacity(0.1),
                borderRadius: BorderRadius.circular(8),
              ),
              child: const Icon(Icons.check_circle_outline, color: Color(0xFF2c2c2e)),
            ),
            const SizedBox(width: 12),
            const Expanded(child: Text('Confirm Room Selection')),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Room ${_selectedRoom!.roomNumber}',
              style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w600),
            ),
            const SizedBox(height: 4),
            Text(
              _selectedRoom!.roomType,
              style: const TextStyle(fontSize: 14, color: Color(0xFFb8956a)),
            ),
            const SizedBox(height: 16),
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: const Color(0xFFfaf8f5),
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: const Color(0xFFe8e3dc)),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text('Price per night:', style: TextStyle(fontSize: 13)),
                  Text(
                    '\$${_selectedRoom!.pricePerNight}',
                    style: const TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.w600,
                      color: Color(0xFF2c2c2e),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: const Color(0xFFfff3cd),
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: const Color(0xFFffc107)),
              ),
              child: const Row(
                children: [
                  Icon(Icons.info_outline, color: Color(0xFF856404), size: 20),
                  SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      'Your selection will be sent to the receptionist',
                      style: TextStyle(fontSize: 12, color: Color(0xFF856404)),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            style: TextButton.styleFrom(foregroundColor: const Color(0xFF8b8680)),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () => Navigator.pop(context, true),
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF2c2c2e),
              foregroundColor: Colors.white,
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
            ),
            child: const Text('Confirm Selection'),
          ),
        ],
      ),
    );

    if (confirmed == true && mounted) {
      // Send selection to backend
      final success = await _apiService.sendRoomSelection(_selectedRoom!.roomId);
      
      if (success) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: const Row(
              children: [
                Icon(Icons.check_circle, color: Colors.white),
                SizedBox(width: 12),
                Expanded(
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Room selected successfully!',
                        style: TextStyle(fontWeight: FontWeight.w600),
                      ),
                      SizedBox(height: 4),
                      Text(
                        'Receptionist has been notified',
                        style: TextStyle(fontSize: 12),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            backgroundColor: const Color(0xFF6b8e23),
            behavior: SnackBarBehavior.floating,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
            margin: const EdgeInsets.all(16),
            duration: const Duration(seconds: 4),
          ),
        );
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: const Row(
              children: [
                Icon(Icons.warning, color: Colors.white),
                SizedBox(width: 12),
                Text('Failed to notify receptionist'),
              ],
            ),
            backgroundColor: Colors.red,
            behavior: SnackBarBehavior.floating,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
            margin: const EdgeInsets.all(16),
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final isWideScreen = MediaQuery.of(context).size.width > 900;

    return Scaffold(
      backgroundColor: const Color(0xFFfaf8f5),
      appBar: AppBar(
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Select Your Room', style: TextStyle(fontWeight: FontWeight.w400, fontSize: 18)),
            if (_currentFilter?.active == true)
              Text(
                'Filtered: ${_currentFilter!.roomType ?? "All"} | ${_currentFilter!.checkInDate ?? ""} - ${_currentFilter!.checkOutDate ?? ""}',
                style: const TextStyle(fontSize: 11, color: Color(0xFFb8956a)),
              ),
          ],
        ),
        backgroundColor: const Color(0xFF2c2c2e),
        foregroundColor: Colors.white,
        elevation: 0,
        leading: isWideScreen
            ? IconButton(
                icon: Icon(_sidebarExpanded ? Icons.menu_open : Icons.menu),
                onPressed: () {
                  setState(() => _sidebarExpanded = !_sidebarExpanded);
                },
              )
            : null,
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh, size: 22),
            onPressed: () => _loadRooms(),
            tooltip: 'Refresh',
          ),
          Padding(
            padding: const EdgeInsets.only(right: 8),
            child: TextButton.icon(
              onPressed: _handleLogout,
              icon: const Icon(Icons.logout, size: 18),
              label: const Text('Logout'),
              style: TextButton.styleFrom(foregroundColor: Colors.white),
            ),
          ),
        ],
      ),
      body: _isLoading
          ? Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const CircularProgressIndicator(color: Color(0xFF2c2c2e)),
                  const SizedBox(height: 16),
                  Text(
                    'Loading available rooms...',
                    style: TextStyle(fontSize: 14, color: Colors.grey[600]),
                  ),
                ],
              ),
            )
          : _rooms.isEmpty
              ? Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.hotel_outlined, size: 64, color: Colors.grey[400]),
                      const SizedBox(height: 16),
                      Text(
                        _currentFilter?.active == true
                            ? 'No rooms match the current filter'
                            : 'No rooms available',
                        style: TextStyle(fontSize: 18, color: Colors.grey[600]),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        _currentFilter?.active == true
                            ? 'Please wait for receptionist to adjust the filter'
                            : 'Please contact reception',
                        style: TextStyle(fontSize: 14, color: Colors.grey[500]),
                      ),
                      const SizedBox(height: 16),
                      ElevatedButton.icon(
                        onPressed: _loadRooms,
                        icon: const Icon(Icons.refresh),
                        label: const Text('Retry'),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFF2c2c2e),
                        ),
                      ),
                    ],
                  ),
                )
              : isWideScreen
                  ? _buildWideLayout()
                  : _buildNarrowLayout(),
    );
  }

  Widget _buildWideLayout() {
    return Row(
      children: [
        AnimatedContainer(
          duration: const Duration(milliseconds: 300),
          width: _sidebarExpanded ? 320 : 0,
          decoration: const BoxDecoration(
            color: Colors.white,
            border: Border(right: BorderSide(color: Color(0xFFe8e3dc), width: 1)),
          ),
          child: _sidebarExpanded
              ? Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Container(
                      padding: const EdgeInsets.all(20),
                      decoration: const BoxDecoration(
                        border: Border(bottom: BorderSide(color: Color(0xFFe8e3dc), width: 1)),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              const Text(
                                'Available Rooms',
                                style: TextStyle(
                                  fontSize: 18,
                                  fontWeight: FontWeight.w500,
                                  color: Color(0xFF2c2c2e),
                                ),
                              ),
                              if (_currentFilter?.active == true)
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                  decoration: BoxDecoration(
                                    color: const Color(0xFFb8956a).withOpacity(0.2),
                                    borderRadius: BorderRadius.circular(12),
                                  ),
                                  child: const Text(
                                    'FILTERED',
                                    style: TextStyle(
                                      fontSize: 10,
                                      fontWeight: FontWeight.w600,
                                      color: Color(0xFFb8956a),
                                    ),
                                  ),
                                ),
                            ],
                          ),
                          const SizedBox(height: 4),
                          Text(
                            '${_rooms.length} rooms found',
                            style: const TextStyle(fontSize: 12, color: Color(0xFF8b8680)),
                          ),
                        ],
                      ),
                    ),
                    Expanded(
                      child: ListView.builder(
                        padding: const EdgeInsets.all(16),
                        itemCount: _rooms.length,
                        itemBuilder: (context, index) {
                          final room = _rooms[index];
                          return RoomCard(
                            room: room,
                            isSelected: _selectedRoom?.roomId == room.roomId,
                            onTap: () {
                              setState(() {
                                _selectedRoom = room;
                                _currentImageIndex = 0;
                              });
                            },
                          );
                        },
                      ),
                    ),
                  ],
                )
              : null,
        ),
        Expanded(
          child: _selectedRoom == null
              ? const Center(child: Text('Select a room'))
              : RoomDetailsEnhanced(
                  room: _selectedRoom!,
                  currentImageIndex: _currentImageIndex,
                  onImageIndexChanged: (index) {
                    setState(() => _currentImageIndex = index);
                  },
                  onConfirm: _confirmRoom,
                ),
        ),
      ],
    );
  }

  Widget _buildNarrowLayout() {
    return Column(
      children: [
        Container(
          height: 120,
          decoration: const BoxDecoration(
            color: Colors.white,
            border: Border(bottom: BorderSide(color: Color(0xFFe8e3dc), width: 1)),
          ),
          child: ListView.builder(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.all(16),
            itemCount: _rooms.length,
            itemBuilder: (context, index) {
              final room = _rooms[index];
              return Padding(
                padding: const EdgeInsets.only(right: 12),
                child: RoomCard(
                  room: room,
                  isSelected: _selectedRoom?.roomId == room.roomId,
                  onTap: () {
                    setState(() {
                      _selectedRoom = room;
                      _currentImageIndex = 0;
                    });
                  },
                ),
              );
            },
          ),
        ),
        Expanded(
          child: _selectedRoom == null
              ? const Center(child: Text('Select a room'))
              : RoomDetailsEnhanced(
                  room: _selectedRoom!,
                  currentImageIndex: _currentImageIndex,
                  onImageIndexChanged: (index) {
                    setState(() => _currentImageIndex = index);
                  },
                  onConfirm: _confirmRoom,
                ),
        ),
      ],
    );
  }
}