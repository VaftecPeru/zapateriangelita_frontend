import { useState } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import FeaturedProperties from './components/FeaturedProperties';
import WhyChooseUs from './components/WhyChooseUs';
import ServicesSection from './components/ServicesSection';
import CTASection from './components/CTASection';
import Footer from './components/Footer';
import PropertyDetails from './components/PropertyDetails';

function App() {
  const [selectedProperty, setSelectedProperty] = useState<any>(null);

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main>
        <Hero />
        <FeaturedProperties onOpenDetails={(p: any) => setSelectedProperty(p)} />
        <WhyChooseUs />
        <ServicesSection />
        <CTASection />
      </main>

      <Footer />

      {selectedProperty && (
        <PropertyDetails
          property={selectedProperty}
          onClose={() => setSelectedProperty(null)}
        />
      )}
    </div>
  );
}

export default App;