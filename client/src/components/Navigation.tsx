import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { 
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Menu, User, LogOut, Sparkles, Phone, Mail, X } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { motion } from "framer-motion";
import { useState } from "react";

export default function Navigation() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const services = [
    { name: "Shop", path: "/shop", color: "skd-shop", title: "SKD Shop", icon: "🛍️" },
    { name: "Créa", path: "/crea", color: "skd-crea", title: "SKD Créa", icon: "🎨" },
    { name: "Rent", path: "/rent", color: "skd-rent", title: "SKD Rent", icon: "📦" },
    { name: "Events", path: "/events", color: "skd-events", title: "SKD Events", icon: "🎉" },
    { name: "Home", path: "/home", color: "skd-home", title: "SKD Home", icon: "🏠" },
    { name: "& Co", path: "/co", color: "skd-co", title: "SKD & Co", icon: "🤝" },
  ];

  if (isLoading) {
    return (
      <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-sm z-50 border-b border-gold/20 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="animate-pulse">
              <div className="h-8 w-48 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <>
      {/* Top Bar with Contact Info */}
      <div className="fixed top-0 w-full bg-gradient-to-r from-gold/90 to-yellow-500/90 text-white text-sm z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-10">
            <div className="flex items-center space-x-4 lg:space-x-6">
              <div className="flex items-center space-x-2">
                <Phone className="h-3 w-3" />
                <span className="hidden sm:inline">06 88 00 39 28</span>
                <span className="sm:hidden">06 88 00 39 28</span>
              </div>
              <div className="hidden md:flex items-center space-x-2">
                <Mail className="h-3 w-3" />
                <span>contact@sakadeco.com</span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Sparkles className="h-3 w-3 animate-pulse" />
              <span className="font-medium hidden sm:inline">Bordeaux Métropole</span>
              <span className="font-medium sm:hidden">Bordeaux</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="fixed top-10 w-full bg-white/95 backdrop-blur-md z-40 border-b border-gold/20 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <motion.div 
              className="flex items-center"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Link href="/">
                <div className="flex items-center space-x-2 lg:space-x-3 cursor-pointer group">
                  <div className="relative">
                    <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-gold to-yellow-500 rounded-full flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                      <span className="text-white font-bold text-base lg:text-lg">S</span>
                    </div>
                    <div className="absolute -top-1 -right-1 w-3 h-3 lg:w-4 lg:h-4 bg-red-500 rounded-full animate-pulse"></div>
                  </div>
                  <div>
                    <h1 className="text-xl lg:text-2xl font-playfair font-bold bg-gradient-to-r from-gold to-yellow-600 bg-clip-text text-transparent group-hover:from-yellow-600 group-hover:to-gold transition-all duration-300">
                      SakaDeco Group
                    </h1>
                    <span className="text-xs lg:text-sm text-gray-600 font-light hidden lg:block">
                      L'élégance au service de vos moments
                    </span>
                  </div>
                </div>
              </Link>
            </motion.div>

            {/* Desktop Navigation */}
            <div className="hidden xl:flex items-center space-x-6">
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <Link href="/" className={`relative text-gray-700 hover:text-gold transition-colors duration-300 font-medium ${location === "/" ? "text-gold" : ""}`}>
                  Accueil
                  {location === "/" && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute -bottom-2 left-0 right-0 h-0.5 bg-gradient-to-r from-gold to-yellow-500"
                      initial={false}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                </Link>
              </motion.div>
              
              {services.map((service, index) => (
                <motion.div
                  key={service.path}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 + index * 0.05 }}
                >
                  <Link 
                    href={service.path} 
                    className={`relative flex items-center space-x-1 lg:space-x-2 text-gray-700 hover:text-gold transition-colors duration-300 font-medium group ${location === service.path ? "text-gold" : ""}`}
                  >
                    <span className="text-base lg:text-lg group-hover:scale-110 transition-transform duration-200">{service.icon}</span>
                    <span className="hidden lg:inline">{service.name}</span>
                    {location === service.path && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute -bottom-2 left-0 right-0 h-0.5 bg-gradient-to-r from-gold to-yellow-500"
                        initial={false}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      />
                    )}
                  </Link>
                </motion.div>
              ))}
              
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <Link href="/about" className={`relative text-gray-700 hover:text-gold transition-colors duration-300 font-medium ${location === "/about" ? "text-gold" : ""}`}>
                  À propos
                  {location === "/about" && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute -bottom-2 left-0 right-0 h-0.5 bg-gradient-to-r from-gold to-yellow-500"
                      initial={false}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                </Link>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.45 }}
              >
                <Link href="/contact" className={`relative text-gray-700 hover:text-gold transition-colors duration-300 font-medium ${location === "/contact" ? "text-gold" : ""}`}>
                  Contact
                  {location === "/contact" && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute -bottom-2 left-0 right-0 h-0.5 bg-gradient-to-r from-gold to-yellow-500"
                      initial={false}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                </Link>
              </motion.div>

              {isAuthenticated ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                >
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="relative h-10 w-10 lg:h-12 lg:w-12 rounded-full hover:bg-gold/10 transition-all duration-300">
                        <Avatar className="h-10 w-10 lg:h-12 lg:w-12 ring-2 ring-gold/20 hover:ring-gold/40 transition-all duration-300">
                          <AvatarImage src={user?.profileImageUrl || undefined} alt={user?.firstName || ""} />
                          <AvatarFallback className="bg-gradient-to-br from-gold to-yellow-500 text-white font-bold">
                            {user?.firstName?.[0] || user?.email?.[0] || "U"}
                          </AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end" forceMount>
                      <DropdownMenuItem className="flex-col items-start">
                        <div className="font-medium">{user?.firstName} {user?.lastName}</div>
                        <div className="text-sm text-muted-foreground">{user?.email}</div>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <a href="/api/logout" className="flex items-center w-full">
                          <LogOut className="mr-2 h-4 w-4" />
                          <span>Se déconnecter</span>
                        </a>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                >
                  <Button asChild className="bg-gradient-to-r from-gold to-yellow-500 text-white hover:from-yellow-500 hover:to-gold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 text-sm lg:text-base">
                    <a href="/api/login" className="flex items-center space-x-1 lg:space-x-2">
                      <User className="h-3 w-3 lg:h-4 lg:w-4" />
                      <span>Se connecter</span>
                    </a>
                  </Button>
                </motion.div>
              )}
            </div>

            {/* Tablet Navigation - Show only icons */}
            <div className="hidden lg:flex xl:hidden items-center space-x-4">
              <Link href="/" className={`p-2 rounded-full hover:bg-gold/10 transition-colors ${location === "/" ? "bg-gold/20 text-gold" : "text-gray-700"}`}>
                🏠
              </Link>
              {services.map((service) => (
                <Link 
                  key={service.path} 
                  href={service.path} 
                  className={`p-2 rounded-full hover:bg-gold/10 transition-colors text-lg ${location === service.path ? "bg-gold/20 text-gold" : "text-gray-700"}`}
                >
                  {service.icon}
                </Link>
              ))}
              <Link href="/about" className={`p-2 rounded-full hover:bg-gold/10 transition-colors ${location === "/about" ? "bg-gold/20 text-gold" : "text-gray-700"}`}>
                ℹ️
              </Link>
              <Link href="/contact" className={`p-2 rounded-full hover:bg-gold/10 transition-colors ${location === "/contact" ? "bg-gold/20 text-gold" : "text-gray-700"}`}>
                📞
              </Link>
              
              {isAuthenticated ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full hover:bg-gold/10 transition-all duration-300">
                      <Avatar className="h-10 w-10 ring-2 ring-gold/20 hover:ring-gold/40 transition-all duration-300">
                        <AvatarImage src={user?.profileImageUrl || undefined} alt={user?.firstName || ""} />
                        <AvatarFallback className="bg-gradient-to-br from-gold to-yellow-500 text-white font-bold">
                          {user?.firstName?.[0] || user?.email?.[0] || "U"}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuItem className="flex-col items-start">
                      <div className="font-medium">{user?.firstName} {user?.lastName}</div>
                      <div className="text-sm text-muted-foreground">{user?.email}</div>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <a href="/api/logout" className="flex items-center w-full">
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Se déconnecter</span>
                      </a>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button asChild className="bg-gradient-to-r from-gold to-yellow-500 text-white hover:from-yellow-500 hover:to-gold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                  <a href="/api/login" className="flex items-center space-x-2">
                    <User className="h-4 w-4" />
                    <span>Se connecter</span>
                  </a>
                </Button>
              )}
            </div>

            {/* Mobile Navigation */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="lg:hidden"
            >
              <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full hover:bg-gold/10 transition-all duration-300">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-80 sm:w-96">
                  <SheetHeader>
                    <SheetTitle className="font-playfair bg-gradient-to-r from-gold to-yellow-600 bg-clip-text text-transparent text-xl sm:text-2xl">
                      SakaDeco Group
                    </SheetTitle>
                    <SheetDescription className="text-gray-600 text-sm">
                      L'élégance au service de vos moments
                    </SheetDescription>
                  </SheetHeader>
                  
                  <div className="mt-8 space-y-2">
                    <Link 
                      href="/" 
                      className="flex items-center py-3 px-4 text-lg font-medium hover:text-gold hover:bg-gold/5 rounded-lg transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      🏠 Accueil
                    </Link>
                    
                    {services.map((service) => (
                      <Link 
                        key={service.path} 
                        href={service.path} 
                        className="flex items-center py-3 px-4 hover:text-gold hover:bg-gold/5 rounded-lg transition-colors"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <span className="text-xl mr-3">{service.icon}</span>
                        <span className="text-lg font-medium">{service.title}</span>
                      </Link>
                    ))}
                    
                    <Link 
                      href="/about" 
                      className="flex items-center py-3 px-4 text-lg font-medium hover:text-gold hover:bg-gold/5 rounded-lg transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      ℹ️ À propos
                    </Link>
                    
                    <Link 
                      href="/contact" 
                      className="flex items-center py-3 px-4 text-lg font-medium hover:text-gold hover:bg-gold/5 rounded-lg transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      📞 Contact
                    </Link>
                    
                    {isAuthenticated ? (
                      <div className="border-t pt-6 mt-6">
                        <div className="flex items-center space-x-3 mb-4 px-4">
                          <Avatar className="h-12 w-12 ring-2 ring-gold/20">
                            <AvatarImage src={user?.profileImageUrl || undefined} alt={user?.firstName || ""} />
                            <AvatarFallback className="bg-gradient-to-br from-gold to-yellow-500 text-white font-bold">
                              {user?.firstName?.[0] || user?.email?.[0] || "U"}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{user?.firstName} {user?.lastName}</div>
                            <div className="text-sm text-gray-500">{user?.email}</div>
                          </div>
                        </div>
                        <Button asChild variant="outline" className="w-full mx-4">
                          <a href="/api/logout" className="flex items-center">
                            <LogOut className="mr-2 h-4 w-4" />
                            Se déconnecter
                          </a>
                        </Button>
                      </div>
                    ) : (
                      <div className="border-t pt-6 mt-6">
                        <Button asChild className="w-full mx-4 bg-gradient-to-r from-gold to-yellow-500 text-white hover:from-yellow-500 hover:to-gold">
                          <a href="/api/login" className="flex items-center">
                            <User className="mr-2 h-4 w-4" />
                            Se connecter
                          </a>
                        </Button>
                      </div>
                    )}
                  </div>
                </SheetContent>
              </Sheet>
            </motion.div>
          </div>
        </div>
      </nav>
    </>
  );
}
