
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  MessageSquare, 
  Cpu, 
  Image, 
  FileText, 
  PanelRight,
  Lock,
  ArrowRight,
  Github,
  Sparkles,
  User,
  Linkedin,
  Mail
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

const AnimatedGradient = () => (
  <div className="absolute inset-0 -z-10 h-full w-full bg-white">
    <div className="absolute top-0 left-0 right-0 h-[500px] rounded-full bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 opacity-50 blur-3xl" />
    <div className="absolute bottom-0 right-0 left-0 h-[500px] rounded-full bg-gradient-to-l from-rose-50 via-orange-50 to-yellow-50 opacity-40 blur-3xl" />
  </div>
);

const FloatingParticle = ({ className }: { className?: string }) => (
  <div className={`absolute rounded-full opacity-30 animate-pulse-slow ${className}`}></div>
);

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col overflow-hidden">
      <AnimatedGradient />
      
      {/* Animated floating particles */}
      <FloatingParticle className="h-4 w-4 bg-blue-400 top-1/4 left-1/4" />
      <FloatingParticle className="h-6 w-6 bg-purple-400 top-1/3 right-1/4" />
      <FloatingParticle className="h-3 w-3 bg-pink-400 bottom-1/4 left-1/3" />
      <FloatingParticle className="h-5 w-5 bg-indigo-400 bottom-1/3 right-1/3" />
      
      <Navbar />
      
      {/* Hero Section */}
      <section className="flex-1 pt-24 md:pt-32 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center space-y-6 animate-fade-in">
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-sm mb-4 animate-slide-up">
              <Sparkles className="h-4 w-4 mr-2" />
              <span>Powered by Azure OpenAI</span>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight leading-tight">
              Your AI  with Vision
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              vGPT translates documents and images into intelligent insights with Azure's advanced AI technology.
            </p>
            <div className="flex flex-wrap justify-center gap-4 pt-4">
              <Link to="/chat">
                <Button size="lg" className="gap-2 relative overflow-hidden group">
                  <span className="absolute inset-0 bg-gradient-to-r from-blue-400/30 to-violet-400/30 animate-pulse-slow opacity-0 group-hover:opacity-100 transition-opacity duration-500"></span>
                  Start Chatting
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <a href="https://github.com/gopalkumr" target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="lg" className="gap-2">
                  <Github className="h-4 w-4" />
                  View on GitHub
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-20 bg-secondary/30 overflow-hidden relative">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-semibold mb-4 animate-slide-up animate-delay-100">Powerful Features</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Experience the perfect blend of advanced AI and intuitive design
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-background rounded-xl p-6 shadow-sm border border-border/50 transition-all hover:shadow-md hover:border-border hover:-translate-y-1 duration-300">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Cpu className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-medium mb-2">Azure GPT-3.5 Turbo</h3>
              <p className="text-muted-foreground">
                Powered by Azure's advanced AI models for intelligent and nuanced conversations.
              </p>
            </div>
            
            <div className="bg-background rounded-xl p-6 shadow-sm border border-border/50 transition-all hover:shadow-md hover:border-border hover:-translate-y-1 duration-300">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-medium mb-2">Document OCR</h3>
              <p className="text-muted-foreground">
                Extract text from PDFs and process them through the AI for intelligent insights.
              </p>
            </div>
            
            <div className="bg-background rounded-xl p-6 shadow-sm border border-border/50 transition-all hover:shadow-md hover:border-border hover:-translate-y-1 duration-300">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Image className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-medium mb-2">Image Analysis</h3>
              <p className="text-muted-foreground">
                Extract text from images and include it in your conversations with the AI.
              </p>
            </div>
            
            <div className="bg-background rounded-xl p-6 shadow-sm border border-border/50 transition-all hover:shadow-md hover:border-border hover:-translate-y-1 duration-300">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <MessageSquare className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-medium mb-2">Chat History</h3>
              <p className="text-muted-foreground">
                All your conversations are stored securely for easy reference and continuity.
              </p>
            </div>
            
            <div className="bg-background rounded-xl p-6 shadow-sm border border-border/50 transition-all hover:shadow-md hover:border-border hover:-translate-y-1 duration-300">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <PanelRight className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-medium mb-2">Intuitive UI</h3>
              <p className="text-muted-foreground">
                Clean, minimal design with smooth animations for an exceptional user experience.
              </p>
            </div>
            
            <div className="bg-background rounded-xl p-6 shadow-sm border border-border/50 transition-all hover:shadow-md hover:border-border hover:-translate-y-1 duration-300">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Lock className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-medium mb-2">Secure Storage</h3>
              <p className="text-muted-foreground">
                All data is stored securely in Supabase with proper authentication and authorization.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* About Developer Section */}
      <section className="py-16 bg-gradient-to-b from-white to-secondary/20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-semibold mb-2">Meet the Developer</h2>
              <p className="text-muted-foreground">The mind behind vGPT</p>
            </div>
            
            <div className="bg-white rounded-xl shadow-md overflow-hidden sm:flex">
              <div className="sm:flex-shrink-0 bg-gradient-to-br from-primary/10 to-primary/5 p-8 flex items-center justify-center">
                <Avatar className="h-24 w-24 border-2 border-primary/10">
                  <AvatarImage 
                    src="https://github-production-user-asset-6210df.s3.amazonaws.com/91552766/423399930-a6839b0a-ba96-4ccd-b11e-73a12950633a.png" 
                    alt="Gopal Kumar" 
                  />
                  <AvatarFallback>GK</AvatarFallback>
                </Avatar>
              </div>
              <div className="p-8">
                <div className="text-xl font-semibold mb-2">Gopal Kumar</div>
                <p className="text-muted-foreground mb-4">
                  AI Developer & Full Stack Engineer
                </p>
                <p className="mb-4">
                  Passionate about combining AI with practical applications. vGPT was created as a showcase of Azure OpenAI capabilities with document understanding and OCR technology.
                </p>
                <div className="flex gap-3">
                  <a href="https://github.com/gopalkumr" target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" size="sm" className="gap-2">
                      <Github className="h-4 w-4" />
                      GitHub
                    </Button>
                  </a>
                  <a href="https://linkedin.com/in/gopalkumr" target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" size="sm" className="gap-2">
                      <Linkedin className="h-4 w-4" />
                      LinkedIn
                    </Button>
                  </a>
                  <a href="mailto:gopal.kmr@yahoo.com">
                    <Button variant="outline" size="sm" className="gap-2">
                      <Mail className="h-4 w-4" />
                      Email
                    </Button>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <div className="inline-block animate-bounce mb-2">
              <Sparkles className="h-8 w-8 text-primary/70" />
            </div>
            <h2 className="text-3xl font-semibold">Ready to experience vGPT?</h2>
            <p className="text-muted-foreground">
              Try it now for free - no credit card required. Chat twice without an account, then create one to continue.
            </p>
            <div className="pt-4">
              <Link to="/chat">
                <Button size="lg" className="group">
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default Index;
