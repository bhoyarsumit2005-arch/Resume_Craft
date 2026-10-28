import AtsTemplate from "./AtsTemplate";
import type { TemplateProps } from "./shared";

/** Creative — expressive typography inside a safe single-column ATS structure. */
export default function CreativeTemplate(props: TemplateProps) {
  return <AtsTemplate {...props} variant="creative" />;
}
