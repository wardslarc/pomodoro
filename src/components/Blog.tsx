import React, { useState } from "react";
import { ArrowLeft, Calendar, User, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface BlogPost {
  id: string;
  title: string;
  author: string;
  date: string;
  category: string;
  excerpt: string;
  content: string;
  readTime: string;
}

const Blog = () => {
  const navigate = useNavigate();
  const [selectedPost, setSelectedPost] = useState<string | null>(null);

  const posts: BlogPost[] = [
    {
      id: "0",
      title: "The Neurobiology of Focus: Why 25 Minutes?",
      author: "Dr. Michael Torres",
      date: "January 2, 2026",
      category: "Deep Dive",
      excerpt: "Explore the fascinating neurobiology behind why 25 minutes is the optimal duration for focused work, backed by cutting-edge brain research.",
      readTime: "12 min read",
      content: `
        ### Week 1: Deep Dive Blog
        
        The number 25 isn't arbitrary. It's been validated by decades of neuroscience research into how our brains process information, 
        maintain attention, and optimize cognitive performance. Let's dive deep into the fascinating neurobiology that makes the 
        Pomodoro Technique work.
        
        ### The Prefrontal Cortex and Executive Function
        When you sit down to work, your prefrontal cortex (the CEO of your brain) activates. This region is responsible for:
        - Executive function and decision-making
        - Working memory management
        - Attention regulation
        - Impulse control
        
        The prefrontal cortex is metabolically expensive—it consumes a disproportionate amount of glucose and oxygen. During intense focus, 
        it works hard but also fatigues quickly. This is called "ego depletion" or "decision fatigue." The 25-minute window is precisely 
        the sweet spot where your prefrontal cortex is still firing on all cylinders before fatigue sets in.
        
        ### Neurotransmitters: The Brain's Chemical Messengers
        Your ability to focus depends on neurotransmitters, particularly:
        
        **Dopamine**: Released when you're focused and engaged, dopamine creates the motivation to continue working. The 25-minute interval 
        is long enough to get a solid dopamine hit from accomplishing something, but short enough that you don't deplete your dopamine reserves.
        
        **Norepinephrine**: This neurotransmitter creates alertness and focus. Your brain naturally maintains high norepinephrine levels for 
        about 20-30 minutes during focused attention, then it begins to decline.
        
        **Acetylcholine**: Critical for memory formation and learning, acetylcholine is released during focused attention. Again, optimal 
        levels are maintained for roughly 25-30 minutes.
        
        ### The Arousal-Attention Relationship
        There's a principle in neuroscience called the Yerkes-Dodson Law, which describes the relationship between arousal and performance. 
        Your brain performs optimally at a moderate level of arousal—not too tired, not too anxious.
        
        A 25-minute timer creates just enough urgency to maintain optimal arousal without triggering the stress response system. 
        Longer intervals might decrease arousal (boredom, fatigue), while arbitrarily tight intervals create anxiety.
        
        ### Attention Restoration Theory
        Your attention is a limited resource. There are two types of attention:
        
        **Directed Attention**: This is what you use to focus on a task, resist distractions, and maintain concentration. 
        It's mentally effortful and depletes over time.
        
        **Involuntary Attention**: This is captured by inherently interesting stimuli (a beautiful view, an interesting conversation). 
        It's restorative and doesn't deplete your directed attention capacity.
        
        The 5-minute break between pomodoros is crucial because it allows your directed attention system to recover. When you spend those 
        5 minutes looking out a window, stretching, or meditating, you're restoring your capacity for directed attention.
        
        ### Circadian and Ultradian Rhythms
        Beyond the 25-minute cycle, your brain operates on multiple time scales:
        
        **Circadian Rhythms** (~24 hours): Your daily sleep-wake cycle regulated by melatonin and cortisol.
        
        **Ultradian Rhythms** (90-120 minutes): Within your waking day, you experience natural cycles of energy and focus, sometimes called 
        the "Basic Rest-Activity Cycle" (BRAC), discovered by sleep researcher Nathaniel Kleiterman.
        
        Within these 90-120 minute cycles, there are nested shorter cycles. The 25-minute pomodoro aligns with a mini-cycle of peak alertness 
        and attention capacity.
        
        ### The Role of Habit and Neural Pathways
        When you repeatedly work in 25-minute intervals, your brain learns to anticipate this rhythm. Neural pathways strengthen around:
        - Initiating focused work
        - Maintaining attention for 25 minutes
        - Transitioning to breaks
        - Returning from breaks
        
        After about 2-3 weeks of consistent practice, these pathways become more efficient, and you'll find it increasingly easier to slip 
        into a focused state when your timer starts.
        
        ### Why Not 30 Minutes? Or 20?
        Research from various domains supports the 25-minute sweet spot:
        
        - **Ultradian Rhythm Research**: Studies on the Basic Rest-Activity Cycle suggest natural attention peaks between 20-30 minutes.
        - **Educational Psychology**: Optimal lecture lengths in educational research cluster around 20-30 minutes.
        - **Attention Restoration Studies**: Attention recovery in restorative environments takes about 5 minutes of moderate intensity activity.
        - **Cognitive Load Theory**: Complex cognitive tasks show peak performance in 25-30 minute intervals.
        
        25 minutes isn't magic because it's a round number; it's effective because it aligns with genuine neurobiological processes.
        
        ### The Individual Differences
        Of course, individual differences matter. Some research suggests:
        - Younger people (teens, 20s) may maintain focus for slightly longer (30+ minutes)
        - Older adults might benefit from slightly shorter intervals (20 minutes)
        - Some individuals with ADHD find 20-minute pomodoros more effective
        - Complex, creative work might extend focus to 45 minutes
        - Routine, administrative work might be optimized at 20 minutes
        
        The Pomodoro Technique provides a framework, but neuroscience suggests you should experiment to find your personal sweet spot.
        
        ### Conclusion: Working With Your Brain, Not Against It
        The beauty of the Pomodoro Technique isn't that it forces you to work harder—it's that it works with your brain's natural rhythms 
        and capacities. By honoring the neurobiological realities of attention, rest, and recovery, you achieve more while maintaining 
        mental health and preventing burnout.
        
        The next time you set a 25-minute timer, remember: you're not just being productive, you're neuroscientifically optimized.
      `
    },
    {
      id: "1",
      title: "The Science Behind the Pomodoro Technique",
      author: "Dr. Sarah Chen",
      date: "December 28, 2025",
      category: "Productivity",
      excerpt: "Discover the neuroscience behind why 25-minute work intervals are so effective for focus and retention.",
      readTime: "8 min read",
      content: `
        The Pomodoro Technique has gained widespread popularity over the past few decades, but what makes it so effective? 
        The answer lies in neuroscience and our understanding of how the human brain works.
        
        ### The Ultradian Rhythm
        Our brains operate in natural cycles called ultradian rhythms, which typically last between 90 and 120 minutes. 
        However, within these longer cycles, there are shorter periods of peak focus that last approximately 25-30 minutes. 
        The Pomodoro Technique leverages this natural cycle by working with your brain's inherent rhythm rather than against it.
        
        ### Attention and Context Switching
        When you commit to a 25-minute focused session, you're giving your brain a clear boundary. This reduces the mental load 
        associated with deciding when to take a break or switch tasks. Research shows that context switching (task-switching) 
        can reduce productivity by up to 40%, so the Pomodoro's firm time boundary helps prevent this cognitive penalty.
        
        ### The Role of Short Breaks
        The 5-minute breaks between pomodoros are crucial. They allow your brain to consolidate information and prevent decision fatigue. 
        During these breaks, your default mode network (the part of your brain responsible for reflection and integration) becomes active, 
        helping you process what you've learned.
        
        ### Neuroplasticity and Habit Formation
        Consistent use of the Pomodoro Technique creates neural pathways associated with focused work. Over time, your brain becomes 
        more efficient at entering a focused state, and the technique becomes less of a conscious tool and more of an automatic habit.
      `
    },
    {
      id: "2",
      title: "How Reflection Transforms Your Productivity",
      author: "Marcus Williams",
      date: "December 22, 2025",
      category: "Reflection",
      excerpt: "Learn how adding a reflection layer to your Pomodoro sessions can unlock exponential productivity gains.",
      readTime: "6 min read",
      content: `
        Many productivity systems focus on doing more, but they ignore a critical component: learning from what you do. 
        This is where reflection comes in, and it's often the missing piece that transforms good productivity into great productivity.
        
        ### What is Reflection?
        Reflection is the practice of consciously examining your work, decisions, and outcomes. In the context of the Pomodoro Technique, 
        it means taking a few minutes after your work session to note what went well, what was challenging, and what you learned.
        
        ### The Reflection-Action Loop
        The most successful people in any field share a common trait: they engage in continuous feedback loops. 
        They do something, reflect on it, adjust their approach, and try again. This cycle of action and reflection is what drives improvement.
        
        ### Making Reflection Actionable
        Reflection without action is just thinking. Our AI-powered reflection system helps you:
        - Identify patterns in your productivity
        - Recognize recurring obstacles
        - Spot opportunities for improvement
        - Connect daily reflections to long-term goals
        
        ### The Compound Effect
        When you reflect consistently, the benefits compound over time. After a month of daily reflections, you'll have deep insights into 
        your work patterns. After three months, you'll have transformed your entire approach to productivity.
      `
    },
    {
      id: "3",
      title: "Mindfulness Practices for the Modern Knowledge Worker",
      author: "Elena Rodriguez",
      date: "December 15, 2025",
      category: "Wellness",
      excerpt: "Explore practical mindfulness techniques that reduce stress and enhance focus in your daily work.",
      readTime: "10 min read",
      content: `
        In an age of constant notifications and digital distractions, mindfulness has become more important than ever. 
        For knowledge workers, mindfulness isn't a luxury—it's a necessity.
        
        ### What is Mindfulness?
        Mindfulness is the practice of bringing full awareness to the present moment without judgment. It's not about emptying your mind 
        or achieving some special state; it's simply about paying attention to what's happening right now.
        
        ### The Cost of Distraction
        Research shows that the average knowledge worker is interrupted every 11 minutes, and it takes about 25 minutes to refocus after 
        an interruption. This creates a vicious cycle where deep work becomes nearly impossible. Mindfulness breaks this cycle.
        
        ### Five Mindfulness Techniques for Work
        
        1. **Mindful Breathing**: Before starting work, spend 2 minutes focusing solely on your breath. This activates your parasympathetic 
        nervous system and prepares your brain for focused work.
        
        2. **Body Scan Meditation**: During breaks, do a quick 3-minute body scan. This helps you release tension and reconnect with your body.
        
        3. **Mindful Eating**: Use your break to eat a snack mindfully, fully tasting and appreciating each bite. This gives your mind a 
        complete break from work.
        
        4. **Mindful Walking**: Take a walk while focusing on the sensations of movement, the feeling of your feet on the ground, and your breath.
        
        5. **Mindful Listening**: During meetings or conversations, practice listening without planning your response. This improves 
        communication and reduces mental clutter.
        
        ### Building a Mindfulness Practice
        Start small. Even 5 minutes of mindfulness daily can create significant changes in your focus, stress levels, and overall well-being. 
        The key is consistency, not duration.
      `
    },
    {
      id: "4",
      title: "From Procrastination to Progress: A Case Study",
      author: "James Patterson",
      date: "December 8, 2025",
      category: "Case Study",
      excerpt: "See how one individual transformed their productivity by combining Pomodoro, reflection, and mindfulness.",
      readTime: "7 min read",
      content: `
        Meet Alex, a software engineer who struggled with procrastination for years. Despite knowing how to solve problems, 
        he found himself constantly delaying important tasks. Here's how he turned things around.
        
        ### The Problem
        Alex would start his day with good intentions, but by mid-morning, he'd find himself checking emails, scrolling social media, 
        or working on less important tasks. He'd end each day feeling like he hadn't accomplished anything meaningful.
        
        ### The Turning Point
        Alex decided to try the Pomodoro Technique combined with our reflection system. He started with just 2 pomodoros per day 
        (50 minutes of focused work) and committed to a brief reflection after each session.
        
        ### Week 1: The Shift
        In the first week, something unexpected happened. By having a clear 25-minute boundary, Alex found it easier to focus. 
        The timer created a sense of urgency that helped overcome his procrastination impulse. He completed 10 pomodoros that week.
        
        ### Week 2: The Pattern
        Through reflection, Alex noticed he was most productive in the morning and that coding tasks went better with 
        music while research tasks went better in silence. He adjusted his schedule accordingly.
        
        ### Week 4: The Transformation
        By week four, Alex was consistently completing 8-10 pomodoros daily. More importantly, his energy and confidence had improved. 
        He started meditation during his breaks and noticed reduced anxiety.
        
        ### Three Months Later
        Alex had completed over 800 pomodoros and delivered three major projects ahead of schedule. His code quality improved because 
        he wasn't rushing. His team noticed his increased reliability and focus. But most importantly, he felt better.
        
        ### The Takeaway
        Alex's transformation wasn't about working harder—it was about working smarter, reflecting consistently, and taking care of his mental health. 
        The same approach can work for you.
      `
    },
    {
      id: "5",
      title: "The Future of Productivity: AI-Powered Insights",
      author: "Dr. Priya Kapoor",
      date: "November 30, 2025",
      category: "Technology",
      excerpt: "Explore how artificial intelligence is revolutionizing productivity by providing personalized insights and recommendations.",
      readTime: "9 min read",
      content: `
        Artificial intelligence is transforming how we approach productivity. Gone are the days of one-size-fits-all productivity advice. 
        Today, AI can analyze your unique work patterns and provide tailored recommendations.
        
        ### How AI Enhances Reflection
        Traditional reflection is limited by our ability to remember and analyze our own behavior. AI changes this by:
        - Automatically categorizing your reflections
        - Identifying patterns you wouldn't notice manually
        - Predicting when you're likely to experience energy dips
        - Recommending adjustments based on your data
        
        ### Personalization at Scale
        What works for your morning might not work for your afternoon. What works for creative work might not work for analytical work. 
        AI can help you understand these nuances and optimize your schedule accordingly.
        
        ### Privacy and Ethical AI
        As we adopt AI-powered productivity tools, privacy and ethics become crucial. The best AI systems are transparent about what data 
        they collect, how they use it, and give you control over your information.
        
        ### The Future
        We're moving toward a future where your productivity system learns and adapts to you, rather than forcing you to adapt to a rigid system. 
        AI will help us identify not just how to be more productive, but how to be productive in ways that align with our values and well-being.
      `
    },
    {
      id: "6",
      title: "Goal Setting for Peak Performance",
      author: "Victoria Zhang",
      date: "November 20, 2025",
      category: "Goal Setting",
      excerpt: "Master the art of setting meaningful goals that actually drive results and align with your values.",
      readTime: "11 min read",
      content: `
        Goal setting is the bridge between where you are and where you want to be. But not all goals are created equal. 
        The difference between goals that inspire action and goals that collect dust in a journal is often just a matter of how you frame them.
        
        ### The Problem with Vague Goals
        "I want to be more productive" is a nice sentiment, but it's not actionable. Your brain doesn't know what to do with it, 
        so it often defaults to doing nothing. Effective goals need specificity, measurability, and clear timelines.
        
        ### The SMART Framework Evolved
        You've probably heard of SMART goals (Specific, Measurable, Achievable, Relevant, Time-bound), but there's more to it:
        
        **Specific**: Instead of "exercise more," say "complete 3 strength training sessions per week."
        
        **Measurable**: You need concrete metrics. Not "improve code quality," but "reduce bug reports by 20% in Q1."
        
        **Achievable**: This is where many goal-setters fail. Unrealistic goals demotivate rather than inspire. Push yourself, but stay grounded.
        
        **Relevant**: Does this goal actually matter to you? Does it align with your values and long-term vision?
        
        **Time-bound**: "Complete my project sometime" is not a goal. "Ship the beta version by March 15" is.
        
        ### The Power of Backward Planning
        Here's a technique that separates high achievers from average performers: backward planning.
        
        Start with your one-year goal. Work backward to identify the milestones for quarters, months, and weeks. 
        Then break those into daily actions. This creates a clear path and makes the goal feel less overwhelming.
        
        Example:
        - Year goal: "Complete advanced certification"
        - Q1: "Finish courses 1-2"
        - Month 1: "Complete course 1"
        - Week 1: "Finish lessons 1-3"
        - Today: "Complete lesson 1"
        
        ### Identity-Based vs. Outcome-Based Goals
        Outcome-based goals focus on results: "Read 12 books this year."
        Identity-based goals focus on who you become: "Become a voracious reader and lifelong learner."
        
        Identity-based goals are more motivating and sustainable because they shape your self-perception and daily habits. 
        Instead of working toward an external outcome, you're living according to your desired identity.
        
        ### The Role of Reflection in Goal Achievement
        This is where our reflection system becomes invaluable. Weekly reflection on your progress toward goals helps you:
        - Stay accountable
        - Adjust strategies that aren't working
        - Celebrate progress and build momentum
        - Learn what conditions help you succeed
        
        ### Making Goals Public (Sometimes)
        Research on goal-setting has found that public commitment increases follow-through. But this works best for goals you control. 
        If your goal depends on others (getting promoted, for example), keeping it private until you're confident is often better.
        
        ### The Quarterly Review
        Make it a habit to review your goals quarterly. What progressed? What stalled? What did you learn? 
        This discipline transforms goal-setting from a one-time exercise into a continuous improvement system.
      `
    },
    {
      id: "7",
      title: "Deep Work in a Shallow World",
      author: "John McCarthy",
      date: "November 10, 2025",
      category: "Deep Dive",
      excerpt: "Why deep, focused work is becoming rarer and more valuable than ever in our distraction-filled world.",
      readTime: "13 min read",
      content: `
        We live in an age of relentless shallow work. Notifications ping constantly. Meetings proliferate. Tasks multiply. 
        Meanwhile, the work that actually moves the needle—the work that requires sustained focus and creative thinking—gets squeezed into ever-shrinking gaps.
        
        ### What is Deep Work?
        Deep work is professional activities performed in a state of unbroken concentration that pushes your cognitive abilities to their limit. 
        It's the opposite of context-switching and constant interruption. It's where real value gets created.
        
        Examples of deep work:
        - Writing or editing complex documents
        - Coding new features or solving architectural problems
        - Strategic thinking and planning
        - Learning something fundamentally new
        - Creative design and problem-solving
        
        Shallow work is everything else: emails, meetings, administrative tasks, and reactive responses.
        
        ### Why Deep Work is Becoming Rare
        Several factors have conspired to make deep work increasingly difficult:
        
        **The Always-On Culture**: We're expected to respond to messages immediately. The expectation of responsiveness creates constant partial attention.
        
        **Artificial Urgency**: Not all urgent things are important, but our brains treat them as equally important. 
        The constant stream of "urgent" items prevents focus on important work.
        
        **Workload Inflation**: As knowledge work has become more abstract, it's easy for managers to add tasks without removing others. 
        People are drowning in commitments.
        
        **Meeting Culture**: Meetings feel productive because things are "happening," but many meetings could be emails. 
        Fragmented time makes deep work impossible.
        
        ### The Economic Value of Deep Work
        Here's the counterintuitive truth: in a world where deep work is rare, it becomes extraordinarily valuable.
        
        The person who can focus for four uninterrupted hours and produce brilliant code, strategic insight, or creative work 
        is worth far more than the person managing shallow tasks competently.
        
        ### How to Protect Your Deep Work
        
        **Block Time**: Schedule deep work like you schedule meetings. Defend these blocks religiously. 
        Tell colleagues you're unavailable during these times.
        
        **Batch Shallow Work**: Process emails in two batches per day. Schedule meetings in clusters. 
        This reduces context switching and preserves larger blocks for deep work.
        
        **Manage Expectations**: Help colleagues understand that your best work requires uninterrupted focus. 
        They'll respect this if you communicate it clearly.
        
        **Design Your Environment**: Eliminate notifications during deep work. Put your phone away. 
        Close unnecessary tabs. Your environment shapes your ability to focus.
        
        **Start the Day with Deep Work**: Your cognitive resources are highest in the morning. 
        Use this prime real estate for your most important work.
        
        ### The Pomodoro Advantage for Deep Work
        The Pomodoro Technique is perfect for deep work because it creates protected time blocks with firm boundaries. 
        Unlike trying to work "until it feels right to stop," a 25-minute timer gives you permission to focus completely.
        
        ### Building Deep Work Capacity
        Like any ability, deep work capacity grows with practice. If you haven't done sustained deep work in months, 
        starting with 25-minute pomodoros is perfect. As your capacity grows, you might extend to 45-minute sessions or even 90-minute deep work blocks.
        
        ### The Future of Work
        Organizations that protect and enable deep work will attract the best talent and produce the best results. 
        As shallow, automatable work gets automated, the ability to do deep work becomes the primary differentiator.
      `
    },
    {
      id: "8",
      title: "Burnout Prevention: Before It's Too Late",
      author: "Dr. Lisa Anderson",
      date: "October 28, 2025",
      category: "Wellness",
      excerpt: "Recognize the early signs of burnout and learn proven strategies to maintain sustainable productivity.",
      readTime: "10 min read",
      content: `
        Burnout isn't a weakness. It's not something that happens to unmotivated people. Often, it happens to the most dedicated, 
        passionate professionals who push themselves too hard for too long without adequate recovery.
        
        ### The Three Dimensions of Burnout
        Burnout isn't just exhaustion. According to burnout research, it has three key components:
        
        **Exhaustion**: Physical and emotional depletion. You feel constantly tired, even after rest.
        
        **Cynicism**: Detachment from work and colleagues. Projects that once excited you feel pointless. You become more critical and withdrawn.
        
        **Inefficacy**: A sense that your efforts don't matter. Your performance declines, which further reinforces the belief that you're ineffective.
        
        The dangerous thing about burnout is that it's often invisible from the outside. You might still look productive, 
        but you're running on fumes and heading for a crash.
        
        ### Early Warning Signs
        Recognizing burnout early is crucial. Look for these signs:
        
        - Persistent fatigue that rest doesn't fix
        - Cynicism about work and colleagues
        - Reduced effectiveness despite more hours worked
        - Loss of enthusiasm for projects you used to love
        - Increased irritability and emotional reactivity
        - Neglecting self-care (sleep, exercise, social connection)
        - Difficulty concentrating despite long work hours
        
        ### The Root Causes
        Burnout isn't usually about working hard. It's typically caused by:
        
        **Misalignment**: Your values don't align with what you're doing.
        
        **Lack of Control**: You're responsible for outcomes but can't control the inputs.
        
        **Insufficient Reward**: The recognition or compensation doesn't match the effort.
        
        **Poor Relationships**: You're isolated or working in a toxic environment.
        
        **Injustice**: You perceive unfair treatment or unequal burden-sharing.
        
        **Workload Mismatch**: The work demands exceed your resources and capacity.
        
        ### Sustainable Productivity vs. Burnout
        The key difference is recovery. Sustainable productivity includes rest, reflection, and renewal. Burnout is constant output without adequate input.
        
        ### Prevention Strategies
        
        **Set Boundaries**: This is non-negotiable. You can't work unlimited hours and remain healthy. Set clear working hours and protect your personal time.
        
        **Practice Recovery**: Sleep is not a luxury; it's essential maintenance. So is exercise, time in nature, and time with people you care about.
        
        **Regular Reflection**: Use your reflection practice to notice when you're sliding toward burnout. Early intervention is far easier than recovery.
        
        **Meaningful Work**: Regularly reconnect with why your work matters. If you can't find meaning, that's important information.
        
        **Community**: Invest in relationships with colleagues and maintain friendships outside of work. Isolation accelerates burnout.
        
        **Control What You Can**: You can't always control workload, but you can control your response, your boundaries, and your self-care practices.
        
        ### The Recovery Timeline
        If you're already experiencing burnout, recovery typically takes months, not weeks. The sooner you address it, the faster you recover. 
        True recovery often requires substantial changes—sometimes including changing roles or organizations.
        
        ### A Final Word
        Your health matters more than any project, promotion, or paycheck. The work will be there, and you can do your best work only if you're healthy. 
        Preventing burnout isn't selfish; it's the prerequisite for sustainable excellence.
      `
    },
    {
      id: "9",
      title: "Building Accountability Systems That Work",
      author: "Robert Chen",
      date: "October 15, 2025",
      category: "Productivity",
      excerpt: "Explore practical accountability methods that actually stick and help you follow through on commitments.",
      readTime: "8 min read",
      content: `
        Accountability is one of the most powerful productivity tools available, yet most people either skip it entirely or implement it in ways that don't work. 
        The difference between those who achieve their goals and those who don't often comes down to accountability.
        
        ### Why Accountability Matters
        Humans are social creatures. We're motivated by the expectations of others and by the desire to maintain a positive self-image. 
        When you tell someone else about a commitment, you activate this social motivation.
        
        Research shows that people who share goals are significantly more likely to achieve them than people who keep goals private. 
        The accountability mechanism doesn't have to be harsh or external—sometimes even minimal accountability is enough.
        
        ### Types of Accountability
        
        **Self-Accountability**: Tracking your own progress and reviewing it regularly. This is where our reflection system becomes powerful.
        
        **Peer Accountability**: Sharing your progress with a friend or colleague who supports you. Often the most motivating and sustainable form.
        
        **Structured Accountability**: Joining a group, cohort, or program with built-in accountability mechanisms.
        
        **Professional Accountability**: Working with a coach or mentor who is paid to help hold you accountable.
        
        **Public Accountability**: Announcing your goals or progress publicly. This is powerful but not appropriate for all goals.
        
        ### Building Your Accountability System
        
        **Choose the Right Level**: If you're working on something important, some form of external accountability is invaluable. 
        Which type works best depends on your personality and the type of goal.
        
        **Frequent Check-Ins**: The more frequent the accountability check-in, the more effective it tends to be. 
        Daily or weekly is far more motivating than monthly.
        
        **Specific Commitments**: Vague accountability ("I'll try to be more productive") doesn't work. 
        Specific commitments ("I'll complete 8 pomodoros daily and review my reflection log weekly") do work.
        
        **Celebrate Progress**: Accountability shouldn't be all about what you didn't do. 
        Celebrating wins and progress reinforces the positive behavior loop.
        
        **Consequences and Incentives**: Some people are motivated by penalties, others by rewards. 
        Know yourself and structure your accountability accordingly.
        
        ### The Reflection-Accountability Loop
        Our reflection system creates a perfect accountability mechanism:
        - Track your daily pomodoros
        - Reflect on what went well and what was challenging
        - Weekly review of patterns and progress
        - Adjust your approach based on what you learn
        
        This creates a virtuous cycle where you become more aware of your patterns and more intentional about your improvements.
        
        ### Avoiding Accountability Theater
        Be careful of accountability that looks good but doesn't drive real change. 
        Checking off boxes without genuine reflection or progress is just performance. 
        Real accountability connects you to genuine progress.
        
        ### Starting Small
        If you're new to accountability, start small. Tell one trusted friend about a goal. 
        Share your progress weekly. As this feels natural, you can expand your accountability system.
      `
    },
    {
      id: "10",
      title: "The Creative Brain: Optimizing for Innovation",
      author: "Dr. Michael Grant",
      date: "October 1, 2025",
      category: "Creativity",
      excerpt: "Discover how to structure your work life to maximize creative thinking and innovation.",
      readTime: "11 min read",
      content: `
        Creativity isn't magic, and it's not reserved for the naturally gifted. It's a cognitive skill that can be developed, and it follows predictable patterns. 
        Understanding how the creative brain works allows you to structure your days to maximize creative output.
        
        ### The Dual-Mode Brain
        Your brain has two complementary thinking modes:
        
        **Focused Mode**: Concentrated, logical, analytical. This is when you're actively working on a problem, writing code, or executing a plan.
        
        **Diffuse Mode**: Relaxed, associative, creative. This is when you're in the shower, taking a walk, or letting your mind wander. 
        This is where creative breakthroughs happen.
        
        Most productivity advice focuses on maximizing focused mode. But true creative work requires both modes working in concert.
        
        ### The Creative Problem-Solving Cycle
        
        **Preparation**: Gather information, understand the problem deeply, explore possibilities.
        
        **Incubation**: Take a break. Let your subconscious work on it. This is where diffuse mode is essential.
        
        **Illumination**: The "aha" moment when a solution becomes apparent. Usually happens when you're not actively thinking about the problem.
        
        **Verification**: Test and refine the idea in focused mode.
        
        Many would-be innovators skip the incubation step, trying to solve everything through pure focused effort. This dramatically reduces creativity.
        
        ### Protecting Creative Time
        
        **Morning Blocks**: Schedule your most creative work in the morning when your cognitive resources are fresh. 
        This might be problem-solving, writing, design, or strategic thinking.
        
        **Minimize Meetings Early**: Meetings fragment your thinking and break your creative focus. Cluster them in afternoon blocks.
        
        **Build in Buffer Time**: Back-to-back appointments leave no space for your mind to wander and make creative connections.
        
        **Embrace Boredom**: Paradoxically, moments of boredom and low stimulation activate the default mode network (your diffuse thinking mode). 
        Short periods of boredom are creative fuel.
        
        ### The Role of Constraints
        Unlimited resources don't necessarily lead to more creativity. Often, creative breakthroughs come from constraints.
        
        A constraint like "solve this in 25 minutes" or "use only these tools" forces creative thinking and forces you to eliminate non-essentials. 
        The Pomodoro timer becomes a creativity tool, not just a productivity tool.
        
        ### Environmental Factors
        
        **Novelty**: Novel environments and experiences stimulate creative thinking. A change of scenery can unlock creative breakthroughs.
        
        **Collaboration**: Bouncing ideas off others stimulates creative thinking. Diverse perspectives lead to more innovative solutions.
        
        **Music**: For some cognitive tasks, background music (especially without lyrics) enhances focus. For others, silence is better. Know your preferences.
        
        **Physical Activity**: Exercise boosts creative thinking. Many creative insights happen during or after physical activity.
        
        ### The Incubation Principle in Your Schedule
        Build incubation into your day deliberately:
        - Work intensively on a creative problem for 25 minutes (pomodoro)
        - Take a 5-minute break where you physically move and let your mind wander
        - Work on something different for the next pomodoro
        - Return to the original problem refreshed with new insights
        
        ### Measuring Creative Output
        Unlike routine tasks, creative work is hard to measure. Instead of measuring hours worked, measure the quality and originality of output. 
        Track breakthroughs and innovations, not just completed tasks.
        
        ### Conclusion: Structure and Freedom
        The paradox of creative work is that it requires both structure and freedom. A completely unstructured day often leads to procrastination and anxiety. 
        Excessive structure crushes creativity. The sweet spot is a framework (like Pomodoro) that creates protective space for both focused work and creative incubation.
      `
    }
  ];

  const selectedPostData = posts.find(post => post.id === selectedPost);

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <Button 
          variant="ghost" 
          onClick={() => selectedPost ? setSelectedPost(null) : navigate("/")}
          className="mb-8 hover:bg-blue-50 text-blue-600"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> {selectedPost ? "Back to Blog" : "Back to Timer"}
        </Button>

        {!selectedPost ? (
          <>
            <div className="text-center mb-16">
              <h1 className="text-4xl font-extrabold text-slate-900 sm:text-5xl sm:tracking-tight lg:text-6xl">
                Productivity Blog
              </h1>
              <p className="mt-5 text-xl text-slate-500">
                Insights, tips, and stories about focus, productivity, and living intentionally.
              </p>
            </div>

            <div className="space-y-6">
              {posts.map((post) => (
                <article 
                  key={post.id}
                  onClick={() => setSelectedPost(post.id)}
                  className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 hover:shadow-lg transition-all cursor-pointer"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold text-slate-900 hover:text-blue-600 transition-colors">
                        {post.title}
                      </h2>
                      <p className="mt-3 text-lg text-slate-600">
                        {post.excerpt}
                      </p>
                      <div className="mt-6 flex flex-wrap gap-4 text-sm text-slate-500">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span>{post.date}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          <span>{post.author}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Tag className="h-4 w-4" />
                          <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                            {post.category}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span>{post.readTime}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </>
        ) : (
          <article className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12">
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-slate-900 mb-6">
                {selectedPostData?.title}
              </h1>
              <div className="flex flex-wrap gap-6 text-slate-600 border-b border-slate-200 pb-8">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  <span>{selectedPostData?.date}</span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  <span>By {selectedPostData?.author}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Tag className="h-5 w-5" />
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                    {selectedPostData?.category}
                  </span>
                </div>
                <span className="ml-auto">{selectedPostData?.readTime}</span>
              </div>
            </div>
            
            <div className="prose prose-blue max-w-none text-slate-700 leading-relaxed whitespace-pre-line">
              {selectedPostData?.content}
            </div>
          </article>
        )}

        <footer className="mt-20 text-center border-t border-slate-200 pt-10">
          <p className="text-slate-500">
            &copy; {new Date().getFullYear()} Reflective Pomodoro. All rights reserved.
          </p>
        </footer>
      </div>
    </div>
  );
};

export default Blog;
