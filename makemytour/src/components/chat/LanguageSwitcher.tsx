import React from "react";
import { LanguageType } from "../../types/chat";

interface LanguageSwitcherProps {
  currentLanguage: LanguageType;
  onChange: (language: LanguageType) => void;
}

const languages: { code: LanguageType; label: string }[] = [
  { code: "en", label: "English" },
  { code: "es", label: "Spanish" },
  { code: "fr", label: "French" },
  { code: "de", label: "German" },
  { code: "zh", label: "Chinese" },
];

const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ currentLanguage, onChange }) => {
  return (
    <div className="flex space-x-2 p-2 border-b border-gray-300">
      {languages.map(({ code, label }) => {
        return (
          <button
            key={code}
            onClick={() => onChange(code)}
            className={
              "px-3 py-1 rounded " +
              (code === currentLanguage ? "bg-blue-500 text-white" : "bg-gray-200")
            }
            aria-pressed={code === currentLanguage}
            aria-label={"Switch language to " + label}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
};

export default LanguageSwitcher;
