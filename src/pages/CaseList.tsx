import React, { useState } from "react";
import { Link } from "react-router-dom";

// Avatar Examples
import avatar1 from "../assets/avatar-1.jpg";
import avatar2 from "../assets/avatar-2.jpg";

const tasks = [
    {
        id: 1,
        name: "2024 Tax Return Single",
        dates: "May 18, 2024",
        client: "John Doe",
        attachment: 4,
        teammates: [avatar1, avatar2],
    },
    {
        id: 2,
        name: "2024 Tax Return Married",
        dates: "May 21, 2024",
        client: "Marry Fincher",
        attachment: 7,
        teammates: [avatar2],
    },
    {
        id: 3,
        name: "2024 Tax Return Married Filing Separately",
        dates: "May 21, 2024",
        client: "Jackie Parker",
        attachment: 6,
        teammates: [avatar1, avatar2],
    },
];

const CaseList: React.FC = () => {
    const [showModal, setShowModal] = useState(false);

    return (
        <div className="w-full h-screen mx-auto px-6 py-2">
            <div className="flex flex-row justify-between items-center p-4 border-b border-gray">
                <div className="flex flex-col gap-1 text-left">
                    <span className="text-black text-2xl font-500 text-left">
                        Cases
                    </span>
                    <span className="text-black-light text-lg font-400 text-left">
                        Manage all your tax cases
                    </span>
                </div>
                <div className="flex flex-row gap-4">
                    <div className="flex-1 relative">
                        <input
                            type="text"
                            placeholder="Search.."
                            className="w-64 px-4 py-2 text-lg border border-gray-dark rounded-md focus:outline-none focus:border-gray-dark"
                        />
                    </div>
                    <button 
                        onClick={() => setShowModal(true)}
                        className="px-4 py-2 text-lg bg-gray text-black font-400 rounded-md border border-gray-dark hover:bg-gray-light transition-colors duration-150"
                    >
                        New Case
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-lg p-4">
                <table className="w-full table-auto text-left">
                    <thead className="bg-gray-light">
                        <tr>
                            <th className="py-2 px-3 font-500 text-lg align-middle">Case Name</th>
                            <th className="py-2 px-3 font-500 text-lg align-middle">Client</th>
                            <th className="py-2 px-3 font-500 text-lg align-middle">Dates</th>
                            <th className="py-2 px-3 font-500 text-lg align-middle">Attachments</th>
                            <th className="py-2 px-3 font-500 text-lg align-middle">Teammates</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tasks.map((item, index) => (
                            <tr key={index} className="border-b border-gray hover:bg-gray-light-light">
                                <Link to={`/case/${item.id}`} className="contents">
                                    <td className="p-3 text-lg align-middle">{item.name}</td>
                                    <td className="p-3 text-lg align-middle">{item.client}</td>
                                    <td className="p-3 text-lg align-middle">{item.dates}</td>
                                    <td className="p-3 text-lg align-middle">
                                        <span className="text-black-light">
                                            {item.attachment}
                                        </span>
                                    </td>
                                    <td className="p-3 text-lg align-middle">
                                        <div className="flex -space-x-2">
                                            {item.teammates.map((avatar, i) => (
                                                <img
                                                    key={i}
                                                    src={avatar}
                                                    alt="Avatar"
                                                    className="w-8 h-8 rounded-full border border-black-light"
                                                />
                                            ))}
                                        </div>
                                    </td>
                                </Link>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Add Modal */}
            <div className={`fixed top-0 right-0 h-full w-96 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out ${showModal ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className="px-6 py-8">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-600">
                            New Case
                        </h2>
                        <button 
                            onClick={() => setShowModal(false)}
                            className="text-gray-dark hover:text-black"
                        >
                            ✕
                        </button>
                    </div>
                    
                    <form className="space-y-4">
                        <div>
                            <label className="block text-black-light text-sm font-500 mb-1 text-left">
                                Name
                            </label>
                            <input
                                type="text"
                                className="w-full px-3 py-2 border border-gray-dark rounded-md focus:outline-none focus:border-black transition-colors duration-150"
                            />
                        </div>
                        
                        <div>
                            <label className="block text-black-light text-sm font-500 mb-1 text-left">
                                Email
                            </label>
                            <input
                                type="email"
                                className="w-full px-3 py-2 border border-gray-dark rounded-md focus:outline-none focus:border-black transition-colors duration-150"
                            />
                        </div>
                        
                        <button
                            type="submit"
                            className="w-full px-4 py-2 bg-gray text-black font-500 rounded-md hover:bg-gray-dark transition-colors duration-150"
                        >
                            Create
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CaseList;
