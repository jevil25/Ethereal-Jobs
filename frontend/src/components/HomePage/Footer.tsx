import { Github, Twitter } from "lucide-react";
import { Button } from "../ui/button";

const Footer = () => {
  return (
    <footer className="w-full border-t py-8 md:py-10 bg-gray-50">
      <div className="container max-w-6xl mx-auto px-4">
        <div className="flex flex-col items-center justify-center gap-5">
          <p className="text-sm text-muted-foreground text-center">
            Made with ☕ coffee and ❤️ love by Aaron Jevil Nazareth
          </p>
          
          <div className="flex items-center justify-center gap-4">
            <Button variant="ghost" size="icon" className="hover:bg-slate-100 transition-colors duration-200" asChild>
              <a 
                href="https://github.com/jevil25" 
                target="_blank" 
                rel="noopener noreferrer" 
                aria-label="GitHub"
                className="rounded-full"
              >
                <Github className="h-5 w-5" />
                <span className="sr-only">GitHub</span>
              </a>
            </Button>
            
            <Button variant="ghost" size="icon" className="hover:bg-slate-100 transition-colors duration-200" asChild>
              <a 
                href="https://x.com/jevil257" 
                target="_blank" 
                rel="noopener noreferrer" 
                aria-label="X (Twitter)"
                className="rounded-full"
              >
                <Twitter className="h-5 w-5" />
                <span className="sr-only">X (Twitter)</span>
              </a>
            </Button>
            
            {/* <Button variant="ghost" size="icon" className="hover:bg-slate-100 transition-colors duration-200" asChild>
              <a 
                href="mailto:aaronjnazareth@gmail.com" 
                aria-label="Email"
                className="rounded-full"
              >
                <Mail className="h-5 w-5" />
                <span className="sr-only">Email</span>
              </a>
            </Button> */}
          </div>
          
          <div className="text-xs text-center text-muted-foreground mt-2">
            © {new Date().getFullYear()} Aaron Nazareth. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;