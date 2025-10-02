import 'package:flutter/material.dart';
import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:stayops/models/reservation.dart';

class DashboardServiceRequestModal extends StatefulWidget {
  final String guestId;
  const DashboardServiceRequestModal({Key? key, required this.guestId})
      : super(key: key);

  @override
  State<DashboardServiceRequestModal> createState() =>
      _DashboardServiceRequestModalState();
}

class _DashboardServiceRequestModalState
    extends State<DashboardServiceRequestModal> {
  List<Reservation> _reservations = [];
  Reservation? _selectedReservation;
  int? _selectedRoomId;
  int _selectedServiceTypeId = 1;
  String _description = "";
  bool _loading = false;
  final List<Map<String, dynamic>> _serviceTypes = [
    {"id": 1, "name": "Room Cleaning", "icon": Icons.cleaning_services},
    {"id": 2, "name": "Swimming Pool Access", "icon": Icons.pool},
    {"id": 3, "name": "Gym Access", "icon": Icons.fitness_center},
    {"id": 4, "name": "Spa & Massage", "icon": Icons.spa},
    {"id": 5, "name": "Airport Pickup", "icon": Icons.flight},
    {"id": 6, "name": "Restaurant Dining", "icon": Icons.restaurant},
    {"id": 7, "name": "Laundry", "icon": Icons.local_laundry_service},
  ];

  @override
  void initState() {
    super.initState();
    _fetchReservations();
  }

  Future<void> _fetchReservations() async {
    setState(() => _loading = true);
    final url = Uri.parse(
        'http://10.203.254.101:8080/api/reservations/guest/${widget.guestId}');
    final response = await http.get(url);
    if (response.statusCode == 200) {
      final List<dynamic> data = json.decode(response.body);
      setState(() {
        _reservations = data.map((json) => Reservation.fromJson(json)).toList();
        if (_reservations.isNotEmpty) {
          _selectedReservation = _reservations.first;
          _selectedRoomId = _selectedReservation!.roomIds.isNotEmpty
              ? _selectedReservation!.roomIds.first
              : null;
        }
      });
    }
    setState(() => _loading = false);
  }

  Future<void> _submitRequest() async {
    if (_selectedReservation == null ||
        _selectedRoomId == null ||
        _description.isEmpty) return;
    setState(() => _loading = true);
    final body = {
      "reservationId": _selectedReservation!.reservationId,
      "guestId": widget.guestId,
      "roomId": _selectedRoomId,
      "serviceTypeId": _selectedServiceTypeId,
      "assignedTo": "Reception Desk - Mary",
      "description": _description,
      "status": "IN_PROGRESS",
    };
    final resp = await http.post(
      Uri.parse("http://10.203.254.101:8080/api/v1/service-requests"),
      headers: {"Content-Type": "application/json"},
      body: jsonEncode(body),
    );
    setState(() => _loading = false);
    if (resp.statusCode == 200 || resp.statusCode == 201) {
      Navigator.of(context).pop();
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("Service request submitted!")),
      );
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text("Failed: ${resp.body}")),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
      ),
      child: _loading
          ? const Center(child: CircularProgressIndicator())
          : Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text("Request a Service",
                    style:
                        TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
                const SizedBox(height: 16),
                DropdownButtonFormField<Reservation>(
                  value: _selectedReservation,
                  decoration: const InputDecoration(labelText: "Reservation"),
                  items: _reservations
                      .map<DropdownMenuItem<Reservation>>(
                          (r) => DropdownMenuItem<Reservation>(
                                value: r,
                                child: Text("Reservation #${r.reservationId}"),
                              ))
                      .toList(),
                  onChanged: (val) {
                    setState(() {
                      _selectedReservation = val;
                      _selectedRoomId = val?.roomIds.isNotEmpty == true
                          ? val!.roomIds.first
                          : null;
                    });
                  },
                ),
                const SizedBox(height: 8),
                DropdownButtonFormField<int>(
                  value: _selectedRoomId,
                  decoration: const InputDecoration(labelText: "Room"),
                  items: (_selectedReservation?.roomIds ?? [])
                      .map<DropdownMenuItem<int>>(
                          (roomId) => DropdownMenuItem<int>(
                                value: roomId,
                                child: Text("Room $roomId"),
                              ))
                      .toList(),
                  onChanged: (val) => setState(() => _selectedRoomId = val),
                ),
                const SizedBox(height: 8),
                DropdownButtonFormField<int>(
                  value: _selectedServiceTypeId,
                  decoration: const InputDecoration(labelText: "Service Type"),
                  items: _serviceTypes
                      .map<DropdownMenuItem<int>>(
                          (type) => DropdownMenuItem<int>(
                                value: type["id"] as int,
                                child: Row(
                                  children: [
                                    Icon(type["icon"] as IconData,
                                        size: 20, color: Colors.blue),
                                    const SizedBox(width: 8),
                                    Text(type["name"] as String),
                                  ],
                                ),
                              ))
                      .toList(),
                  onChanged: (val) =>
                      setState(() => _selectedServiceTypeId = val!),
                ),
                const SizedBox(height: 8),
                TextFormField(
                  decoration: const InputDecoration(labelText: "Description"),
                  onChanged: (val) => _description = val,
                ),
                const SizedBox(height: 16),
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton.icon(
                    icon: const Icon(Icons.send),
                    label: const Text("Submit Request"),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF2563FF),
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(vertical: 14),
                    ),
                    onPressed: _loading ? null : _submitRequest,
                  ),
                ),
              ],
            ),
    );
  }
}
