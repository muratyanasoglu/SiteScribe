'use client';

import { useState } from 'react';
import { updateChangeOrder, addLineItem } from '@/app/actions/change-order';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useT } from '@/components/locale-provider';

type LineItem = { id: string; description: string; quantity: number | null; unit: string | null; unitPrice: number | null; amount: number | null };

export function COEditor({
  projectId,
  coId,
  initial,
}: {
  projectId: string;
  coId: string;
  initial: {
    title: string;
    scopeNarrative: string;
    contractClauses: string;
    assumptions: string;
    exclusions: string;
    scheduleImpactDays?: number;
    status: string;
    lineItems: LineItem[];
  };
}) {
  const t = useT();
  const [title, setTitle] = useState(initial.title);
  const [scopeNarrative, setScopeNarrative] = useState(initial.scopeNarrative);
  const [contractClauses, setContractClauses] = useState(initial.contractClauses);
  const [assumptions, setAssumptions] = useState(initial.assumptions);
  const [exclusions, setExclusions] = useState(initial.exclusions);
  const [scheduleImpactDays, setScheduleImpactDays] = useState(String(initial.scheduleImpactDays ?? ''));
  const [status, setStatus] = useState(initial.status);
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    await updateChangeOrder(projectId, coId, {
      title,
      scopeNarrative,
      contractClauses,
      assumptions,
      exclusions,
      scheduleImpactDays: scheduleImpactDays ? parseInt(scheduleImpactDays, 10) : null,
      status,
    });
    setSaving(false);
  }

  async function addItem(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData();
    formData.set('description', (form.elements.namedItem('newDescription') as HTMLInputElement)?.value || '');
    formData.set('quantity', (form.elements.namedItem('newQuantity') as HTMLInputElement)?.value || '1');
    formData.set('unit', (form.elements.namedItem('newUnit') as HTMLInputElement)?.value || 'LS');
    formData.set('unitPrice', (form.elements.namedItem('newUnitPrice') as HTMLInputElement)?.value || '0');
    await addLineItem(projectId, coId, formData);
    window.location.reload();
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Scope & details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>{t('co.title')}</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1 w-full max-w-full" />
          </div>
          <div>
            <Label>{t('co.scopeNarrative')}</Label>
            <Textarea value={scopeNarrative} onChange={(e) => setScopeNarrative(e.target.value)} rows={6} className="mt-1 w-full max-w-full min-w-0" />
          </div>
          <div>
            <Label>{t('co.contractClauses')}</Label>
            <Textarea value={contractClauses} onChange={(e) => setContractClauses(e.target.value)} rows={4} className="mt-1 w-full max-w-full min-w-0 font-mono text-sm" />
          </div>
          <div>
            <Label>{t('co.assumptions')}</Label>
            <Textarea value={assumptions} onChange={(e) => setAssumptions(e.target.value)} rows={2} className="mt-1 w-full max-w-full min-w-0" />
          </div>
          <div>
            <Label>{t('co.exclusions')}</Label>
            <Textarea value={exclusions} onChange={(e) => setExclusions(e.target.value)} rows={2} className="mt-1 w-full max-w-full min-w-0" />
          </div>
          <div className="flex flex-wrap gap-4">
            <div className="min-w-0">
              <Label>{t('co.scheduleImpactDays')}</Label>
              <Input
                type="number"
                value={scheduleImpactDays}
                onChange={(e) => setScheduleImpactDays(e.target.value)}
                className="mt-1 w-24 max-w-full"
              />
            </div>
            <div className="min-w-0 flex-1">
              <Label>{t('co.status')}</Label>
              <Input value={status} onChange={(e) => setStatus(e.target.value)} className="mt-1 w-full max-w-[140px]" />
            </div>
          </div>
          <Button onClick={save} disabled={saving}>{saving ? t('co.saving') : t('co.save')}</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle>{t('co.costLineItems')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 min-w-0">
          <div className="overflow-x-auto -mx-1">
            <table className="w-full text-sm min-w-[320px]">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-1 pr-2">{t('co.description')}</th>
                  <th className="text-right py-1 whitespace-nowrap">{t('co.qty')}</th>
                  <th className="text-right py-1 whitespace-nowrap">{t('co.unit')}</th>
                  <th className="text-right py-1 whitespace-nowrap">{t('co.unitPrice')}</th>
                  <th className="text-right py-1 whitespace-nowrap">{t('co.amount')}</th>
                </tr>
              </thead>
              <tbody>
                {initial.lineItems.map((row) => (
                  <tr key={row.id} className="border-b">
                    <td className="py-1 pr-2 break-words max-w-[180px] sm:max-w-none">{row.description}</td>
                    <td className="text-right whitespace-nowrap">{row.quantity}</td>
                    <td className="text-right whitespace-nowrap">{row.unit}</td>
                    <td className="text-right whitespace-nowrap">{row.unitPrice}</td>
                    <td className="text-right whitespace-nowrap">{row.amount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <form onSubmit={addItem} className="flex flex-wrap gap-2 pt-2">
            <Input name="newDescription" placeholder={t('co.descriptionPlaceholder')} className="min-w-0 flex-1 sm:w-48 max-w-full" />
            <Input name="newQuantity" type="number" defaultValue={1} className="w-14 sm:w-16" />
            <Input name="newUnit" placeholder={t('co.unitPlaceholder')} defaultValue="LS" className="w-12 sm:w-16" />
            <Input name="newUnitPrice" type="number" step="0.01" defaultValue={0} className="w-20 sm:w-24" />
            <Button type="submit" size="sm" className="shrink-0">{t('co.addLine')}</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
