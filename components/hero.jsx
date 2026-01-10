import Link from "next/link";
import { cn } from "@/lib/utils";
import { LoginForm } from "@/components/login-form";
import { SignUpForm } from "@/components/sign-up-form";
import { SignUpSuccess } from "./SignUpSuccess";
import { ForgotPasswordForm } from "@/components/forgot-password-form";
import { UpdatePasswordForm } from "@/components/update-password-form";
import { MarketingContent } from "@/components/MarketingContent";
import { X } from "lucide-react";

export const Hero = ({ title, subtitle, bgImage, userIsLoggedIn, authMode, marketingContent }) => {
  const targetRoute = userIsLoggedIn ? "/protected" : "/?auth=login";

  const renderDynamicContent = () => {
    switch (authMode) {
      case 'login': return <LoginForm />;
      case 'signup': return <SignUpForm />;
      case 'forgot-password': return <ForgotPasswordForm />;
      case 'sign-up-success': return <SignUpSuccess />;
      case 'update-password': return <UpdatePasswordForm />;
      case 'learn-more': return <MarketingContent content={marketingContent}/>;
      default: return null;
    }
  };
  
  return (
    <div 
      className="w-full flex-1 min-h[70-vh] flex flex-col gap-8 items-center justify-center text-center bg-cover bg-center bg-no-repeat relative px-4"
      style={{ 
        backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.5), rgba(0,0,0,0.7)), url(${bgImage})` 
      }}
    >
      <div className="max-w-5xl flex flex-col items-center gap-6">
        {!authMode ? (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight text-white drop-shadow-lg">
              {title}
            </h1>
            <p className="text-lg md:text-2xl text-white/90 max-w-2xl drop-shadow-md">
              {subtitle}
            </p>

            <div className="flex flex-wrap justify-center gap-4 mt-8">
              <Link
                href={targetRoute}
                className="bg-white text-black hover:bg-white/90 px-8 py-4 rounded-full font-bold transition-all transform hover:scale-105"
              >
                {userIsLoggedIn ? "Go to Dashboard" : "Get Started"}
              </Link>
              <Link
                href="/?auth=learn-more"
                className="bg-transparent text-white border border-white/50 hover:border-white px-8 py-4 rounded-full font-bold transition-all transform hover:scale-105 inline-block shadow-xl"
              >
                Learn More
              </Link>
            </div>
          </div>
        ) : (
          <div className={cn(
            "w-full animate-in zoom-in-95 duration-300 relative px-4",
            authMode === 'learn-more' ? "max-w-5xl" : "max-w-md"
          )}>
            <Link 
              href="/" 
              className="absolute -top-12 right-4 text-white/50 hover:text-white transition-colors flex items-center gap-2"
            >
              <span>Close</span> <X size={18} />
            </Link>
            {renderDynamicContent()}
          </div>
        )}
      </div>
    </div>
  );
};