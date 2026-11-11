import React, { useState, useEffect } from 'react';
import { useApp } from '../../../context/AppContext';
import {
  TransportRoute,
  FleetVehicle,
  RouteStop,
  StudentTransportAssignment,
  VehicleMaintenanceLog,
  TransportIncident,
  TransportAnnouncement,
} from '../../../types';
import { MetricCard } from '../../common/MetricCard';
import { StatusBadge } from '../../common/StatusBadge';
import { Modal } from '../../common/Modal';
import {
  Bus,
  MapPin,
  Clock,
  Users,
  Shield,
  Search,
  Plus,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Phone,
  ArrowRight,
  ChevronRight,
  Calendar,
  Layers,
  Settings,
  Edit2,
  Trash2,
  Eye,
  AlertCircle,
  FileText,
  UserCheck,
  Compass,
  Printer,
  Download,
  Wrench,
  Megaphone,
  Check,
  XCircle,
  User,
  ShieldCheck,
} from 'lucide-react';

// Local storage keys for transport local state extensions
const TR_VEHICLES_KEY = 'schlar_fleet_vehicles_v1';
const TR_STOPS_KEY = 'schlar_route_stops_v1';
const TR_ASSIGNMENTS_KEY = 'schlar_transport_assignments_v1';
const TR_MAINTENANCE_KEY = 'schlar_maintenance_logs_v1';
const TR_INCIDENTS_KEY = 'schlar_transport_incidents_v1';
const TR_ANNOUNCEMENTS_KEY = 'schlar_transport_announcements_v1';
const TR_POLICIES_KEY = 'schlar_transport_policies_v1';

