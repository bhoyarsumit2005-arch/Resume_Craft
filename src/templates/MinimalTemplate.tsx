import AtsTemplate from "./AtsTemplate";
import type { TemplateProps } from "./shared";

/** Minimal — airy single-column ATS layout with quiet headings and generous whitespace. */
export default function MinimalTemplate(props: TemplateProps) {
  return <AtsTemplate {...props} variant="minimal" />;
}
