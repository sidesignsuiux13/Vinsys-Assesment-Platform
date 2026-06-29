import { ChangeEvent, useRef, useState } from 'react';
import { Eye, ImagePlus, Mail, Palette, Pencil, Save, ShieldCheck, UserRound } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { DataTable, Column } from '@/components/ui/DataTable';
import { Input, Select, Textarea } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { useToastStore } from '@/components/ui/Toast';
import {
  EmailTemplate,
  PaletteKey,
  ResultDetailLevel,
  ResultVisibility,
  useSettingsStore,
} from '@/store/settingsStore';

const paletteOptions: { value: PaletteKey; label: string; colors: string[] }[] = [
  { value: 'maroon', label: 'Vinsys Maroon', colors: ['#7B1C1C', '#F9F0F0', '#28221C'] },
  { value: 'indigo', label: 'Indigo', colors: ['#4F46E5', '#EEF2FF', '#312E81'] },
  { value: 'emerald', label: 'Emerald', colors: ['#059669', '#ECFDF5', '#064E3B'] },
  { value: 'slate', label: 'Slate', colors: ['#475569', '#F8FAFC', '#0F172A'] },
];

function renderTemplate(template: string) {
  return template
    .replace(/\{\{candidate_name\}\}/g, 'Arjun Mehta')
    .replace(/\{\{exam_name\}\}/g, 'July FSWD Certification Exam')
    .replace(/\{\{exam_date\}\}/g, '2026-07-05')
    .replace(/\{\{exam_time\}\}/g, '10:00');
}

