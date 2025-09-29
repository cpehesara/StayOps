import React, { useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Chip,
  LinearProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  AppBar,
  Toolbar,
  IconButton,
  Avatar,
  Badge,
  Paper,
  Divider,
  Button,
  Alert,
  Stack,
  Breadcrumbs,
  Link,
} from '@mui/material';
import {
  Hotel,
  TrendingUp,
  AttachMoney,
  CheckCircle,
  Build,
  CleaningServices,
  Visibility,
  Notifications,
  Menu as MenuIcon,
  Search,
  FilterList,
  Refresh,
  MoreVert,
  Warning,
  Person,
  CalendarToday,
  Assessment,
  Home,
  NavigateNext,
  Schedule,
  Phone,
  LocationOn,
} from '@mui/icons-material';

// Enterprise color scheme inspired by IFS Aurena
const colors = {
  primary: '#1565C0',        // Professional blue
  secondary: '#37474F',      // Dark blue-gray
  accent: '#00ACC1',         // Cyan accent
  success: '#2E7D32',        // Professional green
  warning: '#F57C00',        // Professional orange
  error: '#C62828',          // Professional red
  background: '#F5F7FA',     // Light gray background
  surface: '#FFFFFF',        // White surface
  border: '#E0E4E7',
  important:'#6EACDA',         // Light border
  text: {
    primary: '#212121',
    secondary: '#757575',
    disabled: '#BDBDBD'
  }
};

// Sample PMS data
const pmsData = {
  hotelInfo: {
    name: "Bay Watch Hotel",
    address: "123 Business District, Colombo",
    phone: "+94 11 234 5678"
  },
  operationalStats: {
    totalRooms: 150,
    occupiedRooms: 128,
    availableRooms: 22,
    outOfOrderRooms: 5,
    revenue: 45680,
    averageRate: 285,
    checkIns: 23,
    checkOuts: 18,
    pendingCheckIns: 12,
    walkIns: 3,
  },
  recentActivities: [
    { id: 1, type: 'checkin', guest: 'John Smith', room: '201', time: '09:15 AM', status: 'completed' },
    { id: 2, type: 'checkout', guest: 'Sarah Wilson', room: '305', time: '08:45 AM', status: 'completed' },
    { id: 3, type: 'maintenance', room: '402', issue: 'AC repair', time: '08:30 AM', status: 'pending', priority: 'high' },
    { id: 4, type: 'cleaning', room: '105', time: '08:00 AM', status: 'in_progress' },
    { id: 5, type: 'reservation', guest: 'Mike Johnson', room: '118', time: '07:45 AM', status: 'confirmed' },
    { id: 6, type: 'walkin', guest: 'Emma Davis', room: '207', time: '07:30 AM', status: 'pending' },
  ],
  roomStatus: {
    occupied: 128,
    available: 22,
    maintenance: 5,
    cleaning: 12,
    reserved: 8,
  },
  alerts: [
    { id: 1, type: 'warning', message: 'Room 402 requires immediate maintenance attention', priority: 'high' },
    { id: 2, type: 'info', message: '12 guests scheduled to check-in within next 2 hours', priority: 'medium' },
    { id: 3, type: 'success', message: 'Housekeeping completed 15 rooms ahead of schedule', priority: 'low' },
  ]
};