export const TransportView: React.FC = () => {
  const {
    state,
    addTransportRoute,
    updateTransportRoute,
    deleteTransportRoute,
    addToast,
    setActiveNav,
  } = useApp();

  const routes = state.transportRoutes || [];

  // Transport Policies State
  const [policies, setPolicies] = useState({
    maxTransitMinutes: 45,
    speedGovernorKmh: 40,
    emergencyHotline: '+1 (555) 891-9900',
    chaperoneRequiredForElementary: true,
    notificationThresholdMinutes: 10,
    preTripInspectionMandatory: true,
  });

  // Fleet Vehicles State
  const [vehicles, setVehicles] = useState<FleetVehicle[]>(() => {
    try {
      const stored = localStorage.getItem(TR_VEHICLES_KEY);
      if (stored) return JSON.parse(stored);
    } catch {
      // fallback
    }
    return [
      {
        id: 'veh-1',
        vehicleNumber: 'GIS-B-01',
        makeModel: 'Mercedes-Benz Sprinter 516 CDI',
        vehicleType: 'School Bus',
        capacity: 36,
        assignedRouteId: 'rt-1',
        assignedRouteCode: 'BUS-01',
        driverName: 'Robert Kowalski',
        driverPhone: '+1 (555) 891-2011',
        status: 'Active',
        insuranceExpiry: '2027-04-15',
        fitnessInspectionExpiry: '2027-01-20',
        odometerKm: 42150,
        fuelType: 'Diesel',
        year: 2023,
      },
      {
        id: 'veh-2',
        vehicleNumber: 'GIS-B-02',
        makeModel: 'Blue Bird All American Forward Engine',
        vehicleType: 'School Bus',
        capacity: 44,
        assignedRouteId: 'rt-2',
        assignedRouteCode: 'BUS-02',
        driverName: 'Maria Santos',
        driverPhone: '+1 (555) 891-2012',
        status: 'Active',
        insuranceExpiry: '2027-05-10',
        fitnessInspectionExpiry: '2027-02-15',
        odometerKm: 58900,
        fuelType: 'Diesel',
        year: 2022,
      },
      {
        id: 'veh-3',
        vehicleNumber: 'GIS-B-03',
        makeModel: 'Ashok Leyland Falcon Urban Cruiser',
        vehicleType: 'School Bus',
        capacity: 40,
        assignedRouteId: 'rt-3',
        assignedRouteCode: 'BUS-03',
        driverName: 'Tariq Al-Mansoor',
        driverPhone: '+1 (555) 891-2013',
        status: 'Active',
        insuranceExpiry: '2027-03-30',
        fitnessInspectionExpiry: '2026-12-10',
        odometerKm: 34100,
        fuelType: 'CNG',
        year: 2024,
      },
      {
        id: 'veh-4',
        vehicleNumber: 'GIS-B-04',
        makeModel: 'Ford Transit 350 HD Extended',
        vehicleType: 'Mini Bus',
        capacity: 30,
        assignedRouteId: 'rt-4',
        assignedRouteCode: 'BUS-04',
        driverName: 'David O\'Connor',
        driverPhone: '+1 (555) 891-2014',
        status: 'Active',
        insuranceExpiry: '2027-06-25',
        fitnessInspectionExpiry: '2027-03-15',
        odometerKm: 27400,
        fuelType: 'Diesel',
        year: 2023,
      },
      {
        id: 'veh-5',
        vehicleNumber: 'GIS-B-05',
        makeModel: 'Thomas Built Saf-T-Liner C2',
        vehicleType: 'School Bus',
        capacity: 48,
        status: 'Under Maintenance',
        driverName: 'Marcus Wright',
        driverPhone: '+1 (555) 891-2015',
        insuranceExpiry: '2027-02-18',
        fitnessInspectionExpiry: '2026-11-05',
        odometerKm: 76200,
        fuelType: 'Diesel',
        year: 2021,
        notes: 'Scheduled for annual brake caliper replacement and tire rotation',
      },
      {
        id: 'veh-6',
        vehicleNumber: 'GIS-V-06',
        makeModel: 'Chevrolet Express Passenger 3500',
        vehicleType: 'Transit Van',
        capacity: 15,
        status: 'Active',
        driverName: 'Elena Rostova',
        driverPhone: '+1 (555) 891-2016',
        insuranceExpiry: '2027-07-12',
        fitnessInspectionExpiry: '2027-04-18',
        odometerKm: 18400,
        fuelType: 'Diesel',
        year: 2024,
        notes: 'Special educational needs & athletic team shuttle',
      },
    ];
  });

  // Route Stops State
  const [stops, setStops] = useState<RouteStop[]>(() => {
    try {
      const stored = localStorage.getItem(TR_STOPS_KEY);
      if (stored) return JSON.parse(stored);
    } catch {
      // fallback
    }
    return [
      // Route 1 Stops
      { id: 'stp-1-1', routeId: 'rt-1', routeCode: 'BUS-01', stopName: 'Pine Crest Community Center', stopSequence: 1, pickupTime: '07:15 AM', dropTime: '03:45 PM', areaLandmark: 'Community Park Gate A', assignedStudentCount: 8 },
      { id: 'stp-1-2', routeId: 'rt-1', routeCode: 'BUS-01', stopName: 'Oakwood Avenue & 4th Street', stopSequence: 2, pickupTime: '07:25 AM', dropTime: '03:35 PM', areaLandmark: 'Public Library Bus Shelter', assignedStudentCount: 11 },
      { id: 'stp-1-3', routeId: 'rt-1', routeCode: 'BUS-01', stopName: 'Sunset Valley Town Square', stopSequence: 3, pickupTime: '07:38 AM', dropTime: '03:22 PM', areaLandmark: 'Clock Tower Junction', assignedStudentCount: 9 },
      { id: 'stp-1-4', routeId: 'rt-1', routeCode: 'BUS-01', stopName: 'Greenfield Campus Gate 1', stopSequence: 4, pickupTime: '07:55 AM', dropTime: '03:10 PM', areaLandmark: 'Main Campus Drop Loop', assignedStudentCount: 28 },

      // Route 2 Stops
      { id: 'stp-2-1', routeId: 'rt-2', routeCode: 'BUS-02', stopName: 'Silver Lake Recreation Park', stopSequence: 1, pickupTime: '07:05 AM', dropTime: '03:55 PM', areaLandmark: 'Boat House Entrance', assignedStudentCount: 10 },
      { id: 'stp-2-2', routeId: 'rt-2', routeCode: 'BUS-02', stopName: 'Highland Boulevard Plaza', stopSequence: 2, pickupTime: '07:20 AM', dropTime: '03:40 PM', areaLandmark: 'Plaza Metro Crosswalk', assignedStudentCount: 14 },
      { id: 'stp-2-3', routeId: 'rt-2', routeCode: 'BUS-02', stopName: 'Maplewood Heights North', stopSequence: 3, pickupTime: '07:35 AM', dropTime: '03:25 PM', areaLandmark: 'Fire Station Roundabout', assignedStudentCount: 14 },
      { id: 'stp-2-4', routeId: 'rt-2', routeCode: 'BUS-02', stopName: 'Greenfield Campus Gate 2', stopSequence: 4, pickupTime: '07:50 AM', dropTime: '03:15 PM', areaLandmark: 'North Athletic Wing', assignedStudentCount: 38 },

      // Route 3 Stops
      { id: 'stp-3-1', routeId: 'rt-3', routeCode: 'BUS-03', stopName: 'Cedar Way Park & Ride', stopSequence: 1, pickupTime: '07:10 AM', dropTime: '03:50 PM', areaLandmark: 'Commuter Lot Bay 3', assignedStudentCount: 12 },
      { id: 'stp-3-2', routeId: 'rt-3', routeCode: 'BUS-03', stopName: 'South Hill Medical Center', stopSequence: 2, pickupTime: '07:24 AM', dropTime: '03:36 PM', areaLandmark: 'Pediatric Pavilion Entrance', assignedStudentCount: 12 },
      { id: 'stp-3-3', routeId: 'rt-3', routeCode: 'BUS-03', stopName: 'Greenfield Campus Gate 1', stopSequence: 3, pickupTime: '07:45 AM', dropTime: '03:15 PM', areaLandmark: 'Main Campus Drop Loop', assignedStudentCount: 34 },

      // Route 4 Stops
      { id: 'stp-4-1', routeId: 'rt-4', routeCode: 'BUS-04', stopName: 'Metro Station Plaza, Downtown', stopSequence: 1, pickupTime: '07:30 AM', dropTime: '03:35 PM', areaLandmark: 'Transit Terminal Bay 5', assignedStudentCount: 12 },
      { id: 'stp-4-2', routeId: 'rt-4', routeCode: 'BUS-04', stopName: 'Central Quad Botanical Gardens', stopSequence: 2, pickupTime: '07:42 AM', dropTime: '03:20 PM', areaLandmark: 'Gardens North Pavilion', assignedStudentCount: 10 },
      { id: 'stp-4-3', routeId: 'rt-4', routeCode: 'BUS-04', stopName: 'Greenfield Campus Gate 3', stopSequence: 3, pickupTime: '07:55 AM', dropTime: '03:10 PM', areaLandmark: 'Junior School Bus Bay', assignedStudentCount: 22 },
    ];
  });

  // Student Transport Allocations State
  const [assignments, setAssignments] = useState<StudentTransportAssignment[]>(() => {
    try {
      const stored = localStorage.getItem(TR_ASSIGNMENTS_KEY);
      if (stored) return JSON.parse(stored);
    } catch {
      // fallback
    }
    return [
      {
        id: 'asg-1',
        studentId: 'std-aarav',
        studentName: 'Aarav Sharma',
        admissionId: 'GIS-2022-0142',
        class: 'Grade 8A',
        routeId: 'rt-1',
        routeCode: 'BUS-01',
        routeName: 'Route 1 — Northgate & Pine Crest',
        pickupStopId: 'stp-1-1',
        pickupStopName: 'Pine Crest Community Center',
        dropStopId: 'stp-1-1',
        dropStopName: 'Pine Crest Community Center',
        guardianName: 'Vikram Sharma',
        guardianPhone: '+1 (555) 492-8810',
        effectiveDate: '2026-08-17',
        status: 'Active',
      },
      {
        id: 'asg-2',
        studentId: 'std-ananya',
        studentName: 'Ananya Sharma',
        admissionId: 'GIS-2025-0319',
        class: 'Grade 5B',
        routeId: 'rt-1',
        routeCode: 'BUS-01',
        routeName: 'Route 1 — Northgate & Pine Crest',
        pickupStopId: 'stp-1-1',
        pickupStopName: 'Pine Crest Community Center',
        dropStopId: 'stp-1-1',
        dropStopName: 'Pine Crest Community Center',
        guardianName: 'Vikram Sharma',
        guardianPhone: '+1 (555) 492-8810',
        effectiveDate: '2026-08-17',
        status: 'Active',
      },
      {
        id: 'asg-3',
        studentId: 'std-rohan',
        studentName: 'Rohan Mehta',
        admissionId: 'GIS-2020-0089',
        class: 'Grade 10A',
        routeId: 'rt-2',
        routeCode: 'BUS-02',
        routeName: 'Route 2 — Westend & Silver Lake',
        pickupStopId: 'stp-2-2',
        pickupStopName: 'Highland Boulevard Plaza',
        dropStopId: 'stp-2-2',
        dropStopName: 'Highland Boulevard Plaza',
        guardianName: 'Dr. Alok Mehta',
        guardianPhone: '+1 (555) 301-4491',
        effectiveDate: '2026-08-17',
        status: 'Active',
      },
      {
        id: 'asg-4',
        studentId: 'std-priya',
        studentName: 'Priya Patel',
        admissionId: 'GIS-2021-0177',
        class: 'Grade 10A',
        routeId: 'rt-3',
        routeCode: 'BUS-03',
        routeName: 'Route 3 — South Hill & Cedar Way',
        pickupStopId: 'stp-3-1',
        pickupStopName: 'Cedar Way Park & Ride',
        dropStopId: 'stp-3-1',
        dropStopName: 'Cedar Way Park & Ride',
        guardianName: 'Sunita Patel',
        guardianPhone: '+1 (555) 712-3301',
        effectiveDate: '2026-08-17',
        status: 'Active',
      },
      {
        id: 'asg-5',
        studentId: 'std-kevin',
        studentName: 'Kevin Vance',
        admissionId: 'GIS-2020-0044',
        class: 'Grade 10B',
        routeId: 'rt-4',
        routeCode: 'BUS-04',
        routeName: 'Route 4 — Downtown & Central Quad',
        pickupStopId: 'stp-4-1',
        pickupStopName: 'Metro Station Plaza, Downtown',
        dropStopId: 'stp-4-1',
        dropStopName: 'Metro Station Plaza, Downtown',
        guardianName: 'Arthur Vance',
        guardianPhone: '+1 (555) 819-2044',
        effectiveDate: '2026-08-17',
        status: 'Active',
      },
    ];
  });

  // Fleet Maintenance State
  const [maintenanceLogs, setMaintenanceLogs] = useState<VehicleMaintenanceLog[]>(() => {
    try {
      const stored = localStorage.getItem(TR_MAINTENANCE_KEY);
      if (stored) return JSON.parse(stored);
    } catch {
      // fallback
    }
    return [
      {
        id: 'mnt-1',
        vehicleNumber: 'GIS-B-05',
        vehicleId: 'veh-5',
        serviceType: 'Brake Inspection',
        serviceDate: '2026-10-18',
        nextDueDate: '2027-04-18',
        status: 'In Progress',
        odometerReadingKm: 76200,
        workshopVendor: 'Metro Commercial Fleet Service',
        cost: 650.0,
        technicianNotes: 'Front disc rotor resurfacing and master cylinder fluid flush.',
      },
      {
        id: 'mnt-2',
        vehicleNumber: 'GIS-B-01',
        vehicleId: 'veh-1',
        serviceType: 'Routine Service',
        serviceDate: '2026-09-12',
        nextDueDate: '2027-03-12',
        status: 'Completed',
        odometerReadingKm: 40000,
        workshopVendor: 'Mercedes-Benz Authorized Service',
        cost: 420.0,
        technicianNotes: 'Engine synthetic oil change, fuel filter replacement, and tire pressure check.',
      },
      {
        id: 'mnt-3',
        vehicleNumber: 'GIS-B-02',
        vehicleId: 'veh-2',
        serviceType: 'Tire Replacement',
        serviceDate: '2026-08-04',
        nextDueDate: '2027-02-04',
        status: 'Completed',
        odometerReadingKm: 55000,
        workshopVendor: 'Goodyear Fleet Care',
        cost: 1100.0,
        technicianNotes: 'Replaced rear dual tires with all-weather heavy commercial tires.',
      },
    ];
  });

  // Transport Incidents State
  const [incidents, setIncidents] = useState<TransportIncident[]>(() => {
    try {
      const stored = localStorage.getItem(TR_INCIDENTS_KEY);
      if (stored) return JSON.parse(stored);
    } catch {
      // fallback
    }
    return [
      {
        id: 'inc-1',
        incidentRef: 'INC-TR-2026-01',
        date: '2026-10-14',
        time: '07:40 AM',
        routeCode: 'BUS-03',
        vehicleNumber: 'GIS-B-03',
        category: 'Minor Delay',
        severity: 'Low',
        description: 'Highway exit 14 resurfacing caused 12-minute standstill on Cedar Way approach.',
        resolutionStatus: 'Resolved',
        actionTaken: 'Driver notified dispatch; SMS bulletin transmitted to Cedar Way stop parents.',
        reportedBy: 'Tariq Al-Mansoor',
      },
      {
        id: 'inc-2',
        incidentRef: 'INC-TR-2026-02',
        date: '2026-09-22',
        time: '03:45 PM',
        routeCode: 'BUS-01',
        vehicleNumber: 'GIS-B-01',
        category: 'Route Detour',
        severity: 'Low',
        description: 'Water main repair closed Oakwood Avenue between 3rd and 5th Street.',
        resolutionStatus: 'Resolved',
        actionTaken: 'Detoured safely via Maple Boulevard with zero student drop-off delays.',
        reportedBy: 'Robert Kowalski',
      },
    ];
  });

  // Transport Announcements State
  const [announcements, setAnnouncements] = useState<TransportAnnouncement[]>(() => {
    try {
      const stored = localStorage.getItem(TR_ANNOUNCEMENTS_KEY);
      if (stored) return JSON.parse(stored);
    } catch {
      // fallback
    }
    return [
      {
        id: 'ann-1',
        title: 'Route 3 Morning Pickup Time Adjustment',
        routeCode: 'BUS-03',
        audience: 'Route 3 Parents & Riders',
        message: 'Starting Monday, Cedar Way stop pickup will commence 5 minutes earlier at 07:05 AM to avoid morning construction.',
        date: '2026-10-15',
        priority: 'High',
        author: 'Gary Vance (Transport Director)',
      },
      {
        id: 'ann-2',
        title: 'Winter Pre-Trip Vehicle Safety Checks Complete',
        routeCode: 'ALL',
        audience: 'Campus Community',
        message: 'All six fleet vehicles have passed emergency braking and heating inspections for the upcoming cold semester.',
        date: '2026-10-01',
        priority: 'Normal',
        author: 'Gary Vance (Transport Director)',
      },
    ];
  });

  // Local storage persistence
  useEffect(() => {
    localStorage.setItem(TR_VEHICLES_KEY, JSON.stringify(vehicles));
  }, [vehicles]);

  useEffect(() => {
    localStorage.setItem(TR_STOPS_KEY, JSON.stringify(stops));
  }, [stops]);

  useEffect(() => {
    localStorage.setItem(TR_ASSIGNMENTS_KEY, JSON.stringify(assignments));
  }, [assignments]);

  useEffect(() => {
    localStorage.setItem(TR_MAINTENANCE_KEY, JSON.stringify(maintenanceLogs));
  }, [maintenanceLogs]);

  useEffect(() => {
    localStorage.setItem(TR_INCIDENTS_KEY, JSON.stringify(incidents));
  }, [incidents]);

  useEffect(() => {
    localStorage.setItem(TR_ANNOUNCEMENTS_KEY, JSON.stringify(announcements));
  }, [announcements]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(TR_POLICIES_KEY);
      if (stored) setPolicies(JSON.parse(stored));
    } catch {
      // fallback
    }

    const handleReset = () => {
      localStorage.removeItem(TR_VEHICLES_KEY);
      localStorage.removeItem(TR_STOPS_KEY);
      localStorage.removeItem(TR_ASSIGNMENTS_KEY);
      localStorage.removeItem(TR_MAINTENANCE_KEY);
      localStorage.removeItem(TR_INCIDENTS_KEY);
      localStorage.removeItem(TR_ANNOUNCEMENTS_KEY);
      localStorage.removeItem(TR_POLICIES_KEY);
      setPolicies({
        maxTransitMinutes: 45,
        speedGovernorKmh: 40,
        emergencyHotline: '+1 (555) 891-9900',
        chaperoneRequiredForElementary: true,
        notificationThresholdMinutes: 10,
        preTripInspectionMandatory: true,
      });
    };
    window.addEventListener('schlar_demo_reset', handleReset);
    return () => window.removeEventListener('schlar_demo_reset', handleReset);
  }, []);

  // UI Filter and Search State
  const [routeSearch, setRouteSearch] = useState('');
  const [routeStatusFilter, setRouteStatusFilter] = useState('All');
  const [selectedRouteForView, setSelectedRouteForView] = useState<TransportRoute | null>(null);

  // Modals State
  const [isAddRouteModalOpen, setIsAddRouteModalOpen] = useState(false);
  const [isEditRouteModalOpen, setIsEditRouteModalOpen] = useState(false);
  const [selectedRouteForEdit, setSelectedRouteForEdit] = useState<TransportRoute | null>(null);
  const [deleteConfirmRoute, setDeleteConfirmRoute] = useState<TransportRoute | null>(null);

  const [isAddVehicleModalOpen, setIsAddVehicleModalOpen] = useState(false);
  const [isEditVehicleModalOpen, setIsEditVehicleModalOpen] = useState(false);
  const [selectedVehicleForEdit, setSelectedVehicleForEdit] = useState<FleetVehicle | null>(null);
  const [selectedVehicleForView, setSelectedVehicleForView] = useState<FleetVehicle | null>(null);

  const [isAssignStudentModalOpen, setIsAssignStudentModalOpen] = useState(false);
  const [assignStudentId, setAssignStudentId] = useState('');
  const [assignRouteId, setAssignRouteId] = useState('');
  const [assignPickupStopId, setAssignPickupStopId] = useState('');
  const [assignDropStopId, setAssignDropStopId] = useState('');

  const [isAddMaintenanceModalOpen, setIsAddMaintenanceModalOpen] = useState(false);
  const [maintenanceForm, setMaintenanceForm] = useState({
    vehicleNumber: 'GIS-B-01',
    serviceType: 'Routine Service' as VehicleMaintenanceLog['serviceType'],
    cost: 350,
    workshopVendor: 'Metro Commercial Fleet Service',
    technicianNotes: 'Standard quarterly scheduled servicing and inspection',
  });

  const [isAddIncidentModalOpen, setIsAddIncidentModalOpen] = useState(false);
  const [incidentForm, setIncidentForm] = useState({
    routeCode: 'BUS-01',
    vehicleNumber: 'GIS-B-01',
    category: 'Minor Delay' as TransportIncident['category'],
    severity: 'Low' as TransportIncident['severity'],
    description: '',
    actionTaken: '',
  });

  const [isAddAnnouncementModalOpen, setIsAddAnnouncementModalOpen] = useState(false);
  const [announcementForm, setAnnouncementForm] = useState({
    title: '',
    routeCode: 'ALL',
    message: '',
    priority: 'Normal' as TransportAnnouncement['priority'],
  });

  const [selectedRosterRouteId, setSelectedRosterRouteId] = useState<string>('rt-1');

  // Form State for New Route
  const [routeFormData, setRouteFormData] = useState({
    routeName: '',
    routeCode: '',
    startPoint: '',
    endPoint: 'Greenfield International Campus Gate 1',
    vehicleNumber: 'GIS-B-05',
    driverName: 'Robert Kowalski',
    driverPhone: '+1 (555) 891-2011',
    capacity: 36,
    assignedStudents: 0,
    morningPickupTime: '07:30 AM',
    afternoonDropTime: '03:30 PM',
    status: 'Idle' as TransportRoute['status'],
  });

  // Form State for New Vehicle
  const [vehicleFormData, setVehicleFormData] = useState({
    vehicleNumber: '',
    makeModel: '',
    vehicleType: 'School Bus' as FleetVehicle['vehicleType'],
    capacity: 36,
    status: 'Active' as FleetVehicle['status'],
    insuranceExpiry: '2027-08-30',
    fitnessInspectionExpiry: '2027-02-28',
    odometerKm: 25000,
    fuelType: 'Diesel' as FleetVehicle['fuelType'],
    year: 2024,
  });

  // Calculated Metrics
  const totalFleetCapacity = routes.reduce((sum, r) => sum + r.capacity, 0);
  const totalAssignedRiders = routes.reduce((sum, r) => sum + r.assignedStudents, 0);
  const activeRoutesCount = routes.filter((r) => r.status === 'On Route').length;
  const activeVehiclesCount = vehicles.filter((v) => v.status === 'Active').length;
  const maintenanceVehiclesCount = vehicles.filter((v) => v.status === 'Under Maintenance').length;
  const fleetUtilizationRate = totalFleetCapacity > 0 ? Math.round((totalAssignedRiders / totalFleetCapacity) * 100) : 0;

  // Filtered routes
  const filteredRoutes = routes.filter((r) => {
    const q = routeSearch.toLowerCase();
    const matchSearch =
      r.routeName.toLowerCase().includes(q) ||
      r.routeCode.toLowerCase().includes(q) ||
      r.driverName.toLowerCase().includes(q) ||
      r.vehicleNumber.toLowerCase().includes(q) ||
      r.startPoint.toLowerCase().includes(q);
    const matchStatus = routeStatusFilter === 'All' || r.status === routeStatusFilter;
    return matchSearch && matchStatus;
  });

  // Drivers list derived from vehicles and staff
  const driversList = [
    { name: 'Robert Kowalski', licence: 'CDL-GIS-8811', expiry: '2028-09-15', phone: '+1 (555) 891-2011', bus: 'GIS-B-01', route: 'BUS-01', status: 'Active', exp: '12 Yrs', rating: 4.9 },
    { name: 'Maria Santos', licence: 'CDL-GIS-8812', expiry: '2028-11-20', phone: '+1 (555) 891-2012', bus: 'GIS-B-02', route: 'BUS-02', status: 'Active', exp: '9 Yrs', rating: 5.0 },
    { name: 'Tariq Al-Mansoor', licence: 'CDL-GIS-8813', expiry: '2027-06-10', phone: '+1 (555) 891-2013', bus: 'GIS-B-03', route: 'BUS-03', status: 'Active', exp: '14 Yrs', rating: 4.8 },
    { name: 'David O\'Connor', licence: 'CDL-GIS-8814', expiry: '2028-01-25', phone: '+1 (555) 891-2014', bus: 'GIS-B-04', route: 'BUS-04', status: 'Active', exp: '7 Yrs', rating: 4.9 },
    { name: 'Marcus Wright', licence: 'CDL-GIS-8815', expiry: '2027-12-14', phone: '+1 (555) 891-2015', bus: 'GIS-B-05', route: 'Reserve', status: 'On Leave', exp: '11 Yrs', rating: 4.7 },
  ];

  // Attendants List
  const attendantsList = [
    { name: 'Helena Troy', role: 'Bus Safety Attendant', route: 'BUS-01', shift: 'Morning & Afternoon', phone: '+1 (555) 720-1101' },
    { name: 'Chloe Bennett', role: 'Junior School Chaperone', route: 'BUS-02', shift: 'Morning & Afternoon', phone: '+1 (555) 720-1102' },
    { name: 'Rajesh Nair', role: 'Transit Dispatch Officer', route: 'Terminal Gate 1', shift: 'Full Day Shift', phone: '+1 (555) 720-1103' },
    { name: 'Samantha Cole', role: 'Bus Safety Attendant', route: 'BUS-03', shift: 'Morning & Afternoon', phone: '+1 (555) 720-1104' },
  ];

  // CREATE ROUTE
  const handleCreateRoute = (e: React.FormEvent) => {
    e.preventDefault();
    if (!routeFormData.routeName.trim() || !routeFormData.routeCode.trim()) {
      addToast('Validation', 'Route name and route code are required fields.', 'error');
      return;
    }

    // Check duplicate code
    if (routes.some((r) => r.routeCode.toUpperCase() === routeFormData.routeCode.trim().toUpperCase())) {
      addToast('Duplicate Code', `Route code ${routeFormData.routeCode} is already registered.`, 'error');
      return;
    }

    addTransportRoute({
      ...routeFormData,
      routeCode: routeFormData.routeCode.trim().toUpperCase(),
      capacity: Number(routeFormData.capacity) || 36,
      assignedStudents: 0,
    });

    setIsAddRouteModalOpen(false);
    setRouteFormData({
      routeName: '',
      routeCode: '',
      startPoint: '',
      endPoint: 'Greenfield International Campus Gate 1',
      vehicleNumber: 'GIS-B-05',
      driverName: 'Robert Kowalski',
      driverPhone: '+1 (555) 891-2011',
      capacity: 36,
      assignedStudents: 0,
      morningPickupTime: '07:30 AM',
      afternoonDropTime: '03:30 PM',
      status: 'Idle',
    });
  };

  // UPDATE ROUTE
  const handleUpdateRoute = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRouteForEdit) return;

    updateTransportRoute(selectedRouteForEdit);
    setIsEditRouteModalOpen(false);
    setSelectedRouteForEdit(null);
  };

  // DELETE ROUTE
  const handleDeleteRoute = () => {
    if (!deleteConfirmRoute) return;
    deleteTransportRoute(deleteConfirmRoute.id);
    setDeleteConfirmRoute(null);
  };

  // ADD VEHICLE
  const handleCreateVehicle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vehicleFormData.vehicleNumber.trim() || !vehicleFormData.makeModel.trim()) {
      addToast('Validation', 'Vehicle plate number and make/model are required.', 'error');
      return;
    }

    if (vehicles.some((v) => v.vehicleNumber.toUpperCase() === vehicleFormData.vehicleNumber.trim().toUpperCase())) {
      addToast('Duplicate Plate', `Vehicle plate ${vehicleFormData.vehicleNumber} already exists.`, 'error');
      return;
    }

    const newVeh: FleetVehicle = {
      id: 'veh-' + Date.now(),
      vehicleNumber: vehicleFormData.vehicleNumber.trim().toUpperCase(),
      makeModel: vehicleFormData.makeModel.trim(),
      vehicleType: vehicleFormData.vehicleType,
      capacity: Number(vehicleFormData.capacity) || 36,
      status: vehicleFormData.status,
      insuranceExpiry: vehicleFormData.insuranceExpiry,
      fitnessInspectionExpiry: vehicleFormData.fitnessInspectionExpiry,
      odometerKm: Number(vehicleFormData.odometerKm) || 0,
      fuelType: vehicleFormData.fuelType,
      year: Number(vehicleFormData.year) || 2024,
    };

    setVehicles((prev) => [...prev, newVeh]);
    setIsAddVehicleModalOpen(false);
    setVehicleFormData({
      vehicleNumber: '',
      makeModel: '',
      vehicleType: 'School Bus',
      capacity: 36,
      status: 'Active',
      insuranceExpiry: '2027-08-30',
      fitnessInspectionExpiry: '2027-02-28',
      odometerKm: 25000,
      fuelType: 'Diesel',
      year: 2024,
    });
    addToast('Vehicle Registered', `Fleet vehicle ${newVeh.vehicleNumber} added to registry.`, 'success');
  };

  // ASSIGN STUDENT WORKFLOW
  const handleAssignStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignStudentId || !assignRouteId || !assignPickupStopId || !assignDropStopId) {
      addToast('Validation', 'Please select student, active route, and both stops.', 'error');
      return;
    }

    const student = state.students.find((s) => s.id === assignStudentId);
    const targetRoute = routes.find((r) => r.id === assignRouteId);
    const pStop = stops.find((s) => s.id === assignPickupStopId);
    const dStop = stops.find((s) => s.id === assignDropStopId);

    if (!student || !targetRoute || !pStop || !dStop) {
      addToast('Validation', 'Selected parameters are invalid.', 'error');
      return;
    }

    // SAFEGUARD: Check Route Capacity
    if (targetRoute.assignedStudents >= targetRoute.capacity) {
      addToast(
        'Capacity Exceeded',
        `Route ${targetRoute.routeCode} is at maximum capacity (${targetRoute.capacity} seats). Reallocation required.`,
        'error'
      );
      return;
    }

    // SAFEGUARD: Check if vehicle assigned to route is under maintenance
    if (targetRoute.status === 'Maintenance') {
      addToast(
        'Route Unavailable',
        `Route ${targetRoute.routeCode} is flagged for maintenance and cannot accept passengers.`,
        'error'
      );
      return;
    }

    // Remove any previous assignment for this student
    const existing = assignments.find((a) => a.studentId === assignStudentId);
    if (existing) {
      // decrement old route
      const oldRoute = routes.find((r) => r.id === existing.routeId);
      if (oldRoute) {
        updateTransportRoute({
          ...oldRoute,
          assignedStudents: Math.max(0, oldRoute.assignedStudents - 1),
        });
      }
    }

    const newAssignment: StudentTransportAssignment = {
      id: 'asg-' + Date.now(),
      studentId: student.id,
      studentName: student.name,
      admissionId: student.admissionId,
      class: student.class,
      routeId: targetRoute.id,
      routeCode: targetRoute.routeCode,
      routeName: targetRoute.routeName,
      pickupStopId: pStop.id,
      pickupStopName: pStop.stopName,
      dropStopId: dStop.id,
      dropStopName: dStop.stopName,
      guardianName: student.parentName,
      guardianPhone: student.parentPhone,
      effectiveDate: new Date().toISOString().split('T')[0],
      status: 'Active',
    };

    setAssignments((prev) => [newAssignment, ...prev.filter((a) => a.studentId !== student.id)]);

    // Increment route assigned count
    updateTransportRoute({
      ...targetRoute,
      assignedStudents: targetRoute.assignedStudents + 1,
    });

    setIsAssignStudentModalOpen(false);
    setAssignStudentId('');
    setAssignRouteId('');
    setAssignPickupStopId('');
    setAssignDropStopId('');

    addToast(
      'Transport Assigned',
      `${student.name} assigned to ${targetRoute.routeCode} (${pStop.stopName}).`,
      'success'
    );
  };

  // LOG MAINTENANCE
  const handleLogMaintenance = (e: React.FormEvent) => {
    e.preventDefault();
    const newLog: VehicleMaintenanceLog = {
      id: 'mnt-' + Date.now(),
      vehicleNumber: maintenanceForm.vehicleNumber,
      vehicleId: vehicles.find((v) => v.vehicleNumber === maintenanceForm.vehicleNumber)?.id || 'veh-1',
      serviceType: maintenanceForm.serviceType,
      serviceDate: new Date().toISOString().split('T')[0],
      nextDueDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'In Progress',
      odometerReadingKm: vehicles.find((v) => v.vehicleNumber === maintenanceForm.vehicleNumber)?.odometerKm || 45000,
      workshopVendor: maintenanceForm.workshopVendor,
      cost: Number(maintenanceForm.cost) || 300,
      technicianNotes: maintenanceForm.technicianNotes,
    };

    setMaintenanceLogs((prev) => [newLog, ...prev]);

    // Update vehicle status to Under Maintenance
    setVehicles((prev) =>
      prev.map((v) =>
        v.vehicleNumber === maintenanceForm.vehicleNumber
          ? { ...v, status: 'Under Maintenance' }
          : v
      )
    );

    setIsAddMaintenanceModalOpen(false);
    addToast('Service Logged', `Work order opened for ${newLog.vehicleNumber}. Vehicle set to Maintenance.`, 'info');
  };

  // LOG INCIDENT
  const handleLogIncident = (e: React.FormEvent) => {
    e.preventDefault();
    if (!incidentForm.description.trim()) {
      addToast('Validation', 'Incident description is required.', 'error');
      return;
    }

    const newInc: TransportIncident = {
      id: 'inc-' + Date.now(),
      incidentRef: `INC-TR-2026-0${incidents.length + 1}`,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      routeCode: incidentForm.routeCode,
      vehicleNumber: incidentForm.vehicleNumber,
      category: incidentForm.category,
      severity: incidentForm.severity,
      description: incidentForm.description.trim(),
      resolutionStatus: 'Under Review',
      actionTaken: incidentForm.actionTaken.trim() || 'Logged for transport director review',
      reportedBy: 'Gary Vance',
    };

    setIncidents((prev) => [newInc, ...prev]);
    setIsAddIncidentModalOpen(false);
    setIncidentForm({
      routeCode: 'BUS-01',
      vehicleNumber: 'GIS-B-01',
      category: 'Minor Delay',
      severity: 'Low',
      description: '',
      actionTaken: '',
    });
    addToast('Incident Logged', `Incident ${newInc.incidentRef} entered into safety journal.`, 'info');
  };

  // POST ANNOUNCEMENT
  const handlePostAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!announcementForm.title.trim() || !announcementForm.message.trim()) {
      addToast('Validation', 'Title and message are required.', 'error');
      return;
    }

    const newAnn: TransportAnnouncement = {
      id: 'ann-' + Date.now(),
      title: announcementForm.title.trim(),
      routeCode: announcementForm.routeCode,
      audience: announcementForm.routeCode === 'ALL' ? 'All Transport Riders & Parents' : `${announcementForm.routeCode} Riders`,
      message: announcementForm.message.trim(),
      date: new Date().toISOString().split('T')[0],
      priority: announcementForm.priority,
      author: 'Gary Vance (Transport Director)',
    };

    setAnnouncements((prev) => [newAnn, ...prev]);
    setIsAddAnnouncementModalOpen(false);
    setAnnouncementForm({
      title: '',
      routeCode: 'ALL',
      message: '',
      priority: 'Normal',
    });
    addToast('Bulletin Dispatched', `Announcement published to local transit feeds.`, 'success');
  };

  // EXPORT ROSTER CSV
  const handleExportRosterCSV = (routeId: string) => {
    const route = routes.find((r) => r.id === routeId);
    const routeAssignments = assignments.filter((a) => a.routeId === routeId);

    const headers = ['Student Name', 'Admission ID', 'Class', 'Route Code', 'Pickup Stop', 'Drop Stop', 'Guardian', 'Contact Phone'];
    const rows = routeAssignments.map((a) => [
      `"${a.studentName}"`,
      a.admissionId,
      a.class,
      a.routeCode,
      `"${a.pickupStopName}"`,
      `"${a.dropStopName}"`,
      `"${a.guardianName}"`,
      a.guardianPhone,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `schlar_roster_${route?.routeCode || 'BUS'}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast('Roster Exported', `Passenger manifest for ${route?.routeCode} downloaded.`, 'success');
  };

  /* =============================================================
     MODULE 1: TRANSPORT COMMAND DASHBOARD
  ============================================================= */
  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-md border border-amber-200/70">
              Fleet Operations & Logistics
            </span>
            <span className="text-xs font-medium text-slate-500">Academic Year 2026-2027</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 mt-1">
            Transport Command & Dispatch Center
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Gary Vance (Transport Operations Director) · Greenfield Campus Transit Logistics
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsAssignStudentModalOpen(true)}
            className="flex items-center gap-1.5 bg-amber-600 hover:bg-amber-700 text-white px-3.5 py-2 rounded-xl text-xs font-semibold shadow-xs transition-colors"
          >
            <Users className="w-4 h-4" />
            Assign Student
          </button>
          <button
            onClick={() => setIsAddRouteModalOpen(true)}
            className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white px-3.5 py-2 rounded-xl text-xs font-semibold shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Route
          </button>
          <button
            onClick={() => setIsAddVehicleModalOpen(true)}
            className="flex items-center gap-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 px-3 py-2 rounded-xl text-xs font-medium shadow-xs transition-colors"
          >
            <Bus className="w-4 h-4 text-slate-500" />
            Add Bus
          </button>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Fleet Vehicles"
          value={vehicles.length}
          subtitle={`${activeVehiclesCount} in active service`}
          icon={<Bus className="w-5 h-5 text-amber-600" />}
          onAction={() => setActiveNav('vehicles')}
        />
        <MetricCard
          title="Transit Routes"
          value={routes.length}
          subtitle={`${activeRoutesCount} routes currently on run`}
          icon={<MapPin className="w-5 h-5 text-indigo-600" />}
          onAction={() => setActiveNav('routes')}
        />
        <MetricCard
          title="Assigned Riders"
          value={totalAssignedRiders}
          subtitle={`${fleetUtilizationRate}% fleet capacity load`}
          icon={<Users className="w-5 h-5 text-teal-600" />}
          onAction={() => setActiveNav('allocations')}
        />
        <MetricCard
          title="Maintenance Alert"
          value={maintenanceVehiclesCount}
          subtitle={`${maintenanceLogs.filter((m) => m.status === 'In Progress').length} work orders open`}
          change={{ value: `${maintenanceVehiclesCount} vehicles in bay`, isPositive: maintenanceVehiclesCount === 0 }}
          icon={<Wrench className="w-5 h-5 text-rose-600" />}
          onAction={() => setActiveNav('maintenance')}
        />
      </div>

      {/* Active Routes Live Dispatch Cards */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Configured Transit Lines & Fleet Allocation</h3>
            <p className="text-xs text-slate-500">Live operational status, vehicle plates, and passenger loads</p>
          </div>
          <button
            onClick={() => setActiveNav('routes')}
            className="text-xs font-semibold text-amber-700 hover:text-amber-900 flex items-center gap-1"
          >
            Manage All Routes
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {routes.map((route) => {
            const fillPct = Math.min(100, Math.round((route.assignedStudents / (route.capacity || 1)) * 100));
            const isFull = route.assignedStudents >= route.capacity;

            return (
              <div
                key={route.id}
                className="p-4 rounded-xl border border-slate-200/80 hover:border-amber-300 bg-white hover:shadow-xs transition-all space-y-3 cursor-pointer"
                onClick={() => {
                  setSelectedRouteForView(route);
                  setSelectedRosterRouteId(route.id);
                  setActiveNav('rosters');
                }}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-sm text-slate-900">{route.routeCode}</span>
                  <StatusBadge status={route.status} />
                </div>

                <div>
                  <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{route.routeName}</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">From: {route.startPoint}</p>
                </div>

                <div className="pt-2 border-t border-slate-100 text-[11px] space-y-1 text-slate-600">
                  <div className="flex justify-between">
                    <span>Driver:</span>
                    <span className="font-semibold text-slate-800">{route.driverName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Vehicle:</span>
                    <span className="font-mono font-semibold text-slate-800">{route.vehicleNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Schedule:</span>
                    <span className="font-mono text-slate-700">{route.morningPickupTime}</span>
                  </div>
                </div>

                {/* Capacity Progress Bar */}
                <div className="space-y-1 pt-1">
                  <div className="flex justify-between text-[10px]">
                    <span className="text-slate-500">Rider Load:</span>
                    <span className={`font-bold ${isFull ? 'text-rose-600' : 'text-slate-800'}`}>
                      {route.assignedStudents} / {route.capacity} ({fillPct}%)
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        isFull ? 'bg-rose-500' : fillPct > 80 ? 'bg-amber-500' : 'bg-teal-600'
                      }`}
                      style={{ width: `${fillPct}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Safety & Recent Bulletins Two-Column Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Incidents Card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Safety & Incident Registry
            </h3>
            <button
              onClick={() => setActiveNav('incidents')}
              className="text-xs font-semibold text-amber-700 hover:text-amber-900"
            >
              Open Incident Log →
            </button>
          </div>

          <div className="space-y-3">
            {incidents.slice(0, 3).map((inc) => (
              <div
                key={inc.id}
                className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/70 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono font-bold text-xs text-slate-900">{inc.incidentRef}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] text-slate-500">{inc.date}</span>
                    <StatusBadge status={inc.resolutionStatus} />
                  </div>
                </div>
                <p className="text-xs text-slate-700 font-medium">{inc.description}</p>
                <div className="flex items-center gap-2 mt-1.5 text-[11px] text-slate-500">
                  <span>Route: <strong>{inc.routeCode}</strong></span>
                  <span>·</span>
                  <span>Action: {inc.actionTaken}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Transit Announcements Card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <Megaphone className="w-4 h-4 text-indigo-600" />
                Transit Bulletins & Delay Alerts
              </h3>
              <button
                onClick={() => setIsAddAnnouncementModalOpen(true)}
                className="text-xs font-semibold text-amber-700 hover:text-amber-900 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                New Alert
              </button>
            </div>

            <div className="space-y-3">
              {announcements.slice(0, 3).map((ann) => (
                <div
                  key={ann.id}
                  className="p-3.5 rounded-xl border border-indigo-100 bg-indigo-50/40 space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-900">{ann.title}</h4>
                    <span className="text-[10px] font-semibold text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded">
                      {ann.routeCode}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600">{ann.message}</p>
                  <p className="text-[10px] text-slate-400 font-mono mt-1">{ann.date} · {ann.author}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 mt-4 border-t border-slate-100">
            <button
              onClick={() => setActiveNav('announcements')}
              className="w-full text-center text-xs font-semibold text-amber-700 hover:text-amber-900"
            >
              Manage Transit Broadcast Feeds →
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  /* =============================================================
     MODULE 2: FLEET VEHICLES REGISTER
  ============================================================= */
  const renderVehicles = () => (
    <div className="space-y-5">
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xs">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/70">
            Rolling Stock & Fleet Inventory
          </span>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 mt-1">
            School Bus Fleet Register
          </h2>
          <p className="text-xs text-slate-500">
            Active school buses, capacity quotas, inspection validity, and fitness certificates.
          </p>
        </div>

        <button
          onClick={() => setIsAddVehicleModalOpen(true)}
          className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white px-3.5 py-2 rounded-xl text-xs font-semibold shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          Register New Vehicle
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider text-[11px] border-b border-slate-100">
              <tr>
                <th className="px-5 py-3.5 font-mono">Plate Number</th>
                <th className="px-4 py-3.5">Make & Model</th>
                <th className="px-4 py-3.5">Type</th>
                <th className="px-4 py-3.5 text-center">Seating Capacity</th>
                <th className="px-4 py-3.5">Assigned Route</th>
                <th className="px-4 py-3.5">Assigned Driver</th>
                <th className="px-4 py-3.5 font-mono">Inspection Expiry</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {vehicles.map((v) => (
                <tr key={v.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-5 py-3.5 font-mono font-bold text-slate-900">{v.vehicleNumber}</td>
                  <td className="px-4 py-3.5 font-semibold text-slate-800">{v.makeModel}</td>
                  <td className="px-4 py-3.5 text-slate-600">{v.vehicleType}</td>
                  <td className="px-4 py-3.5 text-center font-mono font-bold text-slate-900">
                    {v.capacity} Seats
                  </td>
                  <td className="px-4 py-3.5">
                    {v.assignedRouteCode ? (
                      <span className="font-mono text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded font-semibold text-[11px]">
                        {v.assignedRouteCode}
                      </span>
                    ) : (
                      <span className="text-slate-400">— Unassigned —</span>
                    )}
                  </td>
                  <td className="px-4 py-3.5 text-slate-700 font-medium">{v.driverName || '—'}</td>
                  <td className="px-4 py-3.5 font-mono text-slate-600">{v.fitnessInspectionExpiry}</td>
                  <td className="px-4 py-3.5">
                    <StatusBadge status={v.status} />
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => setSelectedVehicleForView(v)}
                        className="p-1.5 hover:bg-slate-100 text-slate-600 rounded-lg transition-colors"
                        title="View Vehicle Specs"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedVehicleForEdit(v);
                          setIsEditVehicleModalOpen(true);
                        }}
                        className="p-1.5 hover:bg-amber-50 text-amber-700 rounded-lg transition-colors"
                        title="Edit Vehicle"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  /* =============================================================
     MODULE 3: DRIVERS DIRECTORY
  ============================================================= */
  const renderDrivers = () => (
    <div className="space-y-5">
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
        <span className="text-xs font-semibold uppercase tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/70">
          Chauffeurs & Fleet Drivers
        </span>
        <h2 className="text-xl font-bold tracking-tight text-slate-900 mt-1">
          Licensed Commercial Drivers Directory
        </h2>
        <p className="text-xs text-slate-500">
          Commercial Driver Licence (CDL) verification, safety ratings, vehicle allocations, and contact records.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {driversList.map((driver) => (
          <div
            key={driver.licence}
            className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 flex items-center justify-center font-bold text-xs">
                  {driver.name.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{driver.name}</h4>
                  <p className="text-[11px] text-slate-500 font-mono">Licence: {driver.licence}</p>
                </div>
              </div>
              <StatusBadge status={driver.status} />
            </div>

            <div className="py-2.5 border-y border-slate-100 text-xs space-y-1.5 text-slate-600">
              <div className="flex justify-between">
                <span>Assigned Bus:</span>
                <span className="font-mono font-bold text-slate-900">{driver.bus}</span>
              </div>
              <div className="flex justify-between">
                <span>Assigned Route:</span>
                <span className="font-mono text-indigo-700 font-semibold">{driver.route}</span>
              </div>
              <div className="flex justify-between">
                <span>Direct Contact:</span>
                <span className="font-mono text-slate-800">{driver.phone}</span>
              </div>
              <div className="flex justify-between">
                <span>Experience:</span>
                <span className="font-semibold text-slate-800">{driver.exp} Clean Record</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <span className="text-[11px] text-slate-400">CDL Expiry: {driver.expiry}</span>
              <span className="font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                ★ {driver.rating} Safety
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  /* =============================================================
     MODULE 4: TRANSIT STAFF & ATTENDANTS
  ============================================================= */
  const renderStaff = () => (
    <div className="space-y-5">
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
        <span className="text-xs font-semibold uppercase tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/70">
          Passenger Care Personnel
        </span>
        <h2 className="text-xl font-bold tracking-tight text-slate-900 mt-1">
          Bus Attendants, Chaperones & Dispatch Team
        </h2>
        <p className="text-xs text-slate-500">
          On-board safety monitors, elementary student chaperones, and gate dispatch personnel.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider text-[11px] border-b border-slate-100">
            <tr>
              <th className="px-5 py-3.5">Staff Name</th>
              <th className="px-4 py-3.5">Role & Designation</th>
              <th className="px-4 py-3.5">Assigned Transit Line</th>
              <th className="px-4 py-3.5">Shift Schedule</th>
              <th className="px-4 py-3.5 font-mono">Contact Phone</th>
              <th className="px-5 py-3.5 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {attendantsList.map((stf) => (
              <tr key={stf.name} className="hover:bg-slate-50/70 transition-colors">
                <td className="px-5 py-3.5 font-bold text-slate-900">{stf.name}</td>
                <td className="px-4 py-3.5 text-slate-600 font-medium">{stf.role}</td>
                <td className="px-4 py-3.5 font-mono text-indigo-700 font-semibold">{stf.route}</td>
                <td className="px-4 py-3.5 text-slate-700">{stf.shift}</td>
                <td className="px-4 py-3.5 font-mono text-slate-600">{stf.phone}</td>
                <td className="px-5 py-3.5 text-right">
                  <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold text-[11px]">
                    On Duty
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  /* =============================================================
     MODULE 5: TRANSIT ROUTES REGISTER
  ============================================================= */
  const renderRoutes = () => (
    <div className="space-y-5">
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xs">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/70">
            Logistics Network
          </span>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 mt-1">
            Transit Routes & Schedules
          </h2>
          <p className="text-xs text-slate-500">
            Bus route lines, pickup sectors, vehicle assignments, and seating utilization.
          </p>
        </div>

        <button
          onClick={() => setIsAddRouteModalOpen(true)}
          className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white px-3.5 py-2 rounded-xl text-xs font-semibold shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Transit Route
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-[280px]">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by route code, route name, driver, vehicle plate..."
              value={routeSearch}
              onChange={(e) => setRouteSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 font-medium"
            />
          </div>

          <select
            value={routeStatusFilter}
            onChange={(e) => setRouteStatusFilter(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white font-medium text-slate-700"
          >
            <option value="All">All Statuses</option>
            <option value="On Route">On Route</option>
            <option value="Completed">Completed</option>
            <option value="Idle">Idle</option>
            <option value="Maintenance">Maintenance</option>
          </select>
        </div>
      </div>

      {/* Routes Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider text-[11px] border-b border-slate-100">
              <tr>
                <th className="px-5 py-3.5 font-mono">Route Code</th>
                <th className="px-4 py-3.5">Route Name & Sector</th>
                <th className="px-4 py-3.5 font-mono">Vehicle Plate</th>
                <th className="px-4 py-3.5">Assigned Driver</th>
                <th className="px-4 py-3.5 font-mono">Morning Pickup</th>
                <th className="px-4 py-3.5 font-mono">Afternoon Drop</th>
                <th className="px-4 py-3.5 text-center">Capacity Load</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRoutes.map((r) => {
                const fillPct = Math.min(100, Math.round((r.assignedStudents / (r.capacity || 1)) * 100));
                return (
                  <tr key={r.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-5 py-3.5 font-mono font-bold text-slate-900">{r.routeCode}</td>
                    <td className="px-4 py-3.5">
                      <p className="font-bold text-slate-900">{r.routeName}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">Start: {r.startPoint}</p>
                    </td>
                    <td className="px-4 py-3.5 font-mono text-slate-700 font-semibold">{r.vehicleNumber}</td>
                    <td className="px-4 py-3.5 font-medium text-slate-800">{r.driverName}</td>
                    <td className="px-4 py-3.5 font-mono text-slate-600">{r.morningPickupTime}</td>
                    <td className="px-4 py-3.5 font-mono text-slate-600">{r.afternoonDropTime}</td>
                    <td className="px-4 py-3.5 text-center">
                      <span className="font-bold text-slate-900">{r.assignedStudents}</span>
                      <span className="text-slate-400"> / {r.capacity}</span>
                      <div className="w-16 h-1 bg-slate-100 rounded-full mx-auto mt-1 overflow-hidden">
                        <div
                          className={`h-full ${fillPct >= 100 ? 'bg-rose-500' : 'bg-teal-600'}`}
                          style={{ width: `${fillPct}%` }}
                        />
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <StatusBadge status={r.status} />
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setSelectedRosterRouteId(r.id);
                            setActiveNav('rosters');
                          }}
                          className="p-1.5 hover:bg-slate-100 text-slate-600 rounded-lg"
                          title="View Route Roster"
                        >
                          <Users className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedRouteForEdit(r);
                            setIsEditRouteModalOpen(true);
                          }}
                          className="p-1.5 hover:bg-amber-50 text-amber-700 rounded-lg"
                          title="Edit Route"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmRoute(r)}
                          className="p-1.5 hover:bg-rose-50 text-rose-600 rounded-lg"
                          title="Delete Route"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  /* =============================================================
     MODULE 6: STOPS & TIMINGS
  ============================================================= */
  const renderStops = () => {
    return (
      <div className="space-y-5">
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xs">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/70">
              Waypoints & Stops
            </span>
            <h2 className="text-xl font-bold tracking-tight text-slate-900 mt-1">
              Ordered Bus Stops & Timings
            </h2>
            <p className="text-xs text-slate-500">
              Sequence of stops along transit routes, arrival windows, and neighborhood landmarks.
            </p>
          </div>
        </div>

        <div className="space-y-6">
          {routes.map((route) => {
            const routeStops = stops.filter((s) => s.routeId === route.id || s.routeCode === route.routeCode);

            return (
              <div
                key={route.id}
                className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden"
              >
                <div className="p-4 bg-slate-50/70 border-b border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="font-mono font-bold text-xs text-amber-700">{route.routeCode}</span>
                    <h3 className="text-sm font-bold text-slate-900 inline-block ml-2">{route.routeName}</h3>
                    <p className="text-[11px] text-slate-500">
                      Vehicle: {route.vehicleNumber} · Driver: {route.driverName}
                    </p>
                  </div>
                  <span className="text-xs text-slate-500 font-semibold">{routeStops.length} Ordered Stops</span>
                </div>

                <div className="divide-y divide-slate-100">
                  {routeStops.map((stop) => (
                    <div key={stop.id} className="p-4 flex items-center justify-between hover:bg-slate-50/60">
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-full bg-slate-100 font-mono font-bold text-xs text-slate-700 flex items-center justify-center">
                          {stop.stopSequence}
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-900">{stop.stopName}</h4>
                          <p className="text-[11px] text-slate-500">Landmark: {stop.areaLandmark}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-6 text-xs">
                        <div>
                          <span className="text-[10px] text-slate-400 block uppercase">Pickup</span>
                          <span className="font-mono font-bold text-slate-800">{stop.pickupTime}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block uppercase">Drop-Off</span>
                          <span className="font-mono font-bold text-slate-800">{stop.dropTime}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block uppercase">Boarding</span>
                          <span className="font-mono text-teal-700 font-semibold">{stop.assignedStudentCount} Riders</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  /* =============================================================
     MODULE 7: ROUTE SCHEDULES
  ============================================================= */
  const renderSchedules = () => (
    <div className="space-y-5">
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
        <span className="text-xs font-semibold uppercase tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/70">
          Dispatch Timetable
        </span>
        <h2 className="text-xl font-bold tracking-tight text-slate-900 mt-1">
          Master Daily Transit Dispatch Matrix
        </h2>
        <p className="text-xs text-slate-500">
          Timetables for morning campus arrival and afternoon return runs.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Morning Dispatch Run */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-amber-600" />
              Morning Inbound Runs (School Arrival: 07:55 AM)
            </h3>
            <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
              Gate Active
            </span>
          </div>

          <div className="space-y-3">
            {routes.map((r) => (
              <div key={r.id} className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/70 text-xs space-y-1">
                <div className="flex justify-between items-center">
                  <span className="font-mono font-bold text-slate-900">{r.routeCode} — {r.routeName}</span>
                  <span className="font-mono font-bold text-teal-700">{r.morningPickupTime}</span>
                </div>
                <div className="flex justify-between text-[11px] text-slate-500">
                  <span>Start Hub: {r.startPoint}</span>
                  <span>Bay Gate 1</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Afternoon Dispatch Run */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-indigo-600" />
              Afternoon Outbound Runs (Departure: 03:15 PM)
            </h3>
            <span className="text-[11px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
              Staging Ready
            </span>
          </div>

          <div className="space-y-3">
            {routes.map((r) => (
              <div key={r.id} className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/70 text-xs space-y-1">
                <div className="flex justify-between items-center">
                  <span className="font-mono font-bold text-slate-900">{r.routeCode} — {r.routeName}</span>
                  <span className="font-mono font-bold text-indigo-700">{r.afternoonDropTime}</span>
                </div>
                <div className="flex justify-between text-[11px] text-slate-500">
                  <span>Departure: Campus Gate 1</span>
                  <span>Driver: {r.driverName}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  /* =============================================================
     MODULE 8: STUDENT TRANSPORT ASSIGNMENTS
  ============================================================= */
  const renderAllocations = () => (
    <div className="space-y-5">
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xs">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/70">
            Rider Allocations
          </span>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 mt-1">
            Student Transport Allocations
          </h2>
          <p className="text-xs text-slate-500">
            Designate student route assignments, authorized pickup stops, and guardian contacts.
          </p>
        </div>

        <button
          onClick={() => setIsAssignStudentModalOpen(true)}
          className="flex items-center gap-1.5 bg-amber-600 hover:bg-amber-700 text-white px-3.5 py-2 rounded-xl text-xs font-semibold shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          Assign Student to Route
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider text-[11px] border-b border-slate-100">
              <tr>
                <th className="px-5 py-3.5">Student Name</th>
                <th className="px-4 py-3.5">Class</th>
                <th className="px-4 py-3.5 font-mono">Admission ID</th>
                <th className="px-4 py-3.5">Assigned Route</th>
                <th className="px-4 py-3.5">Pickup Stop</th>
                <th className="px-4 py-3.5">Guardian Contact</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {assignments.map((asg) => (
                <tr key={asg.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-5 py-3.5 font-bold text-slate-900">{asg.studentName}</td>
                  <td className="px-4 py-3.5 text-slate-600">{asg.class}</td>
                  <td className="px-4 py-3.5 font-mono text-slate-500">{asg.admissionId}</td>
                  <td className="px-4 py-3.5 font-mono font-semibold text-indigo-700">{asg.routeCode}</td>
                  <td className="px-4 py-3.5 text-slate-800 font-medium">{asg.pickupStopName}</td>
                  <td className="px-4 py-3.5">
                    <span className="text-slate-900 font-medium">{asg.guardianName}</span>
                    <span className="text-slate-400 font-mono block text-[11px]">{asg.guardianPhone}</span>
                  </td>
                  <td className="px-4 py-3.5">
                    <StatusBadge status={asg.status} />
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <button
                      onClick={() => {
                        setAssignments((prev) => prev.filter((a) => a.id !== asg.id));
                        // decrement route count
                        const r = routes.find((x) => x.id === asg.routeId);
                        if (r) {
                          updateTransportRoute({
                            ...r,
                            assignedStudents: Math.max(0, r.assignedStudents - 1),
                          });
                        }
                        addToast('Assignment Removed', `Unassigned ${asg.studentName} from route.`, 'info');
                      }}
                      className="px-2.5 py-1 text-rose-600 hover:bg-rose-50 rounded text-[11px] font-medium transition-colors"
                    >
                      Unassign
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  /* =============================================================
     MODULE 9: ROUTE ROSTERS & MANIFESTS
  ============================================================= */
  const renderRosters = () => {
    const selectedRoute = routes.find((r) => r.id === selectedRosterRouteId) || routes[0];
    const routeAssignments = assignments.filter((a) => a.routeId === selectedRoute?.id);

    return (
      <div className="space-y-5">
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xs">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/70">
              Passenger Manifest
            </span>
            <h2 className="text-xl font-bold tracking-tight text-slate-900 mt-1">
              Route Rosters & Printable Manifests
            </h2>
            <p className="text-xs text-slate-500">
              Printable driver passenger rolls with emergency contacts and designated stops.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 px-3.5 py-2 rounded-xl text-xs font-semibold shadow-xs transition-colors"
            >
              <Printer className="w-4 h-4 text-slate-500" />
              Print Manifest
            </button>
            <button
              onClick={() => handleExportRosterCSV(selectedRoute?.id || '')}
              className="flex items-center gap-1.5 bg-amber-600 hover:bg-amber-700 text-white px-3.5 py-2 rounded-xl text-xs font-semibold shadow-xs transition-colors"
            >
              <Download className="w-4 h-4" />
              Download CSV
            </button>
          </div>
        </div>

        {/* Route Selector Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          {routes.map((r) => (
            <button
              key={r.id}
              onClick={() => setSelectedRosterRouteId(r.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                selectedRoute?.id === r.id
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200'
              }`}
            >
              {r.routeCode} ({r.assignedStudents} Riders)
            </button>
          ))}
        </div>

        {/* Selected Route Header Card */}
        {selectedRoute && (
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="font-mono text-xs font-bold text-amber-700 uppercase">{selectedRoute.routeCode} Manifest</span>
              <h3 className="text-base font-bold text-slate-900 mt-0.5">{selectedRoute.routeName}</h3>
              <p className="text-xs text-slate-500">Start: {selectedRoute.startPoint} → Campus Gate 1</p>
            </div>

            <div className="flex items-center gap-6 text-xs text-slate-600">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">Vehicle</span>
                <span className="font-mono font-bold text-slate-800">{selectedRoute.vehicleNumber}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">Driver</span>
                <span className="font-bold text-slate-800">{selectedRoute.driverName}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">Contact</span>
                <span className="font-mono text-slate-800">{selectedRoute.driverPhone}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">Capacity</span>
                <span className="font-bold text-slate-900">{selectedRoute.assignedStudents} / {selectedRoute.capacity} Seats</span>
              </div>
            </div>
          </div>
        )}

        {/* Manifest Table */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider text-[11px] border-b border-slate-100">
                <tr>
                  <th className="px-5 py-3.5">Student Passenger</th>
                  <th className="px-4 py-3.5">Class</th>
                  <th className="px-4 py-3.5 font-mono">Admission ID</th>
                  <th className="px-4 py-3.5">Designated Pickup Stop</th>
                  <th className="px-4 py-3.5">Guardian Contact</th>
                  <th className="px-5 py-3.5 text-right font-mono">Emergency Phone</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {routeAssignments.map((asg) => (
                  <tr key={asg.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-5 py-3.5 font-bold text-slate-900">{asg.studentName}</td>
                    <td className="px-4 py-3.5 text-slate-600">{asg.class}</td>
                    <td className="px-4 py-3.5 font-mono text-slate-500">{asg.admissionId}</td>
                    <td className="px-4 py-3.5 font-medium text-slate-800">{asg.pickupStopName}</td>
                    <td className="px-4 py-3.5 text-slate-700">{asg.guardianName}</td>
                    <td className="px-5 py-3.5 text-right font-mono font-bold text-slate-900">
                      {asg.guardianPhone}
                    </td>
                  </tr>
                ))}
                {routeAssignments.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-5 py-8 text-center text-slate-400">
                      No students allocated to this transit route yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  /* =============================================================
     MODULE 10: FLEET MAINTENANCE
  ============================================================= */
  const renderMaintenance = () => (
    <div className="space-y-5">
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xs">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200/70">
            Fleet Safety & Compliance
          </span>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 mt-1">
            Vehicle Maintenance & Service Logs
          </h2>
          <p className="text-xs text-slate-500">
            Preventative maintenance work orders, brake inspections, and mechanical logs.
          </p>
        </div>

        <button
          onClick={() => setIsAddMaintenanceModalOpen(true)}
          className="flex items-center gap-1.5 bg-rose-600 hover:bg-rose-700 text-white px-3.5 py-2 rounded-xl text-xs font-semibold shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          Log Service Order
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider text-[11px] border-b border-slate-100">
              <tr>
                <th className="px-5 py-3.5 font-mono">Vehicle</th>
                <th className="px-4 py-3.5">Service Type</th>
                <th className="px-4 py-3.5 font-mono">Service Date</th>
                <th className="px-4 py-3.5 font-mono">Next Inspection Due</th>
                <th className="px-4 py-3.5">Workshop / Vendor</th>
                <th className="px-4 py-3.5 font-mono">Cost</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {maintenanceLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-5 py-3.5 font-mono font-bold text-slate-900">{log.vehicleNumber}</td>
                  <td className="px-4 py-3.5 font-semibold text-slate-800">{log.serviceType}</td>
                  <td className="px-4 py-3.5 font-mono text-slate-600">{log.serviceDate}</td>
                  <td className="px-4 py-3.5 font-mono text-slate-600">{log.nextDueDate}</td>
                  <td className="px-4 py-3.5 text-slate-700">{log.workshopVendor}</td>
                  <td className="px-4 py-3.5 font-mono font-bold text-slate-900">${log.cost.toFixed(2)}</td>
                  <td className="px-4 py-3.5">
                    <StatusBadge status={log.status} />
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    {log.status === 'In Progress' && (
                      <button
                        onClick={() => {
                          setMaintenanceLogs((prev) =>
                            prev.map((m) => (m.id === log.id ? { ...m, status: 'Completed' } : m))
                          );
                          // Restore vehicle to Active
                          setVehicles((prev) =>
                            prev.map((v) =>
                              v.vehicleNumber === log.vehicleNumber ? { ...v, status: 'Active' } : v
                            )
                          );
                          addToast('Service Completed', `${log.vehicleNumber} restored to active service.`, 'success');
                        }}
                        className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded font-semibold text-[11px]"
                      >
                        Sign Off Work
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  /* =============================================================
     MODULE 11: TRANSPORT INCIDENTS
  ============================================================= */
  const renderIncidents = () => (
    <div className="space-y-5">
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xs">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200/70">
            Safety Log
          </span>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 mt-1">
            Transport Incidents & Delay Reports
          </h2>
          <p className="text-xs text-slate-500">
            Operational disruptions, traffic bottlenecks, minor delays, and safety resolutions.
          </p>
        </div>

        <button
          onClick={() => setIsAddIncidentModalOpen(true)}
          className="flex items-center gap-1.5 bg-rose-600 hover:bg-rose-700 text-white px-3.5 py-2 rounded-xl text-xs font-semibold shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          Log Incident
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider text-[11px] border-b border-slate-100">
              <tr>
                <th className="px-5 py-3.5 font-mono">Incident Ref</th>
                <th className="px-4 py-3.5 font-mono">Date & Time</th>
                <th className="px-4 py-3.5 font-mono">Route</th>
                <th className="px-4 py-3.5">Category</th>
                <th className="px-4 py-3.5">Severity</th>
                <th className="px-4 py-3.5">Incident Description</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {incidents.map((inc) => (
                <tr key={inc.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-5 py-3.5 font-mono font-bold text-slate-900">{inc.incidentRef}</td>
                  <td className="px-4 py-3.5 font-mono text-slate-600">{inc.date} {inc.time}</td>
                  <td className="px-4 py-3.5 font-mono font-semibold text-indigo-700">{inc.routeCode}</td>
                  <td className="px-4 py-3.5 font-medium text-slate-800">{inc.category}</td>
                  <td className="px-4 py-3.5">
                    <span
                      className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                        inc.severity === 'High'
                          ? 'bg-rose-100 text-rose-800'
                          : inc.severity === 'Medium'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {inc.severity}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-slate-700 max-w-[280px]">{inc.description}</td>
                  <td className="px-4 py-3.5">
                    <StatusBadge status={inc.resolutionStatus} />
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    {inc.resolutionStatus !== 'Resolved' && (
                      <button
                        onClick={() => {
                          setIncidents((prev) =>
                            prev.map((i) => (i.id === inc.id ? { ...i, resolutionStatus: 'Resolved' } : i))
                          );
                          addToast('Incident Resolved', `Incident ${inc.incidentRef} marked resolved.`, 'success');
                        }}
                        className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded font-semibold text-[11px]"
                      >
                        Resolve
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  /* =============================================================
     MODULE 12: TRANSIT ANNOUNCEMENTS
  ============================================================= */
  const renderAnnouncements = () => (
    <div className="space-y-5">
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xs">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200/70">
            Rider Bulletins
          </span>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 mt-1">
            Transit Bulletins & Delay Broadcasts
          </h2>
          <p className="text-xs text-slate-500">
            Publish route delay notifications, weather reroutes, and bus schedule updates to families.
          </p>
        </div>

        <button
          onClick={() => setIsAddAnnouncementModalOpen(true)}
          className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white px-3.5 py-2 rounded-xl text-xs font-semibold shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          Broadcast Bulletin
        </button>
      </div>

      <div className="space-y-4">
        {announcements.map((ann) => (
          <div
            key={ann.id}
            className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex items-start justify-between gap-4"
          >
            <div className="space-y-1 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded border border-indigo-200">
                  {ann.routeCode}
                </span>
                <span className="text-[11px] text-slate-500 font-medium">Audience: {ann.audience}</span>
                <span className="text-[11px] text-slate-400 font-mono">· {ann.date}</span>
              </div>
              <h3 className="text-sm font-bold text-slate-900 pt-1">{ann.title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{ann.message}</p>
              <p className="text-[11px] text-slate-400 pt-1">Dispatched by: {ann.author}</p>
            </div>
            <span
              className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                ann.priority === 'High' ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-slate-100 text-slate-700'
              }`}
            >
              {ann.priority} Priority
            </span>
          </div>
        ))}
      </div>
    </div>
  );

  /* =============================================================
     MODULE 13: OPERATIONS REPORTS
  ============================================================= */
  const renderReports = () => {
    const handleExportTransportCSV = () => {
      const headers = ['Route Code', 'Route Name', 'Start Point', 'Vehicle Plate', 'Driver', 'Capacity', 'Assigned Riders', 'Status'];
      const rows = routes.map((r) => [
        r.routeCode,
        `"${r.routeName}"`,
        `"${r.startPoint}"`,
        r.vehicleNumber,
        `"${r.driverName}"`,
        r.capacity,
        r.assignedStudents,
        r.status,
      ]);

      const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `schlar_transport_operations_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      addToast('Operations Exported', 'Transport network operations CSV downloaded.', 'success');
    };

    return (
      <div className="space-y-6">
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xs">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/70">
              Operations Audit
            </span>
            <h2 className="text-xl font-bold tracking-tight text-slate-900 mt-1">
              Transport Fleet & Ridership Reports
            </h2>
            <p className="text-xs text-slate-500">
              Fleet capacity utilization, route efficiency, and maintenance expenditure reports.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 px-3.5 py-2 rounded-xl text-xs font-semibold shadow-xs transition-colors"
            >
              <Printer className="w-4 h-4 text-slate-500" />
              Print Report
            </button>
            <button
              onClick={handleExportTransportCSV}
              className="flex items-center gap-1.5 bg-amber-600 hover:bg-amber-700 text-white px-3.5 py-2 rounded-xl text-xs font-semibold shadow-xs transition-colors"
            >
              <Download className="w-4 h-4" />
              Export Operations CSV
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200/80 text-center">
            <span className="text-xs text-slate-500 block mb-1">Total Fleet Seats</span>
            <span className="text-2xl font-bold text-slate-900">{totalFleetCapacity}</span>
            <span className="text-[11px] text-slate-400 block mt-0.5">Across {vehicles.length} fleet units</span>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200/80 text-center">
            <span className="text-xs text-slate-500 block mb-1">Riders Allocated</span>
            <span className="text-2xl font-bold text-teal-600">{totalAssignedRiders}</span>
            <span className="text-[11px] text-slate-400 block mt-0.5">{fleetUtilizationRate}% seat load</span>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200/80 text-center">
            <span className="text-xs text-slate-500 block mb-1">Fleet Service Costs</span>
            <span className="text-2xl font-bold text-slate-900">
              ${maintenanceLogs.reduce((sum, m) => sum + m.cost, 0).toLocaleString()}
            </span>
            <span className="text-[11px] text-slate-400 block mt-0.5">YTD vehicle maintenance</span>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200/80 text-center">
            <span className="text-xs text-slate-500 block mb-1">Safety Record</span>
            <span className="text-2xl font-bold text-emerald-600">100%</span>
            <span className="text-[11px] text-slate-400 block mt-0.5">Zero major incidents</span>
          </div>
        </div>

        {/* Route Efficiency Table */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Route Performance & Seating Load Summary</h3>
          </div>
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider text-[11px] border-b border-slate-100">
              <tr>
                <th className="px-5 py-3">Route Code</th>
                <th className="px-4 py-3">Line Name</th>
                <th className="px-4 py-3 text-center">Capacity</th>
                <th className="px-4 py-3 text-center">Riders</th>
                <th className="px-4 py-3 text-center">Available Seats</th>
                <th className="px-5 py-3 text-right">Utilization Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {routes.map((r) => {
                const fillPct = Math.round((r.assignedStudents / (r.capacity || 1)) * 100);
                return (
                  <tr key={r.id} className="hover:bg-slate-50/70">
                    <td className="px-5 py-3 font-mono font-bold text-slate-900">{r.routeCode}</td>
                    <td className="px-4 py-3 font-medium text-slate-800">{r.routeName}</td>
                    <td className="px-4 py-3 text-center font-mono">{r.capacity}</td>
                    <td className="px-4 py-3 text-center font-mono font-bold text-teal-700">{r.assignedStudents}</td>
                    <td className="px-4 py-3 text-center font-mono text-slate-600">{Math.max(0, r.capacity - r.assignedStudents)}</td>
                    <td className="px-5 py-3 text-right font-mono font-bold text-slate-900">{fillPct}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  /* =============================================================
     MODULE 14: DISPATCH POLICIES & SETTINGS
  ============================================================= */
  const renderSettings = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
        <span className="text-xs font-semibold uppercase tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/70">
          Operational Standards
        </span>
        <h2 className="text-xl font-bold tracking-tight text-slate-900 mt-1">
          Dispatch Policies & Safety Mandates
        </h2>
        <p className="text-xs text-slate-500">
          Maximum journey duration thresholds, speed governor limits, and emergency protocols.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs max-w-2xl space-y-5 text-xs">
        <div>
          <label className="block text-slate-700 font-bold mb-1">Maximum Permissible Transit Time (Minutes)</label>
          <input
            type="number"
            min={20}
            max={90}
            value={policies.maxTransitMinutes}
            onChange={(e) =>
              setPolicies({ ...policies, maxTransitMinutes: Number(e.target.value) || 45 })
            }
            className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono"
          />
          <p className="text-[11px] text-slate-400 mt-1">
            Student one-way travel time ceiling from initial pickup to school gate.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-slate-700 font-bold mb-1">Campus Speed Governor Limit (km/h)</label>
            <input
              type="number"
              min={15}
              max={60}
              value={policies.speedGovernorKmh}
              onChange={(e) =>
                setPolicies({ ...policies, speedGovernorKmh: Number(e.target.value) || 40 })
              }
              className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono"
            />
          </div>
          <div>
            <label className="block text-slate-700 font-bold mb-1">Delay Alert Threshold (Minutes)</label>
            <input
              type="number"
              min={5}
              max={30}
              value={policies.notificationThresholdMinutes}
              onChange={(e) =>
                setPolicies({ ...policies, notificationThresholdMinutes: Number(e.target.value) || 10 })
              }
              className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono"
            />
          </div>
        </div>

        <div>
          <label className="block text-slate-700 font-bold mb-1">Emergency Dispatch Hotline</label>
          <input
            type="text"
            value={policies.emergencyHotline}
            onChange={(e) => setPolicies({ ...policies, emergencyHotline: e.target.value })}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono"
          />
        </div>

        <div className="space-y-3 pt-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={policies.chaperoneRequiredForElementary}
              onChange={(e) => setPolicies({ ...policies, chaperoneRequiredForElementary: e.target.checked })}
              className="w-4 h-4 text-amber-600 rounded"
            />
            <span className="font-semibold text-slate-800">Mandatory Bus Safety Attendant on all elementary runs</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={policies.preTripInspectionMandatory}
              onChange={(e) => setPolicies({ ...policies, preTripInspectionMandatory: e.target.checked })}
              className="w-4 h-4 text-amber-600 rounded"
            />
            <span className="font-semibold text-slate-800">Daily Driver Pre-Trip Vehicle Checklist Sign-Off required</span>
          </label>
        </div>

        <div className="pt-4 border-t border-slate-100 flex justify-end">
          <button
            onClick={() => {
              localStorage.setItem(TR_POLICIES_KEY, JSON.stringify(policies));
              addToast('Policies Saved', 'Transport dispatch policies saved to institutional cache.', 'success');
            }}
            className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold shadow-xs transition-colors"
          >
            Save Dispatch Policies
          </button>
        </div>
      </div>
    </div>
  );

  /* =============================================================
     MODULE 15: DIRECTOR PROFILE
  ============================================================= */
  const renderProfile = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col md:flex-row items-center gap-6">
        <div className="w-20 h-20 rounded-2xl bg-amber-700 text-white flex items-center justify-center font-bold text-2xl shadow-md">
          GV
        </div>
        <div className="flex-1 text-center md:text-left">
          <span className="text-xs font-semibold uppercase tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/70">
            Transport & Fleet Logistics Director
          </span>
          <h2 className="text-2xl font-bold text-slate-900 mt-1">Gary Vance</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Certified Pupil Transportation Specialist (CPTS) · Commercial Fleet Master Logistics
          </p>
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-3 text-xs text-slate-600">
            <span>Staff ID: <strong>STF-OPS-004</strong></span>
            <span>·</span>
            <span>Email: <strong>transport@greenfield.edu</strong></span>
            <span>·</span>
            <span>Direct Radio Bay: <strong>Channel 4 (Dispatch)</strong></span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3 text-xs">
          <h3 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">Department Authority</h3>
          <p className="text-slate-600 leading-relaxed">
            Full operational authority over school vehicle procurement, route scheduling, CDL driver qualification, and student transit allocations.
          </p>
          <div className="pt-2 border-t border-slate-100 space-y-1.5 text-slate-600">
            <div className="flex justify-between">
              <span>Fleet Authorization:</span>
              <span className="font-bold text-slate-800">Master Dispatch</span>
            </div>
            <div className="flex justify-between">
              <span>Roster Oversight:</span>
              <span className="font-bold text-slate-800">Grades K–12</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3 text-xs">
          <h3 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">Dispatch Shift Hours</h3>
          <div className="space-y-2 text-slate-600">
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span>Morning Dispatch:</span>
              <span className="font-bold text-slate-900">06:30 AM – 08:30 AM</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span>Afternoon Return:</span>
              <span className="font-bold text-slate-900">02:45 PM – 04:45 PM</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span>Fleet Maintenance Bay:</span>
              <span className="font-bold text-slate-900">09:00 AM – 02:00 PM</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3 text-xs">
          <h3 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">Safety Certifications</h3>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-emerald-700 bg-emerald-50 p-2.5 rounded-xl border border-emerald-200">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>National Safety Council Certified</span>
            </div>
            <div className="flex items-center gap-2 text-amber-700 bg-amber-50 p-2.5 rounded-xl border border-amber-200">
              <Check className="w-4 h-4 text-amber-600" />
              <span>DOT & State Pupil Transit Master</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  /* =============================================================
     MAIN DISPATCH ROUTER
  ============================================================= */
  return (
    <div>
      {/* Route according to state.activeNav */}
      {state.activeNav === 'dashboard' && renderDashboard()}
      {state.activeNav === 'vehicles' && renderVehicles()}
      {state.activeNav === 'drivers' && renderDrivers()}
      {state.activeNav === 'staff' && renderStaff()}
      {state.activeNav === 'routes' && renderRoutes()}
      {state.activeNav === 'stops' && renderStops()}
      {state.activeNav === 'schedules' && renderSchedules()}
      {state.activeNav === 'allocations' && renderAllocations()}
      {state.activeNav === 'rosters' && renderRosters()}
      {state.activeNav === 'maintenance' && renderMaintenance()}
      {(state.activeNav === 'incidents' || state.activeNav === 'safety') && renderIncidents()}
      {state.activeNav === 'announcements' && renderAnnouncements()}
      {state.activeNav === 'reports' && renderReports()}
      {state.activeNav === 'settings' && renderSettings()}
      {state.activeNav === 'profile' && renderProfile()}

      {/* Fallback to dashboard */}
      {![
        'dashboard',
        'vehicles',
        'drivers',
        'staff',
        'routes',
        'stops',
        'schedules',
        'allocations',
        'rosters',
        'maintenance',
        'incidents',
        'safety',
        'announcements',
        'reports',
        'settings',
        'profile',
      ].includes(state.activeNav) && renderDashboard()}

      {/* =========================================================
         MODALS
      ========================================================= */}

      {/* MODAL 1: Add Route Modal */}
      {isAddRouteModalOpen && (
        <Modal
          isOpen={isAddRouteModalOpen}
          onClose={() => setIsAddRouteModalOpen(false)}
          title="Register New School Bus Route"
          subtitle="Add a transit line to the Greenfield campus logistics network."
        >
          <form onSubmit={handleCreateRoute} className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Route Code *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. BUS-05"
                  value={routeFormData.routeCode}
                  onChange={(e) => setRouteFormData({ ...routeFormData, routeCode: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Vehicle Plate *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. GIS-B-05"
                  value={routeFormData.vehicleNumber}
                  onChange={(e) => setRouteFormData({ ...routeFormData, vehicleNumber: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Route Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Route 5 — East Valley & Meadowbrook"
                value={routeFormData.routeName}
                onChange={(e) => setRouteFormData({ ...routeFormData, routeName: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Starting Hub / Stop</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Meadowbrook Library Park"
                  value={routeFormData.startPoint}
                  onChange={(e) => setRouteFormData({ ...routeFormData, startPoint: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Campus Gate Destination</label>
                <input
                  type="text"
                  required
                  value={routeFormData.endPoint}
                  onChange={(e) => setRouteFormData({ ...routeFormData, endPoint: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Driver Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Robert Kowalski"
                  value={routeFormData.driverName}
                  onChange={(e) => setRouteFormData({ ...routeFormData, driverName: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Driver Phone</label>
                <input
                  type="text"
                  required
                  placeholder="+1 (555) 891-2015"
                  value={routeFormData.driverPhone}
                  onChange={(e) => setRouteFormData({ ...routeFormData, driverPhone: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Bus Capacity</label>
                <input
                  type="number"
                  min="10"
                  max="60"
                  value={routeFormData.capacity}
                  onChange={(e) => setRouteFormData({ ...routeFormData, capacity: parseInt(e.target.value) || 36 })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Morning Pickup</label>
                <input
                  type="text"
                  value={routeFormData.morningPickupTime}
                  onChange={(e) => setRouteFormData({ ...routeFormData, morningPickupTime: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Afternoon Drop</label>
                <input
                  type="text"
                  value={routeFormData.afternoonDropTime}
                  onChange={(e) => setRouteFormData({ ...routeFormData, afternoonDropTime: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 font-mono"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setIsAddRouteModalOpen(false)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg shadow-xs"
              >
                Save Route
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* MODAL 2: Edit Route Modal */}
      {isEditRouteModalOpen && selectedRouteForEdit && (
        <Modal
          isOpen={isEditRouteModalOpen}
          onClose={() => setIsEditRouteModalOpen(false)}
          title={`Edit Route: ${selectedRouteForEdit.routeCode}`}
          subtitle="Modify vehicle allocation, timings, or operational status."
        >
          <form onSubmit={handleUpdateRoute} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Route Name</label>
              <input
                type="text"
                required
                value={selectedRouteForEdit.routeName}
                onChange={(e) =>
                  setSelectedRouteForEdit({ ...selectedRouteForEdit, routeName: e.target.value })
                }
                className="w-full px-3 py-2 rounded-lg border border-slate-200"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Driver Name</label>
                <input
                  type="text"
                  required
                  value={selectedRouteForEdit.driverName}
                  onChange={(e) =>
                    setSelectedRouteForEdit({ ...selectedRouteForEdit, driverName: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-slate-200"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Operational Status</label>
                <select
                  value={selectedRouteForEdit.status}
                  onChange={(e) =>
                    setSelectedRouteForEdit({
                      ...selectedRouteForEdit,
                      status: e.target.value as any,
                    })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
                >
                  <option value="Idle">Idle</option>
                  <option value="On Route">On Route</option>
                  <option value="Completed">Completed</option>
                  <option value="Maintenance">Maintenance</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Morning Pickup</label>
                <input
                  type="text"
                  value={selectedRouteForEdit.morningPickupTime}
                  onChange={(e) =>
                    setSelectedRouteForEdit({
                      ...selectedRouteForEdit,
                      morningPickupTime: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Afternoon Drop</label>
                <input
                  type="text"
                  value={selectedRouteForEdit.afternoonDropTime}
                  onChange={(e) =>
                    setSelectedRouteForEdit({
                      ...selectedRouteForEdit,
                      afternoonDropTime: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 font-mono"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setIsEditRouteModalOpen(false)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg shadow-xs"
              >
                Update Route
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* MODAL 3: Delete Route Confirmation */}
      {deleteConfirmRoute && (
        <Modal
          isOpen={!!deleteConfirmRoute}
          onClose={() => setDeleteConfirmRoute(null)}
          title="Delete Transit Route?"
          subtitle="Confirm removal from active fleet schedule."
        >
          <div className="text-xs space-y-4">
            <p className="text-slate-600 leading-relaxed">
              Are you sure you want to remove <strong>{deleteConfirmRoute.routeName} ({deleteConfirmRoute.routeCode})</strong>?
              Any currently assigned students will need to be reallocated to another route.
            </p>
            <div className="pt-2 flex justify-end gap-2.5">
              <button
                onClick={() => setDeleteConfirmRoute(null)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteRoute}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-lg shadow-xs"
              >
                Yes, Delete Route
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* MODAL 4: Add Fleet Vehicle Modal */}
      <Modal
        isOpen={isAddVehicleModalOpen}
        onClose={() => setIsAddVehicleModalOpen(false)}
        title="Register Fleet Vehicle"
        subtitle="Add a new bus, mini-bus, or transit van to school fleet inventory."
      >
        <form onSubmit={handleCreateVehicle} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Plate Number *</label>
              <input
                type="text"
                required
                placeholder="e.g. GIS-B-07"
                value={vehicleFormData.vehicleNumber}
                onChange={(e) => setVehicleFormData({ ...vehicleFormData, vehicleNumber: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Vehicle Type</label>
              <select
                value={vehicleFormData.vehicleType}
                onChange={(e) => setVehicleFormData({ ...vehicleFormData, vehicleType: e.target.value as any })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
              >
                <option value="School Bus">School Bus (Large)</option>
                <option value="Mini Bus">Mini Bus</option>
                <option value="Transit Van">Transit Van</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Make & Model *</label>
            <input
              type="text"
              required
              placeholder="e.g. Blue Bird All American FE"
              value={vehicleFormData.makeModel}
              onChange={(e) => setVehicleFormData({ ...vehicleFormData, makeModel: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-slate-200"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Seating Capacity *</label>
              <input
                type="number"
                min={8}
                max={60}
                required
                value={vehicleFormData.capacity}
                onChange={(e) => setVehicleFormData({ ...vehicleFormData, capacity: Number(e.target.value) || 36 })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Fuel Type</label>
              <select
                value={vehicleFormData.fuelType}
                onChange={(e) => setVehicleFormData({ ...vehicleFormData, fuelType: e.target.value as any })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
              >
                <option value="Diesel">Diesel</option>
                <option value="CNG">CNG</option>
                <option value="Electric">Electric</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Model Year</label>
              <input
                type="number"
                value={vehicleFormData.year}
                onChange={(e) => setVehicleFormData({ ...vehicleFormData, year: Number(e.target.value) || 2024 })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Insurance Expiry Date</label>
              <input
                type="date"
                value={vehicleFormData.insuranceExpiry}
                onChange={(e) => setVehicleFormData({ ...vehicleFormData, insuranceExpiry: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Fitness Certificate Expiry</label>
              <input
                type="date"
                value={vehicleFormData.fitnessInspectionExpiry}
                onChange={(e) => setVehicleFormData({ ...vehicleFormData, fitnessInspectionExpiry: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 font-mono"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end gap-2.5">
            <button
              type="button"
              onClick={() => setIsAddVehicleModalOpen(false)}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg shadow-xs"
            >
              Register Vehicle
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL 5: Assign Student to Route Modal */}
      <Modal
        isOpen={isAssignStudentModalOpen}
        onClose={() => setIsAssignStudentModalOpen(false)}
        title="Assign Student to Bus Transit Route"
        subtitle="Verify route capacity, select ordered stops, and authorize daily transit."
      >
        <form onSubmit={handleAssignStudent} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-700 font-semibold mb-1">Select Student *</label>
            <select
              value={assignStudentId}
              onChange={(e) => setAssignStudentId(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
            >
              <option value="">-- Choose Enrolled Student --</option>
              {state.students.map((s) => {
                const currentAsg = assignments.find((a) => a.studentId === s.id);
                return (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.class}) · ID: {s.admissionId}{' '}
                    {currentAsg ? `[Currently on ${currentAsg.routeCode}]` : '[Unassigned]'}
                  </option>
                );
              })}
            </select>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Select Transit Line *</label>
            <select
              value={assignRouteId}
              onChange={(e) => {
                setAssignRouteId(e.target.value);
                setAssignPickupStopId('');
                setAssignDropStopId('');
              }}
              required
              className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
            >
              <option value="">-- Choose Route Line --</option>
              {routes.map((r) => (
                <option
                  key={r.id}
                  value={r.id}
                  disabled={r.assignedStudents >= r.capacity || r.status === 'Maintenance'}
                >
                  {r.routeCode} — {r.routeName} ({r.assignedStudents}/{r.capacity} Seats{' '}
                  {r.assignedStudents >= r.capacity ? 'FULL' : 'Available'})
                </option>
              ))}
            </select>
          </div>

          {assignRouteId && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Pickup Stop (Morning) *</label>
                <select
                  value={assignPickupStopId}
                  onChange={(e) => setAssignPickupStopId(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
                >
                  <option value="">-- Choose Pickup Stop --</option>
                  {stops
                    .filter((s) => s.routeId === assignRouteId || s.routeCode === routes.find((x) => x.id === assignRouteId)?.routeCode)
                    .map((s) => (
                      <option key={s.id} value={s.id}>
                        Stop {s.stopSequence}: {s.stopName} ({s.pickupTime})
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Drop Stop (Afternoon) *</label>
                <select
                  value={assignDropStopId}
                  onChange={(e) => setAssignDropStopId(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
                >
                  <option value="">-- Choose Drop Stop --</option>
                  {stops
                    .filter((s) => s.routeId === assignRouteId || s.routeCode === routes.find((x) => x.id === assignRouteId)?.routeCode)
                    .map((s) => (
                      <option key={s.id} value={s.id}>
                        Stop {s.stopSequence}: {s.stopName} ({s.dropTime})
                      </option>
                    ))}
                </select>
              </div>
            </div>
          )}

          <div className="pt-4 border-t border-slate-100 flex justify-end gap-2.5">
            <button
              type="button"
              onClick={() => setIsAssignStudentModalOpen(false)}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg shadow-xs"
            >
              Confirm Allocation
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL 6: Vehicle Maintenance Modal */}
      <Modal
        isOpen={isAddMaintenanceModalOpen}
        onClose={() => setIsAddMaintenanceModalOpen(false)}
        title="Open Fleet Maintenance Work Order"
        subtitle="Log scheduled inspection or repair order and decommission vehicle temporarily."
      >
        <form onSubmit={handleLogMaintenance} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-700 font-semibold mb-1">Select Fleet Vehicle *</label>
            <select
              value={maintenanceForm.vehicleNumber}
              onChange={(e) => setMaintenanceForm({ ...maintenanceForm, vehicleNumber: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white font-mono"
            >
              {vehicles.map((v) => (
                <option key={v.id} value={v.vehicleNumber}>
                  {v.vehicleNumber} ({v.makeModel}) · Status: {v.status}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Service Type</label>
              <select
                value={maintenanceForm.serviceType}
                onChange={(e) => setMaintenanceForm({ ...maintenanceForm, serviceType: e.target.value as any })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
              >
                <option value="Routine Service">Routine 10,000 km Service</option>
                <option value="Brake Inspection">Brake Inspection & Overhaul</option>
                <option value="Tire Replacement">Tire Replacement & Alignment</option>
                <option value="Engine Diagnostic">Engine Diagnostic Check</option>
                <option value="AC System Service">AC Climate Control Service</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Estimated Cost ($)</label>
              <input
                type="number"
                min={0}
                value={maintenanceForm.cost}
                onChange={(e) => setMaintenanceForm({ ...maintenanceForm, cost: Number(e.target.value) || 0 })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Workshop / Authorized Vendor</label>
            <input
              type="text"
              value={maintenanceForm.workshopVendor}
              onChange={(e) => setMaintenanceForm({ ...maintenanceForm, workshopVendor: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-slate-200"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Technician Notes</label>
            <textarea
              rows={2}
              value={maintenanceForm.technicianNotes}
              onChange={(e) => setMaintenanceForm({ ...maintenanceForm, technicianNotes: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-slate-200"
            />
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end gap-2.5">
            <button
              type="button"
              onClick={() => setIsAddMaintenanceModalOpen(false)}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-lg shadow-xs"
            >
              Authorize Work Order
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL 7: Transport Incident Modal */}
      <Modal
        isOpen={isAddIncidentModalOpen}
        onClose={() => setIsAddIncidentModalOpen(false)}
        title="Log Safety or Route Disruption Incident"
        subtitle="Document route delay, mechanical breakdown, or student behavior issue."
      >
        <form onSubmit={handleLogIncident} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Route Code *</label>
              <select
                value={incidentForm.routeCode}
                onChange={(e) => setIncidentForm({ ...incidentForm, routeCode: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white font-mono"
              >
                {routes.map((r) => (
                  <option key={r.id} value={r.routeCode}>
                    {r.routeCode} — {r.routeName}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Vehicle Plate</label>
              <input
                type="text"
                value={incidentForm.vehicleNumber}
                onChange={(e) => setIncidentForm({ ...incidentForm, vehicleNumber: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Incident Category</label>
              <select
                value={incidentForm.category}
                onChange={(e) => setIncidentForm({ ...incidentForm, category: e.target.value as any })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
              >
                <option value="Minor Delay">Minor Delay (Traffic / Congestion)</option>
                <option value="Mechanical Issue">Mechanical Issue</option>
                <option value="Route Detour">Route Detour (Roadwork)</option>
                <option value="Inclement Weather">Inclement Weather</option>
                <option value="Student Behavior">Student Behavior Protocol</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Severity</label>
              <select
                value={incidentForm.severity}
                onChange={(e) => setIncidentForm({ ...incidentForm, severity: e.target.value as any })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Incident Description *</label>
            <textarea
              required
              rows={3}
              placeholder="Detail circumstances, timing, location, and nature of delay..."
              value={incidentForm.description}
              onChange={(e) => setIncidentForm({ ...incidentForm, description: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-slate-200"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Immediate Action Taken</label>
            <input
              type="text"
              placeholder="e.g. Detoured via alternate arterial road; informed school gate dispatch"
              value={incidentForm.actionTaken}
              onChange={(e) => setIncidentForm({ ...incidentForm, actionTaken: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-slate-200"
            />
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end gap-2.5">
            <button
              type="button"
              onClick={() => setIsAddIncidentModalOpen(false)}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-lg shadow-xs"
            >
              Record Incident
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL 8: Transport Announcement Modal */}
      <Modal
        isOpen={isAddAnnouncementModalOpen}
        onClose={() => setIsAddAnnouncementModalOpen(false)}
        title="Broadcast Transit Bulletin"
        subtitle="Transmit route alert or delay advisory to student riders and parents."
      >
        <form onSubmit={handlePostAnnouncement} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Target Route *</label>
              <select
                value={announcementForm.routeCode}
                onChange={(e) => setAnnouncementForm({ ...announcementForm, routeCode: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white font-mono"
              >
                <option value="ALL">ALL Routes (Fleet-Wide)</option>
                {routes.map((r) => (
                  <option key={r.id} value={r.routeCode}>
                    {r.routeCode} ({r.routeName})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Priority</label>
              <select
                value={announcementForm.priority}
                onChange={(e) => setAnnouncementForm({ ...announcementForm, priority: e.target.value as any })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
              >
                <option value="Normal">Normal Advisory</option>
                <option value="High">High (Immediate Alert)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Bulletin Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. Morning Route 2 Delay Advisory (15 Mins)"
              value={announcementForm.title}
              onChange={(e) => setAnnouncementForm({ ...announcementForm, title: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-slate-200"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Message Content *</label>
            <textarea
              required
              rows={3}
              placeholder="Enter message details for parent mobile notifications..."
              value={announcementForm.message}
              onChange={(e) => setAnnouncementForm({ ...announcementForm, message: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-slate-200"
            />
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end gap-2.5">
            <button
              type="button"
              onClick={() => setIsAddAnnouncementModalOpen(false)}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-xs"
            >
              Broadcast Bulletin
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL 9: Vehicle Dossier */}
      {selectedVehicleForView && (
        <Modal
          isOpen={!!selectedVehicleForView}
          onClose={() => setSelectedVehicleForView(null)}
          title={`Fleet Dossier: ${selectedVehicleForView.vehicleNumber}`}
          subtitle={`${selectedVehicleForView.makeModel} · ${selectedVehicleForView.vehicleType}`}
        >
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-100">
              <div>
                <span className="text-slate-500 block">Seating Capacity:</span>
                <span className="font-bold text-slate-900">{selectedVehicleForView.capacity} Passengers</span>
              </div>
              <div>
                <span className="text-slate-500 block">Fuel Engine:</span>
                <span className="font-bold text-slate-900">{selectedVehicleForView.fuelType}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Odometer Reading:</span>
                <span className="font-mono font-bold text-slate-900">{selectedVehicleForView.odometerKm.toLocaleString()} km</span>
              </div>
              <div>
                <span className="text-slate-500 block">Model Year:</span>
                <span className="font-mono font-bold text-slate-900">{selectedVehicleForView.year || 2023}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Fitness Certificate:</span>
                <span className="font-mono text-emerald-700 font-bold">{selectedVehicleForView.fitnessInspectionExpiry}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Insurance Expiry:</span>
                <span className="font-mono text-slate-700">{selectedVehicleForView.insuranceExpiry}</span>
              </div>
            </div>

            <div>
              <span className="text-slate-500 block">Assigned Driver & Route:</span>
              <p className="font-semibold text-slate-800 mt-0.5">
                {selectedVehicleForView.driverName || 'No permanent driver'} · {selectedVehicleForView.assignedRouteCode || 'Unassigned Line'}
              </p>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedVehicleForView(null)}
                className="px-4 py-2 bg-slate-900 text-white rounded-lg font-semibold text-xs"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
