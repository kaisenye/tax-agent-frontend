import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import AnimatedContainer from '../components/containers/AnimatedContainer';
import { getUserCases, createCase } from "../api/caseAPI";
import { Case, CreateCaseRequest } from "../types/case.types";
import { useAuth } from "../context/AuthContext";

// Avatar Examples
import avatar1 from "../assets/avatar-1.jpg";
import avatar2 from "../assets/avatar-2.jpg";

const CaseList: React.FC = () => {
    // Get userId from AuthContext
    const { userId } = useAuth();
    
    const [showModal, setShowModal] = useState(false);
    const [cases, setCases] = useState<Case[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    
    // Form state for creating a new case
    const [newCase, setNewCase] = useState<CreateCaseRequest>({
        user_id: userId || "",
        title: "",
        clientName: "",
        clientEmail: "",
        status: "pending"
    });

    // Update newCase.user_id when userId changes
    useEffect(() => {
        if (userId) {
            setNewCase(prev => ({
                ...prev,
                user_id: userId
            }));
        }
    }, [userId]);

    // Fetch cases from API
    useEffect(() => {
        const fetchCases = async () => {
            if (!userId) return;
            
            try {
                setLoading(true);
                const fetchedCases = await getUserCases(userId);
                setCases(fetchedCases);
                setError(null);
            } catch (err) {
                console.error('Error fetching cases:', err);
                setError('Failed to load cases');
            } finally {
                setLoading(false);
            }
        };

        fetchCases();
    }, [userId]);

    // Handle form input changes
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setNewCase(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Handle form submission
    const handleCreateCase = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userId) {
            setError('You must be logged in to create a case');
            return;
        }
        
        try {
            const createdCase = await createCase(newCase);
            setCases(prev => [...prev, createdCase]);
            setShowModal(false);
            
            // Reset form
            setNewCase({
                user_id: userId,
                title: "",
                clientName: "",
                clientEmail: "",
                status: "pending"
            });
        } catch (err) {
            console.error('Error creating case:', err);
            setError('Failed to create case');
        }
    };

    return (
        <AnimatedContainer>
            <div className="size-full mx-auto px-6 py-2 animate-fadeIn">
                <div className="flex flex-row justify-between items-center py-3 border-b border-gray">
                    <div className="flex flex-col gap-1 text-left">
                        <span className="text-black text-xl font-500 text-left">
                            Cases
                        </span>
                        <span className="text-black-light text-sm font-400 text-left">
                            Manage all your tax cases
                        </span>
                    </div>
                    <div className="flex flex-row gap-4">
                        <div className="flex-1 relative">
                            <input
                                type="text"
                                placeholder="Search.."
                                className="w-64 px-3 py-1.5 text-sm border border-gray-dark rounded-md focus:outline-none focus:border-gray-dark"
                            />
                        </div>
                        <button 
                            onClick={() => setShowModal(true)}
                            className="px-3 py-1.5 text-sm bg-gray text-black font-400 rounded-md border border-gray-dark hover:bg-gray-light transition-colors duration-150"
                        >
                            New Case
                        </button>
                    </div>
                </div>

                <div className="bg-white rounded-lg py-3">
                    {loading ? (
                        <div className="flex justify-center items-center h-64">
                            <p className="text-sm">Loading cases...</p>
                        </div>
                    ) : error ? (
                        <div className="text-center py-4">
                            <p className="text-red-500 text-sm">{error}</p>
                        </div>
                    ) : cases.length === 0 ? (
                        <div className="text-center py-4">
                            <p className="text-sm text-gray-dark">No cases found. Create a new case to get started.</p>
                        </div>
                    ) : (
                        <table className="w-full table-auto text-left">
                            <thead className="bg-gray-light">
                                <tr>
                                    <th className="py-1 px-3 font-500 text-xs align-middle">Case Name</th>
                                    <th className="py-1 px-3 font-500 text-xs align-middle">Client</th>
                                    <th className="py-1 px-3 font-500 text-xs align-middle">Dates</th>
                                    <th className="py-1 px-3 font-500 text-xs align-middle">Attachments</th>
                                    <th className="py-1 px-3 font-500 text-xs align-middle">Members</th>
                                </tr>
                            </thead>
                            <tbody>
                                {cases.map((caseItem) => (
                                    <tr key={caseItem.case_id} className="border-b border-gray hover:bg-gray-light-light">
                                        <Link to={`/case/${caseItem.case_id}`} className="contents">
                                            <td className="px-3 py-2 text-sm align-middle">{caseItem.title}</td>
                                            <td className="px-3 py-2 text-sm align-middle">{caseItem.clientName || "No client name"}</td>
                                            <td className="px-3 py-2 text-sm align-middle">{caseItem.created_at?.split('T')[0] || "N/A"}</td>
                                            <td className="px-3 py-2 text-sm align-middle">
                                                <span className="text-black-light">
                                                    {/* Placeholder for attachment count */}
                                                    0
                                                </span>
                                            </td>
                                            <td className="px-3 py-2 text-sm align-middle">
                                                <div className="flex -space-x-2">
                                                    {/* Placeholder avatars */}
                                                    <img
                                                        src={avatar1}
                                                        alt="Avatar"
                                                        className="w-6 h-6 rounded-full border border-black-light"
                                                    />
                                                </div>
                                            </td>
                                        </Link>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Add Modal */}
                <div className={`fixed top-0 right-0 h-full w-96 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out ${showModal ? 'translate-x-0' : 'translate-x-full'}`}>
                    <div className="px-5 py-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-600">
                                New Case
                            </h2>
                            <button 
                                onClick={() => setShowModal(false)}
                                className="text-gray-dark hover:text-black"
                            >
                                ✕
                            </button>
                        </div>
                        
                        <form className="space-y-3" onSubmit={handleCreateCase}>
                            <div>
                                <label className="block text-black-light text-xs font-500 mb-1 text-left">
                                    Case Title
                                </label>
                                <input
                                    type="text"
                                    name="title"
                                    value={newCase.title}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-1.5 border border-gray-dark rounded-md focus:outline-none focus:border-black transition-colors duration-150 text-sm"
                                    required
                                />
                            </div>
                            
                            <div>
                                <label className="block text-black-light text-xs font-500 mb-1 text-left">
                                    Client Name
                                </label>
                                <input
                                    type="text"
                                    name="clientName"
                                    value={newCase.clientName}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-1.5 border border-gray-dark rounded-md focus:outline-none focus:border-black transition-colors duration-150 text-sm"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-black-light text-xs font-500 mb-1 text-left">
                                    Client Email
                                </label>
                                <input
                                    type="email"
                                    name="clientEmail"
                                    value={newCase.clientEmail}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-1.5 border border-gray-dark rounded-md focus:outline-none focus:border-black transition-colors duration-150 text-sm"
                                />
                            </div>
                            
                            <button
                                type="submit"
                                className="w-full px-3 py-1.5 bg-gray text-black font-500 rounded-md hover:bg-gray-dark transition-colors duration-150 text-sm"
                            >
                                Create
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </AnimatedContainer>
    );
};

export default CaseList;
