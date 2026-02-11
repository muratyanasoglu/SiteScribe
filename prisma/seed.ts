import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('demo1234', 10);

  const user = await prisma.user.upsert({
    where: { email: 'demo@sitescribe.app' },
    update: {},
    create: {
      email: 'demo@sitescribe.app',
      passwordHash,
      name: 'Demo User',
    },
  });

  const org = await prisma.organization.upsert({
    where: { slug: 'demo-org' },
    update: {},
    create: {
      name: 'Demo Organization',
      slug: 'demo-org',
    },
  });

  await prisma.membership.upsert({
    where: {
      organizationId_userId: { organizationId: org.id, userId: user.id },
    },
    update: {},
    create: {
      organizationId: org.id,
      userId: user.id,
      role: 'OWNER',
    },
  });

  const project = await prisma.project.create({
    data: {
      organizationId: org.id,
      name: 'Demo Construction Project',
      description: 'Sample project for SiteScribe walkthrough',
    },
  });

  const evidence1 = await prisma.evidence.create({
    data: {
      projectId: project.id,
      type: 'SITE_LOG',
      title: 'Daily log – scope change noted',
      description: 'Contractor reported additional work required due to unforeseen conditions.',
      occurredAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      extractedText: 'Site visit. Changed scope discussed. Revision needed. Delay possible. Additional cost to be submitted.',
      createdBy: user.id,
    },
  });

  await prisma.evidenceChunk.createMany({
    data: [
      { evidenceId: evidence1.id, index: 0, content: 'Site visit. Changed scope discussed. Revision needed.' },
      { evidenceId: evidence1.id, index: 1, content: 'Delay possible. Additional cost to be submitted.' },
    ],
  });

  const evidence2 = await prisma.evidence.create({
    data: {
      projectId: project.id,
      type: 'RFI_DOC',
      title: 'RFI-001',
      occurredAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      extractedText: 'Request for information regarding revised drawings. Unforeseen condition.',
      createdBy: user.id,
    },
  });

  await prisma.evidenceChunk.create({
    data: { evidenceId: evidence2.id, index: 0, content: 'Request for information regarding revised drawings. Unforeseen condition.' },
  });

  const changeEvent = await prisma.changeEvent.create({
    data: {
      projectId: project.id,
      title: 'Change signal: scope revision',
      description: 'Keyword: "changed"; Keyword: "revision"; RFI document',
      status: 'DETECTED',
      occurredAt: new Date(),
    },
  });

  await prisma.eventSignal.createMany({
    data: [
      { changeEventId: changeEvent.id, evidenceId: evidence1.id, score: 0.8, reason: 'Keyword: "changed"; Keyword: "revision"' },
      { changeEventId: changeEvent.id, evidenceId: evidence2.id, score: 0.7, reason: 'RFI document' },
    ],
  });

  const co = await prisma.changeOrder.create({
    data: {
      projectId: project.id,
      changeEventId: changeEvent.id,
      title: 'CO – Scope revision',
      scopeNarrative: 'Change Order – Scope Narrative\n\nThis Change Order addresses the following scope change(s) identified from project evidence:\n\nContractor reported additional work required due to unforeseen conditions.',
      contractClauses: '[EVID:' + evidence2.id + '#chunk:0] Request for information regarding revised drawings...',
      assumptions: '- Scope is as described in linked evidence.\n- Pricing to be confirmed with subcontractors.',
      exclusions: '- Work outside the described scope.',
      scheduleImpactDays: 5,
      status: 'DRAFT',
    },
  });

  await prisma.changeOrderLineItem.createMany({
    data: [
      { changeOrderId: co.id, description: 'Additional scope – labor', quantity: 1, unit: 'LS', unitPrice: 0, amount: 0 },
      { changeOrderId: co.id, description: 'Additional scope – materials', quantity: 1, unit: 'LS', unitPrice: 0, amount: 0 },
    ],
  });

  console.log('Seed complete.');
  console.log('  Demo user: demo@sitescribe.app / demo1234');
  console.log('  Org:', org.name);
  console.log('  Project:', project.name);
  console.log('  Event:', changeEvent.title);
  console.log('  CO:', co.title);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
