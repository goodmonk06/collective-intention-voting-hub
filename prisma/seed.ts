import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Create a sample cycle
  const cycle = await prisma.intentionCycle.create({
    data: {
      key: 'dec-2025-intentions',
      title: 'December 2025: Community Intentions',
      descriptionMarkdown: `What should be our collective focus for the end of the year?

This is a time for reflection and setting intentions for how we want to close out 2025.
Share your proposals for themes, focus areas, or practices that could guide our community.`,
      periodStart: new Date('2025-12-01'),
      periodEnd: new Date('2025-12-31'),
      proposalWindowOpen: true,
      votingWindowOpen: true,
    },
  });

  console.log('✅ Created cycle:', cycle.title);

  // Create sample proposals
  const proposals = await Promise.all([
    prisma.intentionProposal.create({
      data: {
        cycleId: cycle.id,
        proposerMemberId: 'seed-user-1',
        title: 'Deepening Connection & Presence',
        bodyMarkdown: `Let's make December about truly connecting with each other and being present.

**Why this matters:**
- We've been moving fast all year
- The holidays are a natural time to slow down
- Our community thrives on authentic connection

**What this could look like:**
- Weekly deep listening circles
- Device-free gatherings
- Mindful celebration practices
- Gratitude sharing rituals`,
        tagsJson: JSON.stringify(['connection', 'mindfulness', 'community']),
      },
    }),
    prisma.intentionProposal.create({
      data: {
        cycleId: cycle.id,
        proposerMemberId: 'seed-user-2',
        title: 'Year-End Reflection & Integration',
        bodyMarkdown: `Use December to reflect on our journey and integrate our learnings.

**The Vision:**
Create structured time and space for the community to:
- Review our accomplishments and challenges
- Harvest insights from the year
- Set clear intentions for 2026
- Document our collective wisdom

**Proposed Activities:**
- Reflection workshops
- Story harvesting sessions
- Personal and collective vision boarding
- End-of-year retrospective`,
        tagsJson: JSON.stringify(['reflection', 'growth', 'learning']),
      },
    }),
    prisma.intentionProposal.create({
      data: {
        cycleId: cycle.id,
        proposerMemberId: 'seed-user-3',
        title: 'Joy & Celebration',
        bodyMarkdown: `December should be about joy, play, and celebrating what we've built together!

Let's prioritize lightness and celebration. We've worked hard - it's time to enjoy the fruits.

**Ideas:**
- Weekly celebration gatherings
- Creative play sessions
- Music and art nights
- Appreciation circles
- Fun holiday traditions`,
        tagsJson: JSON.stringify(['joy', 'celebration', 'play']),
      },
    }),
    prisma.intentionProposal.create({
      data: {
        cycleId: cycle.id,
        proposerMemberId: 'seed-user-4',
        title: 'Service & Giving Back',
        bodyMarkdown: `Focus on service to others and sharing our abundance.

**Core Intention:**
December is traditionally a time of giving. Let's organize our collective energy around service.

**Potential Projects:**
- Community service days
- Skill-sharing workshops for neighboring communities
- Resource redistribution
- Mentorship programs
- Supporting local initiatives`,
        tagsJson: JSON.stringify(['service', 'giving', 'impact']),
      },
    }),
  ]);

  console.log(`✅ Created ${proposals.length} proposals`);

  // Create sample votes
  const votes = await Promise.all([
    // Votes for "Deepening Connection"
    prisma.intentionVote.create({
      data: {
        proposalId: proposals[0].id,
        voterMemberId: 'voter-1',
        weightScore: 5,
        resonanceTagJson: JSON.stringify(['inspiring', 'timely']),
      },
    }),
    prisma.intentionVote.create({
      data: {
        proposalId: proposals[0].id,
        voterMemberId: 'voter-2',
        weightScore: 4,
        resonanceTagJson: JSON.stringify(['grounded', 'practical']),
      },
    }),
    prisma.intentionVote.create({
      data: {
        proposalId: proposals[0].id,
        voterMemberId: 'voter-3',
        weightScore: 5,
        resonanceTagJson: JSON.stringify(['transformative', 'inspiring']),
      },
    }),

    // Votes for "Year-End Reflection"
    prisma.intentionVote.create({
      data: {
        proposalId: proposals[1].id,
        voterMemberId: 'voter-1',
        weightScore: 4,
        resonanceTagJson: JSON.stringify(['practical', 'grounded']),
      },
    }),
    prisma.intentionVote.create({
      data: {
        proposalId: proposals[1].id,
        voterMemberId: 'voter-4',
        weightScore: 5,
        resonanceTagJson: JSON.stringify(['timely', 'transformative']),
      },
    }),

    // Votes for "Joy & Celebration"
    prisma.intentionVote.create({
      data: {
        proposalId: proposals[2].id,
        voterMemberId: 'voter-2',
        weightScore: 5,
        resonanceTagJson: JSON.stringify(['inspiring', 'bold']),
      },
    }),
    prisma.intentionVote.create({
      data: {
        proposalId: proposals[2].id,
        voterMemberId: 'voter-3',
        weightScore: 3,
        resonanceTagJson: JSON.stringify(['practical']),
      },
    }),
    prisma.intentionVote.create({
      data: {
        proposalId: proposals[2].id,
        voterMemberId: 'voter-5',
        weightScore: 4,
        resonanceTagJson: JSON.stringify(['inspiring']),
      },
    }),

    // Votes for "Service & Giving Back"
    prisma.intentionVote.create({
      data: {
        proposalId: proposals[3].id,
        voterMemberId: 'voter-4',
        weightScore: 4,
        resonanceTagJson: JSON.stringify(['timely', 'grounded']),
      },
    }),
    prisma.intentionVote.create({
      data: {
        proposalId: proposals[3].id,
        voterMemberId: 'voter-5',
        weightScore: 3,
        resonanceTagJson: JSON.stringify(['practical']),
      },
    }),
  ]);

  console.log(`✅ Created ${votes.length} votes`);

  console.log('\n🎉 Seed completed successfully!');
  console.log('\n📊 Summary:');
  console.log(`   - 1 cycle: ${cycle.title}`);
  console.log(`   - ${proposals.length} proposals`);
  console.log(`   - ${votes.length} votes`);
  console.log('\n💡 Next steps:');
  console.log('   1. Start the dev server: npm run dev');
  console.log('   2. Visit http://localhost:3000');
  console.log('   3. Explore the cycle and vote on proposals!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
