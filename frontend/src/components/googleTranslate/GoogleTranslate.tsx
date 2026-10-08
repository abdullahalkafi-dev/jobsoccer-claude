/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";

import { useEffect, useState } from "react";

declare global {
  interface Window {
    googleTranslateElementInit?: () => void;
    google?: any;
  }
}

export default function GoogleTranslate() {
  const [currentLang, setCurrentLang] = useState<string>("en");
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Get saved language from localStorage
    const savedLang = localStorage.getItem("googtrans");
    if (savedLang) {
      // Format: /en/de or /en/en
      const lang = savedLang.split("/")[2] || "en";
      setCurrentLang(lang);
    }

    // Add the Google Translate script
    const addScript = () => {
      // Check if already loaded
      if (window.google?.translate) {
        initTranslate();
        return;
      }

      // Set init function
      window.googleTranslateElementInit = initTranslate;

      // Add script if not exists
      if (!document.querySelector('script[src*="translate.google.com"]')) {
        const script = document.createElement("script");
        script.src =
          "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
        script.async = true;
        document.head.appendChild(script);
      }
    };

    const initTranslate = () => {
      if (window.google?.translate?.TranslateElement) {
        new window.google.translate.TranslateElement(
          {
            pageLanguage: "en",
            includedLanguages: "en,es,fr",
            autoDisplay: false,
          },
          "google_translate_element",
        );

        // Mark as loaded
        setTimeout(() => {
          setIsLoaded(true);

          // Apply saved language after load
          const savedLang = localStorage.getItem("googtrans");
          if (savedLang) {
            const lang = savedLang.split("/")[2] || "en";
            if (lang !== "en") {
              triggerTranslation(lang);
            }
          }
        }, 1000);
      }
    };

    addScript();
  }, []);

  const triggerTranslation = (lang: string) => {
    const findAndTrigger = (attempts = 0) => {
      if (attempts > 30) {
        console.log("Translation trigger timeout");
        return;
      }

      const select = document.querySelector(
        "select.goog-te-combo",
      ) as HTMLSelectElement;

      if (select) {
        select.value = lang;
        select.dispatchEvent(new Event("change", { bubbles: true }));

        // Save to localStorage
        const domain = window.location.hostname;

        if (lang === "en") {
          // Clear all translation cookies and storage
          localStorage.removeItem("googtrans");

          // Clear cookies for all domain variations
          document.cookie = `googtrans=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC`;
          document.cookie = `googtrans=; path=/; domain=${domain}; expires=Thu, 01 Jan 1970 00:00:00 UTC`;
          document.cookie = `googtrans=; path=/; domain=.${domain}; expires=Thu, 01 Jan 1970 00:00:00 UTC`;
        } else {
          // Set language cookies and storage
          localStorage.setItem("googtrans", `/en/${lang}`);
          document.cookie = `googtrans=/en/${lang}; path=/; domain=${domain}; max-age=2592000`;
          document.cookie = `googtrans=/en/${lang}; path=/; max-age=2592000`;
        }
      } else {
        setTimeout(() => findAndTrigger(attempts + 1), 100);
      }
    };

    findAndTrigger();
  };

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLang = e.target.value;
    setCurrentLang(newLang);
    triggerTranslation(newLang);
  };

  return (
    <>
      {/* Google Translate Element (hidden) */}
      <div id="google_translate_element" style={{ display: "none" }} />

      {/* Language Selector */}
      <div className="language-switch-container notranslate">
        <select
          className="language-select notranslate"
          value={currentLang}
          onChange={handleLanguageChange}
          disabled={!isLoaded}
          aria-label="Select Language"
        >
          <option value="en" className="notranslate">
            English
          </option>
          <option value="es" className="notranslate">
            Spanish
          </option>
          <option value="fr" className="notranslate">
            French
          </option>
        </select>
      </div>

      <style jsx global>{`
        /* Hide Google UI */
        .skiptranslate {
          display: none !important;
        }
        .goog-te-banner-frame {
          display: none !important;
        }
        body {
          top: 0 !important;
        }
        #google_translate_element {
          display: none !important;
        }
        iframe.skiptranslate {
          display: none !important;
        }
        .goog-te-spinner-pos {
          display: none !important;
        }

        /* Container */
        .language-switch-container {
          display: inline-flex;
          align-items: center;
          gap: 12px;
        }

        /* Language Select */
        .language-select {
          padding: 8px 32px 8px 12px;
          font-size: 14px;
          font-weight: 500;
          color: #1e293b;
          border: 1px solid gray;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
          font-family:
            -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16'%3E%3Cpath fill='%2362C1BF' d='M4.5 6L8 9.5L11.5 6'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 8px center;
          min-width: 140px;
        }

        .language-select:hover:not(:disabled) {
          border-color: #4da9a7;
          box-shadow: 0 2px 8px rgba(98, 193, 191, 0.2);
        }

        .language-select:focus {
          outline: none;
          border-color: #62c1bf;
          box-shadow: 0 0 0 3px rgba(98, 193, 191, 0.2);
        }

        .language-select:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          background-color: #f1f5f9;
        }

        .language-select option {
          padding: 8px;
          font-weight: 500;
        }

        /* Language Labels */
        .language-labels {
          display: flex;
          gap: 12px;
          font-weight: 600;
          font-size: 14px;
          font-family:
            -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        }

        .lang-label {
          color: #94a3b8;
          transition: all 0.3s ease;
          letter-spacing: 0.5px;
        }

        .lang-label.active {
          color: #62c1bf;
          transform: scale(1.1);
        }

        /* Loading Spinner */
        .loading-spinner {
          width: 20px;
          height: 20px;
          border: 3px solid #e2e8f0;
          border-top-color: #62c1bf;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        /* Responsive */
        @media (max-width: 640px) {
          .language-select {
            min-width: 120px;
            font-size: 13px;
            padding: 6px 28px 6px 10px;
          }
        }
      `}</style>
    </>
  );
}
