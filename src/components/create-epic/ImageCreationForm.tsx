"use client";

import { useState, type FormEvent } from "react";
import { FormField } from "@/components/ui/FormField";
import {
  StatusControls,
  DynamicSaveButton,
  ToneSelector,
  AiModelSelector,
  TagInput,
  HashtagInput,
  SocialShareIcons,
  FileUpload,
  GridImageUpload,
} from "./index";
import type { EpicStatus } from "./StatusControls";
import type { Tone } from "./ToneSelector";
import type { AiModel } from "./AiModelSelector";
import type { SocialPlatform } from "./SocialShareIcons";

const IMAGE_SOCIAL_PLATFORMS: SocialPlatform[] = [
  "instagram",
  "facebook",
  "linkedin",
];

export function ImageCreationForm() {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [gridImageUrls, setGridImageUrls] = useState<string[]>([]);
  const [description, setDescription] = useState("");
  const [hashtagsInput, setHashtagsInput] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [status, setStatus] = useState<EpicStatus>("draft");
  const [tone, setTone] = useState<Tone>("friendly");
  const [aiModel, setAiModel] = useState<AiModel>("gemini");
  const [socialShare, setSocialShare] = useState<Set<SocialPlatform>>(
    new Set()
  );
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  const handleSocialChange = (platform: SocialPlatform, checked: boolean) => {
    setSocialShare((prev) => {
      const next = new Set(prev);
      if (checked) next.add(platform);
      else next.delete(platform);
      return next;
    });
  };

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaveError(null);
    setSaveSuccess(null);
    setSaving(true);

    try {
      const res = await fetch("/api/epic/images", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageUrl,
          gridImageUrls,
          description: description.trim() || undefined,
          tags: tagsInput.split(",").map((t) => t.trim()).filter(Boolean),
          hashtags: hashtagsInput.split(",").map((h) => h.trim()).filter(Boolean),
          status,
          tone,
          aiModel,
          socialShare: Array.from(socialShare),
        }),
      });

      const data = (await res.json()) as {
        data?: unknown;
        error?: { message?: string };
      };

      if (!res.ok) {
        setSaveError(data.error?.message ?? "Failed to save.");
        return;
      }

      setSaveSuccess("Saved successfully.");
    } catch {
      setSaveError("Unable to reach the server. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 rounded-xl border border-zinc-800 bg-zinc-950/60 p-6"
    >
      <FileUpload
        value={imageUrl}
        onChange={setImageUrl}
        id="image-upload"
        label="Image Upload"
      />

      <GridImageUpload
        value={gridImageUrls}
        onChange={setGridImageUrls}
        id="grid-image-upload"
        label="Grid Image Upload"
      />

      <FormField id="image-description" label="Image Description">
        <textarea
          id="image-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe your image"
          rows={4}
          className="w-full resize-y rounded-md border border-zinc-800 bg-zinc-900/70 px-3 py-2 text-sm text-zinc-50 outline-none transition focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 placeholder:text-zinc-500"
        />
      </FormField>

      <div className="grid gap-6 sm:grid-cols-2">
        <HashtagInput
          value={hashtagsInput}
          onChange={setHashtagsInput}
          id="image-hashtags"
        />
        <TagInput value={tagsInput} onChange={setTagsInput} id="image-tags" />
      </div>

      <SocialShareIcons
        platforms={IMAGE_SOCIAL_PLATFORMS}
        selected={socialShare}
        onChange={handleSocialChange}
      />

      <div className="grid gap-6 sm:grid-cols-2">
        <ToneSelector value={tone} onChange={setTone} id="image-tone" />
        <AiModelSelector
          value={aiModel}
          onChange={setAiModel}
          id="image-ai-model"
        />
      </div>

      <div className="border-t border-zinc-800 pt-6">
        <p className="mb-3 text-xs font-medium text-zinc-300">Status</p>
        <StatusControls value={status} onChange={setStatus} />
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <DynamicSaveButton status={status} saving={saving} />
        <div className="min-h-[1.25rem] text-xs">
          {saveError ? (
            <p className="text-red-400">{saveError}</p>
          ) : saveSuccess ? (
            <p className="text-emerald-400">{saveSuccess}</p>
          ) : null}
        </div>
      </div>
    </form>
  );
}