// Professional PMS Stat Card
const PMSStatCard = ({ title, value, subtitle, icon, change, changeType, color = colors.primary, onClick }) => (
  <Card 
    sx={{ 
      height: '120px',
      cursor: onClick ? 'pointer' : 'default',
      transition: 'all 0.2s ease-in-out',
      border: `1px solid ${colors.border}`,
      '&:hover': onClick ? {
        borderColor: color,
        boxShadow: `0 4px 12px ${color}20`,
        transform: 'translateY(-2px)',
      } : {},
    }}
    onClick={onClick}
  >
    <CardContent sx={{ p: 2.5 }}>
      <Box display="flex" justifyContent="space-between" alignItems="flex-start">
        <Box flex={1}>
          <Typography variant="caption" sx={{ color: colors.text.secondary, fontWeight: 500, textTransform: 'uppercase' }}>
            {title}
          </Typography>
          <Typography variant="h4" sx={{ color: colors.text.primary, fontWeight: 700, my: 0.5, fontSize: '1.8rem' }}>
            {value}
          </Typography>
          {subtitle && (
            <Typography variant="body2" sx={{ color: colors.text.secondary, fontSize: '0.75rem' }}>
              {subtitle}
            </Typography>
          )}
          {change && (
            <Box display="flex" alignItems="center" mt={0.5}>
              <Typography 
                variant="caption" 
                sx={{ 
                  color: changeType === 'positive' ? colors.success : changeType === 'negative' ? colors.error : colors.text.secondary,
                  fontWeight: 600,
                  fontSize: '0.7rem'
                }}
              >
                {change}
              </Typography>
            </Box>
          )}
        </Box>
        <Box
          sx={{
            backgroundColor: `${color}15`,
            color: color,
            borderRadius: 1.5,
            p: 1,
            display: 'flex',
            alignItems: 'center',
          }}
        >
          {icon}
        </Box>
      </Box>
    </CardContent>
  </Card>
);

// Room Status Overview Card
const RoomStatusOverview = ({ status, count, color, percentage, icon }) => (
  <Paper sx={{ p: 2, border: `1px solid ${colors.border}`, borderRadius: 2 }}>
    <Box display="flex" alignItems="center" justifyContent="space-between" mb={1.5}>
      <Box display="flex" alignItems="center" gap={1}>
        <Box sx={{ color: color }}>{icon}</Box>
        <Typography variant="body2" fontWeight={600}>
          {status}
        </Typography>
      </Box>
      <Chip 
        label={count} 
        size="small"
        sx={{ 
          backgroundColor: color,
          color: 'white',
          fontWeight: 'bold',
          minWidth: 40
        }}
      />
    </Box>
    <LinearProgress
      variant="determinate"
      value={percentage}
      sx={{
        height: 6,
        borderRadius: 3,
        backgroundColor: `${color}20`,
        '& .MuiLinearProgress-bar': {
          backgroundColor: color,
          borderRadius: 3,
        },
      }}
    />
    <Typography variant="caption" sx={{ color: colors.text.secondary, mt: 0.5, display: 'block' }}>
      {percentage}% capacity
    </Typography>
  </Paper>
);

// Activity Feed Item
const ActivityFeedItem = ({ activity }) => {
  const getActivityConfig = (type, status) => {
    const configs = {
      checkin: { icon: <Person />, color: colors.success, label: 'Check-in' },
      checkout: { icon: <Visibility />, color: colors.primary, label: 'Check-out' },
      maintenance: { icon: <Build />, color: colors.warning, label: 'Maintenance' },
      cleaning: { icon: <CleaningServices />, color: colors.accent, label: 'Housekeeping' },
      reservation: { icon: <CalendarToday />, color: colors.primary, label: 'Reservation' },
      walkin: { icon: <Person />, color: colors.warning, label: 'Walk-in' },
    };
    return configs[type] || configs.checkin;
  };

  const config = getActivityConfig(activity.type, activity.status);
  
  const getStatusChip = (status, priority) => {
    const statusConfig = {
      completed: { color: colors.success, label: 'Completed' },
      pending: { color: priority === 'high' ? colors.error : colors.warning, label: 'Pending' },
      in_progress: { color: colors.accent, label: 'In Progress' },
      confirmed: { color: colors.primary, label: 'Confirmed' },
    };
    const statusInfo = statusConfig[status] || statusConfig.pending;
    
    return (
      <Chip
        label={statusInfo.label}
        size="small"
        sx={{
          backgroundColor: `${statusInfo.color}20`,
          color: statusInfo.color,
          fontWeight: 500,
          fontSize: '0.65rem',
          height: 20,
        }}
      />
    );
  };

  const getActivityText = (activity) => {
    switch (activity.type) {
      case 'checkin':
      case 'checkout':
      case 'reservation':
      case 'walkin':
        return `${activity.guest} - Room ${activity.room}`;
      case 'maintenance':
        return `Room ${activity.room} - ${activity.issue}`;
      case 'cleaning':
        return `Room ${activity.room} cleaning`;
      default:
        return 'System activity';
    }
  };

  return (
    <ListItem sx={{ px: 0, py: 1 }}>
      <ListItemIcon sx={{ minWidth: 40 }}>
        <Box sx={{ 
          color: config.color,
          backgroundColor: `${config.color}15`,
          p: 0.5,
          borderRadius: 1,
          display: 'flex',
          alignItems: 'center',
        }}>
          {config.icon}
        </Box>
      </ListItemIcon>
      <ListItemText
        primary={
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="body2" fontWeight={500}>
              {getActivityText(activity)}
            </Typography>
            {getStatusChip(activity.status, activity.priority)}
          </Box>
        }
        secondary={
          <Box display="flex" justifyContent="space-between" alignItems="center" mt={0.5}>
            <Typography variant="caption" color={colors.text.secondary}>
              {config.label} • {activity.time}
            </Typography>
          </Box>
        }
      />
    </ListItem>
  );
};

