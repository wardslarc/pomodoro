import React from "react";
import { BookOpen, Clock, Brain, Zap, Target, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Guides = () => {
  const navigate = useNavigate();

  const guides = [
    {
      title: "Mastering the Pomodoro Technique",
      description: "Learn how to break your work into manageable intervals for maximum focus.",
      icon: <Clock className="h-6 w-6 text-blue-600" />,
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
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <Button 
          variant="ghost" 
          onClick={() => navigate("/")}
          className="mb-8 hover:bg-blue-50 text-blue-600"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Timer
        </Button>

        <div className="text-center mb-16">
          <h1 className="text-4xl font-extrabold text-slate-900 sm:text-5xl sm:tracking-tight lg:text-6xl">
            Productivity Guides
          </h1>
          <p className="mt-5 text-xl text-slate-500">
            Expert advice on focus, time management, and continuous learning.
          </p>
        </div>

        <div className="space-y-12">
          {guides.map((guide, index) => (
            <section key={index} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 transition-all hover:shadow-md">
              <div className="flex items-center mb-6">
                <div className="p-3 bg-slate-50 rounded-xl mr-4">
                  {guide.icon}
                </div>
                <h2 className="text-2xl font-bold text-slate-900">{guide.title}</h2>
              </div>
              <p className="text-lg text-slate-600 mb-6 font-medium italic">
                {guide.description}
              </p>
              <div className="prose prose-blue max-w-none text-slate-700 leading-relaxed whitespace-pre-line">
                {guide.content}
              </div>
            </section>
          ))}
        </div>

        <footer className="mt-20 text-center border-t border-slate-200 pt-10">
          <p className="text-slate-500">
            &copy; {new Date().getFullYear()} Reflective Pomodoro. All rights reserved.
          </p>
        </footer>
      </div>
    </div>
  );
};

export default Guides;
