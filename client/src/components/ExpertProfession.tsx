import { useState, useEffect } from "react";
import { IconButton, Input, PrimaryButton, SecondaryButton } from "../pages/ExpertDashboard";
import axios from '../lib/axios';
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";
import { AlertCircle } from "lucide-react";

interface ExpertProfessionProps {
  onUpdate?: () => void;
  profileData?: any;
  isMissing?: boolean;
}

const ExpertProfession = ({ onUpdate, isMissing }: ExpertProfessionProps) => {
  const { user } = useAuth();

  const initialProfile = {
    professional: {
      title: "",
      company: "",
      totalExperience: "",
      industry: "",
      previous: []
    }
  };

  const [profile, setProfile] = useState<{ professional: { title: string; company: string; totalExperience: string; industry: string; level?: string; previous: any[] } }>(initialProfile);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  const fetchProfessional = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/expert/profession");
      if (res.data.success) {
        setProfile({ professional: res.data.data });
      }
    } catch (err: any) {
      console.error("Failed to fetch professional info:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfessional();
  }, [user]);

  const setProfessionalField = (field: string, value: string) =>
    setProfile((p) => ({ ...p, professional: { ...p.professional, [field]: value } }));

  const addExperience = () =>
    setProfile((p) => ({
      ...p,
      professional: {
        ...p.professional,
        previous: [...p.professional.previous, { company: "", title: "", start: "", end: "" }]
      }
    }));

  const updateExperience = (idx: number, field: string, value: string) => {
    setProfile((p) => {
      const prev = [...p.professional.previous];
      prev[idx] = { ...prev[idx], [field]: value };
      return { ...p, professional: { ...p.professional, previous: prev } };
    });
  };

  const removeExperience = async (idx: number) => {
    try {
      const newPrevious = profile.professional.previous.filter((_, i) => i !== idx);
      setProfile((p) => ({
        ...p,
        professional: { ...p.professional, previous: newPrevious }
      }));

      const res = await axios.delete(
        `/api/expert/profession/previous/${idx}`
      );

      if (!res.data.success) {
        toast.error("Failed to remove experience in DB");
      } else {
        if (onUpdate) onUpdate();
      }
    } catch (err: any) {
      console.error("Error removing experience:", err);
      toast.error("Server error");
    }
  };

  const saveProfessional = async () => {
    try {
      const res = await axios.put(
        "/api/expert/profession",
        { professionalDetails: profile.professional }
      );

      if (res.data.success) {
        toast.success("Professional details saved successfully!");
        setIsEditing(false);
        if (onUpdate) onUpdate();
      } else {
        toast.error("Failed to save professional info");
      }
    } catch (err: any) {
      console.error(err);
      toast.error("Server error");
    }
  };

  if (loading) return <p>Loading professional info...</p>;

  return (
    <div className="h-full">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-blue-800 flex items-center gap-2">
            Professional Details
            {isMissing && <span className="text-xs font-bold text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full flex items-center gap-1"><AlertCircle className="w-3 h-3" /> Action Required</span>}
          </h3>
          <p className="text-sm text-gray-500 mt-1">Current role and work history</p>
        </div>
        {isEditing && (
          <div>
            <SecondaryButton onClick={addExperience}>+ Add Previous</SecondaryButton>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <Input
          disabled={!isEditing}
          label="Current Job Title"
          placeholder="e.g. HR Manager"
          value={profile.professional?.title || ""}
          onChange={(v) => setProfessionalField("title", v)}
        />
        <Input
          disabled={!isEditing}
          label="Current Company"
          placeholder="Company name"
          value={profile.professional?.company || ""}
          onChange={(v) => setProfessionalField("company", v)}
        />
        <Input
          disabled={!isEditing}
          label="Total Years of Experience"
          type="number"
          placeholder="0"
          value={profile.professional?.totalExperience || ""}
          onChange={(v) => setProfessionalField("totalExperience", v)}
        />
        <Input
          disabled={!isEditing}
          label="Industry Expertise"
          placeholder="e.g. IT Services"
          value={profile.professional?.industry || ""}
          onChange={(v) => setProfessionalField("industry", v)}
        />
      </div>

      {profile.professional.previous.length > 0 && (
        <div className="mt-6 space-y-4">
          {profile.professional.previous.map((exp: any, i: number) => (
            <div key={i} className="border border-gray-200 rounded-lg p-10 relative bg-gray-50">
              {isEditing && (
                <IconButton onClick={() => removeExperience(i)} className="absolute top-2 right-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </IconButton>
              )}
              <div className="space-y-3">
                <Input
                  disabled={!isEditing}
                  placeholder="Company Name"
                  value={exp.company}
                  onChange={(v) => updateExperience(i, "company", v)}
                />
                <Input
                  disabled={!isEditing}
                  placeholder="Job Title"
                  value={exp.title}
                  onChange={(v) => updateExperience(i, "title", v)}
                />
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    disabled={!isEditing}
                    placeholder="Start Year"
                    type="number"
                    value={exp.start}
                    onChange={(v) => updateExperience(i, "start", v)}
                  />
                  <Input
                    disabled={!isEditing}
                    placeholder="End Year"
                    type="number"
                    value={exp.end}
                    onChange={(v) => updateExperience(i, "end", v)}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-6 flex justify-end">
        {isEditing ? (
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => {
                fetchProfessional();
                setIsEditing(false);
              }}
              className="px-6 py-2 border border-gray-300 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <PrimaryButton onClick={saveProfessional}>Save Changes</PrimaryButton>
          </div>
        ) : (
          <PrimaryButton onClick={() => setIsEditing(true)}>Edit Experience</PrimaryButton>
        )}
      </div>
    </div>
  );
};

export default ExpertProfession;
