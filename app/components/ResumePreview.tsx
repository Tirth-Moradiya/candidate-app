interface ResumePreviewProps {
  text: string;
}

export default function ResumePreview({ text }: ResumePreviewProps) {
  return (
    <div className="mt-4 p-4 bg-white shadow rounded">
      <h2 className="text-lg font-semibold">Parsed Resume Text</h2>
      {text ? (
        <p className="mt-2 whitespace-pre-wrap">{text}</p>
      ) : (
        <p>No resume uploaded yet.</p>
      )}
    </div>
  );
}
