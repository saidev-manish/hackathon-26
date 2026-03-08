import { Doughnut } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const SymptomChart = ({ data }) => {
    // data: array of { symptoms: { acne: 0-3, cramps: 0-3, ... } }

    const symptomCounts = {};

    data.forEach(log => {
        Object.entries(log.symptoms || {}).forEach(([symptom, severity]) => {
            if (severity > 0) {
                symptomCounts[symptom] = (symptomCounts[symptom] || 0) + 1;
            }
        });
    });

    const labels = Object.keys(symptomCounts).map(s => s.charAt(0).toUpperCase() + s.slice(1));
    const values = Object.values(symptomCounts);

    const chartData = {
        labels,
        datasets: [
            {
                label: '# of Reports',
                data: values,
                backgroundColor: [
                    '#B39DDB', // Deep Purple
                    '#F48FB1', // Pink
                    '#90CAF9', // Blue
                    '#80CBC4', // Teal
                    '#FFE082', // Yellow
                ],
                borderColor: [
                    '#ffffff',
                    '#ffffff',
                    '#ffffff',
                    '#ffffff',
                    '#ffffff'
                ],
                borderWidth: 2,
            },
        ],
    };

    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'right',
                labels: {
                    font: {
                        family: "'Poppins', sans-serif"
                    }
                }
            },
            title: {
                display: true,
                text: 'Common Symptoms',
                color: '#4B5563',
                font: {
                    family: "'Poppins', sans-serif",
                    size: 16
                }
            },
        },
    };

    return (
        <div style={{ background: 'white', padding: '20px', borderRadius: '24px', boxShadow: 'var(--shadow-soft)' }}>
            <div style={{ height: '250px', display: 'flex', justifyContent: 'center' }}>
                <Doughnut data={chartData} options={options} />
            </div>
        </div>
    );
};

export default SymptomChart;
