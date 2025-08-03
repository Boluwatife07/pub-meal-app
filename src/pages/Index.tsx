import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { QrCode, Users, Settings } from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-cream to-light-grey">
      {/* Hero Header */}
      <header className="container mx-auto px-4 py-12">
        <div className="text-center space-y-6 slide-in">
          <h1 className="text-6xl font-bold gradient-text">
            Bella Vista
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            An exquisite fine dining experience where culinary artistry meets exceptional service
          </p>
        </div>
      </header>

      {/* Main Navigation Cards */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <Link to="/menu">
            <Card className="food-card h-full stagger-animation stagger-1">
              <div className="relative">
                <div className="w-full h-48 bg-gradient-to-br from-elegant-gold/20 to-elegant-gold/40 flex items-center justify-center">
                  <div className="text-center space-y-3">
                    <QrCode className="w-16 h-16 text-charcoal mx-auto" />
                    <h3 className="text-2xl font-bold text-charcoal">Browse Menu</h3>
                  </div>
                </div>
              </div>
              <CardHeader>
                <CardTitle className="text-center">Customer Menu</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-center text-muted-foreground">
                  Explore our carefully crafted seasonal menu featuring the finest ingredients and exceptional flavors.
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link to="/auth">
            <Card className="food-card h-full stagger-animation stagger-2">
              <div className="relative">
                <div className="w-full h-48 bg-gradient-to-br from-charcoal/20 to-charcoal/40 flex items-center justify-center">
                  <div className="text-center space-y-3">
                    <Users className="w-16 h-16 text-white mx-auto" />
                    <h3 className="text-2xl font-bold text-white">Staff Portal</h3>
                  </div>
                </div>
              </div>
              <CardHeader>
                <CardTitle className="text-center">Staff Access</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-center text-muted-foreground">
                  Access kitchen, bar, and administrative functions to manage operations and ensure seamless service.
                </p>
              </CardContent>
            </Card>
          </Link>

          <Card className="food-card h-full stagger-animation stagger-3">
            <div className="relative">
              <div className="w-full h-48 bg-gradient-to-br from-warm-grey/20 to-warm-grey/40 flex items-center justify-center">
                <div className="text-center space-y-3">
                  <Settings className="w-16 h-16 text-charcoal mx-auto" />
                  <h3 className="text-2xl font-bold text-charcoal">Our Story</h3>
                </div>
              </div>
            </div>
            <CardHeader>
              <CardTitle className="text-center">About Bella Vista</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-center text-muted-foreground">
                Discover our passion for culinary excellence, our commitment to sustainability, and our dedication to creating memorable dining experiences.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Additional Info Section */}
        <div className="mt-16 text-center space-y-6 fade-in-up">
          <h2 className="text-3xl font-bold gradient-text">
            Experience Fine Dining Redefined
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            At Bella Vista, we blend traditional culinary techniques with modern innovation to create 
            an unforgettable dining experience. Our team of expert chefs sources the finest local 
            ingredients to craft dishes that celebrate both flavor and artistry.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12 max-w-4xl mx-auto">
            <div className="text-center space-y-3">
              <div className="w-12 h-12 bg-elegant-gold/20 rounded-full flex items-center justify-center mx-auto">
                <span className="text-2xl">🍽️</span>
              </div>
              <h3 className="font-semibold">Exceptional Cuisine</h3>
              <p className="text-sm text-muted-foreground">Artfully crafted dishes using the finest seasonal ingredients</p>
            </div>
            <div className="text-center space-y-3">
              <div className="w-12 h-12 bg-elegant-gold/20 rounded-full flex items-center justify-center mx-auto">
                <span className="text-2xl">🏆</span>
              </div>
              <h3 className="font-semibold">Award Winning</h3>
              <p className="text-sm text-muted-foreground">Recognized for culinary excellence and outstanding service</p>
            </div>
            <div className="text-center space-y-3">
              <div className="w-12 h-12 bg-elegant-gold/20 rounded-full flex items-center justify-center mx-auto">
                <span className="text-2xl">🌿</span>
              </div>
              <h3 className="font-semibold">Sustainable</h3>
              <p className="text-sm text-muted-foreground">Committed to environmental responsibility and local sourcing</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
