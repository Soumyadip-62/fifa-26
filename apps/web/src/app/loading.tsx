import { LoadingState } from "@/components/common/LoadingState";

export default function Loading() {
  return (
    <div className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:px-8">
      <LoadingState />
    </div>
  );
}
