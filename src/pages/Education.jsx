import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search } from 'lucide-react';
import VideoCard from '../components/content/VideoCard';
import Input from '../components/Input';

const DUMMY_CONTENT = [
    {
        id: 1,
        title: "15-Min Yoga for Period Pain Relief",
        category: "Yoga",
        duration: "15:00",
        thumbnail: "https://images.unsplash.com/photo-1544367563-12123d8965cd?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
        url: "https://www.youtube.com/watch?v=sLaeNJtCoVk" // Example link
    },
    {
        id: 2,
        title: "Foods to Eat During Your Cycle",
        category: "Diet",
        duration: "10:30",
        thumbnail: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
        url: "#"
    },
    {
        id: 3,
        title: "Guided Meditation for PMS",
        category: "Mental Health",
        duration: "20:00",
        thumbnail: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
        url: "#"
    },
    {
        id: 4,
        title: "Full Body Gentle Stretch",
        category: "Yoga",
        duration: "12:00",
        thumbnail: "https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
        url: "#"
    }
];

const Education = () => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("All");

    const categories = ["All", "Yoga", "Diet", "Mental Health"];

    const filteredContent = DUMMY_CONTENT.filter(item => {
        const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === "All" || item.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const handleVideoClick = (url) => {
        window.open(url, '_blank');
    };

    return (
        <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto', paddingBottom: '80px' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px' }}>
                <button
                    onClick={() => navigate('/dashboard')}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', marginRight: '16px', color: 'var(--text-secondary)' }}
                >
                    <ArrowLeft size={24} />
                </button>
                <h1 style={{ margin: 0, fontSize: '24px', color: 'var(--text-main)', fontWeight: 700 }}>
                    Health Hub
                </h1>
            </div>

            {/* Search and Filters */}
            <div style={{ marginBottom: '32px' }}>
                <div style={{ position: 'relative', marginBottom: '16px' }}>
                    <input
                        type="text"
                        placeholder="Search for tips, exercises..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '16px 16px 16px 48px',
                            borderRadius: '16px',
                            border: 'none',
                            background: 'white',
                            boxShadow: 'var(--shadow-soft)',
                            outline: 'none',
                            fontSize: '16px',
                            color: 'var(--text-main)'
                        }}
                    />
                    <Search style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                </div>

                <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            style={{
                                padding: '8px 16px',
                                borderRadius: '24px',
                                border: 'none',
                                background: selectedCategory === cat ? 'var(--primary-purple)' : 'white',
                                color: selectedCategory === cat ? 'white' : 'var(--text-secondary)',
                                fontWeight: 500,
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                whiteSpace: 'nowrap',
                                boxShadow: selectedCategory === cat ? '0 4px 12px rgba(106, 62, 161, 0.3)' : 'none'
                            }}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: '24px'
            }}>
                {filteredContent.map(item => (
                    <VideoCard
                        key={item.id}
                        {...item}
                        onClick={() => handleVideoClick(item.url)}
                    />
                ))}
            </div>

            {filteredContent.length === 0 && (
                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                    No content found matching your search.
                </div>
            )}
        </div>
    );
};

export default Education;
