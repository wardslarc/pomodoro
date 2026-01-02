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
