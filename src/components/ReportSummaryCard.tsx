import { useAlums } from "@/context/AlumContext";
import { useWorkExperience } from "@/context/WorkExperienceContext";
import { getAuth } from "firebase/auth";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";

interface ReportSummaryCardProps {
  data: string;
}

const ReportSummaryCard = ({ data }: ReportSummaryCardProps) => {
  const { activeAlums, alums } = useAlums();
  const { allWorkExperience } = useWorkExperience();
  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState(
    "AI-Generated Report Summary and Insight: Cinomment out ko muna yung reports kasi may limit lang AI, baka maubos"
  );

  const handleSend = async () => {
    setLoading(true);
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      return;
    }

    const idToken = await user.getIdToken();
    const response = await fetch("/api/report-generator", {
      method: "POST",
      body: JSON.stringify({ data }),
      headers: {
        Authorization: `Bearer ${idToken}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to send question");
    }
    const message = await response.json();
    setReport(message.answer);
    console.log(`Message ${message.answer}`);
    setLoading(false);
  };

  useEffect(() => {
    handleSend();
  }, [activeAlums, alums, allWorkExperience]);

  return (
    <>
      <div className="flex-1 bg-white shadow-md rounded-lg p-6">
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <h1>AI-Generated Report Summary and Insight</h1>
            <Loader2 className="animate-spin w-8 h-8 text-blue-500" />
          </div>
        ) : (
          <div className="prose max-w-none">
            <ReactMarkdown
              components={{
                h1: ({ ...props }) => (
                  <h1 className="text-2xl font-bold mb-4" {...props} />
                ),
                h2: ({ ...props }) => (
                  <h2 className="text-xl font-semibold mb-3 mt-4" {...props} />
                ),
                strong: ({ ...props }) => (
                  <strong className="font-bold text-blue-700" {...props} />
                ),
                p: ({ ...props }) => <p className="my-3" {...props} />,
                ul: ({ ...props }) => (
                  <ul className="list-disc pl-5 my-3" {...props} />
                ),
                li: ({ ...props }) => <li className="mb-1" {...props} />,
                ol: ({ ...props }) => (
                  <ol className="list-decimal pl-5 my-3" {...props} />
                ),
              }}
            >
              {report}
            </ReactMarkdown>
          </div>
        )}
      </div>
    </>
  );
};

export default ReportSummaryCard;
