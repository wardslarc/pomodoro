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
