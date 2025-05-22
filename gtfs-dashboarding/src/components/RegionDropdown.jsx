import React, { useRef, useEffect, useState } from 'react';
import regions from '../utils/regions';

const RegionDropdown = ({ label = "Région", selectedRegion, onChange }) => {
    const [open, setOpen] = useState(false);
    const dropdownRef = useRef();

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="flex flex-col items-center mt-4">
            <label className="text-lg font-semibold text-gray-800 mb-2">{label} :</label>
            <div className="relative inline-block text-left" ref={dropdownRef}>
                <button
                    type="button"
                    className="inline-flex w-48 justify-center gap-x-1.5 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-gray-300 ring-inset hover:bg-gray-50"
                    onClick={() => setOpen(!open)}
                    aria-expanded={open}
                    aria-haspopup="true"
                >
                    {selectedRegion}
                    <svg className="-mr-1 size-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
                    </svg>
                </button>

                {open && (
                    <div className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black/5 focus:outline-none">
                        <div className="py-1">
                            <button
                                onClick={() => { onChange("Toutes"); setOpen(false); }}
                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                                Toutes
                            </button>
                            {regions.map((r) => (
                                <button
                                    key={r.name}
                                    onClick={() => { onChange(r.name); setOpen(false); }}
                                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                >
                                    {r.name}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RegionDropdown;
