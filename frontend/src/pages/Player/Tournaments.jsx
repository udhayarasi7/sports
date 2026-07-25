import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import Modal from '../../components/Modal';

export default function PlayerTournaments() {
  const { user } = useSelector((state) => state.auth);
  const [tournaments, setTournaments] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(false);

  // Geolocation Dropdown Filters
  const [selectedCity, setSelectedCity] = useState('Chennai');
  const [selectedState, setSelectedState] = useState('Tamil Nadu');
  const [searchQuery, setSearchQuery] = useState('');

  // Team Registration Form Modal state
  const [isRegModalOpen, setIsRegModalOpen] = useState(false);
  const [selectedTournament, setSelectedTournament] = useState(null);
  const [activeTab, setActiveTab] = useState('active'); // 'active' or 'history'

  // Form Fields
  const [teamName, setTeamName] = useState('');
  const [captainName, setCaptainName] = useState('');
  const [captainPhone, setCaptainPhone] = useState('');
  const [targetCoachName, setTargetCoachName] = useState('');
  const [targetCoachEmail, setTargetCoachEmail] = useState('');
  const [members, setMembers] = useState([{ name: '', phone: '', email: '' }]);
  const [submitting, setSubmitting] = useState(false);

  // Map Modal State
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [mapVenueAddress, setMapVenueAddress] = useState('');
  const [mapVenueTitle, setMapVenueTitle] = useState('');

  const STATE_CITIES = {
    'Tamil Nadu': [
      'Ariyalur', 'Chengalpattu', 'Chennai', 'Coimbatore', 'Cuddalore', 'Dharmapuri', 
      'Dindigul', 'Erode', 'Kallakurichi', 'Kanchipuram', 'Kanyakumari', 'Karur', 
      'Krishnagiri', 'Madurai', 'Mayiladuthurai', 'Nagapattinam', 'Namakkal', 'Nilgiris', 
      'Perambalur', 'Pudukkottai', 'Ramanathapuram', 'Ranipet', 'Salem', 'Sivaganga', 
      'Tenkasi', 'Thanjavur', 'Theni', 'Thoothukudi', 'Tiruchirappalli', 'Tirunelveli', 
      'Tirupathur', 'Tiruppur', 'Tuvallur', 'Tiruvannamalai', 'Tiruvarur', 'Vellore', 
      'Viluppuram', 'Virudhunagar'
    ],
    'Karnataka': ['Bangalore', 'Mysore', 'Hubli', 'Mangalore', 'Belgaum'],
    'Kerala': ['Kochi', 'Trivandrum', 'Kozhikode', 'Thrissur', 'Alappuzha'],
    'Andhra Pradesh': ['Visakhapatnam', 'Vijayawada', 'Guntur', 'Nellore', 'Tirupati'],
    'Telangana': ['Hyderabad', 'Warangal', 'Nizamabad', 'Karimnagar'],
    'Maharashtra': ['Mumbai', 'Pune', 'Nagpur', 'Thane', 'Nashik'],
    'Delhi': ['New Delhi', 'South Delhi', 'North Delhi', 'West Delhi', 'East Delhi'],
    'Gujarat': ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Gandhinagar'],
    'Uttar Pradesh': ['Lucknow', 'Kanpur', 'Ghaziabad', 'Agra', 'Varanasi'],
    'West Bengal': ['Kolkata', 'Howrah', 'Durgapur', 'Siliguri', 'Asansol'],
    'Rajasthan': ['Jaipur', 'Jodhpur', 'Udaipur', 'Kota', 'Ajmer'],
    'Punjab': ['Ludhiana', 'Amritsar', 'Jalandhar', 'Patiala', 'Mohali'],
    'Haryana': ['Gurgaon', 'Faridabad', 'Panipat', 'Ambala', 'Rohtak'],
    'Goa': ['Panaji', 'Margao', 'Vasco da Gama', 'Mapusa'],
    'Madhya Pradesh': ['Indore', 'Bhopal', 'Jabalpur', 'Gwalior', 'Ujjain']
  };

  const CITY_COORDINATES = {
    'Ariyalur': [79.0747, 11.1401],
    'Chengalpattu': [79.9774, 12.6841],
    'Chennai': [80.2707, 13.0827],
    'Coimbatore': [76.9616, 11.0168],
    'Cuddalore': [79.7680, 11.7480],
    'Dharmapuri': [78.1578, 12.1211],
    'Dindigul': [77.9803, 10.3673],
    'Erode': [77.7172, 11.3410],
    'Kallakurichi': [78.9625, 11.7381],
    'Kanchipuram': [79.7037, 12.8256],
    'Kanyakumari': [77.5385, 8.0883],
    'Karur': [78.0766, 10.9601],
    'Krishnagiri': [78.2130, 12.5266],
    'Madurai': [78.1198, 9.9252],
    'Mayiladuthurai': [79.6542, 11.1018],
    'Nagapattinam': [79.8433, 10.7656],
    'Namakkal': [78.1652, 11.2189],
    'Nilgiris': [76.6932, 11.4064],
    'Perambalur': [78.8797, 11.2342],
    'Pudukkottai': [78.8275, 10.3797],
    'Ramanathapuram': [78.8356, 9.3639],
    'Ranipet': [79.3326, 12.9272],
    'Salem': [78.1460, 11.6643],
    'Sivaganga': [78.4809, 9.8433],
    'Tenkasi': [77.3182, 8.9592],
    'Thanjavur': [79.1378, 10.7870],
    'Theni': [77.4764, 10.0104],
    'Thoothukudi': [78.1348, 8.7642],
    'Tiruchirappalli': [78.6856, 10.7905],
    'Tirunelveli': [77.7567, 8.7139],
    'Tirupathur': [78.5672, 12.4932],
    'Tiruppur': [77.3411, 11.1085],
    'Tuvallur': [79.9083, 13.1383],
    'Tiruvannamalai': [79.0747, 12.2253],
    'Tiruvarur': [79.6344, 10.7731],
    'Vellore': [79.1378, 12.9165],
    'Viluppuram': [79.4862, 11.9401],
    'Virudhunagar': [77.9577, 9.5680],
    'Bangalore': [77.5946, 12.9716],
    'Mysore': [76.6394, 12.2958],
    'Hubli': [75.1240, 15.3647],
    'Mangalore': [74.8560, 12.9141],
    'Belgaum': [74.5089, 15.8497],
    'Kochi': [76.2711, 9.9312],
    'Trivandrum': [76.9366, 8.5241],
    'Kozhikode': [75.7804, 11.2588],
    'Thrissur': [76.2144, 10.5276],
    'Alappuzha': [76.3388, 9.4981],
    'Visakhapatnam': [83.2185, 17.6868],
    'Vijayawada': [80.6480, 16.5062],
    'Guntur': [80.4365, 16.3067],
    'Nellore': [79.9865, 14.4426],
    'Tirupati': [79.4192, 13.6288],
    'Hyderabad': [78.4867, 17.3850],
    'Warangal': [79.5941, 17.9689],
    'Nizamabad': [78.0941, 18.6725],
    'Karimnagar': [79.1328, 18.4386],
    'Mumbai': [72.8777, 19.0760],
    'Pune': [73.8567, 18.5204],
    'Nagpur': [79.0882, 21.1458],
    'Thane': [72.9781, 19.2183],
    'Nashik': [73.7898, 19.9975],
    'New Delhi': [77.2090, 28.6139],
    'South Delhi': [77.2244, 28.5369],
    'North Delhi': [77.1310, 28.7032],
    'West Delhi': [77.0732, 28.6619],
    'East Delhi': [77.2911, 28.6289],
    'Ahmedabad': [72.5714, 23.0225],
    'Surat': [72.8311, 21.1702],
    'Vadodara': [73.1812, 22.3072],
    'Rajkot': [70.7832, 22.3039],
    'Gandhinagar': [72.6369, 23.2156],
    'Lucknow': [80.9462, 26.8467],
    'Kanpur': [80.3319, 26.4499],
    'Ghaziabad': [77.4229, 28.6692],
    'Agra': [78.0081, 27.1767],
    'Varanasi': [82.9739, 25.3176],
    'Kolkata': [88.3639, 22.5726],
    'Howrah': [88.2636, 22.5958],
    'Durgapur': [87.3105, 23.5204],
    'Siliguri': [88.4277, 26.7271],
    'Asansol': [86.9746, 23.6889],
    'Jaipur': [75.7873, 26.9124],
    'Jodhpur': [73.0243, 26.2389],
    'Udaipur': [73.7125, 24.5854],
    'Kota': [75.8648, 25.1825],
    'Ajmer': [74.6399, 26.4498],
    'Ludhiana': [75.8573, 30.9010],
    'Amritsar': [74.8723, 31.6340],
    'Jalandhar': [75.5762, 31.3260],
    'Patiala': [76.3884, 30.3398],
    'Mohali': [76.7179, 30.7046],
    'Gurgaon': [77.0266, 28.4595],
    'Faridabad': [77.3178, 28.4089],
    'Panipat': [76.9628, 29.3909],
    'Ambala': [76.7794, 30.3782],
    'Rohtak': [76.6085, 28.8955],
    'Panaji': [73.8567, 15.4909],
    'Margao': [73.9701, 15.2709],
    'Vasco da Gama': [73.8124, 15.3995],
    'Mapusa': [73.8076, 15.5928],
    'Indore': [75.8577, 22.7196],
    'Bhopal': [77.4126, 23.2599],
    'Jabalpur': [79.9864, 23.1815],
    'Gwalior': [78.1772, 26.2183],
    'Ujjain': [75.7849, 23.1760]
  };

  const handleStateChange = (stateVal) => {
    setSelectedState(stateVal);
    const cities = STATE_CITIES[stateVal] || [];
    setSelectedCity(cities[0] || '');
  };

  // IMPLEMENT COMPONENT DID MOUNT EFFECT: Fetch records directly from MongoDB using Axios
  useEffect(() => {
    const fetchTournaments = async () => {
      setLoading(true);
      try {
        const response = await axios.get('/api/tournaments');
        // Handle both direct array return or { success: true, tournaments } wrapper
        const data = response.data.tournaments || response.data || [];
        setTournaments(data);
      } catch (error) {
        console.error("Database tracking connection error:", error);
      }
      setLoading(false);
    };

    const fetchEnrollments = async () => {
      try {
        const response = await axios.get(`/api/applications/my-applications?player=${user.id}`);
        setEnrollments(response.data.applications || []);
      } catch (err) {
        console.error("Enrollment fetching error:", err);
      }
    };

    fetchTournaments();
    fetchEnrollments();
  }, [user.id]);

  // Re-fetch trigger for manual synchronization button
  const triggerManualSync = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/tournaments');
      const data = response.data.tournaments || response.data || [];
      setTournaments(data);
      
      const appRes = await axios.get(`/api/applications/my-applications?player=${user.id}`);
      setEnrollments(appRes.data.applications || []);
    } catch (err) {
      console.error('Error syncing:', err);
    }
    setLoading(false);
  };

  const handleAddMember = () => {
    setMembers(prev => [...prev, { name: '', phone: '', email: '' }]);
  };

  const handleRemoveMember = (index) => {
    setMembers(prev => prev.filter((_, idx) => idx !== index));
  };

  const handleMemberChange = (index, field, value) => {
    setMembers(prev => prev.map((m, idx) => {
      if (idx === index) {
        return { ...m, [field]: value };
      }
      return m;
    }));
  };

  const openRegistrationModal = (tournament) => {
    setSelectedTournament(tournament);
    setTeamName('');
    setCaptainName(user.name);
    setCaptainPhone(user.phone || '');
    setTargetCoachName('');
    setTargetCoachEmail('');
    setMembers([{ name: '', phone: '', email: '' }]);
    setIsRegModalOpen(true);
  };

  const handleRegisterTeamSubmit = async (e) => {
    e.preventDefault();
    if (!selectedTournament) return;

    setSubmitting(true);
    try {
      const res = await axios.post('/api/applications', {
        playerId: user.id,
        tournamentId: selectedTournament._id,
        teamName,
        captainName,
        captainPhone,
        teamMembers: members.filter(m => m.name.trim()),
        targetCoachName,
        targetCoachEmail
      });
      if (res.data.success) {
        setIsRegModalOpen(false);
        triggerManualSync();
      } else {
        alert(res.data.message || 'Team registration failed.');
      }
    } catch (err) {
      console.error('Registration failed:', err);
    }
    setSubmitting(false);
  };

  // Case-insensitive substring matching filter logic
  const filteredTournaments = tournaments.filter(tournament => {
    const matchCity = selectedCity ? tournament.city?.toLowerCase().includes(selectedCity.toLowerCase()) : true;
    const matchState = selectedState ? tournament.state?.toLowerCase().includes(selectedState.toLowerCase()) : true;
    
    // Check search query against title, sport, level, city, or locationName
    const matchSearch = searchQuery
      ? tournament.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tournament.sport?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tournament.level?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tournament.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tournament.locationName?.toLowerCase().includes(searchQuery.toLowerCase())
      : true;

    // Filter by tab selection (active = scheduled/live, history = completed)
    const isCompleted = tournament.status === 'completed';
    const matchTab = activeTab === 'active' ? !isCompleted : isCompleted;

    return matchCity && matchState && matchSearch && matchTab;
  });

  const getEnrollmentState = (tournamentId) => {
    const found = enrollments.find(e => e.tournament?._id === tournamentId);
    if (found) {
      return found.workflowState; // 'pending_coach_proof', 'pending_organizer_vetting', 'fully_enrolled'
    }
    return null;
  };

  const activeCoordinates = CITY_COORDINATES[selectedCity] || [80.2707, 13.0827];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="font-display text-4xl font-black text-white tracking-tight">
            Find Competition Shards
          </h1>
          <p className="text-sm text-on-surface-variant mt-2">
            Locate tournaments via dynamic region filters or search parameters.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full max-w-xs">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm">search</span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#141218]/50 border border-slate-700 focus:border-white/20 focus:ring-1 focus:ring-white/20 rounded-xl py-2 pl-9 pr-4 text-xs text-on-surface outline-none"
            placeholder="Search sport, title, or district..."
          />
        </div>
      </div>

      {/* Main split: Map and List */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Region Dropdown Filter Grid (5 columns) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="glass-panel p-6 rounded-2xl space-y-4">
            <h3 className="font-bold text-base text-white flex items-center gap-2">
              <span className="material-symbols-outlined text-emerald-400">map</span>
              <span>Region Filter Desk</span>
            </h3>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider ml-1">District Jurisdiction</label>
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="w-full bg-slate-950/50 border border-slate-700 focus:border-emerald-500/30 rounded-xl py-2.5 px-3 text-xs text-on-surface outline-none appearance-none"
                >
                  {(STATE_CITIES[selectedState] || []).map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider ml-1">State Jurisdiction</label>
                <select
                  value={selectedState}
                  onChange={(e) => handleStateChange(e.target.value)}
                  className="w-full bg-slate-950/50 border border-slate-700 focus:border-emerald-500/30 rounded-xl py-2.5 px-3 text-xs text-on-surface outline-none appearance-none"
                >
                  <option value="Tamil Nadu">Tamil Nadu</option>
                  <option value="Karnataka">Karnataka</option>
                  <option value="Kerala">Kerala</option>
                  <option value="Andhra Pradesh">Andhra Pradesh</option>
                  <option value="Telangana">Telangana</option>
                  <option value="Maharashtra">Maharashtra</option>
                  <option value="Delhi">Delhi</option>
                  <option value="Gujarat">Gujarat</option>
                  <option value="Uttar Pradesh">Uttar Pradesh</option>
                  <option value="West Bengal">West Bengal</option>
                  <option value="Rajasthan">Rajasthan</option>
                  <option value="Punjab">Punjab</option>
                  <option value="Haryana">Haryana</option>
                  <option value="Goa">Goa</option>
                  <option value="Madhya Pradesh">Madhya Pradesh</option>
                </select>
              </div>
            </div>

            <button
              onClick={triggerManualSync}
              className="w-full bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold py-2 rounded-xl text-xs uppercase tracking-wider transition-all"
            >
              Update Region Matrix
            </button>
          </div>
        </div>

        {/* Tournaments List Grid (7 columns) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b border-white/10 pb-4">
            <h3 className="font-bold text-lg text-white">
              {activeTab === 'active' ? 'Available Brackets' : 'Past Brackets (History)'} ({filteredTournaments.length})
            </h3>
            
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setActiveTab('active')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all border ${
                  activeTab === 'active'
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                    : 'bg-white/5 text-on-surface-variant border-transparent hover:text-white'
                }`}
              >
                Active
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('history')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all border ${
                  activeTab === 'history'
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                    : 'bg-white/5 text-on-surface-variant border-transparent hover:text-white'
                }`}
              >
                History
              </button>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12 text-on-surface-variant">Scanning database coordinates...</div>
          ) : filteredTournaments.length === 0 ? (
            <div className="glass-panel p-12 text-center rounded-2xl border border-white/5 space-y-4">
              <span className="material-symbols-outlined text-4xl text-on-surface-variant">search_off</span>
              <h4 className="font-bold text-on-surface text-base">No Tournaments Located</h4>
              <p className="text-xs text-on-surface-variant max-w-sm mx-auto">
                No active sports tournament brackets match your region selection. Try changing the city or state.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredTournaments.map((t) => {
                const enrollmentState = getEnrollmentState(t._id);
                const applied = enrollmentState !== null;
                const capacityFull = t.registeredCount >= t.capacity;

                const getButtonLabel = () => {
                  if (t.status === 'completed') return 'Completed';
                  if (!applied) return 'Register Team';
                  if (enrollmentState === 'pending_coach_proof') return 'Awaiting Coach Proof';
                  if (enrollmentState === 'pending_organizer_vetting') return 'In Organizer Vetting';
                  if (enrollmentState === 'fully_enrolled') return 'Enrolled';
                  return 'Registered';
                };

                return (
                  <div
                    key={t._id}
                    onClick={() => {
                      if (!applied && !capacityFull && t.status !== 'completed') {
                        openRegistrationModal(t);
                      }
                    }}
                    className={`glass-card rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-5 transition-all duration-300 border border-white/5 ${
                      !applied && !capacityFull && t.status !== 'completed'
                        ? 'cursor-pointer hover:border-emerald-500/40 hover:scale-[1.01] hover:shadow-lg hover:shadow-emerald-500/5'
                        : ''
                    }`}
                  >
                    <div className="space-y-3 min-w-0">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-bold text-base text-white tracking-tight leading-none">
                            {t.title}
                          </h4>
                          {t.status === 'live' && (
                            <span className="bg-emerald-500/10 text-emerald-400 text-[8px] font-black px-2 py-0.5 rounded border border-emerald-500/20 animate-pulse">
                              LIVE
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-on-surface-variant mt-1.5 flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-[14px]">sports_soccer</span>
                          <span>
                            {t.sport} • {t.level} • Category: {t.gender || 'Any'} ({t.ageDivision || 'Open'})
                            {t.divisionType && t.divisionType !== 'Standard' && ` • ${t.divisionType}`}
                          </span>
                        </p>
                      </div>

                      <div className="space-y-1 text-xs text-on-surface-variant">
                        <p className="flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-[14px]">calendar_month</span>
                          <span>{t.startDate ? t.startDate.slice(0, 10) : ''} to {t.endDate ? t.endDate.slice(0, 10) : ''}</span>
                        </p>
                        <p className="flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-[14px]">location_on</span>
                          <span className="truncate">{t.locationName} ({t.city} District, {t.state})</span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setMapVenueAddress(`${t.locationName}, ${t.city}, ${t.state}`);
                              setMapVenueTitle(t.title);
                              setIsMapModalOpen(true);
                            }}
                            className="ml-2 text-emerald-400 hover:text-emerald-300 text-[10px] font-bold underline flex items-center gap-0.5"
                          >
                            <span className="material-symbols-outlined text-[11px]">map</span>
                            <span>Show Map</span>
                          </button>
                        </p>
                      </div>

                      {/* Capacity Meter */}
                      <div className="max-w-[200px]">
                        <div className="flex justify-between items-center text-[10px] text-on-surface-variant font-bold mb-1">
                          <span>Team Spots</span>
                          <span>{t.registeredCount}/{t.capacity}</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-emerald-500 rounded-full"
                            style={{ width: `${(t.registeredCount / t.capacity) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-start sm:items-end justify-between sm:justify-center gap-4 shrink-0 border-t sm:border-t-0 border-white/5 pt-4 sm:pt-0">
                      <div>
                        <p className="text-[10px] text-on-surface-variant uppercase font-bold tracking-wider">Prize Pool</p>
                        <p className="text-lg font-black text-emerald-400">${t.prizePool?.toLocaleString()}</p>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openRegistrationModal(t);
                        }}
                        disabled={applied || capacityFull || t.status === 'completed'}
                        className={`w-full sm:w-auto px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all border ${
                          t.status === 'completed'
                            ? 'bg-slate-500/10 text-slate-400 border-slate-500/20'
                            : applied
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : capacityFull
                            ? 'bg-red-500/10 text-red-400 border-red-500/20'
                            : 'bg-white text-black hover:bg-slate-200 border-transparent'
                        }`}
                      >
                        {getButtonLabel()}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* TEAM ENROLLMENT FORM MODAL */}
      {selectedTournament && (
        <Modal
          isOpen={isRegModalOpen}
          onClose={() => setIsRegModalOpen(false)}
          title={`Register Team: ${selectedTournament.title}`}
        >
          <form onSubmit={handleRegisterTeamSubmit} className="space-y-6">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider border-l-2 border-emerald-500 pl-2">
              Team Meta Details
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] text-on-surface-variant font-bold uppercase">Team Name</label>
                <input
                  type="text"
                  required
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  className="w-full bg-slate-950/50 border border-slate-700 focus:border-emerald-500/30 rounded-xl py-2 px-3 text-xs text-on-surface outline-none"
                  placeholder="e.g. Thunder Brackets"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-on-surface-variant font-bold uppercase">Captain Name</label>
                <input
                  type="text"
                  required
                  value={captainName}
                  onChange={(e) => setCaptainName(e.target.value)}
                  className="w-full bg-slate-950/50 border border-slate-700 focus:border-emerald-500/30 rounded-xl py-2 px-3 text-xs text-on-surface outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-on-surface-variant font-bold uppercase">Captain Phone</label>
                <input
                  type="tel"
                  required
                  value={captainPhone}
                  onChange={(e) => setCaptainPhone(e.target.value)}
                  className="w-full bg-slate-950/50 border border-slate-700 focus:border-emerald-500/30 rounded-xl py-2 px-3 text-xs text-on-surface outline-none"
                />
              </div>
            </div>

            {/* Dynamic Team Members entry list */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Team Members</h4>
                <button
                  type="button"
                  onClick={handleAddMember}
                  className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 transition-all"
                >
                  <span className="material-symbols-outlined text-[12px] font-bold">add</span>
                  <span>Add Member</span>
                </button>
              </div>

              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {members.map((member, index) => (
                  <div key={index} className="flex gap-2 items-center bg-slate-950/40 p-3 rounded-xl border border-white/5">
                    <input
                      type="text"
                      placeholder="Name"
                      required
                      value={member.name}
                      onChange={(e) => handleMemberChange(index, 'name', e.target.value)}
                      className="flex-1 bg-slate-950 border border-slate-800 focus:border-emerald-500/30 rounded-lg py-1.5 px-3 text-xs text-on-surface outline-none"
                    />
                    <input
                      type="tel"
                      placeholder="Phone"
                      value={member.phone}
                      onChange={(e) => handleMemberChange(index, 'phone', e.target.value)}
                      className="w-28 bg-slate-950 border border-slate-800 focus:border-emerald-500/30 rounded-lg py-1.5 px-3 text-xs text-on-surface outline-none"
                    />
                    <input
                      type="email"
                      placeholder="Email"
                      value={member.email}
                      onChange={(e) => handleMemberChange(index, 'email', e.target.value)}
                      className="flex-1 bg-slate-950 border border-slate-800 focus:border-emerald-500/30 rounded-lg py-1.5 px-3 text-xs text-on-surface outline-none"
                    />
                    {members.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveMember(index)}
                        className="text-red-400 hover:text-red-300 p-1 transition-colors"
                      >
                        <span className="material-symbols-outlined text-[16px]">delete</span>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Target verification coach info */}
            <h3 className="text-xs font-bold text-white uppercase tracking-wider border-l-2 border-sky-500 pl-2">
              Target Coach Vetting details
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] text-on-surface-variant font-bold uppercase">Target Coach Name</label>
                <input
                  type="text"
                  required
                  value={targetCoachName}
                  onChange={(e) => setTargetCoachName(e.target.value)}
                  className="w-full bg-slate-950/50 border border-slate-700 focus:border-emerald-500/30 rounded-xl py-2 px-3 text-xs text-on-surface outline-none"
                  placeholder="e.g. Sarah Connor"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-on-surface-variant font-bold uppercase">Target Coach Email</label>
                <input
                  type="email"
                  required
                  value={targetCoachEmail}
                  onChange={(e) => setTargetCoachEmail(e.target.value)}
                  className="w-full bg-slate-950/50 border border-slate-700 focus:border-emerald-500/30 rounded-xl py-2 px-3 text-xs text-on-surface outline-none"
                  placeholder="coach@sportshub.io"
                />
              </div>
            </div>

            {/* Pricing Summary Card */}
            <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10 flex justify-between items-center">
              <div>
                <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">Pricing Summary</p>
                <p className="text-xs text-on-surface-variant mt-0.5">Total Registration Fee due for Single Team Entry</p>
              </div>
              <p className="text-xl font-black text-white">$250.00</p>
            </div>

            {/* Submit */}
            <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={() => setIsRegModalOpen(false)}
                className="bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold py-2.5 px-6 rounded-xl text-xs uppercase tracking-wider transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="bg-emerald-500 hover:bg-emerald-400 text-black font-bold py-2.5 px-6 rounded-xl text-xs uppercase tracking-wider transition-all"
              >
                {submitting ? 'Submitting...' : 'Register Team'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* GOOGLE MAPS VENUE LOCATOR MODAL */}
      {isMapModalOpen && (
        <Modal
          isOpen={isMapModalOpen}
          onClose={() => setIsMapModalOpen(false)}
          title={`Venue Location: ${mapVenueTitle}`}
        >
          <div className="space-y-4 py-2">
            <div className="w-full h-72 rounded-xl overflow-hidden border border-white/10 bg-slate-900">
              <iframe
                title="Google Maps Location"
                width="100%"
                height="100%"
                frameBorder="0"
                scrolling="no"
                marginHeight="0"
                marginWidth="0"
                src={`https://maps.google.com/maps?q=${encodeURIComponent(mapVenueAddress)}&t=&z=14&ie=UTF8&iwloc=&output=embed`}
                className="grayscale opacity-90 invert contrast-100"
              />
            </div>
            <div className="flex justify-between items-center text-xs text-on-surface-variant flex-wrap gap-2">
              <span className="font-bold text-white">{mapVenueAddress}</span>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapVenueAddress)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-400 hover:underline flex items-center gap-1 font-bold"
              >
                <span className="material-symbols-outlined text-sm">open_in_new</span>
                <span>Open in Google Maps</span>
              </a>
            </div>
            <div className="flex justify-end pt-2 border-t border-white/5">
              <button
                type="button"
                onClick={() => setIsMapModalOpen(false)}
                className="bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold py-2 px-6 rounded-xl text-xs uppercase tracking-wider transition-all"
              >
                Close Map
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
