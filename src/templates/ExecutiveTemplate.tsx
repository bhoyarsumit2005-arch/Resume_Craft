import AtsTemplate from "./AtsTemplate";
import type { TemplateProps } from "./shared";

/** Executive — compact single-column ATS layout with strong serif typography. */
export default function ExecutiveTemplate(props: TemplateProps) {
  return <AtsTemplate {...props} variant="executive" />;
}
