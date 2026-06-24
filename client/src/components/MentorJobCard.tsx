import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

// Types
export interface MentorProfile {
    id: string;
    expertID: string;
    name: string;
    role: string;
    company?: string;
    location: string;
    rating: number;
    reviews: number;
    avatar: string;
    activeTime?: string;
    isVerified: boolean;
    price: string;
    skills: string[];
    experience: string;
    totalSessions: number;
    category?: string;
    allTags?: string[];
    bio?: string;
}

// SVG Icons — no emojis
const HeartIcon = ({ filled }: { filled: boolean }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill={filled ? "#2563EB" : "none"} stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);

const VerifiedIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="#3B82F6">
    <path d="M9 12l2 2 4-4M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    <path d="M9 12l2 2 4-4" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="12" cy="12" r="10" fill="#3B82F6"/>
    <path d="M9 12l2 2 4-4" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const BriefcaseIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
  </svg>
);

const PeopleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);

const TargetIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <circle cx="12" cy="12" r="6"/>
    <circle cx="12" cy="12" r="2"/>
  </svg>
);

const StarIcon = ({ filled = true, size = 18 }: { filled?: boolean, size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? "#FBBF24" : "none"} stroke="#FBBF24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
);

const CalendarIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8" y1="2" x2="8" y2="6"/>
    <line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);

const ClockIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <polyline points="12 6 12 12 16 14"/>
  </svg>
);

const TrophyIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/>
    <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/>
    <path d="M4 22h16"/>
    <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/>
    <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/>
    <path d="M18 2H6v7a6 6 0 0 0 12 0V2z"/>
  </svg>
);

const ChevronRightIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6"/>
  </svg>
);

// Amazon logo SVG
const AmazonLogo = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <text x="2" y="17" fontSize="16" fontWeight="bold" fill="#FF9900" fontFamily="Arial">a</text>
    <path d="M4 18 Q12 22 20 18" stroke="#FF9900" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
    <path d="M18 17 L21 18 L19 20" stroke="#FF9900" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// Company logos as SVG
