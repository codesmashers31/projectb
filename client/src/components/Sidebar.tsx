import { useState, useEffect } from "react";
import {
  User,
  UserCircle,
  Calendar,
  Video,
  BookOpen,
  ChevronRight,
  TrendingUp,
  ShieldCheck,
  Bookmark,
  Award,
  Pencil,
  Sparkles
} from "lucide-react";
import axios from '../lib/axios';
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getProfileImageUrl } from "../lib/imageUtils";
import { useUserProfile } from "../hooks/useUserProfile";
import { ProUpgradeCard } from "./ProUpgradeCard";
import Avatar from "./ui/avatar";

const Sidebar = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { data: userProfile, isLoading: isProfileLoading } = useUserProfile();
  const [nextSession, setNextSession] = useState<any>(null);

  useEffect(() => {
    const fetchSessions = async () => {
      if (user?.id) {
        try {
          const sessionsRes = await axios.get(`/api/sessions/candidate/${user.id}`);
          if (Array.isArray(sessionsRes.data)) {
            const now = new Date();
            const upcoming = sessionsRes.data
              .filter((s: any) => new Date(s.startTime) > now && s.status !== 'Cancelled')
              .sort((a: any, b: any) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())[0];
            if (upcoming) setNextSession(upcoming);
          }
        } catch (error) {
          console.error("Error fetching sessions:", error);
        }
      }
    };
    fetchSessions();
  }, [user?.id]);

  const displayProfile = userProfile || {
    name: user?.name || "User",
    profileImage: null,
    profileCompletion: 0,
  };

  const roleLine = (() => {
    const data: any = userProfile;
    const expList = Array.isArray(data?.experience) ? data.experience : [];
    const current = expList.find((e: any) => e?.current && e?.position) || expList.find((e: any) => e?.position);
    const position = (current?.position || "").toString().trim();
    if (position) return position;
    // Fallback: if user hasn’t added experience, show Fresher.
    return "Fresher";
  })();

  const NavItem = ({ icon: Icon, label, path, active }: any) => (
    <button
      onClick={() => navigate(path)}
      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-300 group tracking-tight relative overflow-hidden ${
        active
          ? "bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-md shadow-indigo-650/15"
          : "text-slate-600 hover:bg-slate-50 hover:text-indigo-600"
      }`}
    >
      <div className="flex items-center gap-3 relative z-10">
        <Icon 
          size={15} 
          className={`transition-all duration-300 ${
            active 
              ? "text-white scale-110" 
              : "text-slate-400 group-hover:text-indigo-605 group-hover:scale-110"
          }`} 
        />
        <span className={`transition-transform duration-300 ${!active && "group-hover:translate-x-0.5"}`}>
          {label}
        </span>
      </div>
      {active ? (
        <ChevronRight size={11} strokeWidth={3} className="text-white animate-pulse" />
      ) : (
        <ChevronRight 
          size={11} 
          strokeWidth={3} 
          className="text-slate-300 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" 
        />
      )}
    </button>
  );

  const radius = 20;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - ((displayProfile.profileCompletion || 0) / 100) * circumference;

  if (!displayProfile && isProfileLoading) return <SkeletonSidebar />;

  return (
    <div className="w-full max-w-[240px] mx-auto space-y-4 font-sans">

      {/* CARD 1: IDENTITY */}
      <div 
        onClick={() => navigate("/profile")}
        className="bg-gradient-to-br from-white to-slate-50/50 rounded-2xl border border-slate-200/80 p-4 shadow-[0_2px_8px_rgba(0,0,0,0.03)] cursor-pointer hover:shadow-md hover:border-indigo-200/80 hover:bg-slate-50/10 transition-all duration-300 group/profile-card relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-tr from-indigo-50/0 to-indigo-50/10 opacity-0 group-hover/profile-card:opacity-100 transition-opacity duration-500 pointer-events-none" />
        
        <div className="flex items-center gap-3.5 relative z-10">
          <div className="relative shrink-0">
            <div className="relative w-12 h-12 flex items-center justify-center">
              <svg className="absolute top-0 left-0 w-full h-full transform -rotate-90" viewBox="0 0 48 48">
                <circle cx="24" cy="24" r={radius} fill="none" stroke="#f1f5f9" strokeWidth="2.5" />
                <circle
                  cx="24" cy="24" r={radius}
                  fill="none"
                  stroke="url(#completion-gradient)"
                  strokeWidth="2.5"
                  strokeDasharray={circumference}
                  strokeDashoffset={offset}
                  strokeLinecap="round"
                />
                <defs>
                  <linearGradient id="completion-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#4f46e5" />
                    <stop offset="100%" stopColor="#2563eb" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="w-8.5 h-8.5 rounded-full border-2 border-white absolute bg-slate-50 overflow-hidden shadow-sm">
                <Avatar
                  name={displayProfile.name}
                  src={(user as any)?.profileImage ?? (displayProfile as any)?.profileImage}
                  className="w-full h-full"
                />
              </div>
            </div>
          </div>
          <div className="min-w-0 flex-1 flex items-center justify-between gap-1.5">
            <div className="min-w-0 flex-1">
              <h3 className="font-bold text-[13px] text-slate-800 truncate tracking-tight group-hover/profile-card:text-indigo-650 transition-colors">
                {displayProfile.name}
              </h3>
              
              <div className="mt-2 flex flex-wrap gap-1.5 items-center">
                {/* Experience/Role Badge */}
                <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 border border-indigo-100/80 text-[9px] font-bold text-indigo-650 tracking-wide inline-flex items-center gap-1.5 leading-normal shadow-sm shadow-indigo-100/10">
                  <span className="w-1 h-1 rounded-full bg-indigo-500 shrink-0" />
                  {roleLine.toUpperCase()}
                </span>

                {/* Profile Completion Badge */}
                <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold tracking-wide inline-flex items-center gap-1.5 leading-normal shadow-sm ${
                  displayProfile.profileCompletion >= 90 
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-100/80 shadow-emerald-100/10' 
                    : 'bg-amber-50 text-amber-750 border border-amber-100/80 shadow-amber-100/10'
                }`}>
                  <span className={`w-1 h-1 rounded-full shrink-0 ${
                    displayProfile.profileCompletion >= 90 ? 'bg-emerald-500' : 'bg-amber-500'
                  }`} />
                  {displayProfile.profileCompletion}%
                </span>

                {/* Premium / Pro Status Badge */}
                {displayProfile.isPremium && (
                  <span className="px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[9px] font-black tracking-wide inline-flex items-center gap-1 leading-normal shadow-sm shadow-orange-500/15">
                    <Sparkles size={8} className="text-amber-100 shrink-0 animate-pulse" />
                    PRO
                  </span>
                )}
              </div>
            </div>
            <div className="w-7 h-7 rounded-full bg-slate-50 border border-slate-100 text-slate-400 group-hover/profile-card:bg-indigo-50 group-hover/profile-card:text-indigo-600 group-hover/profile-card:border-indigo-100 transition-all duration-300 flex items-center justify-center shrink-0 shadow-sm group-hover/profile-card:rotate-12">
              <Pencil size={11} className="stroke-[2.5]" />
            </div>
          </div>
        </div>
      </div>

      {/* CARD 2: NAVIGATION — correct process: Overview → Profile → Sessions → Career → Saved → Certificates */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-2 shadow-sm space-y-1">
        <NavItem icon={User} label="Overview" path="/" active={location.pathname === "/" || location.pathname === "/dashboard"} />
        <NavItem icon={UserCircle} label="Profile" path="/profile" active={location.pathname === "/profile"} />
        <NavItem icon={Calendar} label="Sessions" path="/my-sessions" active={location.pathname === "/my-sessions"} />
        <NavItem icon={BookOpen} label="Interview tips" path="/tips" active={location.pathname === "/tips"} />
        <NavItem icon={Bookmark} label="Saved Experts" path="/saved-experts" active={location.pathname === "/saved-experts"} />
        <NavItem icon={Award} label="Certificates" path="/certificates" active={location.pathname === "/certificates"} />
      </div>

      {/* CARD 3: UPGRADE */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-1 shadow-sm overflow-hidden">
        <ProUpgradeCard />
      </div>

      {/* CARD 4: UPCOMING (ONLY WHITE CARD - NO DARK BG) */}
      {nextSession && (
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm relative overflow-hidden group">
          <div className="flex items-center justify-between mb-3.5 relative z-10">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-[9px] font-black uppercase text-emerald-600 tracking-widest">Confirmed</span>
            </div>
            <span className="text-[9px] font-black text-slate-400 tracking-tight">
              {new Date(nextSession.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
          <div className="flex items-center gap-3 mb-4 relative z-10">
            <div className="w-9 h-9 rounded-xl border border-slate-100 p-0.5">
              <img
                src={getProfileImageUrl(nextSession.expertDetails?.profileImage)}
                className="w-full h-full rounded-lg object-cover"
                alt="Expert"
              />
            </div>
            <div className="min-w-0">
              <p className="font-elite text-[11px] truncate">{nextSession.expertDetails?.name}</p>
              <p className="text-[8px] font-black text-slate-400 tracking-tight mt-1 uppercase">Simulation</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/my-sessions')}
            className="w-full py-1.5 bg-elite-blue text-white rounded-lg text-[9px] font-black tracking-tight hover:bg-blue-600 transition-all shadow-sm flex items-center justify-center gap-2"
          >
            <Video size={10} strokeWidth={4} />
            Join Studio
          </button>
        </div>
      )}

      {/* Stats card removed (Skills / Top 5%) */}
    </div>
  );
};

export const SkeletonSidebar = () => (
  <div className="w-full space-y-4 animate-pulse">
    <div className="h-32 bg-white rounded-2xl border border-slate-100"></div>
    <div className="h-40 bg-white rounded-2xl border border-slate-100"></div>
  </div>
);

export default Sidebar;