export default function AdminSettings() {
  const push = useToastStore((s) => s.push);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const emailTemplates = useSettingsStore((s) => s.emailTemplates);
  const showResultToCandidate = useSettingsStore((s) => s.showResultToCandidate);
  const resultDetailLevel = useSettingsStore((s) => s.resultDetailLevel);
  const userProfileRequired = useSettingsStore((s) => s.userProfileRequired);
  const logoDataUrl = useSettingsStore((s) => s.logoDataUrl);
  const palette = useSettingsStore((s) => s.palette);
  const updateTemplate = useSettingsStore((s) => s.updateTemplate);
  const updateResultSettings = useSettingsStore((s) => s.updateResultSettings);
  const updateProfileRequired = useSettingsStore((s) => s.updateProfileRequired);
  const updateBranding = useSettingsStore((s) => s.updateBranding);
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<EmailTemplate | null>(null);

  const saveTemplate = () => {
    if (!editingTemplate) return;
    if (!editingTemplate.name.trim() || !editingTemplate.subject.trim() || !editingTemplate.body.trim()) {
      push('error', 'Template name, subject, and body are required.');
      return;
    }
    updateTemplate({ ...editingTemplate, updatedAt: new Date().toISOString().slice(0, 10) });
    setEditingTemplate(null);
    push('success', 'Email template updated.');
  };

  const handleLogoUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      push('error', 'Please upload an image file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      updateBranding({ logoDataUrl: String(reader.result ?? ''), palette });
      push('success', 'Logo updated.');
    };
    reader.onerror = () => push('error', 'Could not read the selected logo.');
    reader.readAsDataURL(file);
  };

  const columns: Column<EmailTemplate>[] = [
    {
      key: 'name',
      label: 'Template',
      render: (template) => (
        <div>
          <p className="font-medium text-neutral-800">{template.name}</p>
          <p className="text-xs text-neutral-400">{template.subject}</p>
        </div>
      ),
    },
    { key: 'updatedAt', label: 'Updated', render: (template) => <span className="text-neutral-500">{template.updatedAt}</span> },
    {
      key: 'tokens',
      label: 'Tokens',
      render: () => (
        <div className="flex flex-wrap gap-1">
          <Badge variant="neutral">{'{{candidate_name}}'}</Badge>
          <Badge variant="neutral">{'{{exam_name}}'}</Badge>
        </div>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (template) => (
        <div className="flex flex-wrap items-center gap-2">
          <Button size="sm" variant="ghost" onClick={() => setEditingTemplate({ ...template })}>
            <Pencil className="h-4 w-4" />
            Edit
          </Button>
          <Button size="sm" variant="secondary" onClick={() => setPreviewTemplate(template)}>
            <Eye className="h-4 w-4" />
            Preview
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <section className="rounded-xl border border-neutral-200 bg-white">
        <div className="flex items-center gap-2 border-b border-neutral-200 px-5 py-4">
          <Mail className="h-5 w-5 text-maroon-600" />
          <h2 className="text-sm font-semibold text-neutral-800">Email Templates</h2>
        </div>
        <DataTable columns={columns} data={emailTemplates} rowKey={(template) => template.id} />
      </section>

      <div className="grid gap-5 lg:grid-cols-2">
        <section className="rounded-xl border border-neutral-200 bg-white p-5">
          <div className="mb-4 flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-maroon-600" />
            <h2 className="text-sm font-semibold text-neutral-800">Show Result</h2>
          </div>
          <div className="space-y-4">
            <Select
              label="Show result to candidate"
              value={showResultToCandidate}
              onChange={(event) =>
                updateResultSettings({
                  showResultToCandidate: event.target.value as ResultVisibility,
                  resultDetailLevel,
                })
              }
            >
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </Select>
            <Select
              label="Show summary or details"
              value={resultDetailLevel}
              onChange={(event) =>
                updateResultSettings({
                  showResultToCandidate,
                  resultDetailLevel: event.target.value as ResultDetailLevel,
                })
              }
            >
              <option value="summary">Summary</option>
              <option value="details">Details</option>
            </Select>
          </div>
        </section>

        <section className="rounded-xl border border-neutral-200 bg-white p-5">
          <div className="mb-4 flex items-center gap-2">
            <UserRound className="h-5 w-5 text-maroon-600" />
            <h2 className="text-sm font-semibold text-neutral-800">User Profile Required</h2>
          </div>
          <Select
            label="Require profile completion"
            value={userProfileRequired}
            onChange={(event) => {
              updateProfileRequired(event.target.value as 'yes' | 'no');
              push('success', 'Profile requirement updated.');
            }}
          >
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </Select>
        </section>
      </div>

      <section className="rounded-xl border border-neutral-200 bg-white p-5">
        <div className="mb-4 flex items-center gap-2">
          <Palette className="h-5 w-5 text-maroon-600" />
          <h2 className="text-sm font-semibold text-neutral-800">Customize UI</h2>
        </div>

        <div className="grid gap-5 lg:grid-cols-[280px_1fr]">
          <div className="rounded-xl border border-neutral-200 p-4">
            <p className="text-sm font-medium text-neutral-800">Logo</p>
            <div className="mt-3 flex h-24 items-center justify-center rounded-lg border border-dashed border-neutral-300 bg-neutral-50">
              {logoDataUrl ? (
                <img src={logoDataUrl} alt="Portal logo preview" className="max-h-16 max-w-48 object-contain" />
              ) : (
                <span className="text-sm font-semibold text-maroon-600">VINSYS</span>
              )}
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
            <div className="mt-3 flex flex-wrap gap-2">
              <Button size="sm" variant="secondary" onClick={() => fileInputRef.current?.click()}>
                <ImagePlus className="h-4 w-4" />
                Upload Logo
              </Button>
              {logoDataUrl && (
                <Button size="sm" variant="ghost" onClick={() => updateBranding({ logoDataUrl: '', palette })}>
                  Remove
                </Button>
              )}
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-neutral-800">Color Palette</p>
            <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              {paletteOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    updateBranding({ logoDataUrl, palette: option.value });
                    push('success', `${option.label} palette applied.`);
                  }}
                  className={`rounded-xl border p-3 text-left transition-colors ${
                    palette === option.value ? 'border-maroon-600 bg-maroon-50' : 'border-neutral-200 hover:bg-neutral-50'
                  }`}
                >
                  <span className="text-sm font-medium text-neutral-800">{option.label}</span>
                  <span className="mt-3 flex gap-2">
                    {option.colors.map((color) => (
                      <span key={color} className="h-7 w-7 rounded-full border border-white shadow-sm" style={{ backgroundColor: color }} />
                    ))}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Modal
        isOpen={Boolean(editingTemplate)}
        onClose={() => setEditingTemplate(null)}
        title="Edit Email Template"
        width={680}
        footer={
          <>
            <Button variant="ghost" onClick={() => setEditingTemplate(null)}>Cancel</Button>
            <Button onClick={saveTemplate}>
              <Save className="h-4 w-4" />
              Save Template
            </Button>
          </>
        }
      >
        {editingTemplate && (
          <div className="space-y-4">
            <Input label="Template Name" value={editingTemplate.name} onChange={(event) => setEditingTemplate({ ...editingTemplate, name: event.target.value })} />
            <Input label="Subject" value={editingTemplate.subject} onChange={(event) => setEditingTemplate({ ...editingTemplate, subject: event.target.value })} />
            <Textarea label="Body" rows={9} value={editingTemplate.body} onChange={(event) => setEditingTemplate({ ...editingTemplate, body: event.target.value })} />
          </div>
        )}
      </Modal>

      <Modal
        isOpen={Boolean(previewTemplate)}
        onClose={() => setPreviewTemplate(null)}
        title="Template Preview"
        width={640}
        footer={<Button onClick={() => setPreviewTemplate(null)}>Close</Button>}
      >
        {previewTemplate && (
          <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-neutral-400">Subject</p>
            <p className="mt-1 text-sm font-semibold text-neutral-800">
              {renderTemplate(previewTemplate.subject)}
            </p>
            <div className="mt-4 rounded-lg bg-white p-4 text-sm leading-6 text-neutral-700">
              {renderTemplate(previewTemplate.body)
                .split('\n')
                .map((line: string, index: number) => (
                  <p key={index}>{line || '\u00A0'}</p>
                ))}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
