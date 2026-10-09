import React from 'react';
import { motion } from 'framer-motion';
import { Clock, Tag, ArrowLeft, Share2, BookOpen } from 'lucide-react';
import { Link, useParams } from '@tanstack/react-router';

interface ArticleData {
  slug: string;
  category: string;
  title: string;
  excerpt: string;
  readTime: string;
  publishedAt: string;
  tags: string[];
  content: string[];
}

const ARTICLES: ArticleData[] = [
  {
    slug: 'how-to-write-a-matrimony-profile',
    category: 'Profile Tips',
    title: 'How to Write a Matrimony Profile That Gets Responses',
    excerpt: "Your matrimony profile is the first impression you make. Here's a step-by-step guide to writing an honest, compelling profile that attracts compatible matches.",
    readTime: '5 min',
    publishedAt: '10 Nov 2024',
    tags: ['Profile', 'Tips', 'Getting Started'],
    content: [
      "Your matrimony profile does more work than you might think. In a sea of thousands of profiles, it has to communicate who you are, what you value, and what kind of partnership you're looking for in the time it takes someone to scroll past. Getting it right matters.",
      "**Start with a complete profile, not a perfect one.** Profiles with 100% completion receive 4x more connection requests than incomplete ones. Fill every section, even the ones that feel awkward. If you're unsure what to write in the 'about me' section, describe a typical Sunday how you spend your time off tells a prospective match more than a list of adjectives.",
      "**Photos are non-negotiable.** A clear, recent photo (taken in the last 12 months) showing your face is the single biggest predictor of response rate. Use natural lighting. Avoid sunglasses, group photos as the primary image, and heavy filters. For women: one traditional and one candid works well. For men: include one in professional attire and one more relaxed.",
      "**Be specific in your 'about me.'** Don't write 'I am a fun-loving person who loves to travel and spend time with family.' Everyone writes that. Write the specific the books you've read recently, the city you want to explore next, what you cook when you have time, what your relationship with your parents is actually like. Specificity creates connection.",
      "**State your values, not just your demographics.** Your height, weight, and complexion are listed in the basic info. Your 'about me' section is for what you believe in about marriage, family, faith, careers, and how you want to live. People connect with values, not statistics.",
      "**Be honest about deal-breakers in your partner preferences.** If you absolutely cannot relocate cities, say so. If faith is non-negotiable, write it. Being vague to 'keep options open' wastes everyone's time, including yours. The right match will appreciate your clarity.",
      "**Update your profile every 3 months.** Active profiles (recently edited) rank higher in search results. Even a small update a new photo, a revised line in your bio signals that you're actively looking and keeps your profile visible.",
      "Finally, before you hit save: read your profile aloud. If it sounds stiff or scripted, rewrite it. The best profiles read like how you'd actually introduce yourself to someone interesting at a dinner party.",
    ],
  },
  {
    slug: 'understanding-gun-milan-kundli-matching',
    category: 'Astrology',
    title: 'Gun Milan Explained: What a High Kundli Score Actually Means',
    excerpt: "Many families put great weight on the Ashta Koota score, but what does a 28/36 really tell you? A certified astrologer explains each Koota and its real significance.",
    readTime: '8 min',
    publishedAt: '3 Nov 2024',
    tags: ['Astrology', 'Kundli', 'Compatibility'],
    content: [
      "Gun Milan or Ashta Koota matching is one of the oldest systems for assessing marriage compatibility in Vedic astrology. Developed over centuries, it compares the birth charts of two individuals across eight dimensions (Kootas) with a maximum total score of 36 points. A score of 18 or above is generally considered acceptable; 24+ is considered good; 32+ is considered exceptional.",
      "But what does it actually measure? And how much weight should you give it?",
      "**The Eight Kootas, explained:**",
      "1. **Varna (1 point)** Assesses spiritual compatibility and ego compatibility. Based on the division of moon signs into four varnas (Brahmin, Kshatriya, Vaishya, Shudra). The groom's varna must equal or exceed the bride's for full marks. Critics note this koota encodes caste hierarchy and many contemporary astrologers deprioritise it.",
      "2. **Vasya (2 points)** Reflects mutual attraction and influence in the relationship. Based on the classification of moon signs into animal archetypes (manav/human, vanchar/wild, chatushpad/four-legged, jalchar/water). Some pairings get 2, some 1, some 0.",
      "3. **Tara (3 points)** Literally 'star' assesses health and wellbeing compatibility. Calculated by counting from the bride's nakshatra to the groom's and dividing by 9. An even result is auspicious; odd is inauspicious. Three types of Tara are checked for each partner.",
      "4. **Yoni (4 points)** Tests physical and intimate compatibility. Each nakshatra belongs to an animal symbol (yoni). Some yoni pairings are hostile, some are friendly, some neutral. This Koota reflects temperamental and physical chemistry.",
      "5. **Graha Maitri (5 points)** Perhaps the most psychologically meaningful Koota. It assesses the compatibility of the ruling planets (lords) of both moon signs. Friendly planet lords = easy mental alignment, shared communication styles, natural understanding. This is the Koota modern psychologists find most analogous to personality compatibility research.",
      "6. **Gana (6 points)** Each nakshatra belongs to one of three Ganas: Deva (divine), Manushya (human), Rakshasa (demonic). These roughly describe temperament Deva is giving and spiritual, Manushya is balanced and practical, Rakshasa is independent and intense. Deva-Deva is ideal; Deva-Rakshasa is considered challenging.",
      "7. **Bhakoot (7 points)** The second most important Koota. Reflects prosperity, family harmony, and longevity. Calculated by the relative position of moon signs. Certain combinations (6-8, 5-9, 12-2) are considered inauspicious and astrologers often flag these even if the total score is high.",
      "8. **Nadi (8 points)** The most important Koota, worth the most points. Divided into Adi, Madhya, and Antya derived from Nakshatra. If both partners share the same Nadi, the Nadi Dosha applies, which is considered very inauspicious, particularly affecting health and progeny. A score of 0 in Nadi is the most serious flag in Gun Milan.",
      "**What a high score actually means:** A 30/36 score means the couple aligns strongly across multiple dimensions of the traditional compatibility system. It is encouraging. But it is not a guarantee. Gun Milan does not account for economic compatibility, mutual respect, communication quality, shared life goals, or individual values all of which research shows are stronger predictors of marital success than astrological scores.",
      "**Use it as one lens, not the only one.** The wisest approach: take Nadi and Bhakoot seriously (zero in either is worth discussing with a trusted astrologer), and use the overall score as a cultural reference point rather than a pass/fail gate. A couple with 20/36 but exceptional communication will almost always fare better than one with 32/36 and unresolved value differences.",
    ],
  },
  {
    slug: 'first-meeting-tips-matrimony',
    category: 'Relationship',
    title: '10 Things to Discuss at Your First Meeting (That Most People Skip)',
    excerpt: "The first face-to-face meeting after online connection is crucial. Go beyond family background these questions reveal genuine compatibility before you get too emotionally invested.",
    readTime: '6 min',
    publishedAt: '28 Oct 2024',
    tags: ['Meeting', 'Relationship', 'Compatibility'],
    content: [
      "The first in-person meeting in arranged-marriage courtship carries an unusual weight. Both families may have already approved. The profiles matched. The astrology checked out. Now it's your turn to figure out whether this person feels right to spend your life with often in a 1–2 hour meeting, sometimes with family nearby.",
      "Most people stick to safe topics: job, family, hobbies, travel. These aren't wrong but they rarely reveal the things that actually determine long-term compatibility. Here are ten things worth bringing into conversation, gently and naturally:",
      "**1. How do you describe a typical weekday evening?** This reveals habits whether they come home and decompress quietly, whether they go to the gym, whether they spend evenings with parents, whether they work late. You're not judging the answer; you're checking if your rhythms are compatible.",
      "**2. What does your relationship with your parents actually look like?** Not 'are you close to your parents' (everyone says yes) but: do you speak daily? Do they have input in your decisions? Would they live with you after marriage? The specifics here prevent enormous surprises post-marriage.",
      "**3. What would need to be true for you to feel like this marriage is working?** This is a more honest version of 'what are you looking for in a partner.' The answer reveals expectations they might not even be consciously aware of.",
      "**4. Are you open to relocating?** Many couples discover a deal-breaker here only after emotional investment. Career, city, country clarify early.",
      "**5. What does money management look like for you?** Not income (that's on the profile). But: Do you save or spend? Do you have financial goals? Do you expect combined finances or separate? Is supporting extended family part of your budget? Financial misalignment is one of the top causes of marital conflict.",
      "**6. Do you want children, and when?** Assumed, rarely discussed early. If your timelines or intentions differ (or one of you is ambivalent), this matters enormously.",
      "**7. What does your social life look like?** Some people need regular gatherings with large friend groups; others are deeply private. Neither is wrong but a highly social person and a strongly introverted one will have ongoing friction around this.",
      "**8. What role does faith play in your daily life?** Regular temple/mosque/church visits vs. occasional vs. non-religious and expectations around how the home will observe festivals, prayer, dietary rules, children's upbringing.",
      "**9. What was a difficult time in your life, and how did you handle it?** You're not asking for trauma disclosure. You're watching how they talk about adversity with self-awareness, with blame, with humour, with avoidance. This is character.",
      "**10. What are you most nervous about in marriage?** This one takes courage to ask and to answer. But it cuts through the performance and shows whether this person can be honest about vulnerability. That honesty is a very good sign.",
      "You don't need to get through all ten in one meeting. Pick three that feel relevant. The goal isn't to interview it's to have a real conversation. The questions are just starting points.",
    ],
  },
  {
    slug: 'nri-matrimony-challenges',
    category: 'NRI',
    title: 'NRI Matrimony: 7 Challenges and How to Navigate Them',
    excerpt: "Marrying someone settled abroad comes with unique challenges visa timelines, cultural adjustment, family distance. Couples who made it work share their advice.",
    readTime: '7 min',
    publishedAt: '20 Oct 2024',
    tags: ['NRI', 'Abroad', 'Planning'],
    content: [
      "An NRI match is attractive for many reasons financial stability, exposure to a different world, a shared Indian identity maintained across distance. But it comes with real challenges that families often underestimate. Here are seven of the most common, and how couples who've navigated them successfully approached each.",
      "**1. Time zone barriers in the courtship phase.** When one of you is in Hyderabad and the other in Houston, a 10.5-hour difference means the overlap for real-time conversation is limited. Successful NRI couples build structure: a fixed call window they both protect, and voice notes/messages for smaller moments in between. Don't let the courtship happen entirely over text video calls with proper cameras matter for reading body language.",
      "**2. The visa and timeline uncertainty.** Visa processing, especially for partner visas (UK Spouse Visa, US CR-1, Australian Partner Visa) can take 6–18 months. Couples who handle this well discuss and plan the visa process before committing to a wedding date. Research the category, gather documents early, and if possible, consult an immigration lawyer. Don't let a surprise visa delay create relationship crisis.",
      "**3. Cultural drift between the NRI partner and Indian expectations.** Living abroad for years changes you food, social norms, relationship to religion, communication style, and attitude toward gender roles. This is neither good nor bad, but the gap between what the NRI partner expects in a marriage and what their Indian partner (and the family) expects is often larger than either anticipates. Have explicit conversations, not assumed ones.",
      "**4. The 'adjustment burden' falling on the partner who relocates.** In most NRI marriages, one partner moves. That person loses their career networks, friend circles, family proximity, and sometimes their own professional identity temporarily. The partner who stays in their established life often underestimates this cost. Plan concretely: What support will you provide? What timeline for the moving partner to rebuild their own professional and social life?",
      "**5. Family pressure from both sides.** Indian parents of the local partner often have a long wish-list for the match. NRI parents often have their own (sometimes Western-influenced, sometimes more conservative) expectations. The couple is caught between both sets of expectations, over WhatsApp, at distance. The best protection: get on the same page as a couple before engaging with each family's expectations.",
      "**6. The visit-based courtship creating a misleading impression.** When you meet in person only 2–3 times during the engagement, you meet each other at your best rested, prepared, on holiday mode. Daily life abroad looks different. The partner visiting India is also not in their natural habitat. Be deliberate about spending at least some time together in ordinary, non-special contexts.",
      "**7. Financial and property decision complexity.** NRI marriages often involve cross-border financial decisions: property purchase in India, joint accounts across currencies, tax obligations in two countries, and estate planning. These are solvable but need a financial advisor who understands both jurisdictions. Don't ignore this until after the wedding.",
    ],
  },
  {
    slug: 'inter-caste-marriage-family-acceptance',
    category: 'Relationship',
    title: 'Inter-Caste Marriages: Getting Family Acceptance Without Conflict',
    excerpt: "More Indian couples are choosing partners across caste lines. Three couples who did it successfully share how they brought their families onboard.",
    readTime: '9 min',
    publishedAt: '14 Oct 2024',
    tags: ['Inter-caste', 'Family', 'Modern India'],
    content: [
      "Inter-caste marriages in India have increased significantly over the last two decades, particularly in urban areas and among college-educated young adults. Yet for most families, they still require careful navigation. The families who successfully accept and eventually embrace inter-caste matches tend to follow certain patterns. Three couples share theirs.",
      "**Ranjith & Madhuri (Andhra Pradesh):** Ranjith is from a Kamma family; Madhuri from a Reddy background both upper-caste communities but traditionally separate. 'We knew both families would resist because of community loyalty, not actual objections to each other,' says Ranjith. Their approach: they waited until they were both financially independent and had been in a relationship long enough to be certain before approaching families. 'We gave our parents information, not ultimatums. We explained who the other person was their education, their character, their family's values before we mentioned the caste difference.'",
      "**What worked:** They arranged a 'casual meeting' between both sets of parents before calling it a marriage proposal. 'Once our mothers met and spent two hours talking, a lot of the abstract resistance dissolved. The objection was to a category; the acceptance was to a person.'",
      "**Arjun & Fatima (Bangalore):** A Hindu-Muslim interfaith and inter-community match one of the harder conversations in contemporary India. Arjun is from a moderate Tamil Brahmin family; Fatima's family is Hyderabadi Muslim. 'We both knew this would take time,' says Fatima. 'We gave it time. We didn't ask for permission immediately we built relationships between the families slowly, over two years, before we made the formal proposal.'",
      "**What worked:** Both families had individually vetted the other on character, education, and family values long before the 'religion conversation' came to the surface. By then, they already knew the answer to the question that mattered most: 'Are these good people?' Arjun's family held a traditional ceremony; Fatima's a nikah both were private affairs within each family's tradition, followed by a shared reception.",
      "**Priya & Shashank (Pune):** A scheduled caste - forward caste match. This is statistically the rarest and most resistant combination in India. 'My parents weren't against Shashank personally they had never met anyone from a forward caste family. Their hesitation was social: what will people say, how will the family treat me,' says Priya. Shashank's family's initial resistance was different concern about 'status.'",
      "**What worked:** They brought in a mediator an elder aunt in Shashank's family who had known Priya's parents for years through work. The mediation was about values and character first. 'She didn't defend the match. She just kept asking: what is it you actually object to? And the answer kept coming back to what other people would think not anything about Priya herself.'",
      "**Patterns across all three couples:** The matches that succeed in winning family acceptance share a few common approaches: the couple was certain and united before engaging families; they gave the information-not-ultimatum framing ('here's who this person is, here's why we want to marry'); they leveraged existing relationships and trusted intermediaries where possible; they were patient with a timeline measured in months, not weeks; and they kept the conversation going not a single high-stakes confrontation but a series of smaller conversations.",
    ],
  },
  {
    slug: 'red-flags-matrimony-profiles',
    category: 'Safety',
    title: '8 Red Flags in Matrimony Profiles You Should Never Ignore',
    excerpt: "Vague income claims, no family photo, reluctance to video call learn to spot the patterns that suggest a profile may not be authentic.",
    readTime: '4 min',
    publishedAt: '7 Oct 2024',
    tags: ['Safety', 'Verification', 'Tips'],
    content: [
      "The vast majority of profiles on Avyuktha are genuine people looking for genuine connections. But in any large matrimony platform, some profiles are created with misleading information or fraudulent intent. Knowing what to watch for protects you.",
      "**1. Photos that look professionally shot for every frame.** Real people have a mix of candid and posed photos. If every image looks like a modeling portfolio with consistent studio lighting, the photos may have been borrowed from social media or a model's portfolio. Reverse image search profile photos if something feels off.",
      "**2. Income claims that don't match the job title or city.** A 'junior software developer in Tier-2 city' listing ₹25 LPA is an inconsistency worth questioning. Not everyone misrepresents income maliciously (some people confuse CTC with take-home) but it's worth clarifying before emotional investment.",
      "**3. Reluctance or excuses to video call.** There is no legitimate reason in 2024 why someone cannot do a brief video call if they're interested in marriage. If they've been messaging for weeks but consistently avoid video, either the profile photos don't match reality or the person behind the profile is not who they claim to be.",
      "**4. Urgency or pressure to move faster than is comfortable.** Phrases like 'my parents are finalising another match this week' or 'if you don't decide by Sunday I'll move on' are pressure tactics. Genuine matrimony prospects do not give arbitrary deadlines. Slow down when someone tries to speed you up.",
      "**5. Inconsistencies in their story across conversations.** People who are fabricating details about their life, job, family, or location will contradict themselves. Note what they've told you the city they live in, the company they work at, the number of siblings, the parents' occupations. If the story shifts, that's a signal.",
      "**6. Requests for money, gift cards, or financial help.** Any request for money however sympathetically framed from someone you've never met in person on a matrimony platform is fraud. Emergency, medical, travel costs do not send money.",
      "**7. A profile that is very new with no completed verification and unusually attractive photos.** New accounts with zero verification and model-quality photos warrant extra caution. Legitimate profiles build up naturally over time.",
      "**8. Evasiveness about meeting family or video calling with parents.** In Indian matrimony, family involvement is normal and expected. Someone who has been 'interested for months' but has persistent reasons why you cannot speak to or meet even one family member is hiding something.",
      "When in doubt, use Avyuktha's reporting tool. Our Trust & Safety team investigates all reports within 24 hours. You can also request background verification on a specific profile (Platinum+ feature) for additional assurance.",
    ],
  },
  {
    slug: 'telugu-wedding-traditions',
    category: 'Culture',
    title: 'A Complete Guide to Telugu Wedding Traditions and Rituals',
    excerpt: "From Pellikoduku to Saptapadi a detailed walkthrough of every ritual in a traditional Telugu Hindu wedding and what each ceremony symbolises.",
    readTime: '11 min',
    publishedAt: '30 Sep 2024',
    tags: ['Telugu', 'Wedding', 'Culture', 'Traditions'],
    content: [
      "A traditional Telugu Hindu wedding is one of the most elaborate and symbolically rich in South Asia. Spanning two to three days, it involves pre-wedding ceremonies, the main muhurtham event, and post-wedding rituals each with deep meaning in Vedic tradition. Here is a comprehensive guide to the key rituals, what they mean, and what to expect.",
      "**Pre-Wedding: Pellikoduku / Pellikuturu (Groomsmen / Bridesmen Ceremony)**",
      "The day before the wedding, the groom and bride each undergo separate ceremonies at their respective homes. The groom becomes 'Pellikoduku' (wedding son) and the bride becomes 'Pellikuturu' (wedding daughter). Both are anointed with turmeric paste by family women the yellow turmeric both purifies and glows, traditionally believed to enhance complexion for the wedding day.",
      "**Madhuparkam (Welcome of the Groom)**",
      "The groom arrives at the wedding venue and is formally welcomed by the bride's father with Madhuparkam a mixture of yogurt, honey, ghee, and sugar offered in a silver or brass vessel. It symbolises the respectful reception of the son-in-law into the family. The groom drinks a small amount and the remainder is offered in the havan (sacred fire).",
      "**Jeelakarra Bellam (The Cumin and Jaggery Ceremony)**",
      "This is one of the most visually distinctive rituals of a Telugu wedding. Both bride and groom are seated facing each other, separated by a curtain held between them. At the auspicious muhurtham moment, the curtain drops and they simultaneously place a paste of cumin (jeelakarra) and jaggery (bellam) on each other's heads. Jeelakarra symbolises life; bellam symbolises sweetness together, a sweet life. This is the formal moment of marriage completion in Telugu tradition.",
      "**Talambralu (The Showering of Rice)**",
      "Immediately after Jeelakarra Bellam, the couple shower each other with talambralu a mixture of rice, flowers, and turmeric three times. This is accompanied by music and the excited participation of the entire wedding hall. It symbolises prosperity, fertility, and the blessing of the couple by all those present.",
      "**Saptapadi (The Seven Steps)**",
      "The couple takes seven steps around the sacred fire (havan), each step accompanied by a Sanskrit vow: sustenance, strength, prosperity, happiness, progeny, long life, and friendship. The seven steps (saptapadi) are the Vedic core of the Hindu marriage ceremony and are legally constitutive of the marriage under Hindu Marriage Act 1955. After the seventh step, the couple is considered married.",
      "**Kanyadaanam (The Giving Away of the Bride)**",
      "The bride's father places her hand in the groom's hand (hastharekha) while the priest recites Vedic mantras. Water is poured over their joined hands to seal the act of Kanyadaanam the gift of the daughter. This is one of the most emotionally significant moments of a Telugu wedding for both families.",
      "**Sindhooram (The Vermillion Application)**",
      "After Saptapadi, the groom applies vermillion (sindoor) to the bride's hair parting. In Telugu tradition, this may be applied before a mirror or with the priest present. The sindoor is the outward symbol of a married woman in Hindu culture and holds deep significance for the bride and her family.",
      "**Mangalasnanam (Auspicious Bath on Day 2)**",
      "The morning after the wedding, the couple undergoes Mangalasnanam a ritual bath together (in practice, separate, supervised by their respective families). This formally transitions them from their pre-marriage state to married life. It is followed by family meals and the Grhapravesham the bride's entry into her new home.",
      "**Grhapravesham (Entry into the New Home)**",
      "The bride arrives at the groom's home and is welcomed by the mother-in-law with the traditional aarthi. She pushes a small vessel of rice over the threshold with her right foot symbolising the entry of Lakshmi (prosperity) into the home. She then places her footprints in red alta (dye) on the floor marking her as part of the household.",
    ],
  },
  {
    slug: 'managing-family-pressure-marriage',
    category: 'Mental Health',
    title: 'How to Manage Family Pressure Around Marriage Without Losing Yourself',
    excerpt: "When parents are anxious, conversations become arguments. A counsellor shares communication strategies that help bridge the gap between what families want and what you need.",
    readTime: '7 min',
    publishedAt: '22 Sep 2024',
    tags: ['Mental Health', 'Family', 'Communication'],
    content: [
      "The pressure to marry and to marry by a certain age, within a certain community, meeting a particular set of criteria is one of the most common sources of anxiety for young adults in India. For many, it shapes the most stressful years of their late twenties. Managing it without damaging family relationships requires a mix of internal clarity and deliberate communication strategy.",
      "**Understand what the pressure is actually about.** Parents who pressure you about marriage are not (usually) trying to make you unhappy. They're anxious about your wellbeing, about social comparison, about what happens if you 'miss your window,' about their own sense of completion as parents. When you understand that the pressure comes from anxiety and love (in a distorted form), it becomes easier to respond without reacting.",
      "**Don't argue about timelines in the abstract.** 'Why aren't you married yet?' is not a real question it's an expression of anxiety. Trying to win the argument ('I'm still young,' 'It's my life') escalates without resolving. Instead, redirect to the concrete: 'I'm actively looking. Here's what I've been doing. Here's what would help me.' Specificity disarms generalised worry better than any rebuttal.",
      "**Set a boundary around the mode of pressure, not the topic.** There is a difference between 'I don't want to talk about marriage' and 'I'm happy to talk about this, but not at every meal and not in front of relatives.' The first shuts the conversation; the second sets a structure that respects your need for space while keeping the relationship open.",
      "**Give parents a role if it helps them.** Many parents escalate pressure because they feel helpless they want to help but don't know how. If you're comfortable with it, giving them a specific, bounded role (reviewing profiles, sharing shortlists) can channel their energy productively and reduce the ambient pressure.",
      "**Be honest with yourself first.** Sometimes the difficulty is not the parental pressure but internal ambivalence you're not sure what you want, the options available feel insufficient, you're working through your own fears about commitment. Family pressure makes this harder to see clearly. Therapy or journalling around the question 'what do I actually want my life to look like in 5 years?' before addressing family conversations often helps.",
      "**If the pressure becomes coercive, name it.** There is a difference between pressure and coercion. If there are threats withdrawal of financial support, arranged marriage without your meaningful input, social isolation these are not 'family pressure' in the ordinary sense. Name it clearly to someone you trust. Support is available.",
      "Finally, a reframe that many find useful: family pressure about marriage is often love translated poorly by people with limited tools. The response is not to shut it out entirely but to slowly, patiently help your family learn a better language for that love. It takes time. It is worth it.",
    ],
  },
  {
    slug: 'background-verification-matrimony',
    category: 'Safety',
    title: "Why Background Verification Matters in Matrimony (And How It Works)",
    excerpt: "In an era of curated profiles, how do you know what's real? We explain the layers of verification on Avyuktha and why some checks matter more than others.",
    readTime: '5 min',
    publishedAt: '15 Sep 2024',
    tags: ['Safety', 'Verification', 'Trust'],
    content: [
      "The information people put on matrimony profiles is largely self-reported. Education, income, employment, family background these are typed in by the user. Most of it is accurate. Some of it is exaggerated. A small fraction is fabricated. Background verification exists to distinguish between the three.",
      "**What Avyuktha's verification system checks:**",
      "**Identity verification (Aadhaar-based):** Name, date of birth, and photo matched against Aadhaar records via secure API. This is the baseline check it confirms you're speaking to a real person whose identity documents match their stated identity. Verified profiles show a blue Identity badge.",
      "**Employment verification:** A letter from HR or an official company email used to register, cross-referenced with known employer domains. For high-value employers (listed companies, government departments), this is done via third-party databases. Prevents fabricated job titles and employer names.",
      "**Income verification:** Based on PAN-linked IT return data (Form 26AS summary) or salary slips. Income claims within 15% of verified income display an Income Verified badge. Significant discrepancies flag the profile for review.",
      "**Education verification:** Degree certificates or transcripts cross-checked via manual review or, for select institutions, digital verification APIs. Prevents the common practice of upgrading a diploma to a degree or claiming an unstated qualification.",
      "**Face verification:** A real-time selfie matched against submitted profile photos using facial recognition. Confirms the profile photos are of the person behind the account, and that the person is live (not using a static photo).",
      "**Why this matters in practice:** The research on matrimony fraud shows that most misrepresentation happens in income (overstated by 20–40%), employment (job title inflated), and marital status (previously married not disclosed). Verification doesn't guarantee honesty in all dimensions it cannot verify personality, intentions, or family background claims. But it significantly raises the cost of fabrication and creates accountability.",
      "**What to do if you suspect misrepresentation:** Raise a report on the profile. Our Trust & Safety team reviews within 24 hours. For Platinum and Elite subscribers, you can request a third-party background check on a specific profile (identity, address, and employment) conducted by a certified verification agency, with results delivered within 72 hours.",
    ],
  },
];

