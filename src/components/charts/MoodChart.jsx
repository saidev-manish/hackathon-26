import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

const MoodChart = ({ data }) => {
    // data prop should be array of { timestamp, mood (1-5) }

    // Sort by date
    const sortedData = [...data].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    const chartData = {
        labels: sortedData.map(d => new Date(d.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })),
        datasets: [
            {
                label: 'Mood Score',
                data: sortedData.map(d => d.mood),
                borderColor: '#6A3EA1',
                backgroundColor: 'rgba(106, 62, 161, 0.5)',
                tension: 0.4,
                pointBackgroundColor: '#B39DDB',
                pointRadius: 4
            },
        ],
    };

    const options = {
        responsive: true,
        plugins: {
            legend: {
                display: false,
            },
            title: {
                display: true,
                text: 'Mood Trends',
                color: '#4B5563',
                font: {
                    family: "'Poppins', sans-serif",
                    size: 16
                }
            },
        },
        scales: {
            y: {
                min: 0,
                max: 6,
                ticks: {
                    stepSize: 1,
                    callback: (value) => {
                        const moods = ['', 'Very Sad', 'Sad', 'Neutral', 'Happy', 'Very Happy'];
                        return moods[value] || '';
                    }
                },
                grid: {
                    color: '#F3F4F6'
                }
            },
            x: {
                grid: {
                    display: false
                }
            }
        }
    };

    return (
        <div style={{ background: 'white', padding: '20px', borderRadius: '24px', boxShadow: 'var(--shadow-soft)' }}>
            <Line options={options} data={chartData} />
        </div>
    );
};

export default MoodChart;
