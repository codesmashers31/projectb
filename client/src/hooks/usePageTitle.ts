import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ROUTE_TITLES: Record<string, string> = {
  '/': 'Mockeefy - Practice Interviews',
  '/signin': 'Sign In - Mockeefy',
  '/signup': 'Sign Up - Mockeefy',
  '/forgot-password': 'Reset Password - Mockeefy',
  '/complete-profile': 'Complete Your Profile - Mockeefy',
  '/book-session': 'Book a Session - Mockeefy',
  '/payment': 'Payment - Mockeefy',
  '/live-meeting': 'Live Interview - Mockeefy',
  '/my-sessions': 'My Sessions - Mockeefy',
  '/saved-experts': 'Saved Experts - Mockeefy',
  '/tips': 'Interview Tips - Mockeefy',
  '/certificates': 'Certificates - Mockeefy',
  '/profile': 'My Profile - Mockeefy',
  '/notifications': 'Notifications - Mockeefy',
  '/watch-mock': 'Watch Mocks - Mockeefy',
  '/ai-video': 'AI Interview - Mockeefy',
  '/resume-builder': 'Resume Builder - Mockeefy',
  '/plans': 'Subscription Plans - Mockeefy',
  '/terms': 'Terms & Conditions - Mockeefy',
  '/privacy': 'Privacy Policy - Mockeefy',
  '/refund-cancellation': 'Refund & Cancellation - Mockeefy',
  '/return-policy': 'Return Policy - Mockeefy',
  '/shipping-policy': 'Shipping Policy - Mockeefy',
  '/dashboard': 'Dashboard - Expert - Mockeefy',
  '/dashboard/profile': 'Profile - Expert - Mockeefy',
  '/dashboard/sessions': 'Sessions - Expert - Mockeefy',
  '/dashboard/availability': 'Availability - Expert - Mockeefy',
  '/dashboard/skills': 'Skills - Expert - Mockeefy',
  '/dashboard/settings': 'Settings - Expert - Mockeefy',
  '/dashboard/withdraw': 'Withdrawal - Expert - Mockeefy',
  '/admin': 'Admin Dashboard - Mockeefy',
  '/admin/sessions': 'Sessions Management - Admin - Mockeefy',
  '/admin/experts/pending': 'Pending Experts - Admin - Mockeefy',
  '/admin/experts/verified': 'Verified Experts - Admin - Mockeefy',
  '/admin/experts/rejected': 'Rejected Experts - Admin - Mockeefy',
  '/admin/users': 'Users - Admin - Mockeefy',
  '/admin/jobs': 'Job Management - Admin - Mockeefy',
  '/admin/categories': 'Categories - Admin - Mockeefy',
  '/admin/reports': 'Reports - Admin - Mockeefy',
  '/admin/certifications': 'Certifications - Admin - Mockeefy',
  '/admin/pricing': 'Pricing Rules - Admin - Mockeefy',
  '/admin/hr-contacts': 'HR Contacts - Admin - Mockeefy',
  '/admin/payouts': 'Payouts - Admin - Mockeefy',
  '/admin/skills': 'Skills Management - Admin - Mockeefy',
};

/**
 * Get the appropriate title for the current route
 */
const getTitleForRoute = (pathname: string): string => {
  // Check for exact match first
  if (ROUTE_TITLES[pathname]) {
    return ROUTE_TITLES[pathname];
  }

  // Check for prefix match (for routes with params like /live-meeting/:sessionId)
  const segments = pathname.split('/');
  for (let i = segments.length; i > 0; i--) {
    const prefix = segments.slice(0, i).join('/') || '/';
    if (ROUTE_TITLES[prefix]) {
      return ROUTE_TITLES[prefix];
    }
  }

  // Default title
  return 'Mockeefy - Practice Interviews with Real Professionals';
};

/**
 * Create a data URI for the Mockeefy logo favicon - Exact M logo match
 */
const createLogoDataUri = (): string => {
  const svg = `<svg viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
    <!-- Bold Blue Rounded Square Background -->
    <rect x="8" y="8" width="112" height="112" rx="28" fill="#004FCB" />
    
    <!-- White M Letter -->
    <text x="64" y="90" font-family="Arial, sans-serif" font-size="80" font-weight="bold" fill="#FFFFFF" text-anchor="middle" dominant-baseline="middle">M</text>
  </svg>`;

  // Encode SVG to data URI
  const encoded = encodeURIComponent(svg);
  return `data:image/svg+xml;charset=utf-8,${encoded}`;
};

/**
 * Custom hook to manage dynamic page title and favicon
 */
export const usePageTitle = () => {
  const location = useLocation();

  useEffect(() => {
    // Update page title
    const title = getTitleForRoute(location.pathname);
    document.title = title;

    // Update favicon - get or create the favicon link
    let faviconLink = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
    
    if (!faviconLink) {
      // Create favicon link if it doesn't exist
      faviconLink = document.createElement('link');
      faviconLink.rel = 'icon';
      document.head.appendChild(faviconLink);
    }

    // Set the logo favicon
    const faviconUri = createLogoDataUri();
    faviconLink.href = faviconUri;
    faviconLink.type = 'image/svg+xml';
  }, [location.pathname]);
};
