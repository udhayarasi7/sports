import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { authStart, authSuccess, authFailure } from '../../store/authSlice';

export default function RegisterSelection() {
  const [role, setRole] = useState('player'); // player, coach, or organizer
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [formError, setFormError] = useState('');

  // Player Details Fields
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('Male');
  const [institution, setInstitution] = useState('');
  const [skillLevel, setSkillLevel] = useState('Intermediate');
  const [selectedSports, setSelectedSports] = useState([]); // array for primary and secondary preferences

  // Coach Details Fields
  const [academy, setAcademy] = useState('');
  const [experience, setExperience] = useState('4-7');
  const [coachDiscipline, setCoachDiscipline] = useState('');
  const [certFiles, setCertFiles] = useState([]);

  // Organizer Details Fields
  const [organizationName, setOrganizationName] = useState('');
  const [address, setAddress] = useState('');
  const [licenseFiles, setLicenseFiles] = useState([]);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleSportToggle = (sport) => {
    setSelectedSports((prev) => {
      if (prev.includes(sport)) {
        return prev.filter((s) => s !== sport);
      } else {
        if (prev.length >= 2) {
          // Cap at Primary & Secondary (max 2)
          return [prev[1], sport];
        }
        return [...prev, sport];
      }
    });
  };

  const handleLicenseUpload = (e) => {
    const files = Array.from(e.target.files);
    const fileNames = files.map(f => f.name);
    setLicenseFiles(prev => [...prev, ...fileNames]);
  };

  const removeLicense = (idxToRemove) => {
    setLicenseFiles(prev => prev.filter((_, idx) => idx !== idxToRemove));
  };

  const handleCertUpload = (e) => {
    const files = Array.from(e.target.files);
    const fileNames = files.map(f => f.name);
    setCertFiles(prev => [...prev, ...fileNames]);
  };

  const removeCert = (idxToRemove) => {
    setCertFiles(prev => prev.filter((_, idx) => idx !== idxToRemove));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setFormError('');

    // Strict validation: Password and Confirm Password length / content verification
    if (password !== confirmPassword) {
      setFormError('Passwords do not match.');
      return;
    }
    if (password.length !== confirmPassword.length) {
      setFormError('Password confirmation length mismatch.');
      return;
    }

    dispatch(authStart());

    // Package payload details dynamically based on role type
    let payload = {
      name,
      email,
      phone,
      password,
      role,
      status: role === 'player' ? 'approved' : 'pending' // strict status mappings
    };

    if (role === 'player') {
      payload.playerDetails = {
        age: parseInt(age || 0),
        discipline: selectedSports[0] || 'Soccer',
        skillLevel,
        institution,
        gender,
        sportsPreferences: selectedSports
      };
    } else if (role === 'coach') {
      payload.coachDetails = {
        experience: `${experience} Years`,
        discipline: coachDiscipline,
        academy,
        certifications: certFiles
      };
    } else if (role === 'organizer') {
      payload.organizerDetails = {
        organizationName,
        title: 'Representative',
        address,
        licenseFile: licenseFiles
      };
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await response.json();

      if (data.success) {
        dispatch(authSuccess({ token: data.token, user: data.user }));
        if (data.user.status !== 'approved') {
          navigate('/status');
        } else {
          navigate(role === 'player' ? '/player/dashboard' : '/coach/dashboard');
        }
      } else {
        setFormError(data.message || 'Registration failed.');
        dispatch(authFailure(data.message));
      }
    } catch (err) {
      console.log('Registration connection error, using mock fallback...');
      const mockUser = {
        id: `mock_reg_${Date.now()}`,
        name,
        email,
        phone,
        role,
        status: role === 'player' ? 'approved' : 'pending',
        playerDetails: payload.playerDetails,
        coachDetails: payload.coachDetails,
        organizerDetails: payload.organizerDetails
      };
      dispatch(authSuccess({ token: 'mock_token_reg', user: mockUser }));
      if (mockUser.status !== 'approved') {
        navigate('/status');
      } else {
        navigate(role === 'player' ? '/player/dashboard' : '/coach/dashboard');
      }
    }
  };

  return (
    <div className="min-h-screen py-12 px-4 bg-[#020617] relative flex items-center justify-center overflow-x-hidden">
      {/* Glow Decor */}
      <div className="absolute top-10 left-10 w-80 h-80 bg-purple-600/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-emerald-600/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-3xl z-10 space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-black font-display tracking-tight text-white emerald-glow">
            SPORTS HUB REGISTRATION
          </h1>
          <p className="text-xs text-on-surface-variant uppercase tracking-widest mt-2 font-bold">
            Join the Premier Athletic Network of Professional Mentors & Athletes
          </p>
        </div>

        <form onSubmit={handleRegister} className="glass-panel p-8 rounded-2xl border border-white/10 space-y-8">
          {formError && (
            <div className="p-3.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">error</span>
              <span>{formError}</span>
            </div>
          )}

          {/* Three-Column Balanced Grid Selector (No Admin Option) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-b border-white/10 pb-6">
            <button
              type="button"
              onClick={() => {
                setRole('player');
                setFormError('');
              }}
              className={`py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all border flex items-center justify-center gap-2 ${
                role === 'player'
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50'
                  : 'bg-white/5 text-on-surface-variant border-transparent hover:text-white'
              }`}
            >
              <span className="material-symbols-outlined text-sm">sports_soccer</span>
              <span>Athlete / Player</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setRole('coach');
                setFormError('');
              }}
              className={`py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all border flex items-center justify-center gap-2 ${
                role === 'coach'
                  ? 'bg-sky-500/20 text-sky-400 border-sky-500/50'
                  : 'bg-white/5 text-on-surface-variant border-transparent hover:text-white'
              }`}
            >
              <span className="material-symbols-outlined text-sm">sports_kabaddi</span>
              <span>Professional Coach</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setRole('organizer');
                setFormError('');
              }}
              className={`py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all border flex items-center justify-center gap-2 ${
                role === 'organizer'
                  ? 'bg-amber-500/20 text-amber-400 border-amber-500/50'
                  : 'bg-white/5 text-on-surface-variant border-transparent hover:text-white'
              }`}
            >
              <span className="material-symbols-outlined text-sm">stadium</span>
              <span>Tournament Organizer</span>
            </button>
          </div>

          {/* DYNAMIC INPUT FORM FIELDS RENDERING */}
          {role === 'organizer' && (
            <div className="space-y-6">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider border-l-2 border-amber-500 pl-2">
                Organizer Corporate Info
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-xs text-on-surface-variant font-bold ml-1">Organization Legal Name</label>
                  <input
                    type="text"
                    required
                    value={organizationName}
                    onChange={(e) => setOrganizationName(e.target.value)}
                    className="w-full bg-slate-950/50 border border-slate-700 focus:border-white/20 focus:ring-1 focus:ring-white/20 rounded-xl py-2.5 px-4 text-sm text-on-surface outline-none transition-all"
                    placeholder="e.g. Sports Association LLC"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-on-surface-variant font-bold ml-1">Representative Name (Full Name)</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-950/50 border border-slate-700 focus:border-white/20 focus:ring-1 focus:ring-white/20 rounded-xl py-2.5 px-4 text-sm text-on-surface outline-none transition-all"
                    placeholder="e.g. Alexander Thorne"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-on-surface-variant font-bold ml-1">Representative Email Address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-950/50 border border-slate-700 focus:border-white/20 focus:ring-1 focus:ring-white/20 rounded-xl py-2.5 px-4 text-sm text-on-surface outline-none transition-all"
                    placeholder="e.g. contact@association.org"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-on-surface-variant font-bold ml-1">Corporate Phone Number</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-slate-950/50 border border-slate-700 focus:border-white/20 focus:ring-1 focus:ring-white/20 rounded-xl py-2.5 px-4 text-sm text-on-surface outline-none transition-all"
                    placeholder="e.g. +91 94431 82035"
                  />
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs text-on-surface-variant font-bold ml-1">Official Headquarter Physical Address</label>
                  <input
                    type="text"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full bg-slate-950/50 border border-slate-700 focus:border-white/20 focus:ring-1 focus:ring-white/20 rounded-xl py-2.5 px-4 text-sm text-on-surface outline-none transition-all"
                    placeholder="e.g. 102 Sports Boulevard, Chennai, Tamil Nadu"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-on-surface-variant font-bold ml-1">Secure Password</label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-950/50 border border-slate-700 focus:border-white/20 focus:ring-1 focus:ring-white/20 rounded-xl py-2.5 px-4 text-sm text-on-surface outline-none transition-all"
                    placeholder="••••••••"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-on-surface-variant font-bold ml-1">Confirm Password</label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-slate-950/50 border border-slate-700 focus:border-white/20 focus:ring-1 focus:ring-white/20 rounded-xl py-2.5 px-4 text-sm text-on-surface outline-none transition-all"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              {/* Organizer License Upload Zone */}
              <div className="space-y-3">
                <label className="text-xs text-on-surface-variant font-bold ml-1">
                  Upload Organization Proof / Business Registration License (PDF/Image)
                </label>
                <div className="relative border-2 border-dashed border-white/10 rounded-xl bg-white/5 p-6 text-center hover:border-amber-500/40 hover:bg-white/10 transition-all cursor-pointer">
                  <input
                    type="file"
                    multiple
                    onChange={handleLicenseUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  <div className="flex flex-col items-center">
                    <span className="material-symbols-outlined text-4xl text-amber-400 mb-2">folder_zip</span>
                    <h4 className="text-sm font-bold text-on-surface">Upload Business Credentials</h4>
                    <p className="text-xs text-on-surface-variant">Drag files here, or click to browse</p>
                  </div>
                </div>

                {licenseFiles.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-2">
                    {licenseFiles.map((name, index) => (
                      <div
                        key={index}
                        className="bg-amber-500/10 text-amber-400 text-xs px-3 py-1 rounded-full border border-amber-500/20 flex items-center gap-2"
                      >
                        <span>{name}</span>
                        <button
                          type="button"
                          onClick={() => removeLicense(index)}
                          className="material-symbols-outlined text-[14px] hover:text-white transition-colors"
                        >
                          close
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {role === 'player' && (
            <div className="space-y-6">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider border-l-2 border-emerald-500 pl-2">
                Athlete Vetting Info
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-xs text-on-surface-variant font-bold ml-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-950/50 border border-slate-700 focus:border-white/20 focus:ring-1 focus:ring-white/20 rounded-xl py-2.5 px-4 text-sm text-on-surface outline-none transition-all"
                    placeholder="e.g. Jordan Smith"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-on-surface-variant font-bold ml-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-950/50 border border-slate-700 focus:border-white/20 focus:ring-1 focus:ring-white/20 rounded-xl py-2.5 px-4 text-sm text-on-surface outline-none transition-all"
                    placeholder="player@sportshub.io"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-on-surface-variant font-bold ml-1">Phone Number</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-slate-950/50 border border-slate-700 focus:border-white/20 focus:ring-1 focus:ring-white/20 rounded-xl py-2.5 px-4 text-sm text-on-surface outline-none transition-all"
                    placeholder="e.g. +91 98402 11024"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-on-surface-variant font-bold ml-1">Age</label>
                  <input
                    type="number"
                    required
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    className="w-full bg-slate-950/50 border border-slate-700 focus:border-white/20 focus:ring-1 focus:ring-white/20 rounded-xl py-2.5 px-4 text-sm text-on-surface outline-none transition-all"
                    placeholder="20"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-on-surface-variant font-bold ml-1">Gender</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full bg-slate-950/50 border border-slate-700 focus:border-white/20 focus:ring-1 focus:ring-white/20 rounded-xl py-2.5 px-4 text-sm text-on-surface outline-none appearance-none"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-on-surface-variant font-bold ml-1">College / School Name</label>
                  <input
                    type="text"
                    required
                    value={institution}
                    onChange={(e) => setInstitution(e.target.value)}
                    className="w-full bg-slate-950/50 border border-slate-700 focus:border-white/20 focus:ring-1 focus:ring-white/20 rounded-xl py-2.5 px-4 text-sm text-on-surface outline-none transition-all"
                    placeholder="e.g. Tamil Nadu Athletics University"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-on-surface-variant font-bold ml-1">Secure Password</label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-950/50 border border-slate-700 focus:border-white/20 focus:ring-1 focus:ring-white/20 rounded-xl py-2.5 px-4 text-sm text-on-surface outline-none transition-all"
                    placeholder="••••••••"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-on-surface-variant font-bold ml-1">Confirm Password</label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-slate-950/50 border border-slate-700 focus:border-white/20 focus:ring-1 focus:ring-white/20 rounded-xl py-2.5 px-4 text-sm text-on-surface outline-none transition-all"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              {/* Primary / Secondary Sports pill checkboxes */}
              <div className="space-y-3">
                <label className="text-xs text-on-surface-variant font-bold ml-1">
                  Primary and Secondary Sports Preferences (Select up to 2)
                </label>
                <div className="flex flex-wrap gap-3">
                  {[
                    'Soccer', 'Basketball', 'Tennis', 'Badminton', 'Cricket', 
                    'Volleyball', 'Table Tennis', 'Kabaddi', 'Hockey', 'Athletics', 
                    'Swimming', 'Chess', 'Carrom', 'Rugby', 'Baseball', 'Squash', 
                    'Boxing', 'Wrestling', 'Archery', 'Golf', 'Karate', 'Taekwondo'
                  ].map((sport) => {
                    const active = selectedSports.includes(sport);
                    return (
                      <button
                        key={sport}
                        type="button"
                        onClick={() => handleSportToggle(sport)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                          active
                            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50 scale-105'
                            : 'bg-white/5 text-on-surface-variant border-transparent hover:text-white'
                        }`}
                      >
                        {sport} {active && `(#${selectedSports.indexOf(sport) + 1})`}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {role === 'coach' && (
            <div className="space-y-6">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider border-l-2 border-sky-500 pl-2">
                Coach Vetting Info
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-xs text-on-surface-variant font-bold ml-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-950/50 border border-slate-700 focus:border-white/20 focus:ring-1 focus:ring-white/20 rounded-xl py-2.5 px-4 text-sm text-on-surface outline-none transition-all"
                    placeholder="e.g. Sarah Connor"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-on-surface-variant font-bold ml-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-950/50 border border-slate-700 focus:border-white/20 focus:ring-1 focus:ring-white/20 rounded-xl py-2.5 px-4 text-sm text-on-surface outline-none transition-all"
                    placeholder="coach@sportshub.io"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-on-surface-variant font-bold ml-1">Phone Number</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-slate-950/50 border border-slate-700 focus:border-white/20 focus:ring-1 focus:ring-white/20 rounded-xl py-2.5 px-4 text-sm text-on-surface outline-none transition-all"
                    placeholder="e.g. +91 94435 00234"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-on-surface-variant font-bold ml-1">Years of Experience</label>
                  <select
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
                    className="w-full bg-slate-950/50 border border-slate-700 focus:border-white/20 focus:ring-1 focus:ring-white/20 rounded-xl py-2.5 px-4 text-sm text-on-surface outline-none appearance-none"
                  >
                    <option value="1-3">1-3 Years</option>
                    <option value="4-7">4-7 Years</option>
                    <option value="8-12">8-12 Years</option>
                    <option value="13+">13+ Years</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-on-surface-variant font-bold ml-1">Primary Discipline</label>
                  <input
                    type="text"
                    required
                    value={coachDiscipline}
                    onChange={(e) => setCoachDiscipline(e.target.value)}
                    className="w-full bg-slate-950/50 border border-slate-700 focus:border-white/20 focus:ring-1 focus:ring-white/20 rounded-xl py-2.5 px-4 text-sm text-on-surface outline-none transition-all"
                    placeholder="e.g. High Performance / Youth Defense"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-on-surface-variant font-bold ml-1">Academy / Organization Name</label>
                  <input
                    type="text"
                    required
                    value={academy}
                    onChange={(e) => setAcademy(e.target.value)}
                    className="w-full bg-slate-950/50 border border-slate-700 focus:border-white/20 focus:ring-1 focus:ring-white/20 rounded-xl py-2.5 px-4 text-sm text-on-surface outline-none transition-all"
                    placeholder="e.g. Resistance Sports Center"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-on-surface-variant font-bold ml-1">Secure Password</label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-950/50 border border-slate-700 focus:border-white/20 focus:ring-1 focus:ring-white/20 rounded-xl py-2.5 px-4 text-sm text-on-surface outline-none transition-all"
                    placeholder="••••••••"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-on-surface-variant font-bold ml-1">Confirm Password</label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-slate-950/50 border border-slate-700 focus:border-white/20 focus:ring-1 focus:ring-white/20 rounded-xl py-2.5 px-4 text-sm text-on-surface outline-none transition-all"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              {/* Coach Credentials upload list */}
              <div className="space-y-3">
                <label className="text-xs text-on-surface-variant font-bold ml-1">
                  Coaching Certifications (PDF/Images)
                </label>
                <div className="relative border-2 border-dashed border-white/10 rounded-xl bg-white/5 p-6 text-center hover:border-sky-500/40 hover:bg-white/10 transition-all cursor-pointer">
                  <input
                    type="file"
                    multiple
                    onChange={handleCertUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  <div className="flex flex-col items-center">
                    <span className="material-symbols-outlined text-4xl text-sky-400 mb-2">cloud_upload</span>
                    <h4 className="text-sm font-bold text-on-surface">Upload Credentials</h4>
                    <p className="text-xs text-on-surface-variant">Drag files here, or click to browse</p>
                  </div>
                </div>

                {certFiles.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-2">
                    {certFiles.map((name, index) => (
                      <div
                        key={index}
                        className="bg-sky-500/10 text-sky-400 text-xs px-3 py-1 rounded-full border border-sky-500/20 flex items-center gap-2"
                      >
                        <span>{name}</span>
                        <button
                          type="button"
                          onClick={() => removeCert(index)}
                          className="material-symbols-outlined text-[14px] hover:text-white transition-colors"
                        >
                          close
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Sign agreement and submit */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-6 border-t border-white/5">
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                required
                className="mt-1 rounded bg-slate-950/50 border-slate-700 text-emerald-500 focus:ring-emerald-500"
              />
              <label className="text-xs text-on-surface-variant">
                I agree to the <span className="text-white underline cursor-pointer">Terms of Service</span> and{' '}
                <span className="text-white underline cursor-pointer">Privacy Policy</span>.
              </label>
            </div>

            <button
              type="submit"
              className="w-full md:w-auto bg-white text-black font-bold py-3.5 px-10 rounded-xl hover:bg-slate-200 transition-all text-xs uppercase tracking-wider flex items-center justify-center gap-2"
            >
              <span>Complete Registration</span>
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          </div>

          <div className="text-center pt-2">
            <p className="text-xs text-on-surface-variant">
              Already have credentials?{' '}
              <Link to="/login/selection" className="text-white hover:underline font-bold">
                Access Gateway
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
