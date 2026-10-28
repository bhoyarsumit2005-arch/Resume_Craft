import AtsTemplate from "./AtsTemplate";
import type { TemplateProps } from "./shared";

/** Modern — single-column ATS layout with an accent rule and standard headings. */
export default function ModernTemplate(props: TemplateProps) {
  return <AtsTemplate {...props} variant="modern" />;
}
