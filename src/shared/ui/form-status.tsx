interface FormStatusProps {
  tone: "success" | "error";
  message: string;
}

export function FormStatus({ tone, message }: FormStatusProps) {
  const toneClassName =
    tone === "success"
      ? "border-success/30 bg-success/10 text-success"
      : "border-destructive/30 bg-destructive/10 text-destructive";

  return (
    <p role="status" className={`rounded-md border px-3 py-2 text-sm ${toneClassName}`}>
      {message}
    </p>
  );
}
