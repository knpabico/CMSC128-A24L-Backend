import { sendEmailTemplateForJobApplicationStatus } from "@/lib/emailTemplate";
import { Alumnus, JobApplication, JobOffering } from "@/models/models";
import { XIcon, Check, Mail, X } from "lucide-react";

function formatDate(timestamp: any) {
  if (!timestamp || !timestamp.seconds) return "Invalid Date";
  const date = new Date(timestamp.seconds * 1000);
  return date.toISOString().split("T")[0];
}

export default function JobApplicationModalAdmin({
  isOpen,
  onClose,
  onStatusChange,
  applications,
  alums,
  jobId,
  jobs,
}: {
  isOpen: boolean;
  onClose: () => void;
  alums: Alumnus[];
  applications: JobApplication[];
  jobId: string;
  jobs: JobOffering[];
  onStatusChange: (id: string, newStatus: "accepted" | "rejected") => void;
}) {
  if (!isOpen) return null;

  // Get status color based on application status
  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "reviewed":
        return "bg-blue-100 text-blue-800";
      case "accepted":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

   return (
    <div className="fixed inset-0 backdrop-blur-sm bg-white/30 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl max-h-screen overflow-hidden">
        <div className="flex items-center justify-between p-6">
          <h2 className="font-bold text-2xl">Job Applications</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        </div>
        <hr className="my-2 border-t border-gray-300" />

        <div className="p-4 overflow-auto max-h-96">
          {applications.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              No applications found.
            </p>
          ) : (
            <div className="divide-y divide-gray-300 -mt-4">
              {applications
                .filter((app) => app.jobId === jobId)
                .map((application: JobApplication, index: number) => {
                const app = alums.find(
                  (alum: Alumnus) => alum.alumniId === application.applicantId
                );
                const job = jobs.find(
                  (job: JobOffering) => job.jobId === application.jobId
                );
                if (!app) return null;
                
                return (
                    <div key={index} className="py-4">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center">
                          <div>
                            <h3 className="font-medium text-lg">
                              {app.firstName} {app.lastName}
                            </h3>
                            <div className="flex items-center">
                              <p className="text-gray-600">{app.email}</p>
                              <a
                                href={`https://mail.google.com/mail/?view=cm&fs=1&to=${app.email}&su=Job Application Update for ${app.firstName} ${app.lastName}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="ml-2 text-blue-500 hover:text-blue-700"
                                title="Send email"
                              >
                                <Mail size={16} />
                              </a>
                            </div>
                          </div>
                        </div>

                        {application?.status === "pending" ? (
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={async () => {
                                onStatusChange(
                                  application?.jobApplicationId,
                                  "accepted"
                                );
                                await sendEmailTemplateForJobApplicationStatus(
                                  app,
                                  job!,
                                  "accepted"
                                );
                              }}
                              className="p-1 bg-green-100 text-green-800 rounded-full hover:bg-green-200"
                              title="Accept application"
                            >
                              <Check size={16} />
                            </button>
                            <button
                              onClick={async () => {
                                onStatusChange(
                                  application?.jobApplicationId,
                                  "rejected"
                                );
                                await sendEmailTemplateForJobApplicationStatus(
                                  app,
                                  job!,
                                  "rejected"
                                );
                              }}
                              className="p-1 bg-red-100 text-red-800 rounded-full hover:bg-red-200"
                              title="Reject application"
                            >
                              <XIcon size={16} />
                            </button>
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                                application?.status
                              )}`}
                            >
                              {application?.status.charAt(0).toUpperCase() +
                                application?.status.slice(1)}
                            </span>
                          </div>
                        ) : (
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                              application?.status || ""
                            )}`}
                          >
                            {application?.status
                              ? application.status.charAt(0).toUpperCase() +
                                application.status.slice(1)
                              : ""}
                          </span>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-gray-500">Applied: </span>
                          {application?.dateApplied
                            ? formatDate(application.dateApplied)
                            : "N/A"}
                        </div>
                      </div>
                    </div>
                  );
              })}
            </div>
          )}
        </div>

        {/* <div className="p-4 border-t border-gray-300 flex justify-end">
          <button
            onClick={onClose}
             className="h-10 px-5 flex items-center justify-center rounded-full bg-[#FFFFFF] border border-[#0856BA] text-sm font-semibold text-[#0856BA] shadow-inner shadow-white/10 transition-all duration-300 hover:bg-[#0856BA] hover:text-white hover:shadow-lg"
          >
            Close
          </button>
        </div> */}
      </div>
    </div>
  );
};