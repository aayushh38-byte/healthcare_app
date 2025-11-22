import React from 'react';
import { AlertTriangle, CheckCircle, Info, Calendar, Search, Save } from 'lucide-react';
import { Link } from 'react-router-dom';

const UrgencyBanner = ({ level }) => {
    const colors = {
        low: 'bg-green-100 text-green-800 border-green-200',
        medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        high: 'bg-red-100 text-red-800 border-red-200',
    };

    const icons = {
        low: <CheckCircle className="w-5 h-5" />,
        medium: <Info className="w-5 h-5" />,
        high: <AlertTriangle className="w-5 h-5" />,
    };

    return (
        <div className={`flex items-center gap-3 p-4 rounded-lg border ${colors[level] || colors.low} mb-6`}>
            {icons[level] || icons.low}
            <div>
                <h3 className="font-bold capitalize">{level} Urgency</h3>
                <p className="text-sm opacity-90">
                    {level === 'high'
                        ? 'Please seek immediate medical attention.'
                        : 'Based on your symptoms, here is some guidance.'}
                </p>
            </div>
        </div>
    );
};

const SymptomResultCard = ({ result, onSave }) => {
    if (!result) return null;

    const { possible_conditions, recommended_specialties, urgency_level, advice } = result;

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <UrgencyBanner level={urgency_level} />

            <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Possible Conditions</h4>
                    <ul className="space-y-2">
                        {possible_conditions.map((condition, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-gray-700">
                                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0" />
                                {condition}
                            </li>
                        ))}
                    </ul>
                </div>

                <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Recommended Specialists</h4>
                    <div className="flex flex-wrap gap-2">
                        {recommended_specialties.map((specialty, idx) => (
                            <Link
                                key={idx}
                                to={`/search?specialization=${specialty}`}
                                className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium hover:bg-blue-100 transition-colors"
                            >
                                {specialty}
                            </Link>
                        ))}
                    </div>
                </div>
            </div>

            <div className="space-y-4 mb-8">
                <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-2">Self Care Advice</h4>
                    <ul className="list-disc list-inside text-gray-700 space-y-1 text-sm">
                        {advice.self_care.map((tip, idx) => (
                            <li key={idx}>{tip}</li>
                        ))}
                    </ul>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-2">Questions for Doctor</h4>
                    <ul className="list-disc list-inside text-gray-700 space-y-1 text-sm">
                        {advice.questions_for_doctor.map((q, idx) => (
                            <li key={idx}>{q}</li>
                        ))}
                    </ul>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 border-t pt-6">
                <Link
                    to="/search"
                    className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                    <Search className="w-4 h-4" />
                    Find Doctors
                </Link>

                <button
                    onClick={onSave}
                    className="flex-1 flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 px-4 py-2.5 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                    <Save className="w-4 h-4" />
                    Save to History
                </button>

                <Link
                    to="/appointments"
                    className="flex-1 flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-green-700 transition-colors"
                >
                    <Calendar className="w-4 h-4" />
                    Book Now
                </Link>
            </div>

            <p className="text-xs text-gray-500 mt-6 text-center">
                Disclaimer: This is an AI-generated assessment and is for informational purposes only.
                It is not a medical diagnosis. In case of emergency, call your local emergency services immediately.
            </p>
        </div>
    );
};

export default SymptomResultCard;
