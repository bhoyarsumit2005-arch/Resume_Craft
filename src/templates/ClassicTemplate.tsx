import AtsTemplate from "./AtsTemplate";
import type { TemplateProps } from "./shared";

/** Classic — centered, traditional, black-and-white single-column ATS layout. */
export default function ClassicTemplate(props: TemplateProps) {
  return <AtsTemplate {...props} variant="classic" />;
}
