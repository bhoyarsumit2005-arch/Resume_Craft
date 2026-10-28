import AtsTemplate from "./AtsTemplate";
import type { TemplateProps } from "./shared";

/** Timeline — date-led single-column ATS layout. */
export default function TimelineTemplate(props: TemplateProps) {
  return <AtsTemplate {...props} variant="timeline" />;
}
