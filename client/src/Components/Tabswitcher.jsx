import React, { useState } from "react";
import { FiSettings } from "react-icons/fi";
import PathModal from "../Modal/PathModal";
const Tabswitcher = ({ tabs = [], onTabChange, initialTab = 0 }) => {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  const handleTabClick = (index) => {
    setActiveTab(index);
    onTabChange && onTabChange(index);
  };
  return (
    <div className="border-b border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between">
        {/* Tab List */}
        <ul className="flex flex-wrap -mb-px text-sm font-medium text-center text-gray-500 dark:text-gray-400">
          {tabs.map((tab, index) => (
            <li key={index} className="me-2 cursor-pointer">
              <button
                onClick={() => handleTabClick(index)}
                className={`inline-flex items-center justify-center p-4 border-b-2 rounded-t-lg group
                ${
                  activeTab === index
                    ? "text-blue-600 border-blue-600 dark:text-blue-500 dark:border-blue-500"
                    : "border-transparent hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300"
                }`}
              >
                <tab.icon
                  className={`w-4 h-4 me-2 ${
                    activeTab === index
                      ? "text-blue-600 dark:text-blue-500"
                      : "text-gray-400 group-hover:text-gray-500 dark:text-gray-500 dark:group-hover:text-gray-300"
                  }`}
                />
                {tab.label}
              </button>
            </li>
          ))}
        </ul>

        {/* Settings Button */}
        <button
          onClick={() => setShowSettingsModal(true)}
          className="flex items-center gap-2 p-2 text-sm text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
        >
          <FiSettings className="w-5 h-5" />
          Settings
        </button>
      </div>

      {/* Modal (optional, replace with your actual modal component) */}
      {/* {showSettingsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
            <h2 className="text-lg font-semibold mb-4">Settings</h2>
            <p className="text-sm">Settings content goes here...</p>
            <button
              onClick={() => setShowSettingsModal(false)}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Close
            </button>
          </div>
        </div>
      )} */}

      <PathModal
        show={showSettingsModal}
        onClose={() => {
          setShowSettingsModal(false);
        }}
      />
    </div>
  );
};

export default Tabswitcher;
