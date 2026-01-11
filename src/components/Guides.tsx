import React, { useState } from "react";
import { BookOpen, Clock, Brain, Zap, Target, ArrowLeft, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Guides = () => {
  const navigate = useNavigate();
  const [expandedGuide, setExpandedGuide] = useState<number | null>(0);

  const guides = [
    {
      title: "Mastering the Pomodoro Technique",
      description: "Learn how to break your work into manageable intervals for maximum focus.",
      icon: <Clock className="h-6 w-6 text-blue-600" />,
      category: "Fundamentals",
      content: `
        The Pomodoro Technique is a time management method developed by Francesco Cirillo in the late 1980s. 
        It uses a timer to break work into intervals, traditionally 25 minutes in length, separated by short breaks. 
        Each interval is known as a pomodoro, from the Italian word for tomato, after the tomato-shaped kitchen timer Cirillo used as a university student.
        
        ### How to use it:
        1. Choose a task you want to get done.
        2. Set the Pomodoro timer (typically for 25 minutes).
        3. Work on the task until the timer rings.
        4. Take a short break (5 minutes).
        5. Every four pomodoros, take a longer break (15-30 minutes).
        
        ### Why it works:
        The structured breaks prevent burnout and maintain consistent energy levels throughout your workday. The timer creates urgency, helping you eliminate perfectionism and focus on progress over perfection.
      `
    },
    {
      title: "The Power of AI Reflections",
      description: "How reflecting on your sessions can double your productivity.",
      icon: <Brain className="h-6 w-6 text-purple-600" />,
      category: "Optimization",
      content: `
        Reflection is the key to continuous improvement. By taking a moment after each focus session to note what you learned, 
        you reinforce the neural pathways associated with that knowledge.
        
        Our AI-powered reflection system helps you categorize your insights and identify patterns in your productivity. 
        Are you more focused in the morning? Do certain tasks always lead to distractions? 
        Reflective Pomodoro helps you answer these questions.
        
        ### Advanced Reflection Techniques:
        - Document not just what you did, but why you did it and how you felt.
        - Identify energy dips and energy peaks throughout your day.
        - Connect your reflections to long-term goals and growth areas.
        - Use AI insights to adapt your schedule for maximum effectiveness.
      `
    },
    {
      title: "Overcoming Procrastination",
      description: "Practical tips to stop delaying and start doing.",
      icon: <Zap className="h-6 w-6 text-amber-600" />,
      category: "Psychology",
      content: `
        Procrastination is often a struggle with emotions, not time management. 
        The Pomodoro technique helps by making the "start" less intimidating. 
        Anyone can focus for just 25 minutes.
        
        ### Tips to stay focused:
        - Clear your workspace of distractions.
        - Use noise-canceling headphones or white noise.
        - Break large projects into tiny, actionable steps.
        - Reward yourself after completing a session.
      `
    },
    {
      title: "Mindfulness and Deep Focus",
      description: "Harness mindfulness practices to enhance concentration and reduce stress.",
      icon: <Target className="h-6 w-6 text-teal-600" />,
      category: "Wellness",
      content: `
        Mindfulness is the practice of being fully present in the moment without judgment. When combined with the Pomodoro Technique, 
        it transforms your work sessions into opportunities for both productivity and mental well-being.
        
        ### Mindfulness practices during Pomodoro sessions:
        1. Start each session with 2 minutes of deep breathing to center yourself.
        2. Focus on one task completely, noticing when your mind wanders and gently returning focus.
        3. Observe your thoughts without judgment during work.
        4. Use break time for body scans or brief meditation (3-5 minutes).
        5. Practice gratitude by noting what you accomplished during the session.
        
        ### Benefits of mindful pomodoros:
        - Reduced anxiety and stress levels
        - Better decision-making and problem-solving
        - Improved attention span and memory retention
        - Enhanced creativity through mental clarity
        - Greater overall well-being and job satisfaction
      `
    },
    {
      title: "Building Sustainable Productivity Habits",
      description: "Create long-term habits that stick and support your goals.",
      icon: <BookOpen className="h-6 w-6 text-rose-600" />,
      category: "Habits",
      content: `
        True productivity isn't about burning yourself out; it's about building sustainable systems that support your goals without compromising your well-being.
        
        ### The habit-building framework:
        1. Start small: Begin with just 2-3 pomodoros per day, not 10+.
        2. Stack habits: Attach your Pomodoro sessions to existing daily habits.
        3. Track progress: Use our app to monitor your consistency and patterns over time.
        4. Adjust regularly: Use AI reflection insights to fine-tune your approach weekly.
        5. Celebrate wins: Acknowledge improvements, no matter how small.
        
        ### Creating your ideal routine:
        - Identify your peak focus hours and schedule important work then.
        - Set realistic daily targets based on your energy levels and workload.
        - Build in buffer time between sessions for transitions.
        - Plan your break activities in advance (walk, stretch, hydrate, meditate).
        - Review your weekly reflection insights every Sunday for continuous optimization.
      `
    },
    {
      title: "Dr. K's Mindfulness & Meditation Techniques",
      description: "Science-backed meditation practices inspired by Dr. Alok Kanojia (Dr. K) from Healthygamer.",
      icon: <Brain className="h-6 w-6 text-indigo-600" />,
      category: "Wellness",
      content: `
        The developer of this application is a big fan of Dr. Alok Kanojia, also known as Dr. K, from Healthygamer. 
        His evidence-based approach to mindfulness and meditation has profoundly influenced how we integrate mental health 
        with productivity in the Reflective Pomodoro system.
        
        ### Dr. K's Core Mindfulness Philosophy:
        Dr. K emphasizes that meditation isn't about clearing your mind or achieving a special state. 
        Instead, it's about developing awareness of your mental patterns and building the capacity to observe your thoughts without judgment. 
        This simple shift transforms how you approach work, stress, and personal growth.
        
        ### Essential Dr. K-Inspired Meditation Techniques for Pomodoro:
        
        **1. The 2-Minute Attention Scan**
        Before starting a pomodoro session, spend 2 minutes observing your current mental state:
        - What's your energy level? (1-10)
        - What emotions are present?
        - What's demanding your attention right now?
        - Simply observe without trying to change anything.
        
        This practice, inspired by Dr. K's approach, helps you understand your baseline and increases self-awareness.
        
        **2. The Breath Anchor Technique**
        During your pomodoro, when your mind wanders (and it will), use your breath as an anchor:
        - Notice you've wandered (that's the win, not the distraction).
        - Return your attention to your breath for 3-5 cycles.
        - Return to your task with renewed focus.
        
        Dr. K emphasizes that noticing you've wandered is actually where the meditation happens. The goal isn't to have no thoughts; 
        it's to notice when you've gotten lost and return to the present.
        
        **3. The Compassionate Break**
        During your 5-minute break, practice Dr. K's compassionate awareness:
        - Don't scroll or distract yourself.
        - Sit with yourself and observe your experience.
        - Notice any urges to escape boredom or discomfort.
        - Practice self-compassion: "It's okay that I feel this way. This is part of being human."
        
        This builds emotional resilience and reduces dependency on constant stimulation.
        
        **4. The Emotion-Based Pomodoro Selection**
        Dr. K teaches that our emotional state significantly impacts our capacity for focus. Use this technique:
        - If you're anxious: Start with a physical warm-up before your pomodoro.
        - If you're depressed/low-energy: Use accountability or work with someone else.
        - If you're angry: Do a 10-minute walk first to metabolize the emotion.
        - If you're calm and focused: Tackle your hardest task.
        
        Matching your task difficulty to your emotional state creates sustainable productivity.
        
        **5. The Insight Journal Practice**
        After your pomodoro, Dr. K-inspired reflection asks:
        - What patterns did you notice in your mind during work?
        - When did you get distracted? What triggered it?
        - How did your emotional state affect your focus?
        - What's one small insight about yourself today?
        
        Over time, these observations create powerful self-knowledge and guide your productivity optimization.
        
        ### Dr. K's Core Insight for Productivity:
        "The goal isn't to become a productivity robot. The goal is to understand yourself deeply enough that you can work with your nature instead of against it."
        
        Your mind will wander. You'll feel resistant sometimes. You'll have low-energy days. That's not failure—that's data. 
        By observing these patterns with curiosity instead of judgment, you develop true mastery over your attention and well-being.
        
        ### Building Your Practice:
        Start with just one technique from Dr. K's framework. Practice it for a week. Notice what shifts. 
        Then gradually integrate more practices. Dr. K emphasizes consistency over intensity—a short, genuine meditation practice beats a long, forced one.
        
        For more on Dr. K's work, visit Healthygamer.gg and his YouTube channel where he combines gaming psychology, neuroscience, and meditation.
      `
    },
    {
      title: "Energy Management: Work With Your Natural Rhythms",
      description: "Optimize productivity by aligning tasks with your ultradian rhythms and energy cycles.",
      icon: <Zap className="h-6 w-6 text-yellow-600" />,
      category: "Optimization",
      content: `
        Your productivity isn't constant throughout the day. Your body operates in natural cycles of energy and focus called ultradian rhythms, 
        typically lasting 90-120 minutes. Understanding and working with these rhythms dramatically improves your output.
        
        ### Identifying Your Energy Patterns:
        1. Track your energy levels (1-10) every hour for a week.
        2. Note which tasks you accomplished during high vs. low energy times.
        3. Identify your peak focus windows (often 2-4 hours after waking).
        4. Recognize your energy dips (usually early afternoon and late evening).
        
        ### Strategic Task Placement:
        - **Peak Energy Hours**: Tackle your most cognitively demanding work (deep work, creative tasks).
        - **Good Energy Hours**: Handle important but less demanding work (meetings, planning, communication).
        - **Lower Energy Hours**: Process emails, routine work that requires less focus.
        - **Recovery Windows**: Use for breaks, physical activity, or light tasks.
        
        ### Tips for Energy Optimization:
        - Schedule your most important work in your first peak window of the day.
        - Use movement and hydration to sustain energy through multiple pomodoro cycles.
        - Take longer breaks (20-30 min) after 90 minutes of work to recover fully.
        - Protect your sleep—it's the foundation of all energy management.
      `
    },
    {
      title: "Breaking Through Productivity Plateaus",
      description: "Overcome stagnation and unlock new levels of performance.",
      icon: <Target className="h-6 w-6 text-indigo-600" />,
      category: "Psychology",
      content: `
        You've been consistently using the Pomodoro Technique for months. Your productivity has improved, but now you're stuck. 
        You've hit a plateau. This is completely normal, and it's an opportunity to level up.
        
        ### Why Plateaus Happen:
        Plateaus occur because your brain adapts to your current system. What was challenging becomes routine. 
        The stimulus that created improvement no longer works because you've accommodated to it.
        
        ### Breaking Through the Plateau:
        
        **1. Increase Difficulty Strategically**
        - Extend your focused sessions: Try 30 or 45-minute pomodoros occasionally.
        - Reduce distractions further: Add more constraints to your environment.
        - Tackle harder problems: Schedule your most challenging work during peak hours.
        
        **2. Vary Your Approach**
        - Change your environment: Work from a different location.
        - Modify your break activities: Instead of scrolling, take a walk or meditate.
        - Experiment with different times: If you always work mornings, try evening sessions.
        
        **3. Deepen Your Reflection**
        - Ask more profound questions: "What am I learning? How am I growing?"
        - Identify limiting beliefs: "What do I believe that might be holding me back?"
        - Connect to bigger purpose: How does today's work connect to your long-term vision?
        
        **4. Focus on Quality Over Quantity**
        - Instead of more pomodoros, focus on deeper focus within each session.
        - Set quality standards for your output, not just completion.
        - Build feedback loops: How can you measure the quality of your work?
        
        ### The Plateau as Feedback:
        A plateau isn't failure—it's feedback that you're ready for the next level.
      `
    },
    {
      title: "Managing Interruptions: Protecting Your Focus",
      description: "Strategies for dealing with interruptions while maintaining deep focus.",
      icon: <Clock className="h-6 w-6 text-red-600" />,
      category: "Fundamentals",
      content: `
        Interruptions are the enemy of deep work. Research shows it takes 23 minutes to regain full focus after an interruption. 
        Here's how to protect your pomodoros.
        
        ### Types of Interruptions:
        
        **External Interruptions**
        - Notifications (email, Slack, phone)
        - People dropping by your desk
        - Unexpected meetings
        - Family members needing attention
        
        **Internal Interruptions**
        - Your own urge to check messages
        - Anxiety about something else
        - The "just quickly check" impulse
        - Your own self-sabotage
        
        ### Protection Strategies:
        
        **1. Environmental Design**
        - Close unnecessary browser tabs and applications
        - Put your phone in another room or in Do Not Disturb mode
        - Use noise-canceling headphones (even without music)
        - Post a "In Focus Time" sign if possible
        - Work from a location where interruptions are less likely
        
        **2. Communication Boundaries**
        - Set an out-of-office for your messaging apps during focus blocks
        - Tell colleagues when you're in pomodoro sessions
        - Establish specific times for communication
        - Negotiate "focus hours" where interruptions aren't expected
        
        **3. Emergency Protocols**
        - Have a system for truly urgent matters
        - Tell people: "If it's an emergency, call twice"
        - Batch your communication: Check messages at specific times
        - Use a timer so people know when you'll be available
        
        ### The Recovery from Interruption:
        If you are interrupted:
        1. Take a breath and note what interrupted you
        2. Quickly manage the interruption
        3. Spend 1-2 minutes refocusing
        4. Resume your pomodoro—you can extend it slightly if needed
      `
    },
    {
      title: "Goal Alignment: From Vision to Daily Action",
      description: "Connect your daily pomodoros to your bigger life goals and vision.",
      icon: <BookOpen className="h-6 w-6 text-green-600" />,
      category: "Planning",
      content: `
        The most powerful productivity system is one where every pomodoro connects to something you genuinely care about. 
        When your daily work aligns with your larger vision, motivation becomes intrinsic rather than forced.
        
        ### The Goal Hierarchy:
        **Level 1: Life Vision** (5-10 years)
        Where do you want your life to be? What impact do you want to have?
        
        **Level 2: Annual Goals** (1 year)
        What major outcomes would move you toward your vision? Typically 3-5 significant goals.
        
        **Level 3: Quarterly Objectives** (3 months)
        What needs to happen this quarter to progress toward annual goals?
        
        **Level 4: Weekly Projects** (1 week)
        What specific projects or outcomes are you focused on this week?
        
        **Level 5: Daily Pomodoros** (Today)
        What specific work today moves you toward this week's projects?
        
        ### Creating Alignment:
        1. Write down your life vision.
        2. Define 3-5 annual goals that align with your vision.
        3. Break each annual goal into quarterly milestones.
        4. This week, identify which quarterly milestone you're working toward.
        5. Each pomodoro session, work on concrete actions toward that milestone.
        
        ### The Power of Alignment:
        When your pomodoro today connects directly to your life vision, something shifts. Your work feels meaningful. 
        Your motivation becomes sustainable. You're not just being productive—you're building the life you want.
      `
    },
    {
      title: "Dealing With Difficult Emotions During Work",
      description: "Navigate anxiety, resistance, and emotional blocks that appear during deep work.",
      icon: <Brain className="h-6 w-6 text-pink-600" />,
      category: "Psychology",
      content: `
        Sometimes, when you sit down to focus, emotions arise: anxiety, resistance, fear of failure, or overwhelm. 
        These emotions are completely normal, and they're not a sign you should stop.
        
        ### Understanding Emotional Resistance:
        Resistance often shows up as:
        - An sudden urge to check your phone
        - Restlessness or inability to sit still
        - Anxiety about whether you can do the work
        - Perfectionism ("I need everything to be perfect before I start")
        - Self-doubt ("Who am I to do this?")
        
        These aren't obstacles to overcome with force. They're information. They're telling you something is important.
        
        ### Strategies for Emotional Navigation:
        
        **1. Name and Acknowledge**
        Instead of fighting the emotion: "I notice I'm feeling anxious about this project. That's okay. I'm doing it anyway."
        This creates distance from the emotion and reduces its power over you.
        
        **2. Physical Grounding**
        - Feel your feet on the ground
        - Place your hand on your heart
        - Take 3 slow breaths before starting
        - Do 5 pushups or a quick stretch
        
        **3. The 2-Minute Commitment**
        You don't need to commit to the whole task. Just commit to 2 minutes of genuine effort. 
        Emotions often shift once you start.
        
        **4. Reframe the Emotion**
        - Anxiety → Excitement (they're physiologically similar)
        - Resistance → Importance (you resist what matters)
        - Self-doubt → Opportunity to grow
        - Overwhelm → Signal to break into smaller steps
        
        **5. Self-Compassion Pause**
        "This is hard, and I'm doing it anyway. I'm brave for facing this. I'm learning and growing."
        Self-compassion actually increases motivation more than self-criticism.
        
        ### Building Emotional Resilience:
        The more you practice working *with* difficult emotions rather than *from* them, the more resilient you become.
      `
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <Button 
          variant="ghost" 
          onClick={() => navigate("/")}
          className="mb-12 hover:bg-blue-100 text-blue-600 font-semibold"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Timer
        </Button>

        <div className="text-center mb-20">
          <div className="inline-block mb-6">
            <span className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
              Learning Center
            </span>
          </div>
          <h1 className="text-5xl sm:text-6xl font-extrabold text-slate-900 mb-6 leading-tight">
            Productivity Guides
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Master the fundamentals, optimize your workflow, and build sustainable productivity habits with 
            expert guidance and science-backed techniques.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          {guides.map((guide, category) => (
            <div key={category} className="text-center p-4 rounded-lg bg-gradient-to-br from-slate-50 to-blue-50 border border-slate-200">
              <div className="flex justify-center mb-3">{guide.icon}</div>
              <p className="text-xs font-bold text-blue-700 tracking-wider uppercase mb-2">{guide.category}</p>
              <p className="text-sm text-slate-700 font-medium">{guide.title}</p>
            </div>
          ))}
        </div>

        <div className="space-y-4">
          {guides.map((guide, index) => (
            <div 
              key={index}
              className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all"
            >
              <button
                onClick={() => setExpandedGuide(expandedGuide === index ? null : index)}
                className="w-full px-8 py-6 flex items-center justify-between hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-colors text-left"
              >
                <div className="flex items-center gap-6 flex-1">
                  <div className="p-3 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg flex-shrink-0">
                    {guide.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs font-bold tracking-wider uppercase">
                        {guide.category}
                      </span>
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900">
                      {guide.title}
                    </h2>
                    <p className="text-slate-600 mt-1 text-base">
                      {guide.description}
                    </p>
                  </div>
                </div>
                <ChevronDown 
                  className={`h-6 w-6 text-slate-400 flex-shrink-0 transition-transform duration-300 ml-4 ${
                    expandedGuide === index ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {expandedGuide === index && (
                <div className="px-8 py-6 bg-gradient-to-br from-slate-50 to-blue-50 border-t border-slate-200">
                  <div className="prose prose-blue prose-lg max-w-none text-slate-700 prose-headings:text-slate-900 prose-strong:text-slate-900 prose-a:text-blue-600 prose-code:bg-white prose-code:text-slate-800 prose-code:px-2 prose-code:py-1 prose-code:rounded whitespace-pre-line leading-relaxed">
                    {guide.content}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <footer className="mt-24 pt-12 border-t border-slate-200">
          <div className="text-center">
            <p className="text-slate-600 font-medium mb-2">
              &copy; {new Date().getFullYear()} Reflective Pomodoro
            </p>
            <p className="text-sm text-slate-500">
              Transforming productivity through intentional focus
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Guides;
