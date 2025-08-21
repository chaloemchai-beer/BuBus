import { useState, useEffect, useRef } from 'react';
import {
  MapPin,
  Bus,
  Navigation,
  Clock,
  Route,
  ChevronDown,
  ChevronUp,
  Timer,
  Target,
  AlertCircle,
  Info
} from 'lucide-react';
import L from "leaflet";

import "leaflet/dist/leaflet.css";
import { locations } from "./data/location";

// ✅ Full, working component (no cuts). Tested with React + Vite.
// If you use Next.js (SSR), load this component on client only (e.g., dynamic import with ssr: false).

const BangkokUniversityMap = () => {
  // Campus locations data


  // Bus route (circular route connecting all locations)
  const busRoute = [1, 2, 4, 5, 6, 3, 7, 8, 1];

  // State management
  const [currentTime, setCurrentTime] = useState(new Date());
  const [busPosition, setBusPosition] = useState(0); // index along busRoute (float to interpolate)
  const [busProgress, setBusProgress] = useState(0); // 0..1 progress to next stop
  const [selectedOrigin, setSelectedOrigin] = useState('');
  const [selectedDestination, setSelectedDestination] = useState('');
  const [userLocation, setUserLocation] = useState(null);
  const [showSchedule, setShowSchedule] = useState(false);
  const [showLocations, setShowLocations] = useState(false);
  const [routeInfo, setRouteInfo] = useState(null);
  const [mapLoading, setMapLoading] = useState(true);
  const [locationError, setLocationError] = useState('');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const mapRef = useRef(null);
  const leafletMap = useRef(null);
  const busMarker = useRef(null);
  const routePolyline = useRef(null);
  const markers = useRef([]);
  const userMarker = useRef(null);

  // กำหนดช่วงเวลาอีเว้นต์ปรับปรุง
  const maintenanceStart = new Date();
  maintenanceStart.setHours(20, 48, 0, 0); // 14:00 วันนี้

  const maintenanceEnd = new Date(maintenanceStart.getTime() + 60 * 60000); // +1 ชั่วโมง = 15:00

  const isMaintenance = currentTime >= maintenanceStart && currentTime <= maintenanceEnd;
  const isOperatingHours = currentTime.getHours() >= 8 && currentTime.getHours() < 18 && !isMaintenance;

  // Time utilities
  const formatTime = (date) => {
    return date.toLocaleTimeString('th-TH', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatTimeShort = (date) => {
    return date.toLocaleTimeString('th-TH', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get location type icon
  const getLocationIcon = (type) => {
    switch (type) {
      case 'store': return '🏪';
      case 'academic': return '🏢';
      case 'facility': return '🌳';
      default: return '📍';
    }
  };

  // Get location type color
  const getLocationColor = (type) => {
    switch (type) {
      case 'store': return 'bg-purple-100 text-purple-800';
      case 'academic': return 'bg-blue-100 text-blue-800';
      case 'facility': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Calculate travel time and next bus arrival
  const calculateRouteInfo = (originId, destinationId) => {
    if (!originId || !destinationId || originId === destinationId) return null;

    const originIndex = busRoute.indexOf(Number(originId));
    const destinationIndex = busRoute.indexOf(Number(destinationId));

    if (originIndex === -1 || destinationIndex === -1) return null;

    let stopsCount;
    if (destinationIndex > originIndex) {
      stopsCount = destinationIndex - originIndex;
    } else {
      stopsCount = (busRoute.length - 1 - originIndex) + destinationIndex;
    }

    const travelTime = stopsCount * 3; // 3 นาทีต่อป้าย

    let nextArrivalMinutes;
    const currentBusIndex = Math.floor(busPosition);
    const currentRouteIndex = Math.min(currentBusIndex, busRoute.length - 2);

    if (originIndex >= currentRouteIndex) {
      nextArrivalMinutes = (originIndex - currentRouteIndex) * 3;
    } else {
      nextArrivalMinutes = ((busRoute.length - 1 - currentRouteIndex) + originIndex) * 3;
    }
    nextArrivalMinutes += (1 - busProgress) * 3;
    nextArrivalMinutes = Math.max(0, Math.round(nextArrivalMinutes));

    let nextArrival = new Date(currentTime.getTime() + nextArrivalMinutes * 60000);

    // ถ้าเลยเวลา 18:00 ให้เลื่อนไปวันถัดไป 08:00
    if (nextArrival.getHours() >= 18) {
      nextArrival = new Date(nextArrival.getFullYear(), nextArrival.getMonth(), nextArrival.getDate() + 1, 8, 0, 0);
    }
    const arrivalAtDestination = new Date(nextArrival.getTime() + travelTime * 60000);

    return {
      travelTime,
      nextArrival,
      arrivalAtDestination,
      stopsCount,
      waitingTime: Math.max(0, Math.round((nextArrival - currentTime) / 60000))
    };
  };

  // Initialize Leaflet map
  useEffect(() => {
    initMap();

    return () => {
      if (leafletMap.current) {
        leafletMap.current.remove();
        leafletMap.current = null;
      }
    };
  }, []);

  const initMap = () => {
    if (leafletMap.current) return;
    if (!mapRef.current) return;

    leafletMap.current = L.map(mapRef.current, {
      center: [14.039585, 100.61193],
      zoom: 16,
      zoomControl: true
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(leafletMap.current);

    // Add location markers with custom icons
    locations.forEach(location => {
      const customIcon = L.divIcon({
        html: `
          <div style="
            background: linear-gradient(135deg, #3B82F6, #1E40AF);
            color: white;
            border-radius: 50%;
            width: 32px;
            height: 32px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 16px;
            border: 3px solid white;
            box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
            font-weight: bold;
          ">${getLocationIcon(location.type)}</div>
        `,
        className: 'custom-location-icon',
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });

      const marker = L.marker([location.lat, location.lng], { icon: customIcon })
        .bindPopup(`
          <div style="font-family: system-ui; padding: 8px;">
            <h3 style="margin: 0 0 8px 0; color: #1E40AF; font-size: 16px;">${location.name}</h3>
            <p style="margin: 0; color: #6B7280; font-size: 14px;">ประเภท: ${location.type === 'academic' ? 'อาคารเรียน' : location.type === 'store' ? 'ร้านค้า' : 'สิ่งอำนวยความสะดวก'}</p>
          </div>
        `)
        .addTo(leafletMap.current);
      markers.current.push(marker);
    });

    // Add bus route polyline
    const routeCoords = busRoute.map(id => {
      const loc = locations.find(l => l.id === id);
      return [loc.lat, loc.lng];
    });

    routePolyline.current = L.polyline(routeCoords, {
      color: '#3B82F6',
      weight: 5,
      opacity: 0.8,
      dashArray: '10, 5',
      lineCap: 'round',
      lineJoin: 'round'
    }).addTo(leafletMap.current);

    // Add bus marker with animated icon
    const busIcon = L.divIcon({
      html: `
        <div style="
          background: linear-gradient(135deg, #EF4444, #DC2626);
          color: white;
          border-radius: 50%;
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          border: 3px solid white;
          box-shadow: 0 6px 20px rgba(239, 68, 68, 0.5);
          animation: busFloat 2s ease-in-out infinite;
        ">🚌</div>
        <style>
          @keyframes busFloat {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-3px); }
          }
        </style>
      `,
      className: 'custom-bus-icon',
      iconSize: [36, 36],
      iconAnchor: [18, 18]
    });

    const firstLocation = locations.find(l => l.id === busRoute[0]);
    busMarker.current = L.marker([firstLocation.lat, firstLocation.lng], { icon: busIcon })
      .bindPopup(`
        <div style="font-family: system-ui; padding: 8px; text-align: center;">
          <h3 style="margin: 0 0 8px 0; color: #EF4444; font-size: 16px;">🚌 รถบัสมหาวิทยาลัย</h3>
          <p style="margin: 0; color: #6B7280; font-size: 14px;">กำลังเดินทางตามเส้นทาง</p>
          <p style="margin: 4px 0 0 0; color: #059669; font-size: 12px; font-weight: bold;">ทุก 15 นาที</p>
        </div>
      `)
      .addTo(leafletMap.current);

    setMapLoading(false);
  };


  // Update bus position animation
  // Update bus position animation
  useEffect(() => {
    const interval = setInterval(() => {
      const hours = currentTime.getHours();
      const operatingHours = hours >= 8 && hours < 18;

      if (operatingHours && !isMaintenance) { // <-- เพิ่ม !isMaintenance
        setBusProgress(prev => {
          if (prev >= 1) {
            setBusPosition(prevPos => (prevPos + 1) % (busRoute.length - 1));
            return 0;
          }
          return prev + 0.012; // ความเร็วปกติ
        });
      }
      // ถ้าอยู่นอกเวลาทำการ หรือกำลังปรับปรุง จะไม่อัปเดต busProgress => bus หยุด
    }, 200);

    return () => clearInterval(interval);
  }, [currentTime, isMaintenance]);
  useEffect(() => {
    if (isMaintenance) {
      // Bus หยุดตรงตำแหน่งปัจจุบัน
      setBusProgress(prev => prev); // ไม่เปลี่ยน
      setBusPosition(prev => prev); // ไม่เปลี่ยน
    }
  }, [isMaintenance]);


  // Update bus marker position
  useEffect(() => {
    if (busMarker.current && locations.length > 0) {
      const currentLocationId = busRoute[Math.floor(busPosition)];
      const nextLocationId = busRoute[(Math.floor(busPosition) + 1) % busRoute.length];

      const currentLoc = locations.find(l => l.id === currentLocationId);
      const nextLoc = locations.find(l => l.id === nextLocationId);

      if (currentLoc && nextLoc) {
        const lat = currentLoc.lat + (nextLoc.lat - currentLoc.lat) * busProgress;
        const lng = currentLoc.lng + (nextLoc.lng - currentLoc.lng) * busProgress;
        busMarker.current.setLatLng([lat, lng]);
      }
    }
  }, [busPosition, busProgress]);

  useEffect(() => {
    const hours = currentTime.getHours();
    if (hours < 8 || hours >= 18) {
      const c8Index = busRoute.indexOf(8);
      if (c8Index !== -1) {
        setBusPosition(c8Index);
        setBusProgress(0);
      }
    }
  }, [currentTime]);


  // Update current time
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Update route info
  useEffect(() => {
    const info = calculateRouteInfo(selectedOrigin, selectedDestination);
    setRouteInfo(info);
  }, [selectedOrigin, selectedDestination, currentTime, busPosition, busProgress]);


  // Get user location
  const getUserLocation = () => {
    setLocationError('');
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lng: longitude });

          if (leafletMap.current) {
            if (userMarker.current) {
              leafletMap.current.removeLayer(userMarker.current);
            }

            const userIcon = L.divIcon({
              html: `
                <div style="
                  background: linear-gradient(135deg, #10B981, #059669);
                  color: white;
                  border-radius: 50%;
                  width: 28px;
                  height: 28px;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  font-size: 14px;
                  border: 3px solid white;
                  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
                  animation: userPulse 2s infinite;
                ">📍</div>
                <style>
                  @keyframes userPulse {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.1); }
                  }
                </style>
              `,
              className: 'custom-user-icon',
              iconSize: [28, 28],
              iconAnchor: [14, 14]
            });

            userMarker.current = L.marker([latitude, longitude], { icon: userIcon })
              .bindPopup(`
                <div style="font-family: system-ui; padding: 8px; text-align: center;">
                  <h3 style="margin: 0 0 8px 0; color: #10B981; font-size: 16px;">📍 ตำแหน่งของคุณ</h3>
                  <p style="margin: 0; color: #6B7280; font-size: 14px;">Lat: ${latitude.toFixed(6)}</p>
                  <p style="margin: 0; color: #6B7280; font-size: 14px;">Lng: ${longitude.toFixed(6)}</p>
                </div>
              `)
              .addTo(leafletMap.current);

            leafletMap.current.setView([latitude, longitude], 17);
          }
        },
        () => {
          setLocationError('ไม่สามารถเข้าถึงตำแหน่งของคุณได้ กรุณาอนุญาตการเข้าถึงตำแหน่ง');
        }
      );
    } else {
      setLocationError('เบราว์เซอร์ของคุณไม่รองรับ Geolocation');
    }
  };

  // Generate bus schedule
  const generateSchedule = () => {
    const schedule = [];
    const busInterval = 15; // นาที
    const startHour = 8;
    const endHour = 18;

    // เริ่มจาก 08:00
    const today = new Date();
    let time = new Date(today.getFullYear(), today.getMonth(), today.getDate(), startHour, 0, 0);

    while (time.getHours() < endHour) {
      const isNext = time > currentTime && schedule.length === 0;
      schedule.push({
        time: formatTimeShort(time),
        route: "Campus Circular Route",
        isNext,
        status: isNext ? 'กำลังมา' : 'รอ'
      });
      time = new Date(time.getTime() + busInterval * 60000);
    }

    return schedule;
  };

  const currentLocation = locations.find(l => l.id === busRoute[Math.floor(busPosition)]);

  return (
    <div className="flex h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 text-white shadow-2xl">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
              <Bus className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Bangkok University</h1>
              <p className="text-blue-100 text-sm">Campus Transport System</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-lg font-mono font-bold">{formatTime(currentTime)}</div>
              <div className="text-xs text-blue-200">เวลาปัจจุบัน</div>
            </div>

            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="lg:hidden p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors z-50 relative"
            >
              {sidebarCollapsed ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 bg-white bg-opacity-100 shadow-2xl overflow-y-auto w-80 transform transition-transform duration-300 ease-in-out ${sidebarCollapsed ? "-translate-x-full" : "translate-x-0"
          } lg:static lg:translate-x-0 lg:w-96 mt-20 lg:mt-20`}
      >


        {/* Route Planning Section */}
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center gap-2 mb-4">
            <Navigation className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-bold text-gray-800">วางแผนเส้นทาง</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">จุดเริ่มต้น</label>
              <select
                className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all bg-white"
                value={selectedOrigin}
                onChange={(e) => setSelectedOrigin(e.target.value)}
              >
                <option value="">เลือกจุดเริ่มต้น...</option>
                {locations.map(loc => (
                  <option key={loc.id} value={loc.id}>
                    {getLocationIcon(loc.type)} {loc.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">จุดหมายปลายทาง</label>
              <select
                className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all bg-white"
                value={selectedDestination}
                onChange={(e) => setSelectedDestination(e.target.value)}
              >
                <option value="">เลือกจุดหมาย...</option>
                {locations.map(loc => (
                  <option key={loc.id} value={loc.id}>
                    {getLocationIcon(loc.type)} {loc.name}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={getUserLocation}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white py-3 px-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <MapPin className="w-5 h-5" />
              ใช้ตำแหน่งปัจจุบัน
            </button>

            {locationError && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm">{locationError}</span>
              </div>
            )}
          </div>
        </div>

        {/* Route Information */}
        {routeInfo && (
          <div className="p-6 border-b bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
            <div className="flex items-center gap-2 mb-4">
              <Route className="w-5 h-5 text-blue-600" />
              <h3 className="font-bold text-blue-800">ข้อมูลการเดินทาง</h3>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-xl shadow-sm border border-blue-100">
                <div className="flex items-center gap-2 mb-2">
                  <Timer className="w-4 h-4 text-green-600" />
                  <span className="text-xs font-semibold text-gray-600">รถคันต่อไป</span>
                </div>
                <div className="text-lg font-bold text-green-600">{formatTimeShort(routeInfo.nextArrival)}</div>
                <div className="text-xs text-gray-500">อีก {routeInfo.waitingTime} นาที</div>
              </div>

              <div className="bg-white p-4 rounded-xl shadow-sm border border-blue-100">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-blue-600" />
                  <span className="text-xs font-semibold text-gray-600">เวลาเดินทาง</span>
                </div>
                <div className="text-lg font-bold text-blue-600">{routeInfo.travelTime} นาที</div>
                <div className="text-xs text-gray-500">{routeInfo.stopsCount} ป้าย</div>
              </div>

              <div className="col-span-2 bg-white p-4 rounded-xl shadow-sm border border-purple-100">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-4 h-4 text-purple-600" />
                  <span className="text-xs font-semibold text-gray-600">ถึงจุดหมาย</span>
                </div>
                <div className="text-xl font-bold text-purple-600">{formatTimeShort(routeInfo.arrivalAtDestination)}</div>
              </div>
            </div>
          </div>
        )}

        {/* Bus Schedule */}
        <div className="p-6 border-b">
          <button
            onClick={() => setShowSchedule(!showSchedule)}
            className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-150 rounded-xl transition-all duration-200 border border-gray-200"
          >
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-gray-600" />
              <span className="font-semibold text-gray-800">ตารางเวลารถบัส</span>
            </div>
            {showSchedule ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>

          {showSchedule && (
            <div className="mt-4 space-y-2">
              {generateSchedule().map((item, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-xl border-2 transition-all ${item.isNext
                    ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 shadow-md'
                    : index === 1
                      ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200'
                      : 'bg-gray-50 border-gray-200'
                    }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${item.isNext ? 'bg-green-500' : index === 1 ? 'bg-blue-500' : 'bg-gray-400'
                        }`}>
                        <Bus className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <div className="font-bold text-lg">{item.time}</div>
                        <div className="text-xs text-gray-600">เส้นทางวนรอบมหาวิทยาลัย</div>
                      </div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-bold ${item.isNext ? 'bg-green-500 text-white' :
                      index === 1 ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'
                      }`}>
                      {item.status}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Campus Locations */}
        <div className="p-6">
          <button
            onClick={() => setShowLocations(!showLocations)}
            className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 rounded-xl transition-all duration-200 border border-purple-200"
          >
            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-purple-600" />
              <span className="font-semibold text-gray-800">สถานที่ในมหาวิทยาลัย</span>
            </div>
            {showLocations ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>

          {showLocations && (
            <div className="mt-4 space-y-2">
              {locations.map(loc => (
                <button
                  key={loc.id}
                  onClick={() => {
                    if (leafletMap.current) {
                      leafletMap.current.setView([loc.lat, loc.lng], 18);
                    }
                  }}
                  className="w-full p-4 text-left bg-white hover:bg-gray-50 border border-gray-200 hover:border-purple-300 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md group"
                >
                  <div className="flex items-center gap-3">
                    <div className="text-xl">{getLocationIcon(loc.type)}</div>
                    <div className="flex-1">
                      <div className="font-semibold text-gray-800 group-hover:text-purple-700 transition-colors">
                        {loc.name}
                      </div>
                      <div className={`text-xs px-2 py-1 rounded-full inline-block mt-1 ${getLocationColor(loc.type)}`}>
                        {loc.type === 'academic' ? 'อาคารเรียน' :
                          loc.type === 'store' ? 'ร้านค้า' : 'สิ่งอำนวยความสะดวก'}
                      </div>
                    </div>
                    <Navigation className="w-4 h-4 text-gray-400 group-hover:text-purple-500 transition-colors" />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Map Container */}
      <div className="flex-1 relative mt-20 lg:mt-20 z-[1]">
        {mapLoading && (
          <div className="absolute inset-0 bg-white/90 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent"></div>
              <p className="mt-4 text-lg font-semibold text-gray-700">กำลังโหลดแผนที่...</p>
              <p className="text-sm text-gray-500">กรุณารอสักครู่</p>
            </div>
          </div>
        )}

        <div
          ref={mapRef}
          className="w-full"
          style={{
            minHeight: "calc(100vh - 80px)"
          }}
        />

        {/* Bus Status Floating Card */}
        <div className="
  absolute bg-white/95 backdrop-blur-lg p-4 rounded-2xl shadow-2xl border border-white/20
  w-11/12 max-w-sm h-[250px] z-[9999] top-5
  bottom-4 left-1/2 -translate-x-1/2
  lg:top-6 lg:right-6 lg:left-auto lg:translate-x-0
">
          <div className="flex items-center gap-3 mb-4">
            <div className="relative">
              <div className={`w-4 h-4 rounded-full animate-pulse ${currentTime.getHours() >= 8 && currentTime.getHours() < 18 ? 'bg-red-500' : 'bg-gray-400'}`}></div>
              <div className={`absolute inset-0 w-4 h-4 rounded-full ${currentTime.getHours() >= 8 && currentTime.getHours() < 18 ? 'bg-red-500 animate-ping opacity-75' : 'bg-gray-400'}`}></div>
            </div>
            <div>
              <h3 className="font-bold text-gray-800 text-lg">
                {isMaintenance ? 'กำลังปรับปรุง' : isOperatingHours ? 'รถบัสกำลังเดินทาง' : 'ปิดบริการ'}
              </h3>
              <p className="text-sm text-gray-600">
                {isMaintenance ? 'กำลังซ่อมแซม รถบัสไม่ให้บริการชั่วคราว' :
                  isOperatingHours ? 'สถานะ: ให้บริการปกติ' : 'รถบัสไม่ให้บริการในเวลานี้'}
              </p>
            </div>
          </div>

          {currentTime.getHours() >= 8 && currentTime.getHours() < 18 ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-xl border border-blue-100">
                <span className="text-sm font-semibold text-gray-700">ตำแหน่งปัจจุบัน:</span>
                <span className="text-sm font-bold text-blue-700">
                  {currentLocation?.name || 'กำลังเดินทาง...'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="text-center p-3 bg-green-50 rounded-xl border border-green-100">
                  <div className="text-xs text-gray-600 mb-1">ความถี่</div>
                  <div className="font-bold text-green-700">ทุก 15 นาที</div>
                </div>

                <div className="text-center p-3 bg-purple-50 rounded-xl border border-purple-100">
                  <div className="text-xs text-gray-600 mb-1">เวลาเฉลี่ย</div>
                  <div className="font-bold text-purple-700">3 นาที/ป้าย</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 text-center text-gray-500 font-semibold">
              รถบัสไม่ให้บริการในเวลานี้
            </div>
          )}
        </div>


        {/* Info Panel */}
        <div className="
      absolute bg-white/95 backdrop-blur-lg p-4 rounded-2xl shadow-2xl border border-white/20
      w-11/12 max-w-sm
      bottom-28 left-1/2 -translate-x-1/2
      lg:bottom-6 lg:left-6 lg:translate-x-0 z-[9999] bottom-10
    ">
          <div className="flex items-center gap-2 mb-2">
            <Info className="w-5 h-5 text-blue-600" />
            <span className="font-semibold text-gray-800">คำแนะนำ</span>
          </div>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• คลิกที่ป้าย เพื่อดูข้อมูลสถานที่</li>
            <li>• เลือกจุดเริ่มต้นและปลายทาง เพื่อวางแผนเส้นทาง</li>
            <li>• ใช้ปุ่ม "ตำแหน่งปัจจุบัน" เพื่อหาตำแหน่งคุณ</li>
          </ul>
        </div>

      </div>
    </div>
  );
};

export default BangkokUniversityMap;