const CompanyLogo = ({ company }: { company: string }) => {
  const name = (company || "").toLowerCase();
  if (name.includes("amazon")) return (
    <svg width="20" height="20" viewBox="0 0 24 24">
      <text x="1" y="16" fontSize="14" fontWeight="900" fill="#FF9900" fontFamily="Arial">a</text>
      <path d="M3 17.5 Q12 21 21 17.5" stroke="#FF9900" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      <path d="M19.5 16.5 L22 17.5 L20 19" stroke="#FF9900" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
  if (name.includes("microsoft")) return (
    <svg width="18" height="18" viewBox="0 0 18 18">
      <rect x="0" y="0" width="8.5" height="8.5" fill="#F25022"/>
      <rect x="9.5" y="0" width="8.5" height="8.5" fill="#7FBA00"/>
      <rect x="0" y="9.5" width="8.5" height="8.5" fill="#00A4EF"/>
      <rect x="9.5" y="9.5" width="8.5" height="8.5" fill="#FFB900"/>
    </svg>
  );
  if (name.includes("google")) return (
    <svg width="18" height="18" viewBox="0 0 24 24">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
  if (name.includes("meta") || name.includes("facebook")) return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="#0866FF">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15.5v-4.5H9.5V11H11V9.5c0-1.66 1.01-2.5 2.5-2.5.71 0 1.5.13 1.5.13V8.5h-.84c-.83 0-1.16.52-1.16 1.04V11h2l-.32 2H13v4.5h-2z"/>
    </svg>
  );
  return null;
};

export const MentorJobCard = React.memo(({ mentor }: { mentor: MentorProfile }) => {
    const navigate = useNavigate();
    const [avatarFailed, setAvatarFailed] = useState(false);
    const [isSaved, setIsSaved] = useState(() => {
        const saved = localStorage.getItem("savedExperts");
        if (saved) {
            const parsed = JSON.parse(saved);
            return parsed.some((m: MentorProfile) => m.expertID === mentor.expertID);
        }
        return false;
    });

    const handleBookNow = (e: React.MouseEvent) => {
        e.stopPropagation();
        navigate(`/book-session`, {
            state: {
                expertId: mentor.expertID,
                profile: { ...mentor }
            }
        });
    };

    const handleCardClick = () => {
        navigate(`/book-session`, {
            state: {
                expertId: mentor.expertID,
                profile: { ...mentor }
            }
        });
    };

    const toggleSave = (e: React.MouseEvent) => {
        e.stopPropagation();
        const saved = localStorage.getItem("savedExperts");
        let parsed: MentorProfile[] = saved ? JSON.parse(saved) : [];

        if (isSaved) {
            parsed = parsed.filter((m) => m.expertID !== mentor.expertID);
        } else {
            parsed.push(mentor);
        }

        localStorage.setItem("savedExperts", JSON.stringify(parsed));
        setIsSaved(!isSaved);
        window.dispatchEvent(new Event("storage"));
    };

    const showPlaceholder = !mentor.avatar || 
                            mentor.avatar.includes("default-avatar.png") || 
                            mentor.avatar.includes("mockeefy.png") || 
                            avatarFailed;

    // Price Calculations
    const cleanPriceVal = mentor.price && mentor.price !== "₹—" ? parseInt(mentor.price.toString().replace(/[^\d]/g, "")) : 799;
    const cleanPrice = `₹${cleanPriceVal.toLocaleString("en-IN")}`;
    const originalPriceVal = Math.round(cleanPriceVal / 0.77);
    const originalPrice = `₹${originalPriceVal.toLocaleString("en-IN")}`;

    const experienceYears = (() => {
        const match = (mentor.experience || "").match(/\d+/);
        return match ? `${match[0]}+` : "5+";
    })();

    const stats = [
      { icon: <BriefcaseIcon />, value: `${experienceYears}`, label: "Years Exp." },
      { icon: <PeopleIcon />, value: `${mentor.totalSessions || 250}+`, label: "Sessions" },
      { icon: <TargetIcon />, value: mentor.rating > 4.7 ? "96%" : "92%", label: "Success Rate" },
      { icon: <StarIcon size={18} />, value: mentor.rating > 0 ? mentor.rating.toFixed(1) : "4.9", label: `(${mentor.reviews || 128} Reviews)` },
    ];

    const placedCount = mentor.totalSessions > 0 ? Math.round(mentor.totalSessions * 0.6 + 50) : 120;
    const isExAmazon = (mentor.company || "").toLowerCase().includes("amazon");

    return (
      <div 
        onClick={handleCardClick}
        className="bg-white rounded-3xl shadow-xl w-full max-w-[330px] p-5 relative flex flex-col justify-between cursor-pointer hover:shadow-2xl transition-all duration-300 font-sans"
      >
        {/* Heart button */}
        <button
          onClick={toggleSave}
          className="absolute top-4 right-4 transition-transform hover:scale-110 focus:outline-none z-30"
          aria-label="Save mentor"
        >
          <HeartIcon filled={isSaved} />
        </button>

        {/* Available Today */}
        <div className="self-start inline-flex items-center gap-1.5 bg-green-50 border border-green-200 text-green-600 text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
          <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
          {mentor.activeTime || "Available Today"}
        </div>

        {/* Profile Row */}
        <div className="flex items-start gap-4 mb-4 text-left">
          {/* Avatar */}
          <div className="relative shrink-0">
            <div
              className="w-[82px] h-[82px] rounded-full overflow-hidden"
              style={{ boxShadow: "0 0 0 4px #DBEAFE" }}
            >
              {showPlaceholder ? (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-500 text-white font-bold text-2xl uppercase">
                  {(mentor.name || 'E').trim().charAt(0).toUpperCase()}
                </div>
              ) : (
                <img
                  src={mentor.avatar}
                  alt={mentor.name}
                  className="w-full h-full object-cover bg-white"
                  onError={() => setAvatarFailed(true)}
                />
              )}
            </div>
            <span className="absolute bottom-1 right-1 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white" />
          </div>

          {/* Name / Role / Company */}
          <div className="flex-1 min-w-0 pt-1">
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className="text-[19px] font-bold text-gray-900 leading-tight truncate">{mentor.name}</span>
              {mentor.isVerified && <VerifiedIcon />}
            </div>
            <p className="text-sm text-gray-500 mb-2 truncate">{mentor.role}</p>
            
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              {mentor.company && (
                <>
                  {mentor.company.toLowerCase().includes("amazon") ? <AmazonLogo /> : <CompanyLogo company={mentor.company} />}
                  <span className="text-sm font-semibold text-gray-800 truncate">{mentor.company}</span>
                </>
              )}
              {isExAmazon && (
                <span className="text-xs bg-blue-100 text-blue-700 font-medium px-2.5 py-0.5 rounded-full whitespace-nowrap">
                  Ex-Amazon
                </span>
              )}
            </div>

            {/* Inline trust signals */}
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-1">
                <StarIcon size={13} />
                <span className="text-xs font-bold text-gray-800">{mentor.rating > 0 ? mentor.rating.toFixed(1) : "4.9"}</span>
                <span className="text-xs text-gray-400">({mentor.reviews || 128})</span>
              </div>
              {mentor.rating >= 4.8 && (
                <div
                  className="flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full"
                  style={{ background: "#FFFBEB", color: "#B45309", border: "1px solid #FDE68A" }}
                >
                  <StarIcon size={10} />
                  Top Rated
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div
          className="grid grid-cols-4 divide-x py-3 mb-4 rounded-2xl border"
          style={{ background: "#F9FAFB", borderColor: "#E5E7EB" }}
        >
          {stats.map((s, i) => (
            <div key={i} className="flex flex-col items-center px-1.5 gap-1">
              {s.icon}
              <span className="text-[15px] font-bold text-gray-900 leading-none">{s.value}</span>
              <span className="text-[10px] text-gray-400 text-center leading-tight whitespace-nowrap">{s.label}</span>
            </div>
          ))}
        </div>

        {/* Skills */}
        <div className="flex flex-wrap gap-2 mb-4">
          {(mentor.skills || []).slice(0, 5).map((skill) => (
            <span
              key={skill}
              className="text-xs font-medium px-3 py-1 rounded-full whitespace-nowrap"
              style={{ background: "#EFF6FF", color: "#1D4ED8", border: "1px solid #BFDBFE" }}
            >
              {skill}
            </span>
          ))}
          {mentor.skills && mentor.skills.length > 5 && (
            <span
              className="text-xs font-medium px-3 py-1 rounded-full whitespace-nowrap"
              style={{ background: "#EFF6FF", color: "#1D4ED8", border: "1px solid #BFDBFE" }}
            >
              +{mentor.skills.length - 5} more
            </span>
          )}
        </div>

        {/* Next Available */}
        <div
          className="flex items-center justify-between px-4 py-3 mb-4 rounded-2xl text-left"
          style={{ background: "#F9FAFB", border: "1px solid #F3F4F6" }}
        >
          <div className="flex items-center gap-3">
            <CalendarIcon />
            <div>
              <p className="text-[11px] text-gray-400 font-medium mb-0.5">Next Available</p>
              <p className="text-sm font-bold text-gray-800">{mentor.activeTime || "Today, 6:30 PM"}</p>
            </div>
          </div>
          <button onClick={handleBookNow} className="flex items-center gap-0.5 text-sm font-semibold text-blue-600 hover:underline">
            View Slots <ChevronRightIcon />
          </button>
        </div>

        {/* Pricing + Buttons */}
        <div className="flex items-end gap-3 mb-3">
          {/* Left: session + price */}
          <div className="flex-1 text-left">
            <div className="flex items-center gap-2 mb-1.5">
              <ClockIcon />
              <span className="text-xs text-gray-500 font-medium">60 mins session</span>
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-2xl font-extrabold text-gray-900">{cleanPrice}</span>
              <span className="text-sm text-gray-400 line-through">{originalPrice}</span>
              <span
                className="text-xs font-bold px-2 py-0.5 rounded-full"
                style={{ background: "#FEE2E2", color: "#DC2626" }}
              >
                23% OFF
              </span>
            </div>
          </div>

          {/* Right: buttons */}
          <div className="flex flex-col gap-2 flex-1">
            <button
              onClick={handleBookNow}
              className="w-full flex items-center justify-center gap-1.5 text-white font-bold py-2.5 rounded-xl text-sm transition-all hover:opacity-90 active:scale-[0.98]"
              style={{ background: "linear-gradient(135deg, #1D4ED8, #2563EB)" }}
            >
              Book Session <ChevronRightIcon size={15} />
            </button>
            <button
              onClick={handleCardClick}
              className="w-full font-bold py-2.5 rounded-xl text-sm transition-all hover:bg-blue-50 active:scale-[0.98]"
              style={{ border: "2px solid #2563EB", color: "#2563EB" }}
            >
              View Profile
            </button>
          </div>
        </div>

        {/* Footer */}
        <div
          className="flex items-center gap-2 pt-3 flex-wrap"
          style={{ borderTop: "1px solid #F3F4F6" }}
        >
          <TrophyIcon />
          <span className="text-xs font-bold text-gray-700">Placed {placedCount}+ Candidates</span>
          <span className="text-gray-300 text-xs">•</span>
          <span className="text-xs text-gray-400">Mentored Professionals at</span>
          <div className="flex items-center gap-1.5">
            <CompanyLogo company="amazon" />
            <CompanyLogo company="microsoft" />
            <CompanyLogo company="google" />
            <CompanyLogo company="meta" />
            <span className="text-xs text-gray-400 font-semibold">+2</span>
          </div>
        </div>
      </div>
    );
});

MentorJobCard.displayName = "MentorJobCard";
