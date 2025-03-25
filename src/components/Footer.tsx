
import React from 'react';
import { Link } from 'react-router-dom';
import { Github, Linkedin, Mail, Twitter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

const Footer = () => {
  return (
    <footer className="border-t border-border/40 bg-card/30 backdrop-blur-md">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-4">
            <h3 className="text-2xl font-medium tracking-tight">vGPT</h3>
            <p className="text-muted-foreground max-w-md">
              A sophisticated AI assistant powered by Azure OpenAI, with OCR capabilities for extracting text from documents and images.
            </p>
            <div className="flex gap-4">
              <Button variant="ghost" size="icon" asChild>
                <a href="https://github.com/gopalkumr" target="_blank" rel="noopener noreferrer">
                  <Github className="h-5 w-5" />
                  <span className="sr-only">GitHub</span>
                </a>
              </Button>
              <Button variant="ghost" size="icon" asChild>
                <a href="https://twitter.com/gopalkumr" target="_blank" rel="noopener noreferrer">
                  <Twitter className="h-5 w-5" />
                  <span className="sr-only">Twitter</span>
                </a>
              </Button>
              <Button variant="ghost" size="icon" asChild>
                <a href="https://linkedin.com/in/gopalkumr" target="_blank" rel="noopener noreferrer">
                  <Linkedin className="h-5 w-5" />
                  <span className="sr-only">LinkedIn</span>
                </a>
              </Button>
              <Button variant="ghost" size="icon" asChild>
                <a href="mailto:gopal@example.com">
                  <Mail className="h-5 w-5" />
                  <span className="sr-only">Email</span>
                </a>
              </Button>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16 border-2 border-primary/10">
                <AvatarImage 
                  src="https://github-production-user-asset-6210df.s3.amazonaws.com/91552766/423399930-a6839b0a-ba96-4ccd-b11e-73a12950633a.png" 
                  alt="Gopal Kumar" 
                />
                <AvatarFallback>GK</AvatarFallback>
              </Avatar>
              <div>
                <h4 className="text-lg font-medium">Gopal Kumar</h4>
                <p className="text-muted-foreground">
                  AI Developer & Full Stack Engineer
                </p>
              </div>
            </div>
            <p className="text-muted-foreground">
              Passionate developer with expertise in AI and web technologies. 
              vGPT was created to demonstrate how Azure AI can be integrated with OCR 
              capabilities and a Supabase backend to create a powerful, user-friendly application.
            </p>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link to="/chat">Try vGPT</Link>
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <a href="mailto:gopal@example.com">Contact Me</a>
              </Button>
            </div>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-border/40 text-sm text-muted-foreground text-center">
          <p>© {new Date().getFullYear()} vGPT by Gopal Kumar. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
