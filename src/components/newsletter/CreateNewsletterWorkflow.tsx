"use client";

import { useState } from "react";
import { CreateNewsletterSteps } from "./CreateNewsletterSteps";
import { NewsletterDraftEditor } from "./NewsletterDraftEditor";
import type { GenerateNewsletterOutput } from "@/lib/ai/types";

export type WorkflowStep = 1 | 2 | 3 | 4 | 5;

export function CreateNewsletterWorkflow() {
  const [step, setStep] = useState<WorkflowStep>(1);
  const [draft, setDraft] = useState<GenerateNewsletterOutput | null>(null);
  const [generating, setGenerating] = useState(false);

  const handleGenerated = (result: GenerateNewsletterOutput) => {
    setDraft(result);
    setStep(6); // Draft editor view
  };

  if (draft && step === 6) {
    return (
      <NewsletterDraftEditor
        draft={draft}
        onBack={() => {
          setDraft(null);
          setStep(1);
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-zinc-50">Create Newsletter</h2>
        <p className="mt-1 text-sm text-zinc-400">
          Generate AI-powered newsletters with a guided workflow.
        </p>
      </div>

      <CreateNewsletterSteps
        step={step}
        onStepChange={setStep}
        onGenerated={handleGenerated}
        generating={generating}
        setGenerating={setGenerating}
      />
    </div>
  );
}
