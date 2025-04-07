import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import {type EditProfile} from "~/services/api";
import { updateProfile } from "./profilequeries";
import "./settings.css";

const UpdateProfile: React.FC = () => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState<EditProfile>({
        firstName: "",
        lastName: "",
        email: "",
        middleName: "",
        address: "",
        phoneNumber: "",
        dateOfBirth: "",
    });

    const [errors, setErrors] = useState({
        email: "",
        password: "",
        birthDate: "",
        phoneNumber: "",
        firstName: "",
        lastName: "",
        address: "",
        middleName: "",
    });

    //fake user load - replace with real fetch from API
    useEffect(() => {
        async function fetchUserData() {
            const userFromDB = await fetch("/api/profile").then(res => res.json());
            setFormData(userFromDB);
        }
        fetchUserData();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const validateForm = (): boolean => {
        const newErrors = {
            email: "",
            password: "",
            phoneNumber: "",
            birthDate: "",
            firstName: "",
            lastName: "",
            middleName: "",
            address: "",
        };
        const { email, phoneNumber, dateOfBirth, firstName, lastName, middleName, address } = 
            formData;

    
        if (!email || !/^\S+@\S+\.\S+$/.test(email))
            // good validation
            newErrors.email = "Enter a valid email.";
        if (!phoneNumber || !/^\d{3}-\d{3}-\d{4}$/.test(phoneNumber))
            // good validation
            newErrors.phoneNumber = "Enter a valid phone number (e.g. 123-456-7890).";
        if (!dateOfBirth) newErrors.birthDate = "Birthdate is required.";
        if (!firstName) newErrors.firstName = "First name is required";
        if (!lastName) newErrors.lastName = "Last name is required";

        setErrors(newErrors);
        return !Object.values(newErrors).some((error) => error);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const result = await updateProfile(formData);
        if (result.success) {
            alert("Profile updated successfully!");
            navigate("/profile/dashboard"); // Redirect to the dashboard after successful update
        } else {
            alert('Error: ${result.error}');
        }
    };

    return (
        <div className="p-6 max-w-2xl mx-auto bg-white shadow rounded-xl">
            <h2 className = "text-2xl font-bold mb-4">Edit Your Profile:</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                {/*First Name*/}
                <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="First Name"
                    className="w-full p-2 border rounded"
                />

                {/*Last Name*/}
                <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="Last Name"
                    className="w-full p-2 border rounded"
                />

                {/*Middle Name*/}
                <input
                    type="text"
                    name="middleName"
                    value={formData.middleName}
                    onChange={handleChange}
                    placeholder="Middle Name"
                    className="w-full p-2 border rounded"
                />

                {/*Email*/}
                <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Email"
                    className="w-full p-2 border rounded"
                />

                {/*Phone Number*/}
                <input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    placeholder="Phone Number (e.g. 123-456-7890)"
                    className="w-full p-2 border rounded"
                />

                {/*Birth Date*/}
                <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    className="w-full p-2 border rounded"
                />

                {/*Address*/}
                <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Address"
                    className="w-full p-2 border rounded"
                />

                {/*Submit Button*/}
                <button
                    type="submit"
                    className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
                >
                    Save Changes
                </button>
            </form>
        </div>

    );
};

export default UpdateProfile;