import { useRef, useState, useEffect } from "react";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { MentorJobCard, MentorProfile } from "./MentorJobCard";

interface CategorySectionProps {
    title: string;
    profiles: MentorProfile[];
    onSeeAll?: () => void;
}

export const CategorySection = ({ title, profiles, onSeeAll }: CategorySectionProps) => {
    const rowRef = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);
    const [scrollLeft, setScrollLeft] = useState(0);
    const [showLeftArrow, setShowLeftArrow] = useState(false);
    const [showRightArrow, setShowRightArrow] = useState(true);
    const [activeDot, setActiveDot] = useState(0);

    const checkScroll = () => {
        if (rowRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = rowRef.current;
            setShowLeftArrow(scrollLeft > 0);
            setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
            
            if (scrollWidth > clientWidth) {
                const percentage = scrollLeft / (scrollWidth - clientWidth);
                const dotIndex = Math.min(4, Math.round(percentage * 4));
                setActiveDot(dotIndex);
            }
        }
    };

    useEffect(() => {
        checkScroll();
        window.addEventListener('resize', checkScroll);
        return () => window.removeEventListener('resize', checkScroll);
    }, [profiles]);

    const scroll = (direction: 'left' | 'right') => {
        if (rowRef.current) {
            const scrollAmount = 320;
            rowRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            });
            setTimeout(checkScroll, 350);
        }
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        if (!rowRef.current) return;
        setIsDragging(true);
        setStartX(e.pageX - rowRef.current.offsetLeft);
        setScrollLeft(rowRef.current.scrollLeft);
    };

    const handleMouseLeave = () => setIsDragging(false);
    const handleMouseUp = () => setIsDragging(false);

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging || !rowRef.current) return;
        e.preventDefault();
        const x = e.pageX - rowRef.current.offsetLeft;
        const walk = (x - startX) * 1.5;
        rowRef.current.scrollLeft = scrollLeft - walk;
        checkScroll();
    };

    return (
        <section className="w-full max-w-full mb-10 overflow-hidden transition-all duration-300 group/section">
            {/* Header - Mockup Style */}
            <div className="flex items-center justify-between mb-5 px-1 text-left">
                <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-11 h-11 rounded-2xl bg-indigo-50 flex items-center justify-center text-[#4F46E5] shrink-0 shadow-sm border border-indigo-100/30">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                        </svg>
                    </div>
                    <div className="min-w-0">
                        <h2 className="text-xl font-extrabold text-gray-900 tracking-tight leading-none">
                            {title === "IT" ? "Top Rated Experts" : `${title} Experts`}
                        </h2>
                        <span className="block text-xs text-slate-500 font-medium mt-2.5 truncate">
                            Connect with verified experts in {title} and accelerate your career
                        </span>
                    </div>
                </div>
                <button
                    onClick={onSeeAll || (() => {})}
                    className="text-xs font-extrabold text-[#4F46E5] hover:bg-slate-50 border border-slate-200/80 px-4.5 py-2.5 rounded-xl transition-all flex items-center gap-1.5 shrink-0 bg-white shadow-sm hover:shadow"
                >
                    View All Experts <ChevronRight size={14} strokeWidth={2.5} />
                </button>
            </div>

            {/* Scroll Wrapper */}
            <div className="relative px-1 pt-2 pb-2">
                {/* Horizontal scroll on all devices */}
                <div
                    ref={rowRef}
                    className={`
                        flex flex-row gap-5 overflow-x-auto pl-1 pr-1 pb-2.5 scrollbar-hide snap-x snap-mandatory
                        ${isDragging ? 'cursor-grabbing select-none' : 'cursor-grab'}
                    `}
                    onMouseDown={handleMouseDown}
                    onMouseLeave={handleMouseLeave}
                    onMouseUp={handleMouseUp}
                    onMouseMove={handleMouseMove}
                    onScroll={checkScroll}
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' } as React.CSSProperties}
                >
                    {profiles.map((profile) => (
                        <div key={profile.id} className="snap-start shrink-0 w-[280px] sm:w-[290px] flex">
                            <MentorJobCard mentor={profile} />
                        </div>
                    ))}
                </div>
            </div>

            {/* Bottom Controls (Arrows + Dots) */}
            <div className="flex justify-center items-center gap-5 mt-4 pb-3">
                <button
                    onClick={() => scroll('left')}
                    className={`
                        w-9 h-9 rounded-full border border-slate-200 bg-white
                        flex items-center justify-center text-slate-600 hover:text-[#4F46E5] hover:border-indigo-200 transition-all shadow-sm hover:shadow
                        ${!showLeftArrow ? 'opacity-30 cursor-not-allowed' : 'opacity-100 hover:scale-105 active:scale-95'}
                    `}
                    disabled={!showLeftArrow}
                    aria-label="Previous"
                >
                    <ChevronLeft size={16} strokeWidth={2.5} />
                </button>

                {/* Dots indicator */}
                <div className="flex justify-center items-center gap-1.5">
                    {[0, 1, 2, 3, 4].map((index) => (
                        <span
                            key={index}
                            className={`h-2 rounded-full transition-all duration-300 ${activeDot === index ? "w-4 bg-indigo-600" : "w-2 bg-gray-200"}`}
                        />
                    ))}
                </div>

                <button
                    onClick={() => scroll('right')}
                    className={`
                        w-9 h-9 rounded-full border border-slate-200 bg-white
                        flex items-center justify-center text-slate-600 hover:text-[#4F46E5] hover:border-indigo-200 transition-all shadow-sm hover:shadow
                        ${!showRightArrow ? 'opacity-30 cursor-not-allowed' : 'opacity-100 hover:scale-105 active:scale-95'}
                    `}
                    disabled={!showRightArrow}
                    aria-label="Next"
                >
                    <ChevronRight size={16} strokeWidth={2.5} />
                </button>
            </div>
        </section>
    );
};
