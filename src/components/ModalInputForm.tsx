import { AIQuestion } from "@/models/models";
import { getAuth } from "firebase/auth";
import React, { useState, useEffect } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (response: string) => void;
  title: string;
  subtitle: string;
  type: string;
  mainTitle: string;
}

const ModalInput: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  title,
  subtitle,
  type,
  mainTitle,
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
        what: mainTitle,
        when: "",
        where: "",
      });
      setError("");
    }
  }, [isOpen, mainTitle]);

  const handleModalSubmit = async () => {
    try {
      setLoading(true);
      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) {
        return;
      }

      const idToken = await user.getIdToken();
      const response = await fetch("/api/ai-helper", {
        method: "POST",
        body: JSON.stringify({
          question: formData,
          type,
        }),
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
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
      className="fixed inset-0 backdrop-blur-sm bg-white/30 flex items-center justify-center z-50 border-s-0"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-3xl">{title}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700" type="button">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <p className="text-gray-600 mb-6">{subtitle}</p>

        {loading ? (
          <div className="flex justify-center items-center py-10">
            <h1 className="text-xl">Loading...</h1>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <div className="bg-white flex flex-col justify-between rounded-2xl overflow-hidden w-full p-4 border border-gray-200">
              <div className="flex flex-col gap-5">
                <div className="space-y-2">
                  <label htmlFor="what" className="block text-sm font-medium flex items-center">
                    <span className="text-red-600" />{" "}
                    {`Title of ${type[0].toUpperCase()}${type.slice(1)}`}
                  </label>
                  <input
                    type="text"
                    id="what"
                    name="what"
                    value={formData.what}
                    onChange={(e) => {
                      setFormData({ ...formData, what: e.target.value })
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder={`Enter ${type} title`}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="who" className="block text-sm font-medium flex items-center">
                    Who is it for?
                  </label>
                  <input
                    type="text"
                    id="who"
                    name="who"
                    value={formData.who}
                    onChange={(e) => {
                      setFormData({ ...formData, who: e.target.value })
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="Enter target audience"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="when" className="block text-sm font-medium flex items-center">
                    When
                  </label>
                  <input
                    id="when"
                    name="when"
                    value={formData.when}
                    onChange={(e) => {
                      setFormData({ ...formData, when: e.target.value })
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="Enter time or date information"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="where" className="block text-sm font-medium flex items-center">
                    Where
                  </label>
                  <input
                    id="where"
                    name="where"
                    value={formData.where}
                    onChange={(e) => {
                      setFormData({ ...formData, where: e.target.value })
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="Enter location information"
                  />
                </div>
              </div>
            </div>

            {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">{error}</div>}

            <div className="flex justify-end gap-4 mt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex items-center justify-center gap-2 text-[#0856BA] border-2 px-4 py-2 rounded-full cursor-pointer hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleModalSubmit}
                className="flex items-center justify-center gap-2 bg-[#0856BA] text-white border-2 border-[#0856BA] px-4 py-2 rounded-full cursor-pointer hover:bg-[#0645a5]"
              >
                Apply
              </button>
          </div>
          </div>
        )}
      </div>
    </div>
  )
};

export default ModalInput;
