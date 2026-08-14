"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

export default function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  
  const [preferences, setPreferences] = useState({
    essential: true, // Always true
    analytics: false,
    marketing: false,
  });

  useEffect(() => {
    // Check if user has already made a choice
    const consent = localStorage.getItem("vortix_cookie_consent");
    if (!consent) {
      // Small delay before showing
      const timer = setTimeout(() => setIsVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const saveConsent = (analytics: boolean, marketing: boolean) => {
    const consentData = {
      essential: true,
      analytics,
      marketing,
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem("vortix_cookie_consent", JSON.stringify(consentData));
    
    // In a real app, you would also set a cookie here for server-side reading
    document.cookie = `vortix_consent=${JSON.stringify(consentData)}; path=/; max-age=31536000`;
    
    setIsVisible(false);
  };

  const handleAcceptAll = () => {
    saveConsent(true, true);
  };

  const handleRejectAll = () => {
    saveConsent(false, false);
  };

  const handleSavePreferences = () => {
    saveConsent(preferences.analytics, preferences.marketing);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[200]"
          />
          
          {/* Modal / Slide-in Panel */}
          <motion.div
            initial={{ opacity: 0, x: 100, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-0 right-0 sm:bottom-6 sm:left-auto sm:right-6 sm:w-full sm:max-w-[440px] bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl z-[201] overflow-hidden flex flex-col max-h-[90vh]"
          >
            <div className="p-6 sm:p-8 flex-1 overflow-y-auto">
              {!showPreferences ? (
                <>
                  <h3 className="text-2xl font-serif font-bold text-gray-900 mb-4">
                    Cookies give you a personalised experience
                  </h3>
                  <p className="text-gray-600 mb-6 text-sm leading-relaxed">
                    We use cookies to ensure you get the best experience on our website, analyze site traffic, and assist in our marketing efforts. 
                  </p>
                  
                  <div className="flex flex-col gap-3">
                    <button
                      onClick={handleAcceptAll}
                      className="w-full bg-accent hover:bg-accent-hover text-white font-medium py-3 rounded-xl transition-colors"
                    >
                      Allow all
                    </button>
                    <button
                      onClick={handleRejectAll}
                      className="w-full bg-gray-100 hover:bg-gray-200 text-gray-900 font-medium py-3 rounded-xl transition-colors"
                    >
                      Reject all
                    </button>
                    <button
                      onClick={() => setShowPreferences(true)}
                      className="w-full text-gray-500 hover:text-gray-900 font-medium py-2 mt-2 transition-colors text-sm"
                    >
                      Manage cookies
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-serif font-bold text-gray-900">
                      Manage Preferences
                    </h3>
                    <button
                      onClick={() => setShowPreferences(false)}
                      className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                      <X size={20} className="text-gray-500" />
                    </button>
                  </div>
                  
                  <div className="space-y-6 mb-8">
                    {/* Essential */}
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-1">Essential Cookies</h4>
                        <p className="text-xs text-gray-500">Necessary for the website to function properly. Cannot be disabled.</p>
                      </div>
                      <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-accent cursor-not-allowed">
                        <span className="inline-block h-4 w-4 transform rounded-full bg-white transition translate-x-6" />
                      </div>
                    </div>
                    
                    {/* Analytics */}
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-1">Analytics</h4>
                        <p className="text-xs text-gray-500">Help us understand how visitors interact with our website.</p>
                      </div>
                      <button
                        onClick={() => setPreferences({ ...preferences, analytics: !preferences.analytics })}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${preferences.analytics ? 'bg-accent' : 'bg-gray-200'}`}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${preferences.analytics ? 'translate-x-6' : 'translate-x-1'}`} />
                      </button>
                    </div>

                    {/* Marketing */}
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-1">Marketing</h4>
                        <p className="text-xs text-gray-500">Used to deliver advertisements more relevant to you and your interests.</p>
                      </div>
                      <button
                        onClick={() => setPreferences({ ...preferences, marketing: !preferences.marketing })}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${preferences.marketing ? 'bg-accent' : 'bg-gray-200'}`}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${preferences.marketing ? 'translate-x-6' : 'translate-x-1'}`} />
                      </button>
                    </div>
                  </div>
                  
                  <button
                    onClick={handleSavePreferences}
                    className="w-full bg-gray-900 hover:bg-black text-white font-medium py-3 rounded-xl transition-colors"
                  >
                    Save Preferences
                  </button>
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
