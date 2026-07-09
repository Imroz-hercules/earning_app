import { FormEvent, useState } from "react";
import { FileImage, Upload } from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";

import { StatusBadge } from "../../components/StatusBadge";
import { absoluteFileUrl, api } from "../../lib/api";
import type { DocumentRecord } from "../../types";

type VerificationResponse = {
  status: string;
  documents: DocumentRecord[];
};

export function VerificationPage() {
  const [documentType, setDocumentType] = useState("government_id");
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState("");
  const verification = useQuery<VerificationResponse>({
    queryKey: ["verification"],
    queryFn: () => api("/verification"),
  });
  const upload = useMutation({
    mutationFn: async () => {
      if (!file) throw new Error("Select a file first");
      const form = new FormData();
      form.append("document_type", selectedType);
      form.append("file", file);
      return api<DocumentRecord>("/upload-document", { method: "POST", body: form });
    },
    onSuccess: async () => {
      setMessage("Document uploaded for review");
      setFile(null);
      await verification.refetch();
    },
    onError: (exc) => setMessage(exc instanceof Error ? exc.message : "Upload failed"),
  });

  const submit = (event: FormEvent) => {
    event.preventDefault();
    upload.mutate();
  };

  const documents = verification.data?.documents ?? [];
  const status = verification.data?.status ?? "pending";
  const isRejected = status === "rejected";
  const governmentId = [...documents].reverse().find((document) => document.document_type === "government_id");
  const selfie = [...documents].reverse().find((document) => document.document_type === "selfie");
  const missingTypes = [
    !governmentId ? { value: "government_id", label: "Government ID" } : null,
    !selfie ? { value: "selfie", label: "Selfie" } : null,
  ].filter(Boolean) as { value: string; label: string }[];
  const hasRequiredDocuments = Boolean(governmentId && selfie);
  const selectedType = missingTypes.some((type) => type.value === documentType) ? documentType : missingTypes[0]?.value ?? "government_id";

  return (
    <div className="space-y-6">
      <section className="panel p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold text-ink">{isRejected ? "Verification rejected" : "Verification pending"}</h2>
            <p className="text-sm text-steel">
              {isRejected
                ? "You are not eligible for our programs."
                : hasRequiredDocuments
                ? "Your government ID and selfie are uploaded. Please wait for admin approval."
                : "Upload your government ID and selfie to start admin review."}
            </p>
          </div>
          {verification.data?.status && <StatusBadge status={verification.data.status} />}
        </div>

        {!isRejected && !hasRequiredDocuments && (
          <form className="mt-6 grid gap-4 lg:grid-cols-[240px_1fr_auto]" onSubmit={submit}>
            <label className="block text-sm font-semibold text-ink">
              Missing document
              <select
                className="input mt-2"
                value={selectedType}
                onChange={(event) => setDocumentType(event.target.value)}
              >
                {missingTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm font-semibold text-ink">
              File
              <input
                className="input mt-2"
                type="file"
                accept=".png,.jpg,.jpeg,.webp,.pdf"
                onChange={(event) => setFile(event.target.files?.[0] ?? null)}
              />
            </label>
            <button className="btn-primary self-end" disabled={upload.isPending}>
              <Upload className="h-4 w-4" />
              {upload.isPending ? "Uploading..." : "Upload"}
            </button>
          </form>
        )}

        {message && <p className="mt-4 rounded-md bg-slate-100 px-3 py-2 text-sm font-semibold text-steel">{message}</p>}
      </section>

      {isRejected && (
        <div className="panel p-6">
          <h3 className="text-lg font-bold text-ink">Program eligibility</h3>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-steel">
            Your profile was reviewed by the admin team and is not eligible for our programs.
          </p>
        </div>
      )}

      {!isRejected && (
        <section className="grid gap-4 md:grid-cols-2">
          {[governmentId, selfie].map((document, index) => (
            <div key={document?.id ?? index} className="panel overflow-hidden">
              <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-5 py-4">
                <h3 className="font-bold text-ink">{index === 0 ? "Government ID" : "Selfie"}</h3>
                {document ? <StatusBadge status={document.status} /> : <StatusBadge status="missing" />}
              </div>
              {document ? (
                <a href={absoluteFileUrl(document.file_url)} target="_blank" rel="noreferrer" className="block bg-slate-50 p-5">
                  {document.file_url.toLowerCase().endsWith(".pdf") ? (
                    <div className="grid aspect-[4/3] place-items-center rounded-md border border-dashed border-slate-300 bg-white">
                      <FileImage className="h-10 w-10 text-slate-400" />
                      <span className="mt-2 text-sm font-semibold text-steel">Open PDF</span>
                    </div>
                  ) : (
                    <img
                      className="aspect-[4/3] w-full rounded-md object-cover"
                      src={absoluteFileUrl(document.file_url)}
                      alt={index === 0 ? "Government ID" : "Selfie"}
                    />
                  )}
                </a>
              ) : (
                <div className="grid aspect-[4/3] place-items-center bg-slate-50 p-5 text-sm font-semibold text-steel">
                  Waiting for upload
                </div>
              )}
            </div>
          ))}
        </section>
      )}

      {!isRejected && hasRequiredDocuments && (
        <div className="panel p-6">
          <h3 className="text-lg font-bold text-ink">Review in progress</h3>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-steel">
            The upload pane is hidden because both required files are submitted. An admin can approve or reject your
            verification from the admin user management screen.
          </p>
        </div>
      )}
    </div>
  );
}
