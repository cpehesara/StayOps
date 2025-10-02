import 'package:flutter/material.dart';
import 'package:stayops/dashboard_page.dart';
import 'dashboard_service_request_modal.dart';

class DashboardWithServiceRequest extends StatelessWidget {
  final String guestId;
  const DashboardWithServiceRequest({Key? key, required this.guestId})
      : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        DashboardPage(guestId: guestId),
        Positioned(
          bottom: 32,
          right: 32,
          child: FloatingActionButton.extended(
            backgroundColor: const Color(0xFF2563FF),
            foregroundColor: Colors.white,
            icon: const Icon(Icons.room_service),
            label: const Text("Request Service"),
            onPressed: () {
              showModalBottomSheet(
                context: context,
                isScrollControlled: true,
                shape: const RoundedRectangleBorder(
                  borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
                ),
                builder: (context) =>
                    DashboardServiceRequestModal(guestId: guestId),
              );
            },
          ),
        ),
      ],
    );
  }
}
