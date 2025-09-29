import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Stack,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
} from "@mui/material";

import {
  getMonthlyReservations,
  getDailyReservations,
} from "../api/reservation";

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function ReservationCalendar({ year, month }) {
  const [summaries, setSummaries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [selectedDate, setSelectedDate] = useState(null);
  const [dayDetails, setDayDetails] = useState([]);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState(null);

  // Fetch calendar summaries
  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);

    getMonthlyReservations(year, month)
      .then((json) => {
        if (mounted) setSummaries(json || []);
      })
      .catch((err) => {
        if (mounted) setError(err.message || "Failed to load");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => (mounted = false);
  }, [year, month]);

  // Map summaries by date for quick lookup
  const summaryMap = useMemo(() => {
    const m = new Map();
    (summaries || []).forEach((s) => {
      const dateOnly = (s.date || "").slice(0, 10);
      if (dateOnly) m.set(dateOnly, s);
    });
    return m;
  }, [summaries]);

  // Calendar grid generation
  const firstDayIndex = new Date(year, month - 1, 1).getDay();
  const daysInMonth = new Date(year, month, 0).getDate();
  const totalCells = Math.ceil((firstDayIndex + daysInMonth) / 7) * 7;
  const cells = Array.from({ length: totalCells }).map((_, idx) => {
    const dayNumber = idx - firstDayIndex + 1;
    return dayNumber >= 1 && dayNumber <= daysInMonth ? dayNumber : null;
  });

  // Fetch reservations by date
  const handleOpenDay = async (dayNumber) => {
    const dateISO = `${year}-${String(month).padStart(2, "0")}-${String(
      dayNumber
    ).padStart(2, "0")}`;

    setSelectedDate(dateISO);
    setDayDetails([]);
    setDetailsError(null);
    setDetailsLoading(true);

    try {
      const details = await getDailyReservations(dateISO);
      setDayDetails(details || []);
    } catch (err) {
      setDetailsError(err.message || "Failed to load details");
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleCloseDialog = () => {
    setSelectedDate(null);
    setDayDetails([]);
    setDetailsError(null);
  };

  return (
    <Box>
      {loading ? (
        <Box sx={{ py: 6, display: "flex", justifyContent: "center" }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Box sx={{ py: 3, textAlign: "center" }}>
          <Typography color="error">Error: {error}</Typography>
        </Box>
      ) : (
        <>
          {/* Day headers */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(7, 1fr)",
              gap: 1,
              mb: 1,
            }}
          >
            {DAY_NAMES.map((d) => (
              <Box key={d} sx={{ textAlign: "center", py: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                  {d}
                </Typography>
              </Box>
            ))}
          </Box>

          {/* Calendar grid */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(7, 1fr)",
              gap: 2,
            }}
          >
            {cells.map((day, idx) => {
              if (!day) return <Box key={`empty-${idx}`} sx={{ minHeight: 120 }} />;

              const dateISO = `${year}-${String(month).padStart(2, "0")}-${String(
                day
              ).padStart(2, "0")}`;
              const summary = summaryMap.get(dateISO);

              return (
                <Paper
                  key={dateISO}
                  onClick={() => handleOpenDay(day)}
                  elevation={2}
                  sx={{
                    minHeight: 120,
                    p: 1.5,
                    position: "relative",
                    cursor: "pointer",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    "&:hover": { boxShadow: 6, transform: "translateY(-2px)" },
                  }}
                >
                  {/* Day number */}
                  <Box
                    sx={{
                      position: "absolute",
                      top: 8,
                      right: 8,
                      width: 28,
                      height: 28,
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 700,
                      backgroundColor: "rgba(0,0,0,0.06)",
                    }}
                  >
                    <Typography variant="caption">{day}</Typography>
                  </Box>

                  {/* Summary */}
                  <Box sx={{ mt: 1 }}>
                    {summary ? (
                      <Stack spacing={0.5}>
                        <Tooltip
                          title={`Check-ins: ${summary.checkIns}`}
                          placement="top"
                        >
                          <Box
                            sx={{
                              px: 0.75,
                              py: 0.4,
                              borderRadius: 999,
                              bgcolor: "rgba(76, 175, 80, 0.12)",
                              fontSize: 12,
                              fontWeight: 600,
                              width: "fit-content",
                            }}
                          >
                            Check-ins: {summary.checkIns}
                          </Box>
                        </Tooltip>
                        <Tooltip
                          title={`Check-outs: ${summary.checkOuts}`}
                          placement="top"
                        >
                          <Box
                            sx={{
                              px: 0.75,
                              py: 0.4,
                              borderRadius: 999,
                              bgcolor: "rgba(244, 67, 54, 0.12)",
                              fontSize: 12,
                              fontWeight: 600,
                              width: "fit-content",
                            }}
                          >
                            Check-outs: {summary.checkOuts}
                          </Box>
                        </Tooltip>
                        <Tooltip
                          title={`Total reservations: ${summary.totalReservations}`}
                          placement="top"
                        >
                          <Box
                            sx={{
                              px: 0.75,
                              py: 0.4,
                              borderRadius: 999,
                              bgcolor: "rgba(33, 150, 243, 0.12)",
                              fontSize: 12,
                              fontWeight: 600,
                              width: "fit-content",
                            }}
                          >
                            Total: {summary.totalReservations}
                          </Box>
                        </Tooltip>
                      </Stack>
                    ) : (
                      <Typography variant="caption" color="text.secondary">
                        No reservations
                      </Typography>
                    )}
                  </Box>

                  <Box sx={{ textAlign: "right" }}>
                    <Typography variant="caption" color="text.secondary">
                      View details
                    </Typography>
                  </Box>
                </Paper>
              );
            })}
          </Box>

          {/* Dialog for day details */}
          <Dialog
            open={!!selectedDate}
            onClose={handleCloseDialog}
            fullWidth
            maxWidth="sm"
          >
            <DialogTitle>
              {selectedDate
                ? `Reservations for ${selectedDate}`
                : "Reservations"}
            </DialogTitle>
            <DialogContent dividers>
              {detailsLoading ? (
                <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
                  <CircularProgress />
                </Box>
              ) : detailsError ? (
                <Typography color="error">{detailsError}</Typography>
              ) : dayDetails && dayDetails.length ? (
                <List>
                  {dayDetails.map((r) => (
                    <ListItem key={r.id}>
                      <ListItemText
                        primary={`${r.guestName} — Room ${r.roomNumber}`}
                        secondary={
                          <>
                            {r.checkIn && <div>Check-in: {r.checkIn}</div>}
                            {r.checkOut && <div>Check-out: {r.checkOut}</div>}
                            {r.status && <div>Status: {r.status}</div>}
                          </>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography>No reservations found for this date.</Typography>
              )}
            </DialogContent>
          </Dialog>
        </>
      )}
    </Box>
  );
}
