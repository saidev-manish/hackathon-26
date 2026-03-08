import { Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

const CycleHistoryChart = ({ data }) => {
    // data: array of { startDate, endDate }

    // Calculate cycle lengths (days between start dates)
    const sortedData = [...data].sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
    const cycleLengths = [];
    const labels = [];

    for (let i = 0; i < sortedData.length - 1; i++) {
        const start = new Date(sortedData[i].startDate);
        const nextStart = new Date(sortedData[i + 1].startDate);
        const diffTime = Math.abs(nextStart - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        cycleLengths.push(diffDays);
        labels.push(start.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }));
    }

    const chartData = {
        labels,
        datasets: [
            {
                label: 'Cycle Length (Days)',
                data: cycleLengths,
                backgroundColor: '#F3ECF9',
                borderColor: '#C8A2C8',
                borderWidth: 1,
                borderRadius: 8,
                hoverBackgroundColor: '#E6D6F5'
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
                text: 'Cycle History',
                color: '#4B5563',
                font: {
                    family: "'Poppins', sans-serif",
                    size: 16
                }
            },
        },
        scales: {
            y: {
                beginAtZero: false,
                min: 20, // Reasonable min for cycle
                max: 40,
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
            <Bar options={options} data={chartData} />
        </div>
    );
};

export default CycleHistoryChart;
