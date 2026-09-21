import { User, FileText, GraduationCap, Briefcase, FolderGit2, Wrench, Award, Trophy, Languages as LanguagesIcon, Link2, Palette } from "lucide-react";
import SectionCard from "./SectionCard";
import PersonalInfoForm from "./PersonalInfoForm";
import SummaryForm from "./SummaryForm";
import EducationForm from "./EducationForm";
import ExperienceForm from "./ExperienceForm";
import ProjectForm from "./ProjectForm";
import SkillsForm from "./SkillsForm";
import CertificationForm from "./CertificationForm";
import AchievementForm from "./AchievementForm";
import LanguageForm from "./LanguageForm";
import SocialLinksForm from "./SocialLinksForm";
import TemplateSelector from "./TemplateSelector";
import type { ResumeData, SectionKey } from "@/lib/resume-types";

interface Props {
  resume: ResumeData;
  onChange: (patch: Partial<ResumeData>) => void;
  onTemplateChange?: (name: string) => void;
}

export default function ResumeForm({ resume, onChange, onTemplateChange }: Props) {
  const toggleSection = (k: SectionKey) =>
    onChange({
      hiddenSections: resume.hiddenSections.includes(k) ? resume.hiddenSections.filter((x) => x !== k) : [...resume.hiddenSections, k],
    });
  const hidden = (k: SectionKey) => resume.hiddenSections.includes(k);

  return (
    <div className="space-y-3">
      <SectionCard title="Template & Style" icon={<Palette size={16} />} defaultOpen={false}>
        <TemplateSelector
          resume={resume}
          onTemplate={(template) => {
            onChange({ template });
            onTemplateChange?.(template);
          }}
          onAccent={(accentColor) => onChange({ accentColor })}
          onFontSize={(fontSize) => onChange({ fontSize })}
          onToggleSection={toggleSection}
        />
      </SectionCard>

      <SectionCard title="Personal Information" icon={<User size={16} />} defaultOpen>
        <PersonalInfoForm value={resume.personalInfo} onChange={(personalInfo) => onChange({ personalInfo })} />
      </SectionCard>

      <SectionCard title="Professional Summary" icon={<FileText size={16} />} hidden={hidden("summary")} onToggleHidden={() => toggleSection("summary")} defaultOpen>
        <SummaryForm
          value={resume.summary}
          onChange={(summary) => onChange({ summary })}
          context={{ title: resume.personalInfo.title, skills: resume.skills, projects: resume.projects.length }}
        />
      </SectionCard>

      <SectionCard title="Education" icon={<GraduationCap size={16} />} count={resume.education.length} hidden={hidden("education")} onToggleHidden={() => toggleSection("education")}>
        <EducationForm items={resume.education} onChange={(education) => onChange({ education })} />
      </SectionCard>

      <SectionCard title="Experience" icon={<Briefcase size={16} />} count={resume.experience.length} hidden={hidden("experience")} onToggleHidden={() => toggleSection("experience")}>
        <ExperienceForm items={resume.experience} onChange={(experience) => onChange({ experience })} />
      </SectionCard>

      <SectionCard title="Projects" icon={<FolderGit2 size={16} />} count={resume.projects.length} hidden={hidden("projects")} onToggleHidden={() => toggleSection("projects")}>
        <ProjectForm items={resume.projects} onChange={(projects) => onChange({ projects })} />
      </SectionCard>

      <SectionCard title="Skills" icon={<Wrench size={16} />} count={resume.skills.length} hidden={hidden("skills")} onToggleHidden={() => toggleSection("skills")}>
        <SkillsForm skills={resume.skills} onChange={(skills) => onChange({ skills })} />
      </SectionCard>

      <SectionCard title="Certifications" icon={<Award size={16} />} count={resume.certifications.length} hidden={hidden("certifications")} onToggleHidden={() => toggleSection("certifications")}>
        <CertificationForm items={resume.certifications} onChange={(certifications) => onChange({ certifications })} />
      </SectionCard>

      <SectionCard title="Achievements" icon={<Trophy size={16} />} count={resume.achievements.length} hidden={hidden("achievements")} onToggleHidden={() => toggleSection("achievements")}>
        <AchievementForm items={resume.achievements} onChange={(achievements) => onChange({ achievements })} />
      </SectionCard>

      <SectionCard title="Languages" icon={<LanguagesIcon size={16} />} count={resume.languages.length} hidden={hidden("languages")} onToggleHidden={() => toggleSection("languages")}>
        <LanguageForm items={resume.languages} onChange={(languages) => onChange({ languages })} />
      </SectionCard>

      <SectionCard title="Social Links" icon={<Link2 size={16} />} count={resume.socialLinks.length} hidden={hidden("socialLinks")} onToggleHidden={() => toggleSection("socialLinks")}>
        <SocialLinksForm items={resume.socialLinks} onChange={(socialLinks) => onChange({ socialLinks })} />
      </SectionCard>
    </div>
  );
}
