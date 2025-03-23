import { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Send } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../components/ui/dialog';
import { Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,} from '../components/ui/select';
import { Textarea } from '../components/ui/textarea';
import showToast from '../components/ui/toast';
import { sendFeedback } from '../api/user';


const FeedbackButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [page, setPage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const pages = [
    { value: 'Resume Builder', label: 'Resume Builder' },
    { value: 'jobs', label: 'Job Listings' },
    { value: 'Individual Job', label: 'Individual Job Analysis' },
    { value: 'LinkedIn Profile', label: 'LinkedIn Profile' },
    { value: "Others", label: "Others" },
  ];

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!message.trim()) {
      return;
    }
    
    setIsSubmitting(true);
    const success = await sendFeedback(page, message);
    if (success)
        showToast("Feedback submitted, Thank you for helping us improve!", "success");
    else
        showToast("Error sending feedback. Please try again.", "error");
    
    setIsSubmitting(false);
    setIsOpen(false);
    setMessage('');
    setPage('');
  };

  return (
    <>
      <motion.div
        className="fixed bottom-6 right-6 z-50"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Button
          onClick={() => setIsOpen(true)}
          className="h-12 w-12 rounded-full p-0 bg-blue-600 hover:bg-blue-700 shadow-lg flex items-center justify-center"
          aria-label="Give Feedback"
        >
          <MessageSquare className="h-6 w-6 text-white" />
        </Button>
        <motion.span
          className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs px-1 py-0.5 rounded-md"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          Feedback
        </motion.span>
      </motion.div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="bg-white rounded-xl border-0 shadow-lg max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-gray-800">
              We value your feedback
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            <div className="space-y-2">
              <label htmlFor="page" className="text-sm font-medium text-gray-700">
                Which feature are you giving feedback on?
              </label>
              <Select value={page} onValueChange={setPage}>
                <SelectTrigger className="border-gray-300 focus:ring-blue-500 focus:border-blue-500">
                  <SelectValue placeholder="Select a page" />
                </SelectTrigger>
                <SelectContent>
                  {pages.map((page) => (
                    <SelectItem key={page.value} value={page.value}>
                      {page.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="message" className="text-sm font-medium text-gray-700">
                Your feedback
              </label>
              <Textarea
                id="message"
                placeholder="Share your thoughts, suggestions, or report issues..."
                className="min-h-[100px] border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </div>
            
            <DialogFooter>
              <Button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white"
                disabled={!message.trim() || isSubmitting}
              >
                {isSubmitting ? (
                  <motion.div
                    className="flex items-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Sending...
                  </motion.div>
                ) : (
                  <span className="flex items-center">
                    <Send className="h-4 w-4 mr-2" /> Send Feedback
                  </span>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default FeedbackButton;
