import React from 'react';
import { motion } from 'framer-motion';
import { Clock, Users, ArrowLeft, Share2, ChevronRight } from 'lucide-react';
import { Link, useParams } from '@tanstack/react-router';

interface AdviceArticle {
  slug: string;
  cat: string;
  icon: string;
  title: string;
  excerpt: string;
  readTime: string;
  expert: string;
  content: string[];
}

const ARTICLES: AdviceArticle[] = [
  {
    slug: 'five-conversations-before-marriage',
    cat: 'Communication',
    icon: '💬',
    title: 'The 5 Conversations Every Couple Must Have Before Marriage',
    excerpt: "Money, in-laws, children, career ambitions, religious practice these topics feel awkward to raise, but avoiding them now creates problems later. Here's how to have them with grace.",
    readTime: '8 min',
    expert: 'Dr. Sunitha Rao, Family Therapist',
    content: [
      "In my 15 years of working with couples pre-marital, newly-wed, and in crisis I have found one consistent pattern in the marriages that succeed versus those that don't: the couples who did well had difficult conversations before they wed, not after.",
      "It sounds obvious. In practice, most couples avoid these conversations because they feel uncomfortable or because they fear the answer. But avoiding a difficult conversation before marriage does not prevent the difficult situation it just means you encounter it as a crisis instead of a discussion.",
      "Here are the five conversations I consider non-negotiable.",
      "**1. Money income, debt, habits, and goals**",
      "Couples fight about money more than almost anything else. The arguments are rarely about the money itself they're about values: security vs. freedom, generosity vs. caution, individual autonomy vs. shared responsibility. Before marriage, be specific: What are each of your incomes? Do either of you carry debt (student loans, car finance, credit cards)? What is your spending style do you track expenses or spend freely and settle at month end? What are your financial goals in 5 years (buy property, save a specific amount, start a business)? Will you have joint accounts, separate accounts, or both? How much financial support do you each provide to your families of origin, and what do you expect this to look like after marriage?",
      "**2. In-laws and family expectations**",
      "In India specifically, marriage is between families as much as individuals. Assumptions here are dangerous. Will parents live with you, and when? How often do you each expect to visit your parents? How much do you expect to financially support each family? Who has veto power over major life decisions you as a couple, or with parental consultation? If your mother and your spouse disagree about something in your home, whose position do you take? These are not hypotheticals they're questions with real answers that shape daily life.",
      "**3. Children whether, when, and how**",
      "Do you both want children? When immediately, or after a few years? How many? If one of you cannot conceive naturally, are you open to medical intervention, adoption? What religion, if any, will children be raised in? Who provides primary childcare will one partner reduce work, will you use a crèche, will grandparents help? What are your educational values? These questions need an answer before the wedding, not during a fertility appointment or an argument about school choices.",
      "**4. Career and ambition**",
      "Whose career takes priority if there is a conflict? Would either of you relocate for the other's opportunity? What does career ambition mean to each of you is work a central identity or a means to an end? If one partner earns significantly more than the other, does that change decision-making power in your relationship? Would you expect a partner to leave their job after having children, and if so, who?",
      "**5. Faith, practice, and values**",
      "How religious are each of you, in practice? Do you attend temple/mosque/church? Do you expect the home to maintain particular rituals daily prayer, dietary rules, festival observances? If you have different beliefs, how will you navigate these in a shared home? This is not about whether your beliefs are compatible it's about whether your *practices* are compatible day to day.",
      "**How to have these conversations:** Don't have all five in one sitting. Space them over several weeks. Approach each as a discovery conversation, not a negotiation the goal first is to understand what each person actually thinks, not to reach agreement. Listen to understand, not to respond. If you reach a genuine incompatibility on any of these topics, that is important information to have before the wedding, not after.",
    ],
  },
  {
    slug: 'first-meeting-less-awkward',
    cat: 'First Meetings',
    icon: '☕',
    title: 'How to Make Your First Meeting Less Awkward and More Meaningful',
    excerpt: "The in-person meeting after weeks of online chatting can feel tense. Practical conversation starters, venue choices, and what to pay attention to beyond what's said.",
    readTime: '6 min',
    expert: 'Kavitha Menon, Relationship Counsellor',
    content: [
      "The first meeting in arranged matrimony is one of the most artificially pressured situations two adults can find themselves in. Both of you know why you're there. One or both families may be involved. There's an implicit expectation that you're evaluating each other for a life partnership within an hour or two.",
      "The good news: if you walk in with the right framing, it can be genuinely enjoyable. Here's how to approach it.",
      "**Choose the venue deliberately.** A quiet café or restaurant works far better than a loud one. You need to be able to hear each other without shouting, and you need enough privacy to have a real conversation without being constantly interrupted. Avoid malls and public parks for a first meeting too much distraction. A café with booth seating, or a quiet restaurant lunch, is ideal. Sitting beside each other rather than across a table reduces the interview-room formality.",
      "**Arrive prepared with genuine questions, not a script.** The worst first meetings feel like HR interviews. The best ones feel like two curious people discovering each other. Come with two or three things you're genuinely curious about based on their profile not standard questions, but things that actually interest you. If they mentioned trekking, ask about a specific trek. If they work in a particular field, ask about something about that field you've actually wondered about.",
      "**Start light, let depth emerge naturally.** Don't open with 'so, tell me about your family's expectations.' Start with something easy and pleasant how they found the place, something that caught your attention in their profile, something you did recently that was interesting. Real depth in conversation emerges when both people feel comfortable, not when it's demanded upfront.",
      "**Pay attention to how they treat others around you.** How do they speak to the waiter? Do they make eye contact with the person taking their order, or look at their phone? Are they considerate about the environment not too loud, not rude? Character is visible in small transactions that people don't notice they're being evaluated on.",
      "**Notice what you feel, not just what you think.** Most people come out of first meetings with a logical assessment ('he seems smart and stable,' 'she seems kind') but miss the felt experience. Were you comfortable? Did you find yourself wanting to know more? Was there ease in the silence, or did it feel tense? Did you feel you could be yourself, or were you performing? Your body knows things your analytical mind doesn't.",
      "**On awkward silences:** they're fine. Don't fill every gap with nervous chatter. A brief, comfortable silence followed by a natural question is a good sign. Two people who can sit quietly together for 20 seconds without panic are probably going to be okay.",
      "**After the meeting:** give yourself a few hours before forming a verdict. First impressions are real but incomplete. If you feel neutral but not negative, a second meeting is worth trying often more than the first tells you.",
    ],
  },
  {
    slug: 'navigating-family-expectations',
    cat: 'Family Dynamics',
    icon: '🏠',
    title: 'Navigating Expectations Between His Family and Hers',
    excerpt: "Both sides come with different expectations about lifestyle, finances, and household roles. How to negotiate early and set boundaries that both families can respect.",
    readTime: '9 min',
    expert: 'Prakash Reddy, Marriage Coach',
    content: [
      "When two families meet in a marriage, they bring with them two different systems two sets of unspoken rules, inherited assumptions, and expectations about how life should be organised. Neither system is wrong. But they will collide unless you actively design a new system together.",
      "The most common collision points, and how to handle them:",
      "**Household decisions: who decides what.** In many Indian families, the older generation particularly mothers-in-law expects to have a say in how the home is run: how it's decorated, how festivals are observed, how guests are hosted, what is cooked, how money is spent. The bride's family often expects the daughter to maintain some autonomy. Neither expectation is unreasonable on its own. Together, without explicit agreement, they create conflict.",
      "The solution is to decide explicitly as a couple before any particular decision becomes a battlefield which domains belong entirely to you as a couple, which you'll discuss with family, and which you're happy for family to take the lead on. Document this for yourselves, even informally. When a specific conflict arises, you have a framework, not a case-by-case argument.",
      "**Financial expectations.** Both families may have expectations about money either direction. Regular financial support (monthly transfers to parents), gifts on occasions, contributions to family expenses, or property investment decisions. These are legitimate, but they need to be discussed between you as a couple before either family's expectations become a de facto commitment.",
      "The boundary here is: financial decisions affecting your household should be made as a couple first. You can then decide together what you commit to. 'My mother expects X' is not a substitute for a couple decision.",
      "**Household roles.** Who cooks? Who handles finances? Who manages childcare? Who handles extended family relationships? These are often assumed along traditional lines and can create resentment when the assumption is wrong. Ask explicitly. Don't assume that because something was a certain way in each of your families, it will naturally be that way in yours.",
      "**The single most important skill: unified front.** The couples who navigate family expectations successfully share one consistent practice they are a unified front to both families. This doesn't mean agreeing on everything privately. It means disagreements are resolved between you first, and whatever position you take is taken as a couple. A family that can play one partner against another will always do so, not out of malice but because it's how family systems work. Close that gap.",
    ],
  },
  {
    slug: 'long-distance-courtship',
    cat: 'Long-Distance',
    icon: '✈️',
    title: 'Maintaining Emotional Connection in a Long-Distance Courtship',
    excerpt: "When you're in Hyderabad and your match is in the UK, the relationship has to survive on calls, texts, and occasional visits. Here's what keeps the spark alive.",
    readTime: '5 min',
    expert: 'Ananya Singh, Psychologist',
    content: [
      "Long-distance courtship is one of the less-discussed challenges of modern Indian matrimony. With a significant percentage of eligible matches now settled abroad the UK, USA, Canada, Australia, Middle East couples often spend 6 to 12 months getting to know each other primarily over screens before meeting in person.",
      "This is not ideal. It is also not a barrier if you're intentional about it. Here's what works.",
      "**Create structure, not just availability.** 'We'll call whenever we're free' doesn't work across time zones. A committed, regular call time that both of you protect even 30 minutes, three times a week creates more connection than sporadic 2-hour calls whenever schedules align. Consistency signals priority.",
      "**Use voice more than text.** Text is efficient but thin. You lose tone, pace, laughter. Voice calls (or video) convey emotion, hesitation, excitement the things that build real intimacy. For important conversations (about expectations, about family, about the future), use voice, not text.",
      "**Share your ordinary life, not just your best self.** A common failure mode in long-distance courtship is performing presenting the polished, thoughtful, articulate version of yourself on every call. But you're not evaluating each other for a job interview. Share mundane things: what you ate, what annoyed you today, a small funny thing that happened, how tired you are. Ordinariness builds trust.",
      "**Send things to each other.** A photo of something that reminded you of a conversation. A voice note in the middle of the day. An article you think they'd like. A book. These small gestures create a sense of presence across distance the feeling that you're in each other's daily lives, not just on scheduled calls.",
      "**Plan visits deliberately.** Use in-person visits to do ordinary things, not just special activities. Go to a grocery store together. Cook something. Spend a morning with nowhere to be. You learn more about someone in an ordinary context than in a curated trip.",
      "**Be honest about what's hard.** The uncertainty, the time zone stress, the difficulty of getting to know someone at a distance talk about these things. Couples who can be honest about the difficulty of their situation are more resilient than those who pretend everything is fine.",
    ],
  },
  {
    slug: 'dual-career-marriage',
    cat: 'Modern Marriages',
    icon: '💼',
    title: 'When Both Partners Have Demanding Careers: Making It Work',
    excerpt: "The dual-career marriage is now the norm. Couples who navigate it successfully share how they divide responsibilities, protect couple time, and support each other's ambitions.",
    readTime: '7 min',
    expert: 'Dr. Venkat Rao, Couples Therapist',
    content: [
      "The dual-career marriage is no longer the exception it's the statistical norm in urban India among graduates. Yet the cultural infrastructure around us was built for a different model: one career, one home manager. The couples who navigate dual-career life successfully tend to be deliberate in ways that one-career couples don't need to be.",
      "**The division of domestic labour is the friction point.** This is where most dual-career couples run into trouble. If both partners work demanding hours, domestic work cooking, cleaning, household administration, childcare, family social obligations has to be genuinely shared. This doesn't mean equal time on each task; it means agreed, explicit, and updated allocation. 'She handles cooking, I handle finances' is fine if both agree. What fails is when allocation is assumed and unacknowledged.",
      "**Whose career takes priority, when?** This will come up a relocation opportunity, a demanding project, a career transition. The couples who handle this best have discussed the principle before the specific instance arises. Some couples take turns. Some agree that income difference determines priority temporarily. Some have a fixed geographic anchor. What matters is that the decision framework exists before the pressure does.",
      "**Protect couple time as seriously as you protect work meetings.** Dual-career couples who don't actively schedule time for each other find that months pass in parallel exhaustion without meaningful connection. This doesn't need to be elaborate even two evenings a week where phones stay down and attention stays mutual makes a significant difference. Protect it from work encroachment.",
      "**Don't compete; support.** Career ambition can slide into competition, particularly when both partners are in similar fields or at similar levels. The couples who sustain genuine partnership tend to actively invest in each other's careers making introductions, reading each other's work, celebrating the other's wins as seriously as their own.",
      "**Outsource what doesn't need to be done by you.** Many dual-career couples carry guilt about hiring domestic help, using professional childcare, or paying for a meal preparation service. Release the guilt. Your time and energy are finite. Strategic outsourcing of tasks that don't require you specifically is not laziness it's sustainability.",
    ],
  },
  {
    slug: 'healthy-boundaries-in-laws',
    cat: 'Family Dynamics',
    icon: '👩‍👩‍👦',
    title: 'How to Set Healthy Boundaries with In-Laws from Day One',
    excerpt: "Boundaries aren't about keeping people out. They're about creating clarity. How to have the in-law conversation kindly and early, before small misunderstandings become resentments.",
    readTime: '6 min',
    expert: 'Meera Iyer, Family Therapist',
    content: [
      "The word 'boundaries' has become almost clinical in relationship discourse, which makes people think of walls rather than what they actually are: agreements about how a relationship will function. Healthy in-law boundaries are not about rejection they're about clarity, and clarity is kindness.",
      "**Start before the wedding, not during a crisis.** The best time to have boundary conversations with in-laws is early, while the relationship is warm and no one is defending a position. A calm pre-wedding or early-marriage conversation is very different from the same conversation mid-conflict.",
      "**Be specific, not general.** 'We need space' is abstract and feels like rejection. 'We'd like Sundays to be our day for now, and we'll be in touch during the week' is specific and actionable. Specific boundaries are easier to keep and easier for others to respect.",
      "**Present them as structure, not rejection.** 'We've decided we want Saturdays for ourselves' lands differently than 'we need you to stop calling every day.' The first is about your structure; the second feels like a criticism. Same boundary, different framing.",
      "**Both partners must hold the boundary, not just one.** A boundary held by only one partner will fail. If the groom sets a boundary around daily unannounced visits but the bride quietly allows them when the husband is at work, the boundary means nothing. Couples must be aligned.",
      "**The most common in-law boundaries worth discussing:**\n- Privacy around couple conversations (what gets shared with parents)\n- Visit frequency and advance notice expectations\n- Financial decision consultation (when are parents involved?)\n- Child-rearing input\n- Home organisation and hosting decisions",
      "**When in-laws resist:** some pushback is normal. Don't repeat the boundary with more force that escalates. Simply maintain it consistently without anger. Consistent behaviour, over time, communicates more effectively than any single conversation. Most in-laws, once the initial resistance passes, adapt to a structure that is maintained calmly.",
    ],
  },
  {
    slug: 'marriage-anxiety',
    cat: 'Mental Health',
    icon: '🧠',
    title: "Marriage Anxiety Is Real And More Common Than You Think",
    excerpt: "Feeling nervous, second-guessing yourself, or afraid of commitment before or after saying yes a therapist explains what's normal and what might need professional support.",
    readTime: '8 min',
    expert: 'Dr. Rohini Nair, Psychotherapist',
    content: [
      "In my practice, I see people across the full arc of the matrimony journey: those looking for matches, those in the process of deciding, those who have said yes and are now terrified, and those in the early years of marriage navigating the reality. Across all of these stages, one thing is strikingly common: anxiety.",
      "Marriage anxiety is almost universal. What differs is its source, its severity, and whether it needs professional support.",
      "**Normal pre-decision anxiety:** Some nervousness before committing to another person is appropriate and rational. Marriage is permanent (or intended to be), life-changing, and involves vulnerability with another human being. If you're nervous, that doesn't mean something is wrong with you or the match.",
      "**Normal post-yes anxiety (cold feet):** Many people experience a wave of doubt after saying yes even when the match is genuinely right for them. This is called pre-commitment anxiety or 'cold feet.' It is extremely common. It does not necessarily mean you're making the wrong decision. It often means your nervous system is responding to the reality of a major change.",
      "**Signs that anxiety may be telling you something important:** The distinction between normal anxiety and information-bearing anxiety is important. Ask yourself: is the anxiety formless (general dread, undirected nervousness) or specific? If specific 'I am afraid of how this person treats me when they're angry,' 'I am not sure we want the same life,' 'I don't feel safe being honest with them' the anxiety may be carrying a real message worth examining.",
      "**The role of perfectionism:** Many people, particularly those who grew up under achievement pressure, bring perfectionism to matrimony. They cannot commit because they cannot be certain. They keep looking for the 'better option' or the moment they feel completely ready. Neither exists. Commitment requires tolerating uncertainty it is a choice made despite uncertainty, not because it has been eliminated.",
      "**Anticipatory anxiety about family response:** Some anxiety before marriage is not about the match at all it's about family reaction, social judgment, or the logistics of a life change. This is common and often resolves with time and clear conversations.",
      "**When to seek professional support:** If anxiety is significantly interfering with your daily functioning, your sleep, your ability to make decisions, or your relationship with the person you're considering, it's worth speaking to a therapist or counsellor. Not because something is wrong with you but because having a professional space to untangle your thoughts is a genuine advantage.",
      "Finally: the people who never feel anxious about major life decisions are not the courageous ones. Courage is moving forward while afraid and marriage, at its best, requires exactly that.",
    ],
  },
  {
    slug: 'how-to-say-no-matrimony',
    cat: 'Communication',
    icon: '💡',
    title: "How to Say No in Matrimony Without Hurting Anyone",
    excerpt: "Declining a match whether on your side or theirs is one of the most socially challenging parts of the process. A counsellor shares how to do it with respect and finality.",
    readTime: '4 min',
    expert: 'Kavitha Menon, Relationship Counsellor',
    content: [
      "Saying no in matrimony is hard. Harder, often, than saying yes because you're not just declining a connection request, you're declining a person, and both families are watching.",
      "But saying no is not a failure of the process. It is the process working correctly. A no that comes early and clearly is an act of respect to the other person's time, to their family's hopes, and to your own integrity.",
      "**Be timely.** The longer you wait to decline, the worse the conversation becomes. If you know within two meetings that you're not interested, say so within a week not after three months of vague hope on their side.",
      "**Be honest, but not brutal.** You don't owe anyone a detailed critique of themselves. 'I don't think we're the right match' is sufficient and true. You don't need to explain that their sense of humour didn't land, or that you found them less ambitious than you'd hoped. Those details are not useful to them and are not kind to share.",
      "**Give a reason in the broad category, not the specific.** 'I feel we want different things from life' or 'I don't think our priorities align' are real, kind, and actionable. They give the other person information they can use without detailing what specifically put you off.",
      "**Communicate directly, not through intermediaries where possible.** Declining through a parent or a broker rather than directly (when you've had personal contact) is a cop-out that the other person usually sees through. If you've been in contact yourself, decline yourself by message if not by call.",
      "**On receiving a no:** a rejection in matrimony, especially after genuine hope, is genuinely painful. It is also not personal in the way it feels. It means the other person concluded you weren't the right match for them which is information, not a verdict on your worth. Allow yourself to be disappointed, and then continue.",
      "The ability to give and receive a no gracefully is one of the quieter emotional skills matrimony requires. It is worth developing.",
    ],
  },
];

