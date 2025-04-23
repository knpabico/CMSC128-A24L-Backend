import { AIQuestion } from "@/models/models";
import React, { useState, useEffect } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (response: string) => void;
  title: string;
  subtitle: string;
  type: string;
}

const ModalInput: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  title,
  subtitle,
  type,
}) => {
  const [formData, setFormData] = useState<AIQuestion>({
    who: "",
    what: "",
    when: "",
    where: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (isOpen) {
      setFormData({
        who: "",
        what: "",
        when: "",
        where: "",
      });
      setError("");
    }
  }, [isOpen]);

  // Handle submission
  const handleModalSubmit = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/ai-helper", {
        method: "POST",
        body: JSON.stringify({
          question: formData,
          type,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send question");
      }
      const data = await response.json();
      onSubmit(data.answer);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "An unknown error occurred"
      );
    } finally {
      setLoading(false);
    }
    onClose();
  };

  // Close modal when clicking backdrop
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 backdrop-blur-sm bg-white/30 flex items-center justify-center z-50"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            type="button"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        <div>
          <h3>{subtitle}</h3>
        </div>
        <br></br>

        {loading ? (
          <h1>Loading...</h1>
        ) : (
          <div>
            <div className="mb-4">
              <label
                htmlFor="what"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                {`Title of ${type[0].toUpperCase()}${type.slice(1)}`}
              </label>
              <input
                type="text"
                id="what"
                name="what"
                value={formData.what}
                onChange={(e) => {
                  setFormData({ ...formData, what: e.target.value });
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="mb-4">
              <label
                htmlFor="who"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Who is it for?
              </label>
              <input
                type="who"
                id="who"
                name="who"
                value={formData.who}
                onChange={(e) => {
                  setFormData({ ...formData, who: e.target.value });
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="mb-4">
              <label
                htmlFor="when"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                When
              </label>
              <input
                id="when"
                name="when"
                value={formData.when}
                onChange={(e) => {
                  setFormData({ ...formData, when: e.target.value });
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="mb-4">
              <label
                htmlFor="where"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Where
              </label>
              <input
                id="where"
                name="where"
                value={formData.where}
                onChange={(e) => {
                  setFormData({ ...formData, where: e.target.value });
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleModalSubmit}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                Apply
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ModalInput;
