import 'package:flutter/material.dart';
import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:stayops/models/reservation.dart';

class ReservationDetailsPage extends StatefulWidget {
  final String guestId;
  const ReservationDetailsPage({Key? key, required this.guestId})
      : super(key: key);

  @override
  State<ReservationDetailsPage> createState() => _ReservationDetailsPageState();
}

class _ReservationDetailsPageState extends State<ReservationDetailsPage> {
  final List<Map<String, dynamic>> _serviceTypes = [
    {"id": 1, "name": "Room Cleaning"},
    {"id": 2, "name": "Swimming Pool Access"},
    {"id": 3, "name": "Gym Access"},
    {"id": 4, "name": "Spa & Massage"},
    {"id": 5, "name": "Airport Pickup"},
    {"id": 6, "name": "Restaurant Dining"},
    {"id": 7, "name": "Laundry"},
  ];

  void _showServiceRequestDialog(Reservation reservation) {
    int? selectedRoomId =
        reservation.roomIds.isNotEmpty ? reservation.roomIds.first : null;
    int selectedServiceTypeId = _serviceTypes.first["id"];
    String assignedTo = "Reception Desk - Mary";
    String description = "";
    String status = "IN_PROGRESS";

    showDialog(
      context: context,
      builder: (context) {
        return AlertDialog(
          title: const Text("Request a Service"),
          content: StatefulBuilder(
            builder: (context, setState) {
              return SingleChildScrollView(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    DropdownButtonFormField<int>(
                      value: selectedRoomId,
                      decoration: const InputDecoration(labelText: "Room"),
                      items: reservation.roomIds
                          .map<DropdownMenuItem<int>>(
                              (roomId) => DropdownMenuItem<int>(
                                    value: roomId,
                                    child: Text("Room $roomId"),
                                  ))
                          .toList(),
                      onChanged: (val) => setState(() => selectedRoomId = val),
                    ),
                    DropdownButtonFormField<int>(
                      value: selectedServiceTypeId,
                      decoration:
                          const InputDecoration(labelText: "Service Type"),
                      items: _serviceTypes
                          .map<DropdownMenuItem<int>>(
                              (type) => DropdownMenuItem<int>(
                                    value: type["id"] as int,
                                    child: Text(type["name"] as String),
                                  ))
                          .toList(),
                      onChanged: (val) =>
                          setState(() => selectedServiceTypeId = val!),
                    ),
                    TextFormField(
                      decoration:
                          const InputDecoration(labelText: "Description"),
                      onChanged: (val) => description = val,
                    ),
                  ],
                ),
              );
            },
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(context).pop(),
              child: const Text("Cancel"),
            ),
            ElevatedButton(
              onPressed: () async {
                if (selectedRoomId == null || description.isEmpty) return;
                final body = {
                  "reservationId": reservation.reservationId,
                  "guestId": widget.guestId,
                  "roomId": selectedRoomId,
                  "serviceTypeId": selectedServiceTypeId,
                  "assignedTo": assignedTo,
                  "description": description,
                  "status": status,
                };
                final resp = await http.post(
                  Uri.parse(
                      "http://10.203.254.101:8080/api/v1/service-requests"),
                  headers: {"Content-Type": "application/json"},
                  body: jsonEncode(body),
                );
                Navigator.of(context).pop();
                if (resp.statusCode == 200 || resp.statusCode == 201) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text("Service request submitted!")),
                  );
                } else {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(content: Text("Failed: ${resp.body}")),
                  );
                }
              },
              child: const Text("Submit"),
            ),
          ],
        );
      },
    );
  }

  late Future<List<Reservation>> _reservationsFuture;

  @override
  void initState() {
    super.initState();
    _reservationsFuture = fetchReservations(widget.guestId);
  }

  Future<List<Reservation>> fetchReservations(String guestId) async {
    final url =
  Uri.parse('http://10.203.254.101:8080/api/reservations/guest/$guestId');
    final response = await http.get(url);
    if (response.statusCode == 200) {
      final List<dynamic> data = json.decode(response.body);
      return data.map((json) => Reservation.fromJson(json)).toList();
    } else {
      throw Exception('Failed to load reservations');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Reservation Details'),
        backgroundColor: const Color(0xFF2563FF),
        foregroundColor: Colors.white,
      ),
      body: FutureBuilder<List<Reservation>>(
        future: _reservationsFuture,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          } else if (snapshot.hasError) {
            return Center(child: Text('Error: ${snapshot.error}'));
          } else if (!snapshot.hasData || snapshot.data!.isEmpty) {
            return const Center(child: Text('No reservations found.'));
          }
          final reservations = snapshot.data!;
          return ListView.builder(
            itemCount: reservations.length,
            itemBuilder: (context, index) {
              final r = reservations[index];
              return Card(
                margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                child: Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('Reservation ID: ${r.reservationId}',
                          style: const TextStyle(fontWeight: FontWeight.bold)),
                      Text('Room(s): ${r.roomIds.join(", ")}',
                          style: const TextStyle()),
                      Text('Check-in: ${r.checkInDate}'),
                      Text('Check-out: ${r.checkOutDate}'),
                      Text('Status: ${r.status}'),
                      Text('Created: ${r.createdAt}'),
                      Text('Updated: ${r.updatedAt}'),
                      const SizedBox(height: 8),
                      ElevatedButton.icon(
                        icon: const Icon(Icons.room_service),
                        label: const Text("Request Service"),
                        onPressed: () => _showServiceRequestDialog(r),
                      ),
                    ],
                  ),
                ),
              );
            },
          );
        },
      ),
    );
  }
}
