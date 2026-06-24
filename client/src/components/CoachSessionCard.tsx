import React, { useMemo, useState } from "react";
import { MentorJobCard, MentorProfile } from "./MentorJobCard";
import { CategorySection } from "./CategorySection";
import { AlertCircle, Search, X, ChevronDown, RotateCcw } from "lucide-react";
import axios from '../lib/axios';
import { getProfileImageUrl } from "../lib/imageUtils";
import { useQuery } from "@tanstack/react-query";
import { calculateAge, calculateProfessionalExperience, getCurrentCompany, getJobTitle } from "../lib/expertUtils";
import { Input } from "./ui/input";
import { Button } from "./ui/button";

const CoachSessionCard = React.memo(function CoachSessionCard() {
  // Query experts
  const {
    data: expertsData,
    isLoading: isExpertsLoading,
    isError: isExpertsError,
    error: expertsError
  } = useQuery({
    queryKey: ["experts"],
    queryFn: async () => {
      const res = await axios.get("/api/expert/verified");
      return res.data;
    },
    staleTime: 1000 * 60 * 5,
  });

  // Query categories
  const {
    data: categoriesData,
    isLoading: isCategoriesLoading
  } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await axios.get("/api/categories");
      return res.data;
    },
    staleTime: 1000 * 60 * 60,
  });

  // Parse verified experts profiles
  const allProfiles = useMemo<MentorProfile[]>(() => {
    if (isExpertsLoading && !expertsData) return [];
    let rawExperts: any[] = [];
    if (expertsData?.success && Array.isArray(expertsData?.data)) {
      rawExperts = expertsData.data;
    } else if (Array.isArray(expertsData)) {
      rawExperts = expertsData;
    }

    return rawExperts.map((expert: any) => {
      const cat = expert.personalInformation?.category || "IT";
      let exp = "";
      if (expert.professionalDetails?.totalExperience) {
        exp = expert.professionalDetails.totalExperience === 1 ? "1 year" : `${expert.professionalDetails.totalExperience} years`;
      } else {
        exp = calculateProfessionalExperience(expert.professionalDetails) || (calculateAge(expert.personalInformation?.dob) - 22 > 0 ? `${calculateAge(expert.personalInformation?.dob) - 22}+ years` : "Fresher");
      }

      const skills = (() => {
        if (expert.expertSkills && expert.expertSkills.length > 0) {
          return expert.expertSkills
            .filter((s: any) => s.isEnabled && s.skillName)
            .map((s: any) => s.skillName);
        }
        return [...(expert.skillsAndExpertise?.domains || []), ...(expert.skillsAndExpertise?.tools || [])];
      })();

      return {
        id: expert._id || expert.userId,
        expertID: expert._id || expert.userId,
        name: expert.personalInformation?.userName || "Expert",
        role: getJobTitle(expert.professionalDetails, cat),
        company: getCurrentCompany(expert.professionalDetails, cat),
        location: expert.personalInformation?.city || "Online",
        rating: expert.metrics?.avgRating || 0,
        reviews: expert.metrics?.totalReviews || 0,
        avatar: getProfileImageUrl(expert.profileImage),
        isVerified: expert.status === "Active" || expert.status === "verified",
        price: expert.price ? String(expert.price) : "799",
        skills: skills,
        experience: exp,
        activeTime: expert.availability?.nextAvailable || "Available Today",
        totalSessions: expert.metrics?.totalSessions || 0,
        category: cat,
        bio: expert.personalInformation?.bio || "",
        allTags: [cat, ...skills, expert.professionalDetails?.industry].filter(Boolean).map(s => s.toString())
      } as MentorProfile & { category: string, allTags: string[] };
    });
  }, [expertsData, isExpertsLoading]);

  // Extract unique skills from database profiles dynamically
  const uniqueSkills = useMemo(() => {
    const set = new Set<string>();
    allProfiles.forEach((p) => {
      if (Array.isArray(p.skills)) {
        p.skills.forEach(s => { if (s?.trim()) set.add(s.trim()); });
      }
    });
    return Array.from(set).sort();
  }, [allProfiles]);

  // Extract categories dynamically
  const uniqueCategories = useMemo(() => {
    if (categoriesData && Array.isArray(categoriesData)) {
      return categoriesData.filter((c: any) => c.status !== "Inactive").map((c: any) => c.name);
    }
    const set = new Set<string>();
    allProfiles.forEach((p) => { if (p.category) set.add(p.category); });
    return Array.from(set).sort();
  }, [allProfiles, categoriesData]);

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [skillSearchQuery, setSkillSearchQuery] = useState("");
  const [maxExperience, setMaxExperience] = useState<number>(15);
  const [availabilityFilter, setAvailabilityFilter] = useState<string>("All"); // "All", "Today", "Week"
  const [sortOption, setSortOption] = useState<string>("recommended");
  const [showAllSkills, setShowAllSkills] = useState(false);

  // Quick Dropdown Toolbar states
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  // Close toolbar dropdowns on click outside
  React.useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest(".relative")) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  // Clear all filters
  const handleReset = () => {
    setSearchQuery("");
    setSelectedCategories([]);
    setSelectedSkills([]);
    setSkillSearchQuery("");
    setMaxExperience(15);
    setAvailabilityFilter("All");
    setSortOption("recommended");
  };

  // Toggle Category Selection
  const toggleCategory = (cat: string) => {
    setSelectedCategories(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  // Toggle Skill Selection
  const toggleSkill = (skill: string) => {
    setSelectedSkills(prev =>
      prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
    );
  };

  // Filtered skills list based on nested skills search
  const filteredSkillsList = useMemo(() => {
    const query = skillSearchQuery.trim().toLowerCase();
    if (!query) return uniqueSkills;
    return uniqueSkills.filter(s => s.toLowerCase().includes(query));
  }, [uniqueSkills, skillSearchQuery]);

  // Filtered experts selector logic
  const filteredProfiles = useMemo(() => {
    let list = [...allProfiles];

    // 1. Text Search query (name, role, company, skills)
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      list = list.filter((p) => {
        const name = (p.name || "").toLowerCase();
        const role = (p.role || "").toLowerCase();
        const company = (p.company || "").toLowerCase();
        const skills = (p.skills || []).join(" ").toLowerCase();
        return name.includes(q) || role.includes(q) || company.includes(q) || skills.includes(q);
      });
    }

    // 2. Categories checkbox filters
    if (selectedCategories.length > 0) {
      list = list.filter(p => p.category && selectedCategories.includes(p.category));
    }

    // 3. Skills checkbox filters
    if (selectedSkills.length > 0) {
      list = list.filter(p => p.skills && p.skills.some(s => selectedSkills.includes(s)));
    }

    // 4. Experience Slider filter
    list = list.filter(p => {
      const match = (p.experience || "").match(/\d+/);
      const expYears = match ? parseInt(match[0], 10) : 0;
      return expYears <= maxExperience;
    });

    // 5. Availability filter
    if (availabilityFilter === "Today") {
      list = list.filter(p => p.activeTime?.toLowerCase().includes("today"));
    } else if (availabilityFilter === "Week") {
      list = list.filter(p => p.activeTime?.toLowerCase().includes("today") || p.activeTime?.toLowerCase().includes("week"));
    }

    // 6. Sorting logic
    if (sortOption === "price-asc") {
      list.sort((a, b) => parseInt(a.price || "0") - parseInt(b.price || "0"));
    } else if (sortOption === "price-desc") {
      list.sort((a, b) => parseInt(b.price || "0") - parseInt(a.price || "0"));
    } else if (sortOption === "rating-desc") {
      list.sort((a, b) => b.rating - a.rating);
    }

    return list;
  }, [allProfiles, searchQuery, selectedCategories, selectedSkills, maxExperience, availabilityFilter, sortOption]);

  // Group experts by category
  const groupedByCategory = useMemo(() => {
    const groups: { [key: string]: MentorProfile[] } = {};
    filteredProfiles.forEach((profile) => {
      const cat = profile.category || "IT";
      if (!groups[cat]) {
        groups[cat] = [];
      }
      groups[cat].push(profile);
    });
    return groups;
  }, [filteredProfiles]);

  const activeCategoriesWithData = useMemo(() => {
    return uniqueCategories.filter(cat => groupedByCategory[cat] && groupedByCategory[cat].length > 0);
  }, [uniqueCategories, groupedByCategory]);

  const toggleDropdown = (dropdown: string) => {
    setActiveDropdown(prev => prev === dropdown ? null : dropdown);
  };

  return (
    <div className="w-full max-w-full pb-16">
      <div className="w-full space-y-6 mt-6">
        
        {/* Header Title block */}
        <div className="text-left space-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Find the Right Expert for You</h1>
          <p className="text-sm font-semibold text-slate-500">Connect with verified industry experts from top companies and accelerate your career.</p>
        </div>

        {/* Experts Grid Container */}
        <div className="pt-2">
          {isExpertsLoading || isCategoriesLoading ? (
            <div className="space-y-6">
              {[1, 2].map(i => (
                <div key={i} className="bg-white border border-slate-200/60 rounded-[24px] p-6 space-y-4 animate-pulse">
                  <div className="h-4 bg-slate-100 rounded w-48 mb-6"></div>
                  <div className="flex gap-4 overflow-hidden">
                    <div className="w-[300px] h-80 bg-slate-50 rounded-2xl shrink-0"></div>
                    <div className="w-[300px] h-80 bg-slate-50 rounded-2xl shrink-0"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : isExpertsError ? (
            <div className="text-center py-20 bg-rose-50/50 rounded-2xl border border-rose-100/50">
              <AlertCircle className="w-10 h-10 text-rose-400 mx-auto mb-4" />
              <h3 className="text-sm font-black text-rose-900 uppercase tracking-widest">Handshake Error</h3>
              <p className="text-[10px] text-rose-500 font-bold uppercase mt-1">{expertsError instanceof Error ? expertsError.message : "Failure Connecting"}</p>
            </div>
          ) : activeCategoriesWithData.length === 0 ? (
            <div className="text-center py-16 bg-slate-50/50 rounded-2xl border border-slate-200/50">
              <p className="text-sm font-semibold text-slate-600">No experts found.</p>
            </div>
          ) : (
            <div className="w-full space-y-8">
              {activeCategoriesWithData.map((cat) => (
                <CategorySection
                  key={cat}
                  title={cat}
                  profiles={groupedByCategory[cat]}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

export default CoachSessionCard;
