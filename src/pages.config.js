import AIAssistant from './pages/AIAssistant';
import AIAssistantSuccess from './pages/AIAssistantSuccess';
import AdminListingVerification from './pages/AdminListingVerification';
import AdminReviewModeration from './pages/AdminReviewModeration';
import AdminVerification from './pages/AdminVerification';
import Analytics from './pages/Analytics';
import BookingCancel from './pages/BookingCancel';
import BookingSuccess from './pages/BookingSuccess';
import CreateListing from './pages/CreateListing';
import Dashboard from './pages/Dashboard';
import DataExport from './pages/DataExport';
import FeaturedSuccess from './pages/FeaturedSuccess';
import GoogleSheetsSettings from './pages/GoogleSheetsSettings';
import HelpArticle from './pages/HelpArticle';
import HelpCenter from './pages/HelpCenter';
import Home from './pages/Home';
import HostDashboard from './pages/HostDashboard';
import HostOnboarding from './pages/HostOnboarding';
import Insurance from './pages/Insurance';
import LearnMore from './pages/LearnMore';
import ListingDetail from './pages/ListingDetail';
import Messages from './pages/Messages';
import MyBookings from './pages/MyBookings';
import MyEscrows from './pages/MyEscrows';
import PaymentHistory from './pages/PaymentHistory';
import PayoutsPage from './pages/PayoutsPage';
import Profile from './pages/Profile';
import ReminderSettings from './pages/ReminderSettings';
import SaleCancel from './pages/SaleCancel';
import SaleSuccess from './pages/SaleSuccess';
import SavedListings from './pages/SavedListings';
import SearchResults from './pages/SearchResults';
import SellerDashboard from './pages/SellerDashboard';
import StripeIdentityFAQ from './pages/StripeIdentityFAQ';
import TermsAndConditions from './pages/TermsAndConditions';
import VerificationCenter from './pages/VerificationCenter';
import WebhookTest from './pages/WebhookTest';
import PublicProfile from './pages/PublicProfile';
import Privacy from './pages/Privacy';
import CCPADisclosure from './pages/CCPADisclosure';
import NotFound from './pages/NotFound';
import ErrorPage from './pages/ErrorPage';
import __Layout from './Layout.jsx';


export const PAGES = {
    "AIAssistant": AIAssistant,
    "AIAssistantSuccess": AIAssistantSuccess,
    "AdminListingVerification": AdminListingVerification,
    "AdminReviewModeration": AdminReviewModeration,
    "AdminVerification": AdminVerification,
    "Analytics": Analytics,
    "BookingCancel": BookingCancel,
    "BookingSuccess": BookingSuccess,
    "CreateListing": CreateListing,
    "Dashboard": Dashboard,
    "DataExport": DataExport,
    "FeaturedSuccess": FeaturedSuccess,
    "GoogleSheetsSettings": GoogleSheetsSettings,
    "HelpArticle": HelpArticle,
    "HelpCenter": HelpCenter,
    "Home": Home,
    "HostDashboard": HostDashboard,
    "HostOnboarding": HostOnboarding,
    "Insurance": Insurance,
    "LearnMore": LearnMore,
    "ListingDetail": ListingDetail,
    "Messages": Messages,
    "MyBookings": MyBookings,
    "MyEscrows": MyEscrows,
    "PaymentHistory": PaymentHistory,
    "PayoutsPage": PayoutsPage,
    "Profile": Profile,
    "ReminderSettings": ReminderSettings,
    "SaleCancel": SaleCancel,
    "SaleSuccess": SaleSuccess,
    "SavedListings": SavedListings,
    "SearchResults": SearchResults,
    "SellerDashboard": SellerDashboard,
    "StripeIdentityFAQ": StripeIdentityFAQ,
    "TermsAndConditions": TermsAndConditions,
    "VerificationCenter": VerificationCenter,
    "WebhookTest": WebhookTest,
    "PublicProfile": PublicProfile,
    "Privacy": Privacy,
    "CCPADisclosure": CCPADisclosure,
    "NotFound": NotFound,
    "ErrorPage": ErrorPage,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};