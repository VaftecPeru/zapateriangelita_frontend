import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Hero from '../components/Hero';
import FeaturedProperties from '../components/FeaturedProperties';
import WhyChooseUs from '../components/WhyChooseUs';
import ServicesSection from '../components/ServicesSection';
import CTASection from '../components/CTASection';
import PropertyDetails from '../components/PropertyDetails';
import { useAuth } from '../hooks/useAuth';
import apiClient from '../services/apiClient';

const HomePage = () => {
    const { user, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [selectedProperty, setSelectedProperty] = useState<any>(null);
    const [searchCriteria, setSearchCriteria] = useState<any>(null);
    const [properties, setProperties] = useState<any[]>([]);

    useEffect(() => {
        if (isAuthenticated && user?.role === 'admin') {
            navigate('/admin/dashboard');
        }
        loadProperties();
    }, [isAuthenticated, user, navigate]);

    const loadProperties = async () => {
        try {
            const response = await apiClient.get('/properties');
            const data = Array.isArray(response.data) ? response.data : (response.data.data || []);
            setProperties(data);
        } catch (err) {
            console.error('Error loading properties for hero validation:', err);
        }
    };

    return (
        <main>
            <Hero 
                onSearch={(criteria: any) => setSearchCriteria(criteria)} 
                properties={properties}
            />
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
