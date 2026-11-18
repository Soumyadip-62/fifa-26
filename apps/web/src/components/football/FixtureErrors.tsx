import { ErrorState } from "@/components/common/ErrorState";

export function FixtureErrors({
  errors,
}: {
  errors: Partial<Record<string, string>>;
}) {
  return (
    <>
      {Object.entries(errors).map(([id, message]) =>
        message ? (
          <ErrorState
            key={id}
            title={`${id.replaceAll("-", " ")} fixtures unavailable`}
            message={message}
          />
        ) : null,
      )}
    </>
  );
}
