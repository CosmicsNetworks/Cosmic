import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/authContext';
import axios from 'axios';
import { toast } from 'sonner';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { ThumbsUp, ThumbsDown, MessageSquare, Search, HelpCircle, Tag, Loader2 } from 'lucide-react';

interface FAQCategory {
  id: number;
  name: string;
  description: string;
  parentId: number | null;
}

interface FAQ {
  id: number;
  question: string;
  answer: string;
  categoryId: number;
  tags: string[];
  helpful: number;
  notHelpful: number;
  userRating?: 'helpful' | 'notHelpful' | null;
}

const FAQSection = () => {
  const { user, isPremium } = useAuth();
  const [categories, setCategories] = useState<FAQCategory[]>([]);
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<number | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [activeTab, setActiveTab] = useState('browse');
  const [submittingRating, setSubmittingRating] = useState<number | null>(null);

  useEffect(() => {
    fetchCategories();
    fetchFAQs();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await axios.get('/api/faq/categories');
      if (response.data.categories) {
        setCategories(response.data.categories);
      }
    } catch (error) {
      console.error('Error fetching FAQ categories:', error);
      toast.error('Failed to load FAQ categories');
    }
  };

  const fetchFAQs = async (categoryId?: number, query?: string) => {
    try {
      setLoading(true);
      let url = '/api/faq';
      const params = new URLSearchParams();

      if (categoryId && categoryId !== 'all') {
        params.append('categoryId', categoryId.toString());
      }

      if (query) {
        params.append('search', query);
      }

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await axios.get(url);
      if (response.data.faqs) {
        setFaqs(response.data.faqs);
      }
    } catch (error) {
      console.error('Error fetching FAQs:', error);
      toast.error('Failed to load FAQs');
    } finally {
      setLoading(false);
      setIsSearching(false);
    }
  };

  const handleCategoryChange = (categoryId: number | 'all') => {
    setSelectedCategory(categoryId);
    fetchFAQs(categoryId === 'all' ? undefined : categoryId, searchQuery);
  };

  const handleSearch = () => {
    setIsSearching(true);
    setActiveTab('search');
    fetchFAQs(selectedCategory === 'all' ? undefined : selectedCategory, searchQuery);
  };

  const handleRateFAQ = async (faqId: number, isHelpful: boolean) => {
    if (!user) {
      toast.error('You must be logged in to rate FAQs');
      return;
    }

    try {
      setSubmittingRating(faqId);
      const response = await axios.post(`/api/faq/${faqId}/rating`, { helpful: isHelpful });

      // Update local state
      setFaqs(faqs.map(faq => 
        faq.id === faqId 
          ? { 
              ...faq, 
              helpful: isHelpful ? faq.helpful + 1 : faq.helpful,
              notHelpful: !isHelpful ? faq.notHelpful + 1 : faq.notHelpful,
              userRating: isHelpful ? 'helpful' : 'notHelpful'
            } 
          : faq
      ));

      toast.success('Thank you for your feedback!');
    } catch (error) {
      console.error('Error rating FAQ:', error);
      toast.error('Failed to submit rating');
    } finally {
      setSubmittingRating(null);
    }
  };

  const getCategoryName = (categoryId: number) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.name : 'Uncategorized';
  };

  return (
    <div className="space-y-6">
      <Card className="border border-slate-800 bg-slate-900/40 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-purple-400" />
            Frequently Asked Questions
          </CardTitle>
          <CardDescription>
            Find answers to common questions or submit a support ticket
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-500" />
                <Input
                  placeholder="Search for help..."
                  className="pl-9 bg-black/30 border-slate-700"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleSearch();
                    }
                  }}
                />
              </div>
              <Button 
                onClick={handleSearch}
                disabled={isSearching || !searchQuery.trim()}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {isSearching ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Search className="h-4 w-4 mr-2" />}
                Search
              </Button>
              {isPremium && (
                <Button 
                  variant="outline" 
                  className="border-amber-500/30 text-amber-400 hover:bg-amber-500/10"
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Priority Support
                </Button>
              )}
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="browse">Browse by Category</TabsTrigger>
                <TabsTrigger value="search">Search Results</TabsTrigger>
              </TabsList>

              <TabsContent value="browse" className="pt-4">
                <div className="flex flex-wrap gap-2 mb-6">
                  <Button
                    variant={selectedCategory === 'all' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleCategoryChange('all')}
                    className={selectedCategory === 'all' ? 'bg-purple-600 hover:bg-purple-700' : 'border-slate-700'}
                  >
                    All Categories
                  </Button>
                  {categories.map((category) => (
                    <Button
                      key={category.id}
                      variant={selectedCategory === category.id ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleCategoryChange(category.id)}
                      className={selectedCategory === category.id ? 'bg-purple-600 hover:bg-purple-700' : 'border-slate-700'}
                    >
                      {category.name}
                    </Button>
                  ))}
                </div>

                {renderFAQs()}
              </TabsContent>

              <TabsContent value="search" className="pt-4">
                {searchQuery ? (
                  renderFAQs()
                ) : (
                  <div className="text-center py-8">
                    <Search className="h-12 w-12 text-slate-600 mx-auto mb-4" />
                    <h3 className="text-lg font-medium">Search for Help</h3>
                    <p className="text-sm text-slate-400 mt-2">
                      Enter a keyword or phrase to search our knowledge base
                    </p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </CardContent>
      </Card>

      <Card className="border border-slate-800 bg-slate-900/40 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-purple-400" />
            Need More Help?
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 border border-slate-700 rounded-lg">
              <h3 className="font-semibold mb-2">Open a Support Ticket</h3>
              <p className="text-sm text-slate-400 mb-4">
                Can't find what you're looking for? Create a support ticket and our team will help you.
              </p>
              <Button className="w-full bg-purple-600 hover:bg-purple-700">
                Create Support Ticket
              </Button>
            </div>

            <div className="p-4 border border-amber-500/20 rounded-lg bg-black/20">
              <h3 className="font-semibold mb-2 flex items-center">
                <span className="mr-2">Premium Support</span>
                {isPremium && (
                  <span className="text-xs bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full">
                    Available
                  </span>
                )}
              </h3>
              <p className="text-sm text-slate-400 mb-4">
                {isPremium 
                  ? "As a Premium user, you have access to priority support with faster response times."
                  : "Upgrade to Premium for priority support with dedicated assistance and faster response times."}
              </p>
              {isPremium ? (
                <Button className="w-full bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-black">
                  Contact Premium Support
                </Button>
              ) : (
                <Button className="w-full bg-slate-800 hover:bg-slate-700 text-amber-400" disabled>
                  Upgrade to Premium
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  function renderFAQs() {
    if (loading) {
      return (
        <div className="flex justify-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full"></div>
        </div>
      );
    }

    if (faqs.length === 0) {
      return (
        <div className="text-center py-12 space-y-3">
          <HelpCircle className="h-12 w-12 text-slate-600 mx-auto" />
          <h3 className="text-lg font-medium">No FAQs Found</h3>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            {searchQuery 
              ? `No results found for "${searchQuery}". Try a different search term or browse by category.`
              : "No FAQs available in this category yet."}
          </p>
        </div>
      );
    }

    return (
      <Accordion type="single" collapsible className="w-full">
        {faqs.map((faq) => (
          <AccordionItem 
            key={faq.id} 
            value={`faq-${faq.id}`}
            className="border-slate-700"
          >
            <AccordionTrigger className="text-left hover:no-underline py-4">
              <div className="flex flex-col items-start">
                <div className="text-slate-100">{faq.question}</div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded-full">
                    {getCategoryName(faq.categoryId)}
                  </span>
                  {faq.tags.map((tag, index) => (
                    <span 
                      key={index} 
                      className="text-xs bg-slate-700 text-slate-300 px-2 py-0.5 rounded-full flex items-center"
                    >
                      <Tag className="h-3 w-3 mr-1" />
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-2 pb-4">
              <div className="prose prose-slate prose-sm dark:prose-invert max-w-none">
                <div dangerouslySetInnerHTML={{ __html: faq.answer }} />
              </div>

              <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-800">
                <div className="text-xs text-slate-500">Was this answer helpful?</div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className={`h-8 border-slate-700 ${faq.userRating === 'helpful' ? 'bg-green-500/20 text-green-400 border-green-500/30' : ''}`}
                    onClick={() => handleRateFAQ(faq.id, true)}
                    disabled={!!faq.userRating || submittingRating === faq.id}
                  >
                    {submittingRating === faq.id ? (
                      <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
                    ) : (
                      <ThumbsUp className="h-3.5 w-3.5 mr-1" />
                    )}
                    Yes ({faq.helpful})
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className={`h-8 border-slate-700 ${faq.userRating === 'notHelpful' ? 'bg-red-500/20 text-red-400 border-red-500/30' : ''}`}
                    onClick={() => handleRateFAQ(faq.id, false)}
                    disabled={!!faq.userRating || submittingRating === faq.id}
                  >
                    {submittingRating === faq.id ? (
                      <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
                    ) : (
                      <ThumbsDown className="h-3.5 w-3.5 mr-1" />
                    )}
                    No ({faq.notHelpful})
                  </Button>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    );
  }
};

export default FAQSection;