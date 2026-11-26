"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { Dialog } from "@base-ui/react/dialog";
import { Compass, X } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  finishTour,
  TOUR_REPLAY_EVENT,
  tourSteps,
  tourWasHandled,
} from "@/lib/website-tour";
import "./website-tour.css";

function visibleTarget(selectors: readonly string[]) {
  for (const selector of selectors) {
    const target = Array.from(
      document.querySelectorAll<HTMLElement>(selector),
    ).find((element) => element.getClientRects().length > 0);
    if (target) return target;
  }
  return null;
}

export function WebsiteTour() {
  const pathname = usePathname();
  // -1 is the welcome screen; null leaves the website unobstructed.
  const [step, setStep] = useState<number | null>(null);
  const [hasTarget, setHasTarget] = useState(true);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);
  const publicPage = !pathname.startsWith("/admin");
  const current = step !== null && step >= 0 ? tourSteps[step] : null;

  useEffect(() => {
    const open = (welcome: boolean) => {
      returnFocus.current =
        document.activeElement instanceof HTMLElement
          ? document.activeElement
          : null;
      document
        .querySelectorAll("header details[open]")
        .forEach((menu) => menu.removeAttribute("open"));
      setStep(welcome ? -1 : 0);
    };
    const replay = () => {
      if (publicPage) open(false);
    };
    window.addEventListener(TOUR_REPLAY_EVENT, replay);
    const timer = window.setTimeout(() => {
      if (publicPage && !tourWasHandled()) open(true);
    }, 300);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener(TOUR_REPLAY_EVENT, replay);
    };
  }, [pathname, publicPage]);

  useEffect(() => {
    if (!current || !publicPage) return;
    let highlighted: HTMLElement | null = null;
    const highlight = () => {
      highlighted?.classList.remove("website-tour-highlight");
      highlighted = visibleTarget(current.targets);
      highlighted?.classList.add("website-tour-highlight");
      setHasTarget(Boolean(highlighted));
    };
    highlight();
    window.addEventListener("resize", highlight);
    return () => {
      highlighted?.classList.remove("website-tour-highlight");
      window.removeEventListener("resize", highlight);
    };
  }, [current, publicPage]);

  useEffect(() => {
    if (step !== null) titleRef.current?.focus();
  }, [step]);

  const close = (outcome: "completed" | "skipped") => {
    finishTour(outcome);
    setStep(null);
  };

  return (
    <Dialog.Root
      open={publicPage && step !== null}
      disablePointerDismissal
      onOpenChange={(open) => {
        if (!open) close("skipped");
      }}
    >
      <Dialog.Portal>
        <Dialog.Backdrop className="website-tour-backdrop" />
        <Dialog.Popup
          className="website-tour-panel"
          initialFocus={titleRef}
          finalFocus={() => {
            const previous = returnFocus.current;
            return previous?.isConnected && previous !== document.body
              ? previous
              : document.querySelector<HTMLElement>('[data-tour="settings"]');
          }}
        >
          <Dialog.Close
            className={buttonVariants({
              variant: "ghost",
              size: "sm",
              className: "absolute right-3 top-3 size-10 p-0",
            })}
            aria-label="Close website tour"
          >
            <X className="size-4" aria-hidden="true" />
          </Dialog.Close>
          <Compass className="mb-5 size-8 text-primary" aria-hidden="true" />
          <p
            className="mb-2 text-xs font-semibold text-primary"
            aria-live="polite"
          >
            {current
              ? `Step ${step! + 1} of ${tourSteps.length}`
              : "A quick look around"}
          </p>
          <Dialog.Title
            ref={titleRef}
            tabIndex={-1}
            className="pr-5 text-xl font-bold outline-none"
          >
            {current?.title ?? "Welcome to NinetyPlus"}
          </Dialog.Title>
          <Dialog.Description className="mt-3 text-sm leading-6 text-muted-foreground">
            {current?.description ??
              "Fixtures, scores, teams and news in one place. Take a quick tour to find your way around and make matchday your own."}
          </Dialog.Description>
          {current && (
            <p className="mt-3 text-xs text-primary">
              {hasTarget
                ? "Look for the highlighted control on this screen."
                : "This control appears in the main navigation when available."}
            </p>
          )}
          <div className="mt-7 flex flex-wrap items-center justify-between gap-2">
            <Dialog.Close className={buttonVariants({ variant: "ghost" })}>
              Skip
            </Dialog.Close>
            <div className="flex gap-2">
              {current && step! > 0 && (
                <Button variant="outline" onClick={() => setStep(step! - 1)}>
                  Back
                </Button>
              )}
              <Button
                onClick={() => {
                  if (step === tourSteps.length - 1) close("completed");
                  else setStep((step ?? -1) + 1);
                }}
              >
                {!current
                  ? "Start tour"
                  : step === tourSteps.length - 1
                    ? "Finish"
                    : "Next"}
              </Button>
            </div>
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
