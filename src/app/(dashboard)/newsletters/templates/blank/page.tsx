import { NewsletterEditor } from "@/components/newsletter/NewsletterEditor";

export default function BlankNewsletterPage() {
  return (
    <NewsletterEditor
      initialValues={{
        title: "",
        description: "",
        body: "",
        tagsInput: "",
        bannerImageUrl: null,
      }}
      previewStyle="posterDark"
      contentType="newsletter"
    />
  );
}
