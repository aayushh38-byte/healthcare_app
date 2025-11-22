import React, { useState } from 'react';
import { Send, Loader2, Sparkles, X } from 'lucide-react';
import SymptomResultCard from './SymptomResultCard';

const SymptomCheckerWidget = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [symptoms, setSymptoms] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const [followUp, setFollowUp] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!symptoms.trim()) return;

        setLoading(true);
        setError(null);
        setResult(null);
        setFollowUp(null);

        try {
            const response = await fetch('http://localhost:3000/api/ai/symptom-check', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // 'Authorization': `Bearer ${token}` // Add auth token if available
                },
                body: JSON.stringify({ symptoms }),
            });

            if (!response.ok) {
                throw new Error('Failed to analyze symptoms');
            }

            const data = await response.json();

            if (data.follow_up_question) {
                setFollowUp(data.follow_up_question);
            } else {
                setResult(data);
            }
        } catch (err) {
            setError(err.message || 'Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        // Implement save functionality if needed separately, 
        // though the backend saves automatically if userId is sent
        alert('Symptom check saved to history!');
    };

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-all z-50 flex items-center gap-2 animate-bounce"
            >
                <Sparkles className="w-6 h-6" />
                <span className="font-medium">AI Symptom Checker</span>
            </button>
        );
    }

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col">
                <div className="p-4 border-b flex items-center justify-between sticky top-0 bg-white z-10">
                    <div className="flex items-center gap-2 text-blue-600">
                        <Sparkles className="w-5 h-5" />
                        <h2 className="font-bold text-lg">AI Symptom Checker</h2>
                    </div>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                <div className="p-6 flex-1">
                    {!result && (
                        <div className="mb-6">
                            <p className="text-gray-600 mb-4">
                                Describe your symptoms in detail. Our AI will analyze them and provide guidance.
                            </p>

                            {followUp && (
                                <div className="bg-blue-50 p-4 rounded-lg mb-4 border border-blue-100">
                                    <p className="font-medium text-blue-800">Follow-up Question:</p>
                                    <p className="text-blue-700">{followUp}</p>
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="relative">
                                <textarea
                                    value={symptoms}
                                    onChange={(e) => setSymptoms(e.target.value)}
                                    placeholder={followUp ? "Answer the follow-up question..." : "E.g., I have a throbbing headache and sensitivity to light..."}
                                    className="w-full min-h-[120px] p-4 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 resize-none transition-all"
                                    disabled={loading}
                                />
                                <button
                                    type="submit"
                                    disabled={loading || !symptoms.trim()}
                                    className="absolute bottom-3 right-3 bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                                </button>
                            </form>
                            {error && (
                                <p className="text-red-500 text-sm mt-3 flex items-center gap-2">
                                    <AlertTriangle className="w-4 h-4" />
                                    {error}
                                </p>
                            )}
                        </div>
                    )}

                    {result && (
                        <div className="animate-in fade-in zoom-in-95 duration-300">
                            <SymptomResultCard result={result} onSave={handleSave} />
                            <button
                                onClick={() => { setResult(null); setSymptoms(''); setFollowUp(null); }}
                                className="mt-6 text-blue-600 text-sm font-medium hover:underline w-full text-center"
                            >
                                Check another symptom
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SymptomCheckerWidget;
