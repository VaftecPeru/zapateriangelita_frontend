import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Hero from '../components/Hero';
import FeaturedProperties from '../components/FeaturedProperties';
import WhyChooseUs from '../components/WhyChooseUs';
import ServicesSection from '../components/ServicesSection';
import CTASection from '../components/CTASection';
import PropertyDetails from '../components/PropertyDetails';
import { useAuth } from '../hooks/useAuth';

const HomePage = () => {
    const { user, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [selectedProperty, setSelectedProperty] = useState<any>(null);
    const [searchCriteria, setSearchCriteria] = useState<any>(null);

    useEffect(() => {
        if (isAuthenticated && user?.role === 'admin') {
            navigate('/admin/dashboard');
        }
    }, [isAuthenticated, user, navigate]);

    return (
        <main>
            <Hero onSearch={(criteria: any) => setSearchCriteria(criteria)} />
            <FeaturedProperties
                searchCriteria={searchCriteria}
                onOpenDetails={(p: any) => setSelectedProperty(p)}
            />
            <WhyChooseUs />
            <ServicesSection />
            <CTASection />

            {selectedProperty && (
                <PropertyDetails
                    property={selectedProperty}
                    onClose={() => setSelectedProperty(null)}
                />
            )}
        </main>
    );
};

export default HomePage;
