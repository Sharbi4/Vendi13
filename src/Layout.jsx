import React, { useEffect } from 'react';
import Footer from './components/layout/Footer';
import ErrorBoundary from './components/errors/ErrorBoundary';
import CookieConsent from './components/privacy/CookieConsent';

export default function Layout({ children, currentPageName }) {
  // Pages that have their own header (Home, SearchResults, ListingDetail, CreateListing, Dashboard)
  // These pages handle their own layout
  const pagesWithOwnHeader = ['Home', 'SearchResults', 'ListingDetail', 'CreateListing', 'Dashboard', 'Profile'];
  
  useEffect(() => {
    // Google Analytics
    const script1 = document.createElement('script');
    script1.async = true;
    script1.src = 'https://www.googletagmanager.com/gtag/js?id=G-NNWR0V8SH2';
    document.head.appendChild(script1);

    const script2 = document.createElement('script');
    script2.innerHTML = `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', 'G-NNWR0V8SH2');
    `;
    document.head.appendChild(script2);

    return () => {
      document.head.removeChild(script1);
      document.head.removeChild(script2);
    };
  }, []);
  
  const showFooter = !['Home'].includes(currentPageName);

  return (
    <ErrorBoundary>
      <CookieConsent />
      <style>
        {`
          @font-face {
            font-family: 'Sofia Pro Soft';
            src: url('https://vendibook-docs.s3.us-east-1.amazonaws.com/documents/sofiaprosoftlight-webfont.woff') format('woff');
            font-weight: 300;
            font-style: normal;
          }

          * {
            font-family: 'Sofia Pro Soft', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', sans-serif;
          }

          body {
            font-family: 'Sofia Pro Soft', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', sans-serif;
          }

          /* Ensure proper color contrast ratios (WCAG AA) */
          .text-slate-500 {
            color: rgb(100 116 139); /* Contrast ratio 4.54:1 on white */
          }

          .text-slate-600 {
            color: rgb(71 85 105); /* Contrast ratio 7.13:1 on white */
          }

          .text-gray-500 {
            color: rgb(107 114 128); /* Contrast ratio 4.58:1 on white */
          }

          /* Improve focus indicators */
          button:focus-visible,
          a:focus-visible,
          input:focus-visible,
          textarea:focus-visible,
          select:focus-visible {
            outline: 3px solid #FF5124;
            outline-offset: 2px;
          }
        `}
      </style>
      {pagesWithOwnHeader.includes(currentPageName) ? (
        <>
          {children}
          {showFooter && <Footer />}
        </>
      ) : (
        <div className="min-h-screen bg-white flex flex-col">
          <div className="flex-1">{children}</div>
          <Footer />
        </div>
      )}
    </ErrorBoundary>
  );
}