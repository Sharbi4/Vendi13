import { SignIn as ClerkSignIn } from '@clerk/clerk-react';
import { Link } from 'react-router-dom';

export default function SignIn() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col">
      {/* Header */}
      <header className="p-6">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-10 h-10 bg-[#FF5124] rounded-xl flex items-center justify-center">
            <span className="text-white font-bold text-xl">V</span>
          </div>
          <span className="text-white font-bold text-xl">VendiBook</span>
        </Link>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Welcome Text */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Welcome back</h1>
            <p className="text-slate-400">Sign in to your VendiBook account</p>
          </div>

          {/* Clerk Sign In Component */}
          <div className="flex justify-center">
            <ClerkSignIn 
              appearance={{
                elements: {
                  rootBox: 'w-full',
                  card: 'bg-slate-800/50 backdrop-blur-xl border border-slate-700 shadow-2xl rounded-2xl',
                  headerTitle: 'text-white',
                  headerSubtitle: 'text-slate-400',
                  socialButtonsBlockButton: 'bg-slate-700 border-slate-600 text-white hover:bg-slate-600',
                  socialButtonsBlockButtonText: 'text-white font-medium',
                  dividerLine: 'bg-slate-600',
                  dividerText: 'text-slate-400',
                  formFieldLabel: 'text-slate-300',
                  formFieldInput: 'bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 focus:border-[#FF5124] focus:ring-[#FF5124]',
                  formButtonPrimary: 'bg-[#FF5124] hover:bg-[#e5481f] text-white',
                  footerActionLink: 'text-[#FF5124] hover:text-[#e5481f]',
                  identityPreviewText: 'text-white',
                  identityPreviewEditButton: 'text-[#FF5124]',
                  formFieldInputShowPasswordButton: 'text-slate-400 hover:text-white',
                  otpCodeFieldInput: 'bg-slate-700 border-slate-600 text-white',
                  formResendCodeLink: 'text-[#FF5124]',
                  alert: 'bg-red-500/10 border-red-500/20 text-red-400',
                  alertText: 'text-red-400',
                },
                layout: {
                  socialButtonsPlacement: 'top',
                  socialButtonsVariant: 'blockButton',
                }
              }}
              routing="path"
              path="/sign-in"
              signUpUrl="/sign-up"
              afterSignInUrl="/"
            />
          </div>

          {/* Footer Links */}
          <div className="mt-8 text-center">
            <p className="text-slate-400 text-sm">
              Don't have an account?{' '}
              <Link to="/sign-up" className="text-[#FF5124] hover:text-[#e5481f] font-medium">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="p-6 text-center">
        <p className="text-slate-500 text-sm">
          © {new Date().getFullYear()} VendiBook. All rights reserved.
        </p>
      </footer>
    </div>
  );
}