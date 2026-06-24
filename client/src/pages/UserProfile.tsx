import { useState } from "react";
import {
  User,
  Briefcase,
  FileText,
  AlertTriangle,
  Zap,
  Target,
  BookOpen,
  Trophy
} from "lucide-react";
import axios from "../lib/axios";
import { useAuth } from "../context/AuthContext";
import PersonalInfoSection from "../components/profile/PersonalInfoSection";
import EducationSection from "../components/profile/EducationSection";
import ExperienceSection from "../components/profile/ExperienceSection";
import CertificationsSection from "../components/profile/CertificationsSection";
import SkillsSection from "../components/profile/SkillsSection";
import PreferencesSection from "../components/profile/PreferencesSection";
import { useQuery } from "@tanstack/react-query";
import ResumePreview from "../components/profile/ResumePreview";

export default function UserProfile() {
  const { user } = useAuth();
  const userId = user?.id || user?._id || user?.userId;
  const [activeTab, setActiveTab] = useState("personal");
  const [showResumeBuilder, setShowResumeBuilder] = useState(false);

  const { data: profileData, isLoading, refetch } = useQuery({
    queryKey: ["userProfile", userId],
    queryFn: async () => {
      if (!userId) return null;
      const response = await axios.get("/api/user/profile", {
        headers: { userid: userId },
      });
      return response.data.success ? response.data.data : null;
    },
    enabled: !!userId,
  });

  const tabs = [
    { id: "personal", label: "Personal", icon: User },
    { id: "education", label: "Education", icon: BookOpen },
    { id: "experience", label: "Experience", icon: Briefcase },
    { id: "certifications", label: "Certificates", icon: Trophy },
    { id: "skills", label: "Skills", icon: Zap },
    { id: "preferences", label: "Preferences", icon: Target },
  ];

  const completion = profileData?.profileCompletion ?? 0;
  const warnings: string[] = profileData?.profileWarnings || [];

  return (
    <div className="animate-in fade-in duration-500 pb-12 bg-[#FAFAFA] min-h-[calc(100vh-80px)] font-sans">
      <div className="max-w-[1100px] mx-auto px-4 pt-4 sm:pt-6 space-y-5">
        
        {/* Header Section: Title, Completion, Resume Button */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-1.5">
              <h1 className="text-xl font-bold text-slate-900 leading-tight">
                Profile Settings
              </h1>
              <p className="text-xs text-slate-500">
                Manage your credentials and preferences to optimize your candidate profile.
              </p>
            </div>
            
            <div className="flex items-center gap-3 shrink-0">
              {/* Progress Box */}
              <div className="px-3.5 py-2 bg-slate-50 rounded-xl border border-slate-100/80 text-right min-w-[110px]">
                <p className="text-[9px] uppercase font-bold text-slate-400">Completion</p>
                <p className="text-xl font-black text-blue-600 mt-0.5">{isLoading ? "..." : `${completion}%`}</p>
              </div>

              {/* Resume Templates Button */}
              <button
                onClick={() => setShowResumeBuilder(true)}
                className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-slate-950 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-all shadow-sm active:scale-95 h-12"
              >
                <FileText size={14} className="text-blue-400" />
                <span>Resume Templates</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tab Navigation (Horizontal Scrollable) */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-2 shadow-sm">
          <div className="flex gap-1.5 overflow-x-auto pb-1.5 pt-0.5 px-0.5 scrollbar-hide snap-x no-scrollbar">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex items-center gap-2 px-4 py-2 text-xs font-bold transition-all rounded-xl border whitespace-nowrap snap-start shrink-0
                    ${isActive 
                       ? "bg-[#004fcb] text-white border-[#004fcb] shadow-sm" 
                       : "bg-white text-slate-600 border-slate-200 hover:text-slate-900"}
                  `}
                >
                  <Icon size={13} className={isActive ? "text-white" : "text-slate-400"} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Warnings Canvas */}
        {warnings.length > 0 && !isLoading && (
          <div className="bg-amber-50 rounded-2xl p-4 border border-amber-200/50 flex gap-3.5 items-start shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="p-1.5 bg-amber-100 text-amber-600 rounded-lg shrink-0 mt-0.5">
              <AlertTriangle size={15} />
            </div>
            <div className="flex-1 space-y-1.5">
              <h4 className="text-xs font-bold text-amber-900">Visibility Checklist:</h4>
              <div className="flex flex-wrap gap-1.5">
                {warnings.map((warning, index) => (
                  <span key={index} className="text-[10px] font-bold text-amber-800 bg-white px-2 py-1 rounded-md border border-amber-200/40">
                    {warning}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Active Content Canvas */}
        <div className="bg-white border border-slate-200/80 shadow-sm rounded-2xl p-5 md:p-6 min-h-[360px] md:min-h-[480px]">
          {isLoading ? (
            <div className="w-full flex flex-col items-center justify-center text-slate-400 gap-3 min-h-[300px]">
              <div className="w-6 h-6 border-2 border-slate-200 border-t-blue-600 rounded-full animate-spin"></div>
              <span className="text-xs font-medium">Loading profile section...</span>
            </div>
          ) : (
            <div className="animate-in fade-in duration-300">
              {activeTab === "personal" && <PersonalInfoSection profileData={profileData} onUpdate={refetch} />}
              {activeTab === "education" && <EducationSection profileData={profileData} onUpdate={refetch} />}
              {activeTab === "experience" && <ExperienceSection profileData={profileData} onUpdate={refetch} />}
              {activeTab === "certifications" && <CertificationsSection profileData={profileData} onUpdate={refetch} />}
              {activeTab === "skills" && <SkillsSection profileData={profileData} onUpdate={refetch} />}
              {activeTab === "preferences" && <PreferencesSection profileData={profileData} onUpdate={refetch} />}
            </div>
          )}
        </div>

      </div>

      <ResumePreview isOpen={showResumeBuilder} onClose={() => setShowResumeBuilder(false)} />
    </div>
  );
}
