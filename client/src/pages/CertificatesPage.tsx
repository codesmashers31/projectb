import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";
import axios from "../lib/axios";
import { Award, ChevronRight, Download, X } from "lucide-react";
import { getProfileImageUrl } from "../lib/imageUtils";
// @ts-ignore
import html2pdf from "html2pdf.js";

type ReviewInfo = {
  overallRating?: number;
  technicalRating?: number;
  communicationRating?: number;
  feedback?: string;
  strengths?: string[];
  weaknesses?: string[];
};

type Session = {
  id: string;
  sessionId: string;
  expert: string;
  profileImage?: string | null;
  startTime?: string;
  category?: string;
  status: string;
  expertReview?: ReviewInfo | null;
  candidateReview?: ReviewInfo | null;
};

// Certificate Template for full A4 landscape rendering (hidden in page, captured by html2pdf)
const CertificateTemplate = ({
  userName,
  isMaster,
  category,
  expertName,
  issueDate,
  certId
}: {
  userName: string;
  isMaster: boolean;
  category?: string;
  expertName?: string;
  issueDate: string;
  certId: string;
}) => {
  return (
    <div
      className="w-[842px] h-[595px] p-10 border-[14px] border-double border-[#1e3a8a] text-slate-800 font-sans flex flex-col justify-between relative bg-white"
      style={{
        backgroundImage: "radial-gradient(circle, #ffffff 0%, #f8fafc 100%)",
        boxShadow: "0 0 40px rgba(0,0,0,0.05)",
      }}
    >
      {/* Thin inner blue frame */}
      <div className="absolute inset-3 border border-[#3b82f6]/30 pointer-events-none" />

      {/* Header Ornaments */}
      <div className="text-center mt-2 flex flex-col items-center">
        <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-[#1e3a8a] mb-2 shadow-sm">
          <Award className="w-5 h-5" />
        </div>
        <div className="text-[9px] font-bold text-[#1e3a8a] tracking-[0.3em] uppercase">
          Mockeefy Certified Assessment
        </div>
      </div>

      {/* Certificate Content */}
      <div className="text-center space-y-3.5">
        <h1 className="text-4xl font-black text-slate-950 tracking-[0.1em] uppercase">
          Mockeefy
        </h1>
        <p className="text-[11px] text-slate-400 font-medium italic mt-2">
          This verified credential is proudly conferred upon
        </p>
        <h2 className="text-3xl font-extrabold text-slate-900 border-b-2 border-indigo-900/10 pb-2.5 max-w-lg mx-auto tracking-wide">
          {userName}
        </h2>
        <p className="text-xs text-slate-600 max-w-xl mx-auto leading-relaxed pt-2">
          {isMaster ? (
            <span>
              for successfully completing the <strong>Mockeefy Master Interview Readiness Program</strong>, comprising 3+ comprehensive mock interview simulations guided by verified industry experts. The recipient has demonstrated exceptional professional competence, technical proficiency, and career readiness.
            </span>
          ) : (
            <span>
              for successfully completing a comprehensive <strong>{category} Mock Interview Simulation</strong> under the guidance of verified industry experts. The candidate was evaluated on technical competency, system design, and communication skills.
            </span>
          )}
        </p>
      </div>

      {/* Footer containing seal, dates, signatures */}
      <div className="grid grid-cols-3 items-end text-center pb-4 px-6">
        {/* Left Signature */}
        <div className="flex flex-col items-center">
          <div className="w-36 border-b border-slate-300 pb-1 text-slate-800 font-sans text-xs italic font-medium">
            Mockeefy Expert Panel
          </div>
          <span className="text-[8px] text-slate-400 uppercase font-black tracking-widest mt-1.5">
            Assessing Board
          </span>
        </div>

        {/* Center Seal */}
        <div className="flex justify-center relative -bottom-1">
          <div className="w-20 h-20 bg-gradient-to-br from-indigo-900 via-indigo-950 to-[#1e3a8a] rounded-full flex items-center justify-center shadow-md relative border-[3px] border-white z-10">
            {/* Blue Ribbon Tails */}
            <div className="absolute -bottom-4 left-3 w-4.5 h-10 bg-[#1e3a8a] rotate-[25deg] origin-top rounded-b-sm shadow-sm" />
            <div className="absolute -bottom-4 right-3 w-4.5 h-10 bg-[#1e3a8a] -rotate-[25deg] origin-top rounded-b-sm shadow-sm" />
            <div className="w-14 h-14 rounded-full border border-indigo-200/30 flex flex-col items-center justify-center text-center p-1 bg-white font-sans text-[6px] font-black uppercase text-[#1e3a8a] tracking-wider">
              <span>Verified</span>
              <span className="text-[5px] text-slate-500 mt-0.5">Credential</span>
            </div>
          </div>
        </div>

        {/* Right Signature */}
        <div className="flex flex-col items-center">
          <div className="w-36 border-b border-slate-300 pb-1 text-slate-800 font-sans text-xs italic font-medium">
            Aditya Vardhan
          </div>
          <span className="text-[8px] text-slate-400 uppercase font-black tracking-widest mt-1.5">
            Founder, Mockeefy
          </span>
        </div>
      </div>

      {/* Meta verification */}
      <div className="flex justify-between items-center text-[8px] text-slate-400 font-sans border-t border-slate-100 pt-3 px-2">
        <span>Date Issued: {issueDate}</span>
        <span>Certificate ID: {certId}</span>
        <span>Verify at mockeefy.com/verify</span>
      </div>
    </div>
  );
};

export default function CertificatesPage() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [isMasterSelected, setIsMasterSelected] = useState(false);
  const [downloading, setDownloading] = useState<string | null>(null);
  const [downloadingMaster, setDownloadingMaster] = useState(false);

  const completedSessions = useMemo(() => {
    return sessions.filter((s) => (s.status || "").toLowerCase() === "completed");
  }, [sessions]);

  const masterCertId = useMemo(() => {
    const userId = (user as any)?.id || (user as any)?._id || "USR";
    return `MCFY-MST-${userId.slice(-6).toUpperCase()}-${new Date().getFullYear()}`;
  }, [user]);

  const handleDownloadPDF = async (sessionObj: Session) => {
    setDownloading(sessionObj.id);
    setSelectedSession(sessionObj);
    
    // Give react time to render template
    setTimeout(async () => {
      const element = document.getElementById("certificate-pdf-content");
      if (element) {
        const name = user?.name || "Candidate";
        const filename = `${name.replace(/\s+/g, "_")}_${sessionObj.category || "Interview"}_Certificate.pdf`;
        const opt = {
          margin:       0,
          filename:     filename,
          image:        { type: 'jpeg', quality: 0.98 },
          html2canvas:  { scale: 2, useCORS: true, letterRendering: true, logging: false },
          jsPDF:        { unit: 'mm', format: 'a4', orientation: 'landscape' }
        };
        try {
          // @ts-ignore
          await html2pdf().from(element).set(opt).save();
        } catch (err) {
          console.error(err);
        }
      }
      setDownloading(null);
      setSelectedSession(null);
    }, 150);
  };

  const handleDownloadMasterPDF = async () => {
    setDownloadingMaster(true);
    setIsMasterSelected(true);
    
    setTimeout(async () => {
      const element = document.getElementById("certificate-pdf-content");
      if (element) {
        const name = user?.name || "Candidate";
        const filename = `${name.replace(/\s+/g, "_")}_Master_Interview_Certificate.pdf`;
        const opt = {
          margin:       0,
          filename:     filename,
          image:        { type: 'jpeg', quality: 0.98 },
          html2canvas:  { scale: 2, useCORS: true, letterRendering: true, logging: false },
          jsPDF:        { unit: 'mm', format: 'a4', orientation: 'landscape' }
        };
        try {
          // @ts-ignore
          await html2pdf().from(element).set(opt).save();
        } catch (err) {
          console.error(err);
        }
      }
      setDownloadingMaster(false);
      setIsMasterSelected(false);
    }, 150);
  };

  // Pagination (same pattern as My Bookings)
  const sortedCompleted = useMemo(() => {
    return completedSessions
      .slice()
      .sort((a, b) => new Date(b.startTime || 0).getTime() - new Date(a.startTime || 0).getTime());
  }, [completedSessions]);

  const PAGE_SIZE = 10;
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(sortedCompleted.length / PAGE_SIZE));

  useEffect(() => {
    setPage(1);
  }, [sortedCompleted.length]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const pageStartIdx = (page - 1) * PAGE_SIZE;
  const pageEndIdx = Math.min(sortedCompleted.length, pageStartIdx + PAGE_SIZE);
  const pagedCertificates = sortedCompleted.slice(pageStartIdx, pageEndIdx);

  useEffect(() => {
    const fetchSessions = async () => {
      const userId = (user as any)?.id || (user as any)?._id;
      if (!userId) return;
      setLoading(true);
      try {
        const res = await axios.get(`/api/sessions/candidate/${userId}`);
        const raw = Array.isArray(res.data) ? res.data : [];
        const mapped: Session[] = raw.map((s: any) => ({
          id: s._id || s.sessionId,
          sessionId: s.sessionId,
          expert: s.expertDetails?.name || s.expertId?.name || "Expert",
          profileImage: s.expertDetails?.profileImage || s.expertId?.profileImage || null,
          startTime: s.startTime,
          category: s.categoryName || s.category || s.expertDetails?.personalInformation?.category || "IT",
          status: (s.status || "").charAt(0).toUpperCase() + (s.status || "").slice(1),
          expertReview: s.expertReview || null,
          candidateReview: s.candidateReview || null,
        }));
        setSessions(mapped);
      } catch (e) {
        console.error(e);
        setSessions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, [user]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10 max-w-5xl mx-auto">
      {/* Milestone progress card */}
      {!loading && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_4px_24px_-8px_rgba(0,0,0,0.06)] p-6 relative overflow-hidden">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
            <div className="flex items-center gap-4.5">
              <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-indigo-650 shrink-0 shadow-sm">
                <Award className="w-6 h-6" />
              </div>
              <div className="text-left">
                <h2 className="text-base font-bold text-slate-900">Master Certificate of Interview Excellence</h2>
                <p className="text-xs text-slate-550 mt-1 max-w-xl">
                  Unlock this certification of readiness by completing at least 3 mock interview simulations with verified industry experts.
                </p>
                
                {/* Progress Bar */}
                <div className="mt-3.5 flex items-center gap-3">
                  <div className="w-48 bg-slate-100 rounded-full h-2.5 overflow-hidden border border-slate-200/30">
                    <div 
                      className="bg-indigo-600 h-full rounded-full transition-all duration-500" 
                      style={{ width: `${Math.min(100, (completedSessions.length / 3) * 100)}%` }} 
                    />
                  </div>
                  <span className="text-xs text-slate-500 font-bold">{completedSessions.length}/3 Completed</span>
                </div>
              </div>
            </div>

            <div>
              {completedSessions.length >= 3 ? (
                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => setIsMasterSelected(true)}
                    className="px-4 py-2 bg-indigo-650 hover:bg-indigo-750 text-white font-bold rounded-lg shadow-sm hover:shadow transition-all flex items-center gap-2 text-xs"
                  >
                    View Certification
                  </button>
                  <button
                    type="button"
                    onClick={handleDownloadMasterPDF}
                    disabled={downloadingMaster}
                    className="p-2.5 bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100 font-bold rounded-lg shadow-sm flex items-center gap-2 text-xs"
                    title="Download Master PDF"
                  >
                    <Download size={14} className={downloadingMaster ? "animate-bounce" : ""} />
                  </button>
                </div>
              ) : (
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-500 text-xs font-semibold">
                  Locked (Complete {3 - completedSessions.length} more)
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Certificates List Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_4px_24px_-8px_rgba(0,0,0,0.06)] overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-2.5">
              <Award className="w-4 h-4 text-elite-blue" />
              <h1 className="font-elite leading-none text-slate-900">My Certificates</h1>
            </div>
            <p className="text-[10px] text-slate-500 font-medium">Completed sessions — view verified certificates</p>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-blue-50 text-elite-blue border border-blue-100">
              <span className="w-1 h-1 rounded-full bg-blue-500"></span>
              <span className="text-[8px] font-black tracking-tight uppercase">Verified</span>
            </div>

            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Total</span>
              <span className="text-[10px] font-black text-slate-700 tabular-nums">{sortedCompleted.length}</span>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="p-6">
            <div className="h-10 bg-slate-50 rounded-xl animate-pulse" />
            <div className="h-10 bg-slate-50 rounded-xl animate-pulse mt-3" />
            <div className="h-10 bg-slate-50 rounded-xl animate-pulse mt-3" />
          </div>
        ) : completedSessions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50/50 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Certificate details
                  </th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Date issued
                  </th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {pagedCertificates.map((session) => (
                    <tr key={session.id} className="hover:bg-slate-50/30 transition-colors">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-elite-blue shrink-0 overflow-hidden border border-blue-100">
                            {session.profileImage ? (
                              <img
                                src={getProfileImageUrl(session.profileImage)}
                                alt=""
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Award size={20} />
                            )}
                          </div>
                          <div className="min-w-0">
                            <h3 className="font-bold text-slate-900 text-sm">Certificate of Completion</h3>
                            <p className="text-xs text-slate-500 mt-0.5 truncate">
                              {session.category} Simulation with {session.expert}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <p className="text-sm font-bold text-slate-700">
                          {session.startTime ? new Date(session.startTime).toLocaleDateString() : "—"}
                        </p>
                        <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mt-0.5">Verified</p>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setSelectedSession(session)}
                            className="px-4 py-2 border border-slate-200 hover:border-elite-blue hover:text-elite-blue text-slate-600 rounded-lg text-xs font-bold transition-all flex items-center gap-2"
                          >
                            View <ChevronRight size={12} strokeWidth={3} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDownloadPDF(session)}
                            disabled={downloading === session.id}
                            className="px-4 py-2 bg-[#EEF2FF] hover:bg-indigo-50 text-[#4F46E5] hover:text-indigo-700 border border-indigo-100 rounded-lg text-xs font-bold transition-all flex items-center gap-2 disabled:opacity-50"
                          >
                            <Download size={14} className={downloading === session.id ? "animate-bounce" : ""} />
                            {downloading === session.id ? "Saving..." : "PDF"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-16 text-center flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mb-4">
              <Award className="w-8 h-8 text-slate-300" />
            </div>
            <h3 className="text-slate-900 font-bold mb-1">No Certificates Yet</h3>
            <p className="text-slate-500 text-sm max-w-xs mx-auto">
              Complete sessions to unlock certificates. Your verified certificates will appear here.
            </p>
          </div>
        )}

        {/* Pagination footer (desktop) */}
        {!loading && sortedCompleted.length > 0 && (
          <div className="hidden md:flex items-center justify-between px-5 py-4 border-t border-slate-100 bg-white">
            <div className="text-[10px] font-bold text-slate-500">
              Showing <span className="text-slate-700 tabular-nums">{pageStartIdx + 1}</span>–<span className="text-slate-700 tabular-nums">{pageEndIdx}</span> of{" "}
              <span className="text-slate-700 tabular-nums">{sortedCompleted.length}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="px-3 py-2 rounded-xl border border-slate-200 text-slate-600 text-[10px] font-black hover:border-elite-blue hover:text-elite-blue disabled:opacity-50 disabled:hover:border-slate-200 disabled:hover:text-slate-600 transition-all"
              >
                Prev
              </button>
              <div className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-100 text-[10px] font-black text-slate-700 tabular-nums">
                Page {page} / {totalPages}
              </div>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="px-3 py-2 rounded-xl border border-slate-200 text-slate-600 text-[10px] font-black hover:border-elite-blue hover:text-elite-blue disabled:opacity-50 disabled:hover:border-slate-200 disabled:hover:text-slate-600 transition-all"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* Pagination footer (mobile) */}
        {!loading && sortedCompleted.length > 0 && (
          <div className="md:hidden px-4 py-4 border-t border-slate-100 bg-white flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="px-3 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold disabled:opacity-50"
            >
              Prev
            </button>
            <div className="text-xs font-bold text-slate-600 tabular-nums">
              {pageStartIdx + 1}-{pageEndIdx} / {sortedCompleted.length}
            </div>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="px-3 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Certificate View Modal */}
      {(selectedSession || isMasterSelected) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden animate-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-950 flex items-center gap-2 text-base">
                <Award className="text-indigo-600" />
                {isMasterSelected ? "Master Certificate Preview" : "Verified Certificate Preview"}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setSelectedSession(null);
                  setIsMasterSelected(false);
                }}
                className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-50 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 bg-slate-50/50 flex flex-col items-center gap-6">
              {/* Responsive preview of the certificate */}
              <div className="w-full overflow-hidden border border-slate-200 rounded-2xl bg-white p-2.5 flex justify-center shadow-lg">
                {/* A responsive, CSS-scaled preview using aspect-ratio and relative dimensions */}
                <div className="w-full aspect-[1.414] bg-white border-[6px] md:border-[10px] border-double border-[#1e3a8a] p-4 md:p-6 text-slate-800 font-sans flex flex-col justify-between relative shadow-sm" style={{
                  backgroundImage: "radial-gradient(circle, #ffffff 0%, #f1f5f9 100%)"
                }}>
                  {/* Inner blue frame */}
                  <div className="absolute inset-1 md:inset-2 border border-[#3b82f6]/30 pointer-events-none" />

                  <div className="text-center mt-1 flex flex-col items-center">
                    <Award className="w-3.5 h-3.5 md:w-5 md:h-5 text-[#1e3a8a] mb-0.5 md:mb-1" />
                    <div className="text-[5px] md:text-[6px] font-sans font-black text-[#1e3a8a] tracking-[0.2em] uppercase leading-none">
                      Mockeefy Certified Assessment
                    </div>
                  </div>

                  <div className="text-center my-auto py-2">
                    <h4 className="text-xl md:text-3xl font-black text-slate-955 font-sans tracking-wider uppercase leading-none">
                      Mockeefy
                    </h4>
                    <p className="text-[7px] md:text-[9px] font-sans text-slate-400 italic mt-1 md:mt-2">
                      This verified credential is proudly conferred upon
                    </p>
                    <h5 className="text-base md:text-2xl font-extrabold text-slate-900 border-b border-indigo-900/10 pb-1 max-w-[80%] mx-auto font-sans tracking-wide mt-1.5 md:mt-2.5">
                      {user?.name || "Candidate"}
                    </h5>
                    <p className="text-[6px] md:text-[10px] font-sans text-slate-600 max-w-[90%] mx-auto leading-relaxed mt-2.5 md:mt-4">
                      {isMasterSelected ? (
                        <span>
                          for successfully completing the <strong>Mockeefy Master Interview Readiness Program</strong>, comprising 3+ comprehensive mock interview simulations guided by verified industry experts.
                        </span>
                      ) : (
                        <span>
                          for successfully completing a comprehensive <strong>{selectedSession?.category} Mock Interview Simulation</strong> under the guidance of verified industry experts.
                        </span>
                      )}
                    </p>
                  </div>

                  <div className="grid grid-cols-3 items-end text-center pb-2 px-2">
                    <div className="flex flex-col items-center">
                      <div className="w-16 md:w-28 border-b border-slate-300 pb-0.5 text-slate-800 font-sans text-[5px] md:text-[8px] italic leading-none">
                        Mockeefy Expert Panel
                      </div>
                      <span className="text-[4px] md:text-[6px] text-slate-400 uppercase font-sans font-black mt-1 leading-none">
                        Assessing Board
                      </span>
                    </div>

                    <div className="flex justify-center relative">
                      <div className="w-10 h-10 md:w-16 md:h-16 bg-gradient-to-br from-indigo-900 via-indigo-950 to-[#1e3a8a] rounded-full flex items-center justify-center shadow border-2 border-white relative z-10">
                        {/* Blue Ribbon Tails */}
                        <div className="absolute -bottom-2.5 left-1.5 w-2 h-5 bg-[#1e3a8a] rotate-[25deg] origin-top rounded-b-xs shadow-sm md:-bottom-4 md:left-2 md:w-3.5 md:h-8" />
                        <div className="absolute -bottom-2.5 right-1.5 w-2 h-5 bg-[#1e3a8a] -rotate-[25deg] origin-top rounded-b-xs shadow-sm md:-bottom-4 md:right-2 md:w-3.5 md:h-8" />
                        <div className="w-7 h-7 md:w-11 md:h-11 rounded-full flex flex-col items-center justify-center text-center p-0.5 bg-white font-sans text-[3px] md:text-[5px] font-black uppercase text-[#1e3a8a] tracking-wider">
                          Verified
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-center">
                      <div className="w-16 md:w-28 border-b border-slate-300 pb-0.5 text-slate-800 font-sans text-[5px] md:text-[8px] italic leading-none">
                        Aditya Vardhan
                      </div>
                      <span className="text-[4px] md:text-[6px] text-slate-400 uppercase font-sans font-black mt-1 leading-none">
                        Founder, Mockeefy
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-[4px] md:text-[6px] text-slate-400 font-sans border-t border-slate-100 pt-1.5 px-1 leading-none">
                    <span>Issued: {isMasterSelected ? new Date().toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric' }) : (selectedSession?.startTime ? new Date(selectedSession.startTime).toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric' }) : "—")}</span>
                    <span>ID: {isMasterSelected ? masterCertId : `MCFY-${selectedSession?.id.slice(-8).toUpperCase()}`}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="px-6 py-4 border-t border-slate-100 flex justify-between bg-white">
              <button
                type="button"
                onClick={async () => {
                  const element = document.getElementById("certificate-pdf-content");
                  if (element) {
                    const name = user?.name || "Candidate";
                    const filename = `${name.replace(/\s+/g, "_")}_${isMasterSelected ? "Master" : selectedSession?.category || "Interview"}_Certificate.pdf`;
                    const opt = {
                      margin:       0,
                      filename:     filename,
                      image:        { type: 'jpeg', quality: 0.98 },
                      html2canvas:  { scale: 2, useCORS: true, letterRendering: true, logging: false },
                      jsPDF:        { unit: 'mm', format: 'a4', orientation: 'landscape' }
                    };
                    try {
                      // @ts-ignore
                      await html2pdf().from(element).set(opt).save();
                    } catch (err) {
                      console.error(err);
                    }
                  }
                }}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-md hover:shadow-lg"
              >
                <Download size={14} /> Download PDF Certificate
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectedSession(null);
                  setIsMasterSelected(false);
                }}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hidden container for A4 PDF generation */}
      <div style={{ position: "absolute", left: "-9999px", top: "-9999px" }}>
        <div id="certificate-pdf-content">
          {selectedSession && (
            <CertificateTemplate
              userName={user?.name || "Candidate"}
              isMaster={false}
              category={selectedSession.category}
              expertName={selectedSession.expert}
              issueDate={selectedSession.startTime ? new Date(selectedSession.startTime).toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric' }) : "—"}
              certId={`MCFY-${selectedSession.id.slice(-8).toUpperCase()}`}
            />
          )}
          {isMasterSelected && (
            <CertificateTemplate
              userName={user?.name || "Candidate"}
              isMaster={true}
              issueDate={new Date().toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric' })}
              certId={masterCertId}
            />
          )}
        </div>
      </div>
    </div>
  );
}

