// components/social/SocialFeed.tsx
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  Heart, 
  MessageCircle, 
  Share, 
  BookOpen, 
  Filter, 
  Search,
  MoreHorizontal,
  Send,
  Clock,
  Target,
  Zap,
  TrendingUp
} from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface User {
  uid: string;
  name: string;
  email: string;
  avatar?: string;
}

interface Comment {
  _id: string;
  userId: {
    uid: string;
    name: string;
    avatar?: string;
  };
  text: string;
  createdAt: string;
}

interface ReflectionPost {
  _id: string;
  learnings: string;
  sessionId: string;
  userId: User;
  likes: string[];
  comments: Comment[];
  createdAt: string;
  isPublic: boolean;
  tags: string[];
}

const API_BASE_URL = import.meta.env.VITE_API_URL || "https://www.reflectivepomodoro.com/";

// Constants
const INITIAL_COMMENTS_DISPLAY = 2;
const DEBOUNCE_DELAY = 300;

const SocialFeed: React.FC = () => {
  const { user, token } = useAuth();
  const [posts, setPosts] = useState<ReflectionPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTag, setSelectedTag] = useState<string>("all");
  const [commentTexts, setCommentTexts] = useState<Record<string, string>>({});

  // Memoized API call
  const fetchPosts = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/social/posts`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      
      if (response.ok) {
        const data = await response.json();
        setPosts(data.data?.posts || []);
      } else {
        console.error('Failed to fetch posts:', response.status);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handleLike = async (postId: string) => {
    if (!user?.uid || !token) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/social/posts/${postId}/like`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setPosts(prevPosts => prevPosts.map(post => {
          if (post._id === postId) {
            const isLiked = post.likes.includes(user.uid);
            return {
              ...post,
              likes: isLiked 
                ? post.likes.filter(id => id !== user.uid)
                : [...post.likes, user.uid]
            };
          }
          return post;
        }));
      }
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const handleComment = async (postId: string) => {
    if (!user?.uid || !token || !commentTexts[postId]?.trim()) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/social/posts/${postId}/comment`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text: commentTexts[postId].trim()
        })
      });

      if (response.ok) {
        const data = await response.json();
        setPosts(prevPosts => prevPosts.map(post => {
          if (post._id === postId) {
            return {
              ...post,
              comments: [...post.comments, data.data.comment]
            };
          }
          return post;
        }));
        setCommentTexts(prev => ({ ...prev, [postId]: '' }));
      }
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  // Memoized filtered posts
  const filteredPosts = useMemo(() => {
    return posts.filter(post => {
      const matchesSearch = post.learnings.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           post.userId.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesTag = selectedTag === "all" || post.tags.includes(selectedTag);
      return matchesSearch && matchesTag;
    });
  }, [posts, searchTerm, selectedTag]);

  // Memoized tags
  const allTags = useMemo(() => 
    Array.from(new Set(posts.flatMap(post => post.tags))), 
    [posts]
  );

  // Memoized statistics
  const stats = useMemo(() => ({
    totalPosts: posts.length,
    totalLikes: posts.reduce((acc, post) => acc + post.likes.length, 0),
    totalComments: posts.reduce((acc, post) => acc + post.comments.length, 0),
    totalTags: allTags.length
  }), [posts, allTags.length]);

  const getTimeAgo = useCallback((dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return date.toLocaleDateString();
  }, []);

  if (loading) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30">
      <div className="max-w-6xl mx-auto p-6">
        <HeaderSection />
        
        <StatsSection stats={stats} />
        
        <SearchAndFilterSection 
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          selectedTag={selectedTag}
          onTagChange={setSelectedTag}
          allTags={allTags}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {filteredPosts.map(post => (
              <PostCard
                key={post._id}
                post={post}
                currentUser={user}
                onLike={handleLike}
                onComment={handleComment}
                commentText={commentTexts[post._id] || ''}
                onCommentChange={(text) => setCommentTexts(prev => ({ ...prev, [post._id]: text }))}
                getTimeAgo={getTimeAgo}
              />
            ))}
            
            <EmptyState 
              hasPosts={posts.length > 0}
              hasFilteredPosts={filteredPosts.length === 0}
            />
          </div>

          <Sidebar 
            allTags={allTags}
            selectedTag={selectedTag}
            onTagSelect={setSelectedTag}
          />
        </div>
      </div>
    </div>
  );
};

// Sub-components for better organization
const LoadingSkeleton: React.FC = () => (
  <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30">
    <div className="max-w-6xl mx-auto p-6">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-slate-200 rounded-full" />
                <div className="space-y-2">
                  <div className="h-4 bg-slate-200 rounded w-20" />
                  <div className="h-3 bg-slate-200 rounded w-16" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-4 bg-slate-200 rounded w-full" />
                <div className="h-4 bg-slate-200 rounded w-3/4" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  </div>
);

const HeaderSection: React.FC = () => (
  <div className="text-center mb-8">
    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg mb-4">
      <BookOpen className="h-8 w-8 text-white" />
    </div>
    <h1 className="text-4xl font-bold bg-gradient-to-br from-slate-800 to-slate-600 bg-clip-text text-transparent mb-3">
      Reflection Community
    </h1>
    <p className="text-slate-600 text-lg max-w-2xl mx-auto">
      Connect with fellow learners. Share insights, celebrate progress, and grow together.
    </p>
  </div>
);

const StatsSection: React.FC<{ stats: { totalPosts: number; totalLikes: number; totalComments: number; totalTags: number } }> = ({ stats }) => (
  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
    <StatCard 
      icon={<BookOpen className="h-5 w-5 text-blue-600" />}
      value={stats.totalPosts}
      label="Total Reflections"
      bgColor="bg-blue-100"
    />
    <StatCard 
      icon={<Zap className="h-5 w-5 text-green-600" />}
      value={stats.totalLikes}
      label="Total Likes"
      bgColor="bg-green-100"
    />
    <StatCard 
      icon={<MessageCircle className="h-5 w-5 text-purple-600" />}
      value={stats.totalComments}
      label="Total Comments"
      bgColor="bg-purple-100"
    />
    <StatCard 
      icon={<TrendingUp className="h-5 w-5 text-orange-600" />}
      value={stats.totalTags}
      label="Topics"
      bgColor="bg-orange-100"
    />
  </div>
);

const StatCard: React.FC<{ icon: React.ReactNode; value: number; label: string; bgColor: string }> = ({ 
  icon, value, label, bgColor 
}) => (
  <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
    <div className="flex items-center space-x-3">
      <div className={`p-2 ${bgColor} rounded-lg`}>
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold text-slate-800">{value}</p>
        <p className="text-sm text-slate-600">{label}</p>
      </div>
    </div>
  </div>
);

const SearchAndFilterSection: React.FC<{
  searchTerm: string;
  onSearchChange: (term: string) => void;
  selectedTag: string;
  onTagChange: (tag: string) => void;
  allTags: string[];
}> = ({ searchTerm, onSearchChange, selectedTag, onTagChange, allTags }) => (
  <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 mb-8">
    <div className="flex flex-col lg:flex-row gap-4 items-center">
      <div className="flex-1 w-full">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search reflections, insights, or users..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 h-12 rounded-xl border-slate-200 focus:border-blue-300"
          />
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        <div className="flex items-center space-x-2 bg-slate-50 rounded-xl px-4 py-2">
          <Filter className="h-4 w-4 text-slate-500" />
          <select 
            value={selectedTag}
            onChange={(e) => onTagChange(e.target.value)}
            className="bg-transparent border-none text-sm focus:ring-0"
          >
            <option value="all">All Topics</option>
            {allTags.map(tag => (
              <option key={tag} value={tag}>{tag}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  </div>
);

const EmptyState: React.FC<{ hasPosts: boolean; hasFilteredPosts: boolean }> = ({ 
  hasPosts, 
  hasFilteredPosts 
}) => {
  if (!hasFilteredPosts) return null;

  return (
    <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-slate-100">
      <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <BookOpen className="h-8 w-8 text-slate-400" />
      </div>
      <h3 className="text-xl font-semibold text-slate-700 mb-2">
        {hasPosts ? "No matching reflections" : "No reflections yet"}
      </h3>
      <p className="text-slate-500 mb-6">
        {hasPosts 
          ? "Try adjusting your search or filters" 
          : "Be the first to share your learning journey!"}
      </p>
    </div>
  );
};

const Sidebar: React.FC<{
  allTags: string[];
  selectedTag: string;
  onTagSelect: (tag: string) => void;
}> = ({ allTags, selectedTag, onTagSelect }) => (
  <div className="space-y-6">
    <Card className="rounded-2xl border-slate-100 shadow-sm">
      <CardHeader className="pb-4">
        <h3 className="font-semibold text-slate-800 flex items-center">
          <TrendingUp className="h-4 w-4 mr-2 text-blue-500" />
          Popular Topics
        </h3>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {allTags.slice(0, 8).map(tag => (
            <button
              key={tag}
              onClick={() => onTagSelect(tag)}
              className={`flex items-center justify-between w-full p-2 rounded-lg transition-colors ${
                selectedTag === tag ? 'bg-blue-50 text-blue-700' : 'hover:bg-slate-50'
              }`}
            >
              <span className="text-sm font-medium">#{tag}</span>
              <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
                {allTags.filter(t => t === tag).length}
              </span>
            </button>
          ))}
        </div>
      </CardContent>
    </Card>

    <CommunityGuidelines />
  </div>
);

const CommunityGuidelines: React.FC = () => (
  <Card className="rounded-2xl border-slate-100 shadow-sm bg-gradient-to-br from-slate-50 to-blue-50/50">
    <CardContent className="p-6">
      <div className="text-center">
        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <BookOpen className="h-6 w-6 text-blue-600" />
        </div>
        <h4 className="font-semibold text-slate-800 mb-2">Community Guidelines</h4>
        <p className="text-sm text-slate-600 mb-4">
          Share constructive insights and support fellow learners in their journey.
        </p>
        <div className="space-y-2 text-xs text-slate-500">
          {["Be kind and respectful", "Share learning experiences", "Celebrate progress together"].map((guideline, index) => (
            <div key={index} className="flex items-center justify-center space-x-1">
              <div className="w-1 h-1 bg-slate-300 rounded-full" />
              <span>{guideline}</span>
            </div>
          ))}
        </div>
      </div>
    </CardContent>
  </Card>
);

// PostCard component remains largely the same but with better organization
const PostCard: React.FC<{
  post: ReflectionPost;
  currentUser: User | null;
  onLike: (postId: string) => void;
  onComment: (postId: string) => void;
  commentText: string;
  onCommentChange: (text: string) => void;
  getTimeAgo: (date: string) => string;
}> = ({ post, currentUser, onLike, onComment, commentText, onCommentChange, getTimeAgo }) => {
  const isLiked = currentUser && post.likes.includes(currentUser.uid);
  const [showAllComments, setShowAllComments] = useState(false);

  const displayedComments = showAllComments 
    ? post.comments 
    : post.comments.slice(-INITIAL_COMMENTS_DISPLAY);

  return (
    <Card className="rounded-2xl border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
      <CardHeader className="pb-4">
        <PostHeader post={post} getTimeAgo={getTimeAgo} />
      </CardHeader>

      <CardContent className="pb-4">
        <PostContent post={post} />
      </CardContent>

      <PostStats likes={post.likes.length} comments={post.comments.length} />
      
      <PostActions 
        isLiked={!!isLiked}
        onLike={() => onLike(post._id)}
        currentUser={currentUser}
      />

      <PostComments 
        comments={displayedComments}
        allCommentsCount={post.comments.length}
        showAllComments={showAllComments}
        onToggleComments={() => setShowAllComments(!showAllComments)}
        getTimeAgo={getTimeAgo}
      />

      <PostCommentInput 
        currentUser={currentUser}
        commentText={commentText}
        onCommentChange={onCommentChange}
        onComment={() => onComment(post._id)}
      />
    </Card>
  );
};

const PostHeader: React.FC<{ post: ReflectionPost; getTimeAgo: (date: string) => string }> = ({ 
  post, getTimeAgo 
}) => (
  <div className="flex items-center justify-between">
    <div className="flex items-center space-x-3">
      <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
        <AvatarImage src={post.userId.avatar} alt={post.userId.name} />
        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
          {post.userId.name.charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div>
        <p className="font-semibold text-slate-800">{post.userId.name}</p>
        <div className="flex items-center space-x-2 text-xs text-slate-500">
          <Clock className="h-3 w-3" />
          <span>{getTimeAgo(post.createdAt)}</span>
          <Target className="h-3 w-3 ml-1" />
          <span>Session {post.sessionId.substring(0, 6)}</span>
        </div>
      </div>
    </div>
    
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">Post options</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem>Save</DropdownMenuItem>
        <DropdownMenuItem>Report</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  </div>
);

const PostContent: React.FC<{ post: ReflectionPost }> = ({ post }) => (
  <>
    <div className="prose prose-sm max-w-none">
      {post.learnings.split('\n').map((line, index) => (
        <p key={index} className="mb-3 text-slate-700 leading-relaxed">
          {line}
        </p>
      ))}
    </div>
    
    {post.tags.length > 0 && (
      <div className="flex flex-wrap gap-2 mt-4">
        {post.tags.map(tag => (
          <Badge 
            key={tag} 
            variant="secondary" 
            className="bg-blue-50 text-blue-700 hover:bg-blue-100 border-0 text-xs px-3 py-1 rounded-full"
          >
            #{tag}
          </Badge>
        ))}
      </div>
    )}
  </>
);

const PostStats: React.FC<{ likes: number; comments: number }> = ({ likes, comments }) => (
  <div className="px-6 py-3 border-t border-slate-100 bg-slate-50/50">
    <div className="flex items-center justify-between text-sm text-slate-600">
      <div className="flex items-center space-x-4">
        <span className="flex items-center space-x-1">
          <Heart className="h-4 w-4" />
          <span>{likes} likes</span>
        </span>
        <span className="flex items-center space-x-1">
          <MessageCircle className="h-4 w-4" />
          <span>{comments} comments</span>
        </span>
      </div>
    </div>
  </div>
);

const PostActions: React.FC<{ 
  isLiked: boolean; 
  onLike: () => void; 
  currentUser: User | null;
}> = ({ isLiked, onLike, currentUser }) => (
  <div className="px-6 py-3 border-t border-slate-100">
    <div className="flex space-x-1">
      <Button
        variant="ghost"
        size="sm"
        onClick={onLike}
        className={`flex-1 rounded-lg ${isLiked ? 'text-red-500 bg-red-50' : 'text-slate-600 hover:text-red-500'}`}
        disabled={!currentUser}
      >
        <Heart className={`h-4 w-4 mr-2 ${isLiked ? 'fill-current' : ''}`} />
        {isLiked ? 'Liked' : 'Like'}
      </Button>
      
      <Button 
        variant="ghost" 
        size="sm" 
        className="flex-1 rounded-lg text-slate-600 hover:text-blue-500"
        disabled={!currentUser}
      >
        <MessageCircle className="h-4 w-4 mr-2" />
        Comment
      </Button>
      
      <Button variant="ghost" size="sm" className="flex-1 rounded-lg text-slate-600 hover:text-green-500">
        <Share className="h-4 w-4 mr-2" />
        Share
      </Button>
    </div>
  </div>
);

const PostComments: React.FC<{
  comments: Comment[];
  allCommentsCount: number;
  showAllComments: boolean;
  onToggleComments: () => void;
  getTimeAgo: (date: string) => string;
}> = ({ comments, allCommentsCount, showAllComments, onToggleComments, getTimeAgo }) => {
  if (comments.length === 0) return null;

  return (
    <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/30">
      <div className="space-y-3">
        {comments.map(comment => (
          <div key={comment._id} className="flex space-x-3">
            <Avatar className="h-6 w-6 flex-shrink-0">
              <AvatarFallback className="text-xs bg-slate-200">
                {comment.userId.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="bg-white rounded-2xl px-4 py-3 shadow-sm border border-slate-100">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="font-medium text-sm text-slate-800">
                    {comment.userId.name}
                  </span>
                  <span className="text-xs text-slate-500">
                    {getTimeAgo(comment.createdAt)}
                  </span>
                </div>
                <p className="text-sm text-slate-700">{comment.text}</p>
              </div>
            </div>
          </div>
        ))}
        
        {allCommentsCount > INITIAL_COMMENTS_DISPLAY && (
          <Button 
            variant="link" 
            size="sm" 
            className="px-0 text-blue-600 hover:text-blue-700 text-xs"
            onClick={onToggleComments}
          >
            {showAllComments ? 'Show less' : `View all ${allCommentsCount} comments`}
          </Button>
        )}
      </div>
    </div>
  );
};

const PostCommentInput: React.FC<{
  currentUser: User | null;
  commentText: string;
  onCommentChange: (text: string) => void;
  onComment: () => void;
}> = ({ currentUser, commentText, onCommentChange, onComment }) => {
  if (!currentUser) return null;

  return (
    <div className="px-6 py-4 border-t border-slate-100">
      <div className="flex space-x-3">
        <Avatar className="h-8 w-8 flex-shrink-0">
          <AvatarFallback className="text-sm bg-gradient-to-br from-blue-500 to-purple-600 text-white">
            {currentUser.name.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 flex space-x-2">
          <Input
            placeholder="Add a comment..."
            value={commentText}
            onChange={(e) => onCommentChange(e.target.value)}
            onKeyDown={(e) => {
              e.stopPropagation();
              if (e.key === 'Enter' && commentText.trim()) {
                e.preventDefault();
                onComment();
              }
            }}
            className="flex-1 rounded-xl border-slate-200 focus:border-blue-300"
          />
          <Button 
            size="sm" 
            onClick={onComment}
            disabled={!commentText.trim()}
            className="rounded-xl bg-blue-500 hover:bg-blue-600"
          >
            <Send className="h-4 w-4" />
            <span className="sr-only">Send comment</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SocialFeed;