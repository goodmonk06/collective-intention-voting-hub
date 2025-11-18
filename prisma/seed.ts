import { PrismaClient, MemberRole, MemberStatus, CycleStatus, ProposalStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting comprehensive seed...\n');

  // ============================================================
  // COMMUNITIES
  // ============================================================
  console.log('📍 Creating communities...');

  const techCollective = await prisma.community.create({
    data: {
      key: 'tech-collective',
      name: 'Tech Collective',
      description: 'A community of technologists building for collective wellbeing',
      settingsJson: JSON.stringify({ theme: 'innovation', visibility: 'public' }),
      isPublic: true,
    },
  });

  const wellnessCircle = await prisma.community.create({
    data: {
      key: 'wellness-circle',
      name: 'Wellness Circle',
      description: 'Holistic wellness and mindful living community',
      settingsJson: JSON.stringify({ theme: 'wellness', visibility: 'public' }),
      isPublic: true,
    },
  });

  const neighborhoodCoop = await prisma.community.create({
    data: {
      key: 'neighborhood-coop',
      name: 'Neighborhood Co-op',
      description: 'Local mutual aid and community organizing',
      settingsJson: JSON.stringify({ theme: 'local', visibility: 'public' }),
      isPublic: true,
    },
  });

  console.log(`✅ Created ${3} communities\n`);

  // ============================================================
  // MEMBERS
  // ============================================================
  console.log('👥 Creating members...');

  const members = await Promise.all([
    prisma.member.create({
      data: {
        displayName: 'Alice Chen',
        email: 'alice@example.com',
        bio: 'Community organizer and facilitator passionate about collective decision-making',
        status: MemberStatus.ACTIVE,
        lastActiveAt: new Date(),
      },
    }),
    prisma.member.create({
      data: {
        displayName: 'Bob Martinez',
        email: 'bob@example.com',
        bio: 'Tech worker exploring alternative governance models',
        status: MemberStatus.ACTIVE,
        lastActiveAt: new Date(),
      },
    }),
    prisma.member.create({
      data: {
        displayName: 'Carol Kim',
        email: 'carol@example.com',
        bio: 'Wellness practitioner and meditation teacher',
        status: MemberStatus.ACTIVE,
        lastActiveAt: new Date(),
      },
    }),
    prisma.member.create({
      data: {
        displayName: 'David Thompson',
        email: 'david@example.com',
        bio: 'Neighborhood organizer and mutual aid coordinator',
        status: MemberStatus.ACTIVE,
        lastActiveAt: new Date(),
      },
    }),
    prisma.member.create({
      data: {
        displayName: 'Emma Rodriguez',
        email: 'emma@example.com',
        bio: 'Software engineer interested in civic tech',
        status: MemberStatus.ACTIVE,
      },
    }),
    prisma.member.create({
      data: {
        displayName: 'Frank Liu',
        email: 'frank@example.com',
        bio: 'Designer and creative facilitator',
        status: MemberStatus.ACTIVE,
      },
    }),
    prisma.member.create({
      data: {
        displayName: 'Grace Patel',
        email: 'grace@example.com',
        bio: 'Researcher studying collective intelligence',
        status: MemberStatus.ACTIVE,
      },
    }),
    prisma.member.create({
      data: {
        displayName: 'Henry Wong',
        email: 'henry@example.com',
        bio: 'Community builder and event organizer',
        status: MemberStatus.ACTIVE,
      },
    }),
  ]);

  console.log(`✅ Created ${members.length} members\n`);

  // ============================================================
  // COMMUNITY MEMBERSHIPS
  // ============================================================
  console.log('🤝 Creating community memberships...');

  await Promise.all([
    // Tech Collective members
    prisma.communityMember.create({
      data: { communityId: techCollective.id, memberId: members[0].id, role: MemberRole.ADMIN },
    }),
    prisma.communityMember.create({
      data: { communityId: techCollective.id, memberId: members[1].id, role: MemberRole.MEMBER },
    }),
    prisma.communityMember.create({
      data: { communityId: techCollective.id, memberId: members[4].id, role: MemberRole.MEMBER },
    }),
    prisma.communityMember.create({
      data: { communityId: techCollective.id, memberId: members[6].id, role: MemberRole.MODERATOR },
    }),

    // Wellness Circle members
    prisma.communityMember.create({
      data: { communityId: wellnessCircle.id, memberId: members[2].id, role: MemberRole.ADMIN },
    }),
    prisma.communityMember.create({
      data: { communityId: wellnessCircle.id, memberId: members[0].id, role: MemberRole.MEMBER },
    }),
    prisma.communityMember.create({
      data: { communityId: wellnessCircle.id, memberId: members[5].id, role: MemberRole.MEMBER },
    }),

    // Neighborhood Co-op members
    prisma.communityMember.create({
      data: { communityId: neighborhoodCoop.id, memberId: members[3].id, role: MemberRole.ADMIN },
    }),
    prisma.communityMember.create({
      data: { communityId: neighborhoodCoop.id, memberId: members[7].id, role: MemberRole.MODERATOR },
    }),
    prisma.communityMember.create({
      data: { communityId: neighborhoodCoop.id, memberId: members[1].id, role: MemberRole.MEMBER },
    }),
    prisma.communityMember.create({
      data: { communityId: neighborhoodCoop.id, memberId: members[4].id, role: MemberRole.MEMBER },
    }),
  ]);

  console.log('✅ Created community memberships\n');

  // ============================================================
  // PROPOSAL TEMPLATES
  // ============================================================
  console.log('📝 Creating proposal templates...');

  const templates = await Promise.all([
    prisma.proposalTemplate.create({
      data: {
        communityId: techCollective.id,
        key: 'tech-initiative',
        name: 'Tech Initiative Proposal',
        descriptionMarkdown: 'Template for proposing new technical initiatives',
        templateMarkdown: `## Initiative Title
[Clear, concise title]

## Problem Statement
What problem are we solving?

## Proposed Solution
How will this initiative address the problem?

## Expected Impact
- Who benefits?
- What changes?
- How do we measure success?

## Resources Needed
- Time commitment
- Skills required
- Budget (if any)`,
        defaultTagsJson: JSON.stringify(['tech', 'initiative']),
        isPublic: true,
      },
    }),
    prisma.proposalTemplate.create({
      data: {
        communityId: wellnessCircle.id,
        key: 'wellness-practice',
        name: 'Wellness Practice Proposal',
        descriptionMarkdown: 'Template for proposing new wellness practices',
        templateMarkdown: `## Practice Name
[Name of the practice]

## Description
What is this practice about?

## Benefits
- Physical benefits
- Mental/emotional benefits
- Community benefits

## How to Participate
Step-by-step guide for participation`,
        defaultTagsJson: JSON.stringify(['wellness', 'practice']),
        isPublic: true,
      },
    }),
  ]);

  console.log(`✅ Created ${templates.length} proposal templates\n`);

  // ============================================================
  // INTENTION CYCLES
  // ============================================================
  console.log('🔄 Creating intention cycles...');

  const techCycle = await prisma.intentionCycle.create({
    data: {
      communityId: techCollective.id,
      key: 'tech-q1-2026',
      title: 'Q1 2026: Tech Collective Focus',
      descriptionMarkdown: `What should be our technical focus for the first quarter of 2026?

This cycle will determine our collective priority for building tools and systems that serve community wellbeing.`,
      periodStart: new Date('2026-01-01'),
      periodEnd: new Date('2026-03-31'),
      status: CycleStatus.OPEN_FOR_VOTING,
      proposalWindowOpen: false,
      votingWindowOpen: true,
      createdBy: members[0].id,
    },
  });

  const wellnessCycle = await prisma.intentionCycle.create({
    data: {
      communityId: wellnessCircle.id,
      key: 'wellness-dec-2025',
      title: 'December 2025: Year-End Wellness',
      descriptionMarkdown: `How should we close out 2025 with intention and care?

Vote on practices and themes that will guide our community's wellness journey through the holiday season.`,
      periodStart: new Date('2025-12-01'),
      periodEnd: new Date('2025-12-31'),
      status: CycleStatus.OPEN_FOR_VOTING,
      proposalWindowOpen: false,
      votingWindowOpen: true,
      createdBy: members[2].id,
    },
  });

  const coopCycle = await prisma.intentionCycle.create({
    data: {
      communityId: neighborhoodCoop.id,
      key: 'coop-winter-2026',
      title: 'Winter 2026: Mutual Aid Priorities',
      descriptionMarkdown: `What should our neighborhood prioritize for mutual aid this winter?

Select the initiative that will have the most impact on our local community.`,
      periodStart: new Date('2025-12-15'),
      periodEnd: new Date('2026-02-28'),
      status: CycleStatus.OPEN_FOR_PROPOSALS,
      proposalWindowOpen: true,
      votingWindowOpen: false,
      createdBy: members[3].id,
    },
  });

  console.log(`✅ Created ${3} intention cycles\n`);

  // ============================================================
  // PROPOSALS
  // ============================================================
  console.log('💡 Creating proposals...');

  // Tech Collective proposals
  const techProposals = await Promise.all([
    prisma.intentionProposal.create({
      data: {
        cycleId: techCycle.id,
        proposerId: members[0].id,
        title: 'Build Open-Source Coordination Tools',
        bodyMarkdown: `Let's focus Q1 on building coordination tools that help communities organize without corporate platforms.

**Why this matters:**
- Communities need privacy-respecting tools
- Current platforms extract value from community data
- We have the skills to build better alternatives

**What we'll build:**
- Secure messaging for community organizing
- Event coordination without surveillance
- Resource sharing platform

**Expected impact:**
- 5+ communities can organize independently
- Privacy-first alternative to corporate tools`,
        tagsJson: JSON.stringify(['open-source', 'privacy', 'tools']),
        status: ProposalStatus.PUBLISHED,
      },
    }),
    prisma.intentionProposal.create({
      data: {
        cycleId: techCycle.id,
        proposerId: members[4].id,
        title: 'AI for Community Facilitation',
        bodyMarkdown: `Explore AI tools that can help facilitate better community conversations and decision-making.

**Vision:**
- AI that summarizes community sentiment
- Tools that surface diverse perspectives
- Technology that supports human connection

**Deliverables:**
- Prototype conversation facilitation tool
- Research on AI ethics in community contexts
- Open-source toolkit for others`,
        tagsJson: JSON.stringify(['ai', 'facilitation', 'research']),
        status: ProposalStatus.PUBLISHED,
      },
    }),
    prisma.intentionProposal.create({
      data: {
        cycleId: techCycle.id,
        proposerId: members[6].id,
        title: 'Community Data Commons',
        bodyMarkdown: `Create infrastructure for communities to own and govern their own data.

**Core idea:**
- Communities generate valuable data
- That data should belong to the community
- We need tech that makes this possible

**Q1 goals:**
- Design community data governance models
- Build proof-of-concept infrastructure
- Partner with 3 communities to test`,
        tagsJson: JSON.stringify(['data', 'governance', 'commons']),
        status: ProposalStatus.PUBLISHED,
      },
    }),
  ]);

  // Wellness Circle proposals
  const wellnessProposals = await Promise.all([
    prisma.intentionProposal.create({
      data: {
        cycleId: wellnessCycle.id,
        proposerId: members[2].id,
        title: 'Daily Gratitude Circles',
        bodyMarkdown: `Gather each evening in December to share gratitude and close out the year with appreciation.

**Practice:**
- 20-minute daily circles
- Each person shares one gratitude
- Silent meditation to close

**Benefits:**
- Builds daily connection
- Cultivates appreciation
- Creates ritual closure for 2025`,
        tagsJson: JSON.stringify(['gratitude', 'ritual', 'connection']),
        status: ProposalStatus.PUBLISHED,
      },
    }),
    prisma.intentionProposal.create({
      data: {
        cycleId: wellnessCycle.id,
        proposerId: members[5].id,
        title: 'Winter Solstice Retreat',
        bodyMarkdown: `A 3-day retreat honoring the darkest time of year and setting intentions for the light's return.

**Program:**
- Nature walks and silence
- Creative expression workshops
- Community intention-setting
- Celebration ceremony

**Dates:** December 20-22, 2025`,
        tagsJson: JSON.stringify(['retreat', 'ritual', 'solstice']),
        status: ProposalStatus.PUBLISHED,
      },
    }),
    prisma.intentionProposal.create({
      data: {
        cycleId: wellnessCycle.id,
        proposerId: members[0].id,
        title: 'Rest & Integration Month',
        bodyMarkdown: `Make December a month of rest, integration, and gentle reflection rather than pushing forward.

**Theme:** "Less doing, more being"

**Practices:**
- Reduced meeting schedule
- Optional activities only
- Emphasis on rest and integration
- No new commitments

**Intention:** Honor the natural cycle of winter as a time to slow down.`,
        tagsJson: JSON.stringify(['rest', 'integration', 'slowness']),
        status: ProposalStatus.PUBLISHED,
      },
    }),
  ]);

  // Neighborhood Co-op proposals (accepting new proposals)
  const coopProposals = await Promise.all([
    prisma.intentionProposal.create({
      data: {
        cycleId: coopCycle.id,
        proposerId: members[3].id,
        title: 'Winter Warming Centers',
        bodyMarkdown: `Establish warming centers in our neighborhood for those experiencing housing insecurity.

**Plan:**
- 3 locations open 24/7
- Hot meals twice daily
- Volunteers in 4-hour shifts

**Resources needed:**
- 3 venue partners
- 50+ volunteers
- Food donations`,
        tagsJson: JSON.stringify(['housing', 'mutual-aid', 'urgent']),
        status: ProposalStatus.PUBLISHED,
      },
    }),
  ]);

  console.log(`✅ Created ${techProposals.length + wellnessProposals.length + coopProposals.length} proposals\n`);

  // ============================================================
  // VOTES
  // ============================================================
  console.log('🗳️  Creating votes...');

  await Promise.all([
    // Votes for Tech Collective proposals
    prisma.intentionVote.create({
      data: {
        proposalId: techProposals[0].id,
        voterId: members[1].id,
        weightScore: 5,
        resonanceTagJson: JSON.stringify(['inspiring', 'practical']),
      },
    }),
    prisma.intentionVote.create({
      data: {
        proposalId: techProposals[0].id,
        voterId: members[4].id,
        weightScore: 4,
        resonanceTagJson: JSON.stringify(['timely', 'bold']),
      },
    }),
    prisma.intentionVote.create({
      data: {
        proposalId: techProposals[0].id,
        voterId: members[6].id,
        weightScore: 5,
        resonanceTagJson: JSON.stringify(['transformative']),
      },
    }),

    prisma.intentionVote.create({
      data: {
        proposalId: techProposals[1].id,
        voterId: members[0].id,
        weightScore: 3,
        resonanceTagJson: JSON.stringify(['interesting']),
      },
    }),
    prisma.intentionVote.create({
      data: {
        proposalId: techProposals[1].id,
        voterId: members[6].id,
        weightScore: 4,
        resonanceTagJson: JSON.stringify(['innovative', 'timely']),
      },
    }),

    prisma.intentionVote.create({
      data: {
        proposalId: techProposals[2].id,
        voterId: members[1].id,
        weightScore: 4,
        resonanceTagJson: JSON.stringify(['bold', 'grounded']),
      },
    }),

    // Votes for Wellness Circle proposals
    prisma.intentionVote.create({
      data: {
        proposalId: wellnessProposals[0].id,
        voterId: members[0].id,
        weightScore: 5,
        resonanceTagJson: JSON.stringify(['grounded', 'practical']),
      },
    }),
    prisma.intentionVote.create({
      data: {
        proposalId: wellnessProposals[0].id,
        voterId: members[5].id,
        weightScore: 5,
        resonanceTagJson: JSON.stringify(['inspiring']),
      },
    }),

    prisma.intentionVote.create({
      data: {
        proposalId: wellnessProposals[1].id,
        voterId: members[2].id,
        weightScore: 4,
        resonanceTagJson: JSON.stringify(['transformative', 'bold']),
      },
    }),
    prisma.intentionVote.create({
      data: {
        proposalId: wellnessProposals[1].id,
        voterId: members[0].id,
        weightScore: 3,
        resonanceTagJson: JSON.stringify(['interesting']),
      },
    }),

    prisma.intentionVote.create({
      data: {
        proposalId: wellnessProposals[2].id,
        voterId: members[2].id,
        weightScore: 5,
        resonanceTagJson: JSON.stringify(['timely', 'grounded']),
      },
    }),
    prisma.intentionVote.create({
      data: {
        proposalId: wellnessProposals[2].id,
        voterId: members[5].id,
        weightScore: 4,
        resonanceTagJson: JSON.stringify(['practical']),
      },
    }),
  ]);

  console.log('✅ Created votes\n');

  // ============================================================
  // COMMENTS
  // ============================================================
  console.log('💬 Creating comments...');

  const comment1 = await prisma.comment.create({
    data: {
      proposalId: techProposals[0].id,
      authorId: members[1].id,
      content: 'This is exactly what we need! I\'d love to help with the messaging component.',
    },
  });

  await prisma.comment.create({
    data: {
      proposalId: techProposals[0].id,
      authorId: members[0].id,
      parentId: comment1.id,
      content: 'Amazing! Let\'s connect after the vote to plan next steps.',
    },
  });

  await prisma.comment.create({
    data: {
      proposalId: wellnessProposals[0].id,
      authorId: members[5].id,
      content: 'I love the simplicity of this practice. Daily consistency is so powerful.',
    },
  });

  await prisma.comment.create({
    data: {
      proposalId: wellnessProposals[2].id,
      authorId: members[0].id,
      content: 'Yes! We need to honor the natural rhythm of rest. This resonates deeply.',
    },
  });

  console.log('✅ Created comments\n');

  // ============================================================
  // SUMMARY
  // ============================================================
  console.log('\n🎉 Seed completed successfully!\n');
  console.log('📊 Summary:');
  console.log(`   - ${3} communities`);
  console.log(`   - ${members.length} members`);
  console.log(`   - ${3} intention cycles`);
  console.log(`   - ${techProposals.length + wellnessProposals.length + coopProposals.length} proposals`);
  console.log(`   - ${12} votes`);
  console.log(`   - ${4} comments`);
  console.log(`   - ${templates.length} proposal templates\n`);

  console.log('💡 Next steps:');
  console.log('   1. Start dev server: npm run dev');
  console.log('   2. Visit http://localhost:3000');
  console.log('   3. Explore the communities and vote on proposals!\n');

  console.log('🔑 Key URLs:');
  console.log(`   - Tech Collective cycle: /cycles/${techCycle.id}`);
  console.log(`   - Wellness Circle cycle: /cycles/${wellnessCycle.id}`);
  console.log(`   - Neighborhood Co-op cycle: /cycles/${coopCycle.id}`);
  console.log('   - Admin Dashboard: /admin\n');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