export const BlogArticlePage: React.FC = () => {
  const { slug } = useParams({ from: '/blogs/$slug' });
  const article = ARTICLES.find((a) => a.slug === slug);

  if (!article) {
    return (
      <div className="pt-28 pb-20 container max-w-3xl text-center">
        <div className="text-6xl mb-6">📄</div>
        <h1 className="font-display font-bold text-2xl mb-3">Article Not Found</h1>
        <p className="text-slate-500 mb-6">This article may have moved or been updated.</p>
        <Link to="/blogs" className="btn-luxury px-8 py-3 inline-flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" /> Back to Blog
        </Link>
      </div>
    );
  }

  const related = ARTICLES.filter((a) => a.slug !== slug && (a.category === article.category || a.tags.some((t) => article.tags.includes(t)))).slice(0, 3);

  return (
    <div className="bg-background">
      <div className="pt-28 pb-20">
        {/* Breadcrumb */}
        <div className="container max-w-4xl mb-8">
          <Link to="/blogs" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-foreground transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" /> Blog
          </Link>
          <span className="text-slate-500 mx-2">/</span>
          <span className="text-sm text-slate-500 line-clamp-1">{article.title}</span>
        </div>

        <div className="container max-w-4xl">
          <div className="grid lg:grid-cols-[1fr_260px] gap-10">
            {/* Article */}
            <article>
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
                {/* Category + meta */}
                <div className="flex items-center gap-3 flex-wrap mb-4">
                  <span className="text-xs font-semibold text-brand-700 bg-brand-50 px-3 py-1 rounded-full">{article.category}</span>
                  <span className="text-xs text-slate-500 flex items-center gap-1"><Clock className="w-3 h-3" />{article.readTime} read</span>
                  <span className="text-xs text-slate-500">{article.publishedAt}</span>
                </div>

                <h1 className="font-display font-bold text-3xl md:text-4xl leading-tight mb-5">
                  {article.title}
                </h1>

                <p className="text-lg text-slate-500 leading-relaxed mb-8 border-l-4 border-brand-300 pl-4">
                  {article.excerpt}
                </p>

                <div className="h-48 bg-gradient-to-br from-brand-100 to-violet-100 rounded-2xl flex items-center justify-center mb-10">
                  <BookOpen className="w-16 h-16 text-brand-300" />
                </div>

                {/* Content */}
                <div className="space-y-5 text-base text-foreground/90 leading-loose">
                  {article.content.map((para, i) => {
                    if (para.startsWith('**') && para.endsWith('**') && para.indexOf('**', 2) === para.length - 2) {
                      return (
                        <h3 key={i} className="font-display font-bold text-xl mt-8 mb-2">
                          {para.replace(/\*\*/g, '')}
                        </h3>
                      );
                    }
                    return (
                      <p key={i} className="leading-relaxed" dangerouslySetInnerHTML={{
                        __html: para.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                      }} />
                    );
                  })}
                </div>

                {/* Tags + Share */}
                <div className="mt-10 pt-8 border-t border-border flex items-center justify-between flex-wrap gap-4">
                  <div className="flex flex-wrap gap-2">
                    {article.tags.map((t) => (
                      <span key={t} className="text-xs flex items-center gap-1 text-slate-500 bg-muted px-3 py-1 rounded-full">
                        <Tag className="w-3 h-3" />{t}
                      </span>
                    ))}
                  </div>
                  <button
                    onClick={() => navigator.share?.({ title: article.title, url: window.location.href })}
                    className="flex items-center gap-2 text-sm text-slate-500 hover:text-foreground transition-colors"
                  >
                    <Share2 className="w-4 h-4" /> Share
                  </button>
                </div>
              </motion.div>
            </article>

            {/* Sidebar */}
            <aside className="space-y-6">
              <div className="sticky top-28">
                {related.length > 0 && (
                  <div className="bg-white rounded-2xl border border-border p-5">
                    <h4 className="font-display font-bold text-base mb-4">Related Articles</h4>
                    <div className="space-y-4">
                      {related.map((r) => (
                        <Link
                          key={r.slug}
                          to="/blogs/$slug"
                          params={{ slug: r.slug }}
                          className="block group"
                        >
                          <div className="text-xs text-slate-500 mb-1 flex items-center gap-1"><Clock className="w-3 h-3" />{r.readTime}</div>
                          <p className="text-sm font-semibold leading-snug group-hover:text-brand-700 transition-colors line-clamp-2">{r.title}</p>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                <div className="bg-brand-600 rounded-2xl p-5 text-white mt-6">
                  <h4 className="font-display font-bold text-base mb-2">Find Your Match</h4>
                  <p className="text-white/80 text-xs mb-4 leading-relaxed">Join 50 lakh members on India's most trusted matrimony platform.</p>
                  <Link to="/auth/register" className="bg-white text-brand-700 font-bold text-xs px-4 py-2 rounded-full hover:bg-brand-50 transition-colors inline-block">
                    Register Free
                  </Link>
                </div>
              </div>
            </aside>
          </div>

          {/* Back link */}
          <div className="mt-14">
            <Link to="/blogs" className="inline-flex items-center gap-2 text-sm font-semibold text-brand-700 hover:underline">
              <ArrowLeft className="w-4 h-4" /> All Articles
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

