import React, { useState, useEffect } from 'react';
import Modal from '../../components/Modal';

export default function CreateTournament() {
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);

  // Form Fields State
  const [title, setTitle] = useState('');
  const [sport, setSport] = useState('Soccer');
  const [level, setLevel] = useState('Professional');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [locationName, setLocationName] = useState('');
  const [city, setCity] = useState('Chennai');
  const [state, setState] = useState('Tamil Nadu');
  const [longitude, setLongitude] = useState('-0.1278');
  const [latitude, setLatitude] = useState('51.5074');
  const [capacity, setCapacity] = useState('32');
  const [prizePool, setPrizePool] = useState('10000');
  const [status, setStatus] = useState('scheduled');
  const [requiresCoachApproval, setRequiresCoachApproval] = useState(false);
  const [gender, setGender] = useState('Any');
  const [ageDivision, setAgeDivision] = useState('Open');
  const [divisionType, setDivisionType] = useState('Standard');

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

  // Fallback default list
  const DEFAULT_TOURNAMENTS = [
    {
      _id: 't_mock_1',
      title: 'Global Champions League',
      sport: 'Soccer',
      level: 'Professional',
      startDate: '2024-10-24',
      endDate: '2024-11-12',
      locationName: 'London National Arena',
      city: 'Chennai',
      state: 'Tamil Nadu',
      location: { coordinates: [80.2707, 13.0827] },
      capacity: 32,
      registeredCount: 28,
      prizePool: 125400,
      status: 'scheduled',
      requiresCoachApproval: true
    },
    {
      _id: 't_mock_2',
      title: 'Pro-Am Invitational',
      sport: 'Basketball',
      level: 'Tier 1',
      startDate: '2024-08-15',
      endDate: '2024-09-05',
      locationName: 'Madison Square Hub',
      city: 'Coimbatore',
      state: 'Tamil Nadu',
      location: { coordinates: [76.9616, 11.0168] },
      capacity: 64,
      registeredCount: 64,
      prizePool: 82000,
      status: 'live',
      requiresCoachApproval: false
    }
  ];

  const fetchTournaments = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/tournaments');
      const data = await res.json();
      if (data.success && data.tournaments.length > 0) {
        setTournaments(data.tournaments);
      } else {
        setTournaments([]);
      }
    } catch (err) {
      setTournaments([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTournaments();
  }, []);

  const handleCityChange = (selectedCity) => {
    setCity(selectedCity);
    const coords = CITY_COORDINATES[selectedCity];
    if (coords) {
      setLongitude(coords[0].toString());
      setLatitude(coords[1].toString());
    }
  };

  const handleStateChange = (selectedState) => {
    setState(selectedState);
    const cities = STATE_CITIES[selectedState] || [];
    const firstCity = cities[0] || '';
    setCity(firstCity);
    const coords = CITY_COORDINATES[firstCity];
    if (coords) {
      setLongitude(coords[0].toString());
      setLatitude(coords[1].toString());
    }
  };

  const openCreateModal = () => {
    setEditId(null);
    setTitle('');
    setSport('Soccer');
    setLevel('Professional');
    setStartDate('');
    setEndDate('');
    setLocationName('');
    setCity('Chennai');
    setState('Tamil Nadu');
    setLongitude('80.2707');
    setLatitude('13.0827');
    setCapacity('32');
    setPrizePool('10000');
    setStatus('scheduled');
    setRequiresCoachApproval(false);
    setGender('Any');
    setAgeDivision('Open');
    setDivisionType('Standard');
    setIsModalOpen(true);
  };

  const openEditModal = (t) => {
    setEditId(t._id);
    setTitle(t.title);
    setSport(t.sport);
    setLevel(t.level);
    setStartDate(t.startDate ? t.startDate.slice(0, 10) : '');
    setEndDate(t.endDate ? t.endDate.slice(0, 10) : '');
    setLocationName(t.locationName);
    setCity(t.city || 'Chennai');
    setState(t.state || 'Tamil Nadu');
    setLongitude(t.location?.coordinates[0]?.toString() || '80.2707');
    setLatitude(t.location?.coordinates[1]?.toString() || '13.0827');
    setCapacity(t.capacity.toString());
    setPrizePool(t.prizePool.toString());
    setStatus(t.status);
    setRequiresCoachApproval(t.requiresCoachApproval);
    setGender(t.gender || 'Any');
    setAgeDivision(t.ageDivision || 'Open');
    setDivisionType(t.divisionType || 'Standard');
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this tournament event?')) return;
    try {
      const res = await fetch(`/api/tournaments/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        // Strict Display wipe: remove from state array immediately
        setTournaments(prev => prev.filter(t => t._id !== id));
      } else {
        alert(data.message || 'Failed to delete tournament.');
      }
    } catch (err) {
      // Mock Fallback wipe
      setTournaments(prev => prev.filter(t => t._id !== id));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      title,
      sport,
      level,
      startDate,
      endDate,
      locationName,
      city,
      state,
      longitude,
      latitude,
      capacity,
      prizePool,
      status,
      requiresCoachApproval,
      gender,
      ageDivision,
      divisionType
    };

    try {
      let res;
      if (editId) {
        res = await fetch(`/api/tournaments/${editId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } else {
        res = await fetch('/api/tournaments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }
      const data = await res.json();
      if (data.success) {
        setIsModalOpen(false);
        fetchTournaments();
      }
    } catch (err) {
      // Mock local fallback
      const mockResult = {
        _id: editId || `t_mock_${Date.now()}`,
        ...payload,
        location: { coordinates: [parseFloat(longitude), parseFloat(latitude)] },
        registeredCount: editId ? (tournaments.find(t => t._id === editId)?.registeredCount || 0) : 0
      };

      if (editId) {
        setTournaments(prev => prev.map(t => t._id === editId ? mockResult : t));
      } else {
        setTournaments(prev => [...prev, mockResult]);
      }
      setIsModalOpen(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6">
        <div>
          <h1 className="font-display text-4xl font-black text-white tracking-tight">
            Tournament CRUD Administration
          </h1>
          <p className="text-sm text-on-surface-variant mt-2">
            Configure global sports brackets, location mappings, and registration parameters.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="bg-amber-400 hover:scale-[1.03] active:scale-95 text-black font-bold py-2.5 px-6 rounded-xl text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-lg shadow-amber-400/10"
        >
          <span className="material-symbols-outlined text-xs">add</span>
          <span>Create Tournament</span>
        </button>
      </div>

      {/* Main Grid */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-12 text-on-surface-variant font-medium">Synchronizing shards database...</div>
        ) : tournaments.length === 0 ? (
          <div className="glass-panel p-12 text-center rounded-2xl border border-white/5 space-y-4">
            <span className="material-symbols-outlined text-4xl text-on-surface-variant">emoji_events</span>
            <h4 className="font-bold text-on-surface text-base">No Tournaments Programmed</h4>
            <p className="text-xs text-on-surface-variant max-w-sm mx-auto">
              Create a new tournament entry to define sport disciplines, locations, and verification parameters.
            </p>
          </div>
        ) : (
          tournaments.map((t) => (
            <div key={t._id} className="glass-card rounded-2xl p-6 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 hover:border-amber-500/30 transition-all border border-white/5">
              <div className="space-y-2 min-w-0">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h3 className="font-bold text-lg text-white leading-tight">{t.title}</h3>
                  <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded border ${
                    t.status === 'live'
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 animate-pulse'
                      : t.status === 'completed'
                      ? 'bg-slate-500/10 text-slate-400 border-slate-500/20'
                      : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                  }`}>
                    {t.status}
                  </span>
                </div>
                <p className="text-xs text-on-surface-variant flex items-center gap-1.5 font-medium">
                  <span className="material-symbols-outlined text-sm">sports_soccer</span>
                  <span>
                    {t.sport} • {t.level} • Category: {t.gender || 'Any'} ({t.ageDivision || 'Open'})
                    {t.divisionType && t.divisionType !== 'Standard' && ` • ${t.divisionType}`}
                  </span>
                </p>
                <div className="text-xs text-on-surface-variant flex items-center gap-4">
                  <span className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-sm">location_on</span>
                    <span>{t.locationName} ({t.city || 'N/A'}, {t.state || 'N/A'})</span>
                  </span>
                  <span>|</span>
                  <span>GPS: {t.location?.coordinates?.join(', ') || 'N/A'}</span>
                </div>
              </div>

              {/* Status and capacity bar */}
              <div className="w-full lg:w-48 space-y-1 text-xs shrink-0">
                <div className="flex justify-between items-center text-[10px] text-on-surface-variant font-bold mb-1">
                  <span>Registered Capacity</span>
                  <span className="text-white">{t.registeredCount || 0} / {t.capacity}</span>
                </div>
                <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-400"
                    style={{ width: `${((t.registeredCount || 0) / t.capacity) * 100}%` }}
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 self-end lg:self-center shrink-0 border-t lg:border-t-0 border-white/5 pt-4 lg:pt-0 w-full lg:w-auto justify-end">
                <button
                  onClick={() => openEditModal(t)}
                  className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-on-surface hover:text-amber-400 hover:border-amber-500/30 transition-all flex items-center justify-center"
                  title="Edit Configuration"
                >
                  <span className="material-symbols-outlined text-lg">edit</span>
                </button>
                <button
                  onClick={() => handleDelete(t._id)}
                  className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-all flex items-center justify-center"
                  title="Delete Event"
                >
                  <span className="material-symbols-outlined text-lg">delete</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Reusable Modal containing Form */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editId ? 'Edit Tournament' : 'Create Tournament'}>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-xs text-on-surface-variant font-bold">Tournament Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-950/50 border border-slate-700 focus:border-amber-500/30 rounded-xl py-2 px-3 text-xs text-on-surface outline-none"
              placeholder="e.g. Global Champions League"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs text-on-surface-variant font-bold">Sport</label>
              <select
                value={sport}
                onChange={(e) => setSport(e.target.value)}
                className="w-full bg-slate-950/50 border border-slate-700 focus:border-amber-500/30 rounded-xl py-2 px-3 text-xs text-on-surface outline-none appearance-none"
              >
                <option value="Soccer">Soccer</option>
                <option value="Basketball">Basketball</option>
                <option value="Tennis">Tennis</option>
                <option value="Badminton">Badminton</option>
                <option value="Cricket">Cricket</option>
                <option value="Volleyball">Volleyball</option>
                <option value="Table Tennis">Table Tennis</option>
                <option value="Kabaddi">Kabaddi</option>
                <option value="Hockey">Hockey</option>
                <option value="Athletics">Athletics</option>
                <option value="Swimming">Swimming</option>
                <option value="Chess">Chess</option>
                <option value="Carrom">Carrom</option>
                <option value="Rugby">Rugby</option>
                <option value="Baseball">Baseball</option>
                <option value="Squash">Squash</option>
                <option value="Boxing">Boxing</option>
                <option value="Wrestling">Wrestling</option>
                <option value="Archery">Archery</option>
                <option value="Golf">Golf</option>
                <option value="Karate">Karate</option>
                <option value="Taekwondo">Taekwondo</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-on-surface-variant font-bold">Level</label>
              <input
                type="text"
                required
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                className="w-full bg-slate-950/50 border border-slate-700 focus:border-amber-500/30 rounded-xl py-2 px-3 text-xs text-on-surface outline-none"
                placeholder="e.g. Professional"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-on-surface-variant font-bold">Gender Category</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full bg-slate-950/50 border border-slate-700 focus:border-amber-500/30 rounded-xl py-2.5 px-3 text-xs text-on-surface outline-none appearance-none"
              >
                <option value="Any">Any / Open</option>
                <option value="Male">Male / Men</option>
                <option value="Female">Female / Women</option>
                <option value="Mixed">Mixed / Co-Ed</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs text-on-surface-variant font-bold">Age Division</label>
              <select
                value={ageDivision}
                onChange={(e) => setAgeDivision(e.target.value)}
                className="w-full bg-slate-950/50 border border-slate-700 focus:border-amber-500/30 rounded-xl py-2.5 px-3 text-xs text-on-surface outline-none appearance-none"
              >
                <option value="Open">Open (All Ages)</option>
                <option value="U-12">Under-12 (U-12)</option>
                <option value="U-15">Under-15 (U-15)</option>
                <option value="U-17">Under-17 (U-17)</option>
                <option value="U-19">Under-19 (U-19)</option>
                <option value="U-23">Under-23 (U-23)</option>
                <option value="Seniors">Seniors (Open)</option>
                <option value="Masters">Masters (O-35 / O-40)</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-on-surface-variant font-bold">Category Division Type</label>
              <select
                value={divisionType}
                onChange={(e) => setDivisionType(e.target.value)}
                className="w-full bg-slate-950/50 border border-slate-700 focus:border-amber-500/30 rounded-xl py-2.5 px-3 text-xs text-on-surface outline-none appearance-none"
              >
                <option value="Standard">Standard / Regular</option>
                <option value="Para-Athletics">Para-Athletics (Differently Abled)</option>
                <option value="Unified">Unified Sports (Special Olympics)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs text-on-surface-variant font-bold">Start Date</label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-slate-950/50 border border-slate-700 focus:border-amber-500/30 rounded-xl py-2 px-3 text-xs text-on-surface outline-none"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-on-surface-variant font-bold">End Date</label>
              <input
                type="date"
                required
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-slate-950/50 border border-slate-700 focus:border-amber-500/30 rounded-xl py-2 px-3 text-xs text-on-surface outline-none"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-on-surface-variant font-bold">Venue Name</label>
            <input
              type="text"
              required
              value={locationName}
              onChange={(e) => setLocationName(e.target.value)}
              className="w-full bg-slate-950/50 border border-slate-700 focus:border-amber-500/30 rounded-xl py-2 px-3 text-xs text-on-surface outline-none"
              placeholder="e.g. London National Arena"
            />
          </div>

          {/* City / State inputs */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs text-on-surface-variant font-bold">District</label>
              <select
                value={city}
                onChange={(e) => handleCityChange(e.target.value)}
                className="w-full bg-slate-950/50 border border-slate-700 focus:border-amber-500/30 rounded-xl py-2 px-3 text-xs text-on-surface outline-none appearance-none"
              >
                {(STATE_CITIES[state] || []).map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-on-surface-variant font-bold">State</label>
              <select
                value={state}
                onChange={(e) => handleStateChange(e.target.value)}
                className="w-full bg-slate-950/50 border border-slate-700 focus:border-amber-500/30 rounded-xl py-2 px-3 text-xs text-on-surface outline-none appearance-none"
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

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs text-on-surface-variant font-bold">Longitude</label>
              <input
                type="text"
                required
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
                className="w-full bg-slate-950/50 border border-slate-700 focus:border-amber-500/30 rounded-xl py-2 px-3 text-xs text-on-surface outline-none"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-on-surface-variant font-bold">Latitude</label>
              <input
                type="text"
                required
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
                className="w-full bg-slate-950/50 border border-slate-700 focus:border-amber-500/30 rounded-xl py-2 px-3 text-xs text-on-surface outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs text-on-surface-variant font-bold">Slot Capacity</label>
              <input
                type="number"
                required
                value={capacity}
                onChange={(e) => setCapacity(e.target.value)}
                className="w-full bg-slate-950/50 border border-slate-700 focus:border-amber-500/30 rounded-xl py-2 px-3 text-xs text-on-surface outline-none"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-on-surface-variant font-bold">Prize Pool ($)</label>
              <input
                type="number"
                required
                value={prizePool}
                onChange={(e) => setPrizePool(e.target.value)}
                className="w-full bg-slate-950/50 border border-slate-700 focus:border-amber-500/30 rounded-xl py-2 px-3 text-xs text-on-surface outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="space-y-1.5">
              <label className="text-xs text-on-surface-variant font-bold">Event Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full bg-slate-950/50 border border-slate-700 focus:border-amber-500/30 rounded-xl py-2 px-3 text-xs text-on-surface outline-none appearance-none"
              >
                <option value="scheduled">Scheduled</option>
                <option value="live">Live</option>
                <option value="completed">Completed</option>
                <option value="draft">Draft</option>
              </select>
            </div>

            <div className="flex items-center gap-3 pt-6 pl-2">
              <input
                type="checkbox"
                checked={requiresCoachApproval}
                onChange={(e) => setRequiresCoachApproval(e.target.checked)}
                className="rounded bg-slate-950/50 border-slate-700 text-amber-500 focus:ring-amber-500"
                id="coach-approval-check"
              />
              <label htmlFor="coach-approval-check" className="text-xs text-on-surface font-semibold select-none cursor-pointer">
                Requires Coach Approvals
              </label>
            </div>
          </div>

          {/* Footer Submit Buttons */}
          <div className="flex justify-end gap-3 pt-6 border-t border-white/10">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold py-2.5 px-6 rounded-xl text-xs uppercase tracking-wider transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-amber-400 hover:scale-[1.02] active:scale-95 text-black font-bold py-2.5 px-6 rounded-xl text-xs uppercase tracking-wider transition-all"
            >
              Confirm Setup
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