export const RelationshipAdviceArticlePage: React.FC = () => {
  const { slug } = useParams({ from: '/relationship-advice/$slug' });
  const article = ARTICLES.find((a) => a.slug === slug);

  if (!article) {
    return (
      <div className="pt-28 pb-20 container max-w-3xl text-center">
        <div className="text-6xl mb-6">📖</div>
        <h1 className="font-display font-bold text-2xl mb-3">Article Not Found</h1>
        <p className="text-slate-500 mb-6">This article may have been updated or moved.</p>
        <Link to="/relationship-advice" className="btn-luxury px-8 py-3 inline-flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" /> Back to Advice
        </Link>
      </div>
    );
  }

  const related = ARTICLES.filter((a) => a.slug !== slug && (a.cat === article.cat || a.expert === article.expert)).slice(0, 3);

  return (
    <div className="bg-background">
      <div className="pt-28 pb-20">
        {/* Breadcrumb */}
        <div className="container max-w-4xl mb-8">
          <Link to="/relationship-advice" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-foreground transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" /> Relationship Advice
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
                  <span className="text-2xl">{article.icon}</span>
                  <span className="text-xs font-semibold text-brand-700 bg-brand-50 px-3 py-1 rounded-full">{article.cat}</span>
                  <span className="text-xs text-slate-500 flex items-center gap-1"><Clock className="w-3 h-3" />{article.readTime} read</span>
                </div>

                <h1 className="font-display font-bold text-3xl md:text-4xl leading-tight mb-5">
                  {article.title}
                </h1>

                <p className="text-lg text-slate-500 leading-relaxed mb-5 border-l-4 border-rose-300 pl-4">
                  {article.excerpt}
                </p>

                {/* Expert */}
                <div className="flex items-center gap-3 mb-8 bg-muted/30 rounded-xl px-4 py-3">
                  <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center flex-shrink-0">
                    <Users className="w-4 h-4 text-brand-600" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-500">Written by</div>
                    <div className="text-sm font-semibold">{article.expert}</div>
                  </div>
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
                        __html: para.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br />')
                      }} />
                    );
                  })}
                </div>

                {/* Share */}
                <div className="mt-10 pt-8 border-t border-border flex items-center justify-end">
                  <button
                    onClick={() => navigator.share?.({ title: article.title, url: window.location.href })}
                    className="flex items-center gap-2 text-sm text-slate-500 hover:text-foreground transition-colors"
                  >
                    <Share2 className="w-4 h-4" /> Share this article
                  </button>
                </div>
              </motion.div>
            </article>

            {/* Sidebar */}
            <aside className="space-y-6">
              <div className="sticky top-28">
                {/* Expert card */}
                <div className="bg-white rounded-2xl border border-border p-5 mb-5">
                  <h4 className="font-semibold text-sm mb-3">About the Expert</h4>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-full bg-brand-100 flex items-center justify-center flex-shrink-0 text-xl">
                      {article.icon}
                    </div>
                    <div>
                      <div className="font-semibold text-sm">{article.expert.split(',')[0]}</div>
                      <div className="text-xs text-slate-500">{article.expert.split(',')[1]?.trim()}</div>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">Expert contributor to Avyuktha's relationship guidance program. Available for one-on-one sessions for Gold+ subscribers.</p>
                </div>

                {related.length > 0 && (
                  <div className="bg-white rounded-2xl border border-border p-5">
                    <h4 className="font-display font-bold text-sm mb-4">More Advice</h4>
                    <div className="space-y-4">
                      {related.map((r) => (
                        <Link
                          key={r.slug}
                          to="/relationship-advice/$slug"
                          params={{ slug: r.slug }}
                          className="flex items-start gap-2 group"
                        >
                          <span className="text-xl flex-shrink-0 mt-0.5">{r.icon}</span>
                          <p className="text-sm font-medium leading-snug group-hover:text-brand-700 transition-colors line-clamp-2">{r.title}</p>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                <div className="bg-rose-600 rounded-2xl p-5 text-white mt-5">
                  <h4 className="font-display font-bold text-base mb-2">Talk to a Counsellor</h4>
                  <p className="text-white/80 text-xs mb-4 leading-relaxed">Gold and Elite subscribers get direct one-on-one access to certified relationship counsellors.</p>
                  <Link to="/pricing" className="bg-white text-rose-700 font-bold text-xs px-4 py-2 rounded-full hover:bg-rose-50 transition-colors inline-flex items-center gap-1">
                    View Plans <ChevronRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </aside>
          </div>

          {/* Back link */}
          <div className="mt-14">
            <Link to="/relationship-advice" className="inline-flex items-center gap-2 text-sm font-semibold text-brand-700 hover:underline">
              <ArrowLeft className="w-4 h-4" /> All Advice
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

