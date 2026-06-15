import { Star, ChevronRight, Briefcase, MapPin, Clock, Bookmark } from "lucide-react";
import { useState } from "react";
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
}

import React from "react";

export const MentorJobCard = React.memo(({ mentor }: { mentor: MentorProfile }) => {
    const navigate = useNavigate();
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

    return (
        <div
            onClick={handleCardClick}
            className="
                group relative bg-white
                rounded-[20px] border border-slate-200
                w-full min-w-0 h-full flex flex-col p-6
                transition-all duration-300 ease-in-out
                hover:shadow-xl hover:shadow-blue-900/5 hover:border-blue-300
                cursor-pointer snap-start overflow-hidden
            "
        >
            {/* Header: Title & Time & Avatar */}
            <div className="flex justify-between items-start mb-4 relative z-10">
                <div className="flex-1 min-w-0 pr-4">
                    <h3 className="font-bold text-lg text-slate-900 tracking-tight leading-tight truncate group-hover:text-blue-600 transition-colors">
                        {mentor.name}
                    </h3>
                    <div className="flex items-center gap-1.5 mt-1.5">
                        <Clock size={14} className="text-slate-400" />
                        <span className="text-xs text-slate-500 font-medium">{mentor.activeTime?.replace(' ago', '') || "Active now"}</span>
                    </div>
                </div>
                
                <div className="shrink-0 flex items-center gap-3">
                    <button
                        onClick={toggleSave}
                        className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${isSaved ? 'text-blue-600 bg-blue-50' : 'text-slate-400 bg-slate-50 hover:bg-slate-100 hover:text-slate-600'}`}
                    >
                        <Bookmark size={16} className={isSaved ? "fill-current" : ""} />
                    </button>
                    
                    <div className="relative">
                        {(mentor.avatar && !mentor.avatar.includes("default-avatar.png")) ? (
                            <div className="w-14 h-14 rounded-full overflow-hidden shrink-0 border border-slate-100 shadow-sm">
                                <img
                                    src={mentor.avatar}
                                    className="w-full h-full object-cover"
                                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                    alt={mentor.name}
                                />
                            </div>
                        ) : (
                            <div className="w-14 h-14 rounded-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 text-blue-700 font-bold text-lg shrink-0 border border-blue-200/50 shadow-sm uppercase">
                                {(mentor.name || 'E').trim().charAt(0).toUpperCase()}
                            </div>
                        )}
                        <div className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white"></div>
                    </div>
                </div>
            </div>

            {/* Info Row: Role & Company */}
            <div className="mb-5 relative z-10">
                <p className="text-sm text-slate-600 font-medium leading-relaxed line-clamp-2">
                    {mentor.role}{mentor.company ? <span className="text-slate-400 font-normal"> at </span> : ""}{mentor.company && <span className="font-semibold text-slate-800">{mentor.company}</span>}
                </p>
            </div>

            {/* Meta Stats: Experience & Sessions */}
            <div className="flex flex-wrap gap-2 mb-6 relative z-10">
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-50 border border-slate-100 text-xs font-medium text-slate-600">
                    <Briefcase size={13} className="text-slate-400" />
                    <span>{mentor.experience}</span>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-50 border border-slate-100 text-xs font-medium text-slate-600">
                    <MapPin size={13} className="text-slate-400" />
                    <span className="truncate max-w-[100px]">{mentor.location || "Global"}</span>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-50 border border-amber-100 text-xs font-medium text-amber-700">
                    <Star size={13} className="fill-amber-500 text-amber-500" />
                    <span>{mentor.rating > 0 ? mentor.rating.toFixed(1) : "New"}</span>
                    {mentor.reviews > 0 && <span className="text-amber-600/70">({mentor.reviews})</span>}
                </div>
            </div>

            {/* Price & Action Section */}
            <div className="mt-auto pt-5 border-t border-slate-100 relative z-10 flex items-center justify-between">
                <div>
                    <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide mb-0.5">Session Price</p>
                    <div className="flex items-baseline gap-1">
                        <span className="text-xl font-bold text-slate-900 tracking-tight">
                            {mentor.price || "₹99"}
                        </span>
                    </div>
                </div>
                <button
                    onClick={handleBookNow}
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition-colors flex items-center gap-1.5 shadow-sm"
                >
                    Book Now
                </button>
            </div>
        </div>
    );
});
