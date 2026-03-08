import { Play } from 'lucide-react';

const VideoCard = ({ title, category, duration, thumbnail, onClick }) => {
    return (
        <div
            onClick={onClick}
            style={{
                background: 'white',
                borderRadius: '16px',
                overflow: 'hidden',
                boxShadow: 'var(--shadow-soft)',
                cursor: 'pointer',
                transition: 'transform 0.2s',
                border: '1px solid #F3F4F6'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
            <div style={{ position: 'relative', height: '140px', background: '#E5E7EB' }}>
                <img
                    src={thumbnail}
                    alt={title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    background: 'rgba(255,255,255,0.8)',
                    borderRadius: '50%',
                    width: '40px',
                    height: '40px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <Play size={20} fill="var(--primary-purple)" color="var(--primary-purple)" style={{ marginLeft: '4px' }} />
                </div>
                <div style={{
                    position: 'absolute',
                    bottom: '8px',
                    right: '8px',
                    background: 'rgba(0,0,0,0.7)',
                    color: 'white',
                    fontSize: '12px',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    fontWeight: 500
                }}>
                    {duration}
                </div>
            </div>
            <div style={{ padding: '16px' }}>
                <span style={{
                    fontSize: '12px',
                    color: 'var(--primary-purple)',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                }}>
                    {category}
                </span>
                <h3 style={{
                    margin: '8px 0 0',
                    fontSize: '16px',
                    color: 'var(--text-main)',
                    fontWeight: 600,
                    lineHeight: '1.4'
                }}>
                    {title}
                </h3>
            </div>
        </div>
    );
};

export default VideoCard;