// Main PMS Dashboard Component
function StayOpsDashboard() {
  const [currentTime] = useState(new Date().toLocaleString());
  const occupancyRate = Math.round((pmsData.operationalStats.occupiedRooms / pmsData.operationalStats.totalRooms) * 100);
  const totalRooms = pmsData.operationalStats.totalRooms;

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      backgroundColor: colors.background,
    }}>
      {/* Professional Header */}
      <AppBar 
        position="static" 
        sx={{ 
          backgroundColor: colors.surface,
          borderBottom: `1px solid ${colors.border}`,
          boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
        }}
      >
        <Toolbar sx={{ minHeight: '70px !important' }}>
          {/* Logo and Title Section */}
          <Box display="flex" alignItems="center" flexGrow={1}>
            
            <Box>
              <Typography variant="h5" sx={{ 
                color: colors.text.primary,
                fontWeight: 700,
                fontSize: '1.4rem',
                lineHeight: 1.2,
              }}>
                StayOps
              </Typography>
              <Typography variant="body2" sx={{ color: colors.text.secondary, fontSize: '0.85rem' }}>
                ARMS
              </Typography>
            </Box>
          </Box>

          {/* Hotel Info Section */}
          <Box display="flex" alignItems="center" gap={2} mr={3}>
            <Box textAlign="right">
              <Typography variant="body2" fontWeight={600} color={colors.text.primary}>
                {pmsData.hotelInfo.name}
              </Typography>
              <Typography variant="caption" color={colors.text.secondary}>
                {currentTime}
              </Typography>
            </Box>
          </Box>

          {/* Action Buttons */}
          <Box display="flex" alignItems="center" gap={1}>
            <IconButton sx={{ color: colors.text.secondary }}>
              <Search />
            </IconButton>
            <IconButton sx={{ color: colors.text.secondary }}>
              <FilterList />
            </IconButton>
            <IconButton sx={{ color: colors.text.secondary }}>
              <Badge badgeContent={3} color="error">
                <Notifications />
              </Badge>
            </IconButton>
            <Avatar sx={{ 
              bgcolor: colors.primary,
              width: 36,
              height: 36,
              fontWeight: 'bold',
              ml: 1,
            }}>
              FM
            </Avatar>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Breadcrumb Navigation */}
      <Box sx={{ backgroundColor: colors.surface, px: 3, py: 1.5, borderBottom: `1px solid ${colors.border}` }}>
        <Breadcrumbs separator={<NavigateNext fontSize="small" />}>
          <Link href="#" sx={{ display: 'flex', alignItems: 'center', color: colors.text.secondary }}>
            <Home sx={{ mr: 0.5, fontSize: '1rem' }} />
            Dashboard
          </Link>
          <Typography color={colors.text.primary} fontWeight={600}>
            Operations Overview
          </Typography>
        </Breadcrumbs>
      </Box>

      {/* Main Content */}
      <Box sx={{ p: 3 }}>
        {/* Alert Section */}
        <Stack spacing={1} sx={{ mb: 3 }}>
          {pmsData.alerts.slice(0, 2).map((alert) => (
            <Alert 
              key={alert.id}
              severity={alert.type === 'warning' ? 'warning' : alert.type === 'info' ? 'info' : 'success'}
              sx={{ 
                borderRadius: 2,
                '& .MuiAlert-message': { fontSize: '0.875rem' }
              }}
            >
              {alert.message}
            </Alert>
          ))}
        </Stack>

        {/* Key Performance Indicators */}
        <Typography variant="h6" gutterBottom sx={{ 
          fontWeight: 700, 
          color: colors.text.primary,
          mb: 2,
          fontSize: '1.1rem'
        }}>
          Today's Operations
        </Typography>

        <Grid container spacing={2} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} lg={3}>
            <PMSStatCard
              title="Occupancy Rate"
              value={`${occupancyRate}%`}
              subtitle={`${pmsData.operationalStats.occupiedRooms}/${pmsData.operationalStats.totalRooms} rooms`}
              change="+5% vs yesterday"
              changeType="positive"
              color={colors.primary}
            />
          </Grid>
          <Grid item xs={12} sm={6} lg={3}>
            <PMSStatCard
              title="Today's Revenue"
              value={`$${pmsData.operationalStats.revenue.toLocaleString()}`}
              subtitle={`ADR: $${pmsData.operationalStats.averageRate}`}
              change="+8.2% vs yesterday"
              changeType="positive"
              color={colors.success}
            />
          </Grid>
          <Grid item xs={12} sm={6} lg={3}>
            <PMSStatCard
              title="Check-ins Pending"
              value={pmsData.operationalStats.pendingCheckIns}
              subtitle={`${pmsData.operationalStats.checkIns} completed today`}
              change="3 overdue"
              changeType="negative"
              color={colors.warning}
            />
          </Grid>
          <Grid item xs={12} sm={6} lg={3}>
            <PMSStatCard
              title="Available Rooms"
              value={pmsData.operationalStats.availableRooms}
              subtitle={`${pmsData.operationalStats.outOfOrderRooms} out of order`}
              color={colors.accent}
            />
          </Grid>
        </Grid>

        {/* Room Status Overview */}
        <Typography variant="h6" gutterBottom sx={{ 
          fontWeight: 700, 
          color: colors.text.primary,
          mb: 2,
          fontSize: '1.1rem'
        }}>
          Room Status Distribution
        </Typography>
        
        <Grid container spacing={2} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={2.4}>
            <RoomStatusOverview
              status="Occupied"
              count={pmsData.roomStatus.occupied}
              percentage={Math.round((pmsData.roomStatus.occupied / totalRooms) * 100)}
              color={colors.important}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <RoomStatusOverview
              status="Available"
              count={pmsData.roomStatus.available}
              percentage={Math.round((pmsData.roomStatus.available / totalRooms) * 100)}
              color={colors.important}
              icon={<CheckCircle />}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <RoomStatusOverview
              status="Reserved"
              count={pmsData.roomStatus.reserved}
              percentage={Math.round((pmsData.roomStatus.reserved / totalRooms) * 100)}
              color={colors.important}
              icon={<CalendarToday />}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <RoomStatusOverview
              status="Maintenance"
              count={pmsData.roomStatus.maintenance}
              percentage={Math.round((pmsData.roomStatus.maintenance / totalRooms) * 100)}
              color={colors.important}
              icon={<Build />}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <RoomStatusOverview
              status="Cleaning"
              count={pmsData.roomStatus.cleaning}
              percentage={Math.round((pmsData.roomStatus.cleaning / totalRooms) * 100)}
              color={colors.important}
              icon={<CleaningServices />}
            />
          </Grid>
        </Grid>

        {/* Activity Feed and Quick Actions */}
        <Grid container spacing={3}>
          <Grid item xs={12} lg={8}>
            <Paper sx={{ 
              border: `1px solid ${colors.border}`,
              borderRadius: 2,
              overflow: 'hidden'
            }}>
              <Box sx={{ 
                p: 2.5, 
                backgroundColor: colors.surface,
                borderBottom: `1px solid ${colors.border}`,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: colors.text.primary, fontSize: '1.1rem' }}>
                  Live Activity Feed
                </Typography>
                <IconButton size="small" sx={{ color: colors.text.secondary }}>
                  <Refresh />
                </IconButton>
              </Box>
              <Box sx={{ maxHeight: '400px', overflow: 'auto' }}>
                <List sx={{ p: 0 }}>
                  {pmsData.recentActivities.map((activity, index) => (
                    <Box key={activity.id}>
                      <ActivityFeedItem activity={activity} />
                      {index < pmsData.recentActivities.length - 1 && (
                        <Divider variant="inset" sx={{ ml: 6 }} />
                      )}
                    </Box>
                  ))}
                </List>
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12} lg={4}>
            <Paper sx={{ 
              border: `1px solid ${colors.border}`,
              borderRadius: 2,
              p: 2.5,
              mb: 3,
            }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 700, color: colors.text.primary, fontSize: '1.1rem' }}>
                Quick Actions
              </Typography>
              
              <Stack spacing={1.5}>
                <Button
                  variant="contained"
                  startIcon={<Person />}
                  fullWidth
                  sx={{ 
                    backgroundColor: colors.primary,
                    py: 1.2,
                    justifyContent: 'flex-start',
                    textTransform: 'none',
                    fontWeight: 600
                  }}
                >
                  Guest Check-in
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<CalendarToday />}
                  fullWidth
                  sx={{ 
                    borderColor: colors.border,
                    color: colors.text.primary,
                    py: 1.2,
                    justifyContent: 'flex-start',
                    textTransform: 'none',
                    fontWeight: 600
                  }}
                >
                  New Reservation
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Build />}
                  fullWidth
                  sx={{ 
                    borderColor: colors.border,
                    color: colors.text.primary,
                    py: 1.2,
                    justifyContent: 'flex-start',
                    textTransform: 'none',
                    fontWeight: 600
                  }}
                >
                  Maintenance Request
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Assessment />}
                  fullWidth
                  sx={{ 
                    borderColor: colors.border,
                    color: colors.text.primary,
                    py: 1.2,
                    justifyContent: 'flex-start',
                    textTransform: 'none',
                    fontWeight: 600
                  }}
                >
                  Generate Report
                </Button>
              </Stack>
            </Paper>

            {/* Hotel Contact Info */}
            <Paper sx={{ 
              border: `1px solid ${colors.border}`,
              borderRadius: 2,
              p: 2.5,
            }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 700, color: colors.text.primary, fontSize: '1.1rem' }}>
                Property Information
              </Typography>
              
              <Stack spacing={1.5}>
                <Box display="flex" alignItems="center" gap={1.5}>
                  <LocationOn sx={{ color: colors.text.secondary, fontSize: '1.1rem' }} />
                  <Typography variant="body2" color={colors.text.secondary}>
                    {pmsData.hotelInfo.address}
                  </Typography>
                </Box>
                <Box display="flex" alignItems="center" gap={1.5}>
                  <Phone sx={{ color: colors.text.secondary, fontSize: '1.1rem' }} />
                  <Typography variant="body2" color={colors.text.secondary}>
                    {pmsData.hotelInfo.phone}
                  </Typography>
                </Box>
                <Box display="flex" alignItems="center" gap={1.5}>
                  <Schedule sx={{ color: colors.text.secondary, fontSize: '1.1rem' }} />
                  <Typography variant="body2" color={colors.text.secondary}>
                    24/7 Operations
                  </Typography>
                </Box>
              </Stack>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}

export default StayOpsDashboard;