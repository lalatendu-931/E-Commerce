import HeroSection from '../components/home/HeroSection/HeroSection';
import CategoryShowcase from '../components/home/CategoryShowcase/CategoryShowcase';
import WhyChooseUs from '../components/home/WhyChooseUs/WhyChooseUs';
import FeaturedProducts from '../components/home/FeaturedProducts/FeaturedProducts';
import RepairHighlight from '../components/home/RepairHighlight/RepairHighlight';
import StorePresence from '../components/home/StorePresence/StorePresence';

const HomePage = () => {
  return (
    <main className="home-page">
      <HeroSection />
      <CategoryShowcase />
      <FeaturedProducts />
      <WhyChooseUs />
      <RepairHighlight />
      <StorePresence />
    </main>
  );
};

export default HomePage;